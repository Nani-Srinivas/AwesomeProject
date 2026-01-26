import csv from 'csv-parser';
import busboy from 'busboy';
import { Readable } from 'stream';
import Area from '../../models/Delivery/Area.js';
import { Customer } from '../../models/User/index.js';
import StoreProduct from '../../models/Product/StoreProduct.js';
import { AttendanceLog } from '../../models/AttendanceLog.js';
import Store from '../../models/Store/Store.js';

export const getBulkUploadForm = async (req, reply) => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bulk Upload</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          form { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
          h1 { text-align: center; }
          input[type=file] { margin-bottom: 20px; }
          button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 3px; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Admin Bulk Upload</h1>
          <form action="/admin/bulk-upload" method="POST" enctype="multipart/form-data">
             <label>Select CSV File:</label><br><br>
             <input type="file" name="file" accept=".csv" required /><br>
             <button type="submit">Upload CSV</button>
          </form>
          <h3>Instructions</h3>
          <p>Order of columns: Area, Apartment, FlatNo, CustomerName, Phone, DeliveryCost, ProductName, DefaultQuantity, [Dates...]</p>
        </div>
      </body>
    </html>
  `;
    reply.type('text/html').send(html);
};

export const bulkUpload = async (req, reply) => {
    try {
        const results = [];
        const logs = [];
        const errors = [];

        // Parse multipart/form-data using busboy manually
        // We do this to potential conflicts with AdminJS's own multipart registration
        await new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            let fileFound = false;

            bb.on('file', (name, file, info) => {
                fileFound = true;
                file
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        // File processed, wait for busboy to finish
                    })
                    .on('error', (err) => reject(err));
            });

            bb.on('close', () => {
                if (!fileFound) {
                    reject(new Error("No CSV file uploaded"));
                } else {
                    resolve();
                }
            });

            bb.on('error', (err) => reject(err));

            req.raw.pipe(bb);
        });

        // --- 1. Fetch Common Data Helpers ---
        // Fetch default store context first
        const defaultStore = await Store.findOne({ status: 'active' }).lean();
        if (!defaultStore) {
            throw new Error("No active store found.");
        }

        // Fetch Areas ONLY for this store to prevent duplicates
        const allAreas = await Area.find({ storeId: defaultStore._id }).lean();
        console.log(`[BulkUpload] Loaded ${allAreas.length} areas for Store: ${defaultStore.name || 'Unknown'}`);
        if (allAreas.length > 0) {
            console.log(`[BulkUpload] Existing areas:`, allAreas.map(a => `"${a.name}"`).join(', '));
        }

        // Fetch Only for this store
        const allProducts = await StoreProduct.find({ storeId: defaultStore._id }).lean();
        console.log(`[BulkUpload] Loaded ${allProducts.length} products for Store: ${defaultStore.name || 'Unknown'}`);
        if (allProducts.length > 0) {
            console.log(`[BulkUpload] Sample Product: ${allProducts[0].name}`);
        }

        const areaMap = new Map(allAreas.map(a => [a.name.trim().toLowerCase(), a]));
        const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p]));

        // (CSV parsing happened above)
        console.log(`[BulkUpload] Parsed ${results.length} rows.`);

        for (const [index, row] of results.entries()) {
            try {
                // --- Normalize Keys ---
                const stdRow = {};
                Object.keys(row).forEach(k => {
                    // Remove BOM, trim, lowercase
                    const cleanKey = k.trim().toLowerCase().replace(/^[\uFEFF\xA0]+|[\uFEFF\xA0]+$/g, '');
                    stdRow[cleanKey] = row[k];
                });

                if (index === 0) {
                    console.log('[BulkUpload] First Row Raw Keys:', Object.keys(row));
                    console.log('[BulkUpload] First Row Normalized Keys:', Object.keys(stdRow));
                }

                // --- Extract Fields (using normalized keys) ---
                const areaName = stdRow['area'];
                const Apartment = stdRow['apartment'];
                const FlatNo = stdRow['flatno'];
                const CustomerName = stdRow['customername'];
                const Phone = stdRow['phone'];
                const ProductName = stdRow['productname'];
                const DefaultQuantity = stdRow['defaultquantity'];
                // Handle DeliveryCost (check for user's specific typo or standard spelling)
                const DeliveryCost = stdRow['deliverycost'] || stdRow['deliveycost'] || 0;

                if (!areaName || !CustomerName || !Phone || !ProductName) {
                    const missing = [];
                    if (!areaName) missing.push('Area');
                    if (!CustomerName) missing.push('CustomerName');
                    if (!Phone) missing.push('Phone');
                    if (!ProductName) missing.push('ProductName');

                    const errorMsg = `Row ${index + 1} skipped. Missing: ${missing.join(', ')}. Found: ${JSON.stringify(Object.keys(stdRow))}`;
                    console.log(`[BulkUpload] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // --- A. Handle Area ---
                let areaId;
                const normalizedArea = areaName.trim().toLowerCase();

                if (index === 0) {
                    console.log(`[BulkUpload] Row 1: Looking for area "${areaName}" (normalized: "${normalizedArea}")`);
                    console.log(`[BulkUpload] Row 1: Map has area? ${areaMap.has(normalizedArea)}`);
                    console.log(`[BulkUpload] Row 1: Map keys:`, Array.from(areaMap.keys()));
                }

                if (areaMap.has(normalizedArea)) {
                    areaId = areaMap.get(normalizedArea)._id;
                    if (index === 0) console.log(`[BulkUpload] Row 1: ✓ Found existing area '${areaName}' (${areaId})`);
                } else {
                    // Try to create new Area
                    try {
                        const newArea = await Area.create({
                            name: areaName.trim(),
                            storeId: defaultStore._id,
                            createdBy: req.user?._id,
                        });
                        areaMap.set(normalizedArea, newArea);
                        areaId = newArea._id;
                        logs.push(`Created Area: ${areaName}`);
                        if (index === 0) console.log(`[BulkUpload] Row 1: ✓ Created new area '${areaName}' (${areaId})`);
                    } catch (areaError) {
                        // If duplicate key error, try to find existing area
                        if (areaError.code === 11000) {
                            console.log(`[BulkUpload] Row ${index + 1}: Area "${areaName}" already exists (duplicate key), fetching...`);
                            const existingArea = await Area.findOne({
                                name: areaName.trim(),
                                storeId: defaultStore._id
                            });
                            if (existingArea) {
                                areaId = existingArea._id;
                                areaMap.set(normalizedArea, existingArea);
                                logs.push(`Using existing area: ${areaName}`);
                            } else {
                                throw new Error(`Area "${areaName}" duplicate key error but not found in database`);
                            }
                        } else {
                            throw areaError;
                        }
                    }
                }

                // --- B. Handle Product ---
                const normalizedProduct = ProductName.trim().toLowerCase();
                const product = productMap.get(normalizedProduct);
                if (!product) {
                    const msg = `Product not found: '${ProductName}' (normalized: '${normalizedProduct}')`;
                    console.log(`[BulkUpload] Row ${index + 1} Error: ${msg}`);
                    errors.push(msg);
                    continue;
                } else if (index === 0) {
                    console.log(`[BulkUpload] Row 1: Found Product '${ProductName}' -> ID: ${product._id}`);
                }
                const productId = product._id;

                // --- C. Handle Customer ---
                let customer = await Customer.findOne({ phone: Phone });
                if (!customer) {
                    if (index === 0) console.log(`[BulkUpload] Row 1: Creating New Customer for Phone ${Phone}`);
                    // Create New Customer
                    customer = await Customer.create({
                        name: CustomerName,
                        phone: Phone,
                        area: areaId,
                        store: defaultStore?._id,
                        address: {
                            Apartment: Apartment,
                            FlatNo: FlatNo,
                        },
                        requiredProduct: [{
                            product: productId,
                            quantity: parseFloat(DefaultQuantity) || 1
                        }],
                        deliveryCost: parseFloat(DeliveryCost) || 0,
                        roles: ['Customer'],
                        isSubscribed: true,
                        createdBy: req.user?._id,
                        createdByModel: req.user?.role || 'Admin',
                    });
                    logs.push(`Created Customer: ${CustomerName}`);
                } else {
                    if (index === 0) console.log(`[BulkUpload] Row 1: Found Existing Customer ${customer.name} (${customer._id})`);
                    // Update existing Customer
                    let updated = false;

                    // 1. Ensure Area is synced
                    if (String(customer.area) !== String(areaId)) {
                        customer.area = areaId;
                        updated = true;
                    }

                    // 2. Add Product if missing
                    const existingProdIndex = customer.requiredProduct.findIndex(p => String(p.product) === String(productId));
                    if (existingProdIndex === -1) {
                        customer.requiredProduct.push({
                            product: productId,
                            quantity: parseFloat(DefaultQuantity) || 1
                        });
                        updated = true;
                        logs.push(`Added product ${ProductName} to Customer ${CustomerName}`);
                    }

                    // 3. Update Delivery Cost if zero (optional decision, assume CSV might have better info)
                    if ((!customer.deliveryCost || customer.deliveryCost === 0) && DeliveryCost > 0) {
                        customer.deliveryCost = parseFloat(DeliveryCost);
                        updated = true;
                    }

                    if (updated) await customer.save();
                }

                // --- D. Handle Attendance (Dynamic Date Columns) ---
                // Iterate over normalized keys that look like YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY
                const dateKeys = Object.keys(stdRow).filter(k =>
                    /^\d{4}-\d{2}-\d{2}$/.test(k) ||
                    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(k) ||
                    /^\d{1,2}-\d{1,2}-\d{4}$/.test(k)
                );

                // Cache for logs to reduce DB calls
                const logCache = new Map();

                for (const dateStr of dateKeys) {
                    const rawValue = stdRow[dateStr];
                    let quantity = 0;
                    let status = 'skipped'; // Default to skipped if 0 or 'A' or 'a'

                    if (typeof rawValue === 'string' && rawValue.trim().toUpperCase() === 'A') {
                        quantity = 0;
                        status = 'skipped';
                    } else {
                        quantity = parseFloat(rawValue);
                        if (isNaN(quantity)) continue;
                        if (quantity > 0) status = 'delivered';
                    }

                    // Parse Date correctly handles all formats
                    let date;
                    if (dateStr.includes('/')) {
                        // Handle DD/MM/YYYY
                        const [day, month, year] = dateStr.split('/').map(Number);
                        date = new Date(year, month - 1, day);
                    } else if (dateStr.includes('-')) {
                        const parts = dateStr.split('-').map(Number);
                        if (parts[0] > 1000) {
                            // Handle YYYY-MM-DD
                            const [year, month, day] = parts;
                            date = new Date(year, month - 1, day);
                        } else {
                            // Handle DD-MM-YYYY
                            const [day, month, year] = parts;
                            date = new Date(year, month - 1, day);
                        }
                    }

                    const businessDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const cacheKey = `${businessDate}-${areaId}`;

                    // Check cache first
                    let log = logCache.get(cacheKey);

                    if (!log) {
                        // Check DB
                        const query = {
                            businessDate: { $eq: businessDate },
                            areaId: areaId,
                            storeId: defaultStore._id
                        };
                        log = await AttendanceLog.findOne(query);

                        if (!log) {
                            // Create new log
                            log = new AttendanceLog({
                                storeId: defaultStore._id,
                                date: date,
                                businessDate: businessDate,
                                areaId: areaId,
                                attendance: []
                            });
                        }
                        logCache.set(cacheKey, log);
                    }

                    // Find Customer in Bucket
                    const custEntryIndex = log.attendance.findIndex(a => String(a.customerId) === String(customer._id));

                    if (custEntryIndex > -1) {
                        // Update existing customer entry in bucket
                        const productEntryIndex = log.attendance[custEntryIndex].products.findIndex(p => String(p.productId) === String(productId));
                        if (productEntryIndex > -1) {
                            // Update product quantity & status
                            log.attendance[custEntryIndex].products[productEntryIndex].quantity = quantity;
                            log.attendance[custEntryIndex].products[productEntryIndex].status = status;
                        } else {
                            // Add product to customer
                            log.attendance[custEntryIndex].products.push({
                                productId: productId,
                                quantity: quantity,
                                status: status
                            });
                        }
                    } else {
                        // Add new customer entry to bucket
                        log.attendance.push({
                            customerId: customer._id,
                            products: [{
                                productId: productId,
                                quantity: quantity,
                                status: status
                            }]
                        });
                    }
                }

                // Save all cached logs for this customer at once
                for (const log of logCache.values()) {
                    await log.save();
                }

            } catch (err) {
                errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
            }
        }

        return reply.send({
            message: "Bulk upload processed",
            logs,
            errors,
            successCount: results.length - errors.length
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error", error: error.message });
    }
};
