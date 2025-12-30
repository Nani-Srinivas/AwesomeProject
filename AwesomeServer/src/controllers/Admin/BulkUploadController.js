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
        // Fetch all Areas
        const allAreas = await Area.find().lean();

        // Fetch default store context first
        const defaultStore = await Store.findOne({ status: 'active' }).lean();
        if (!defaultStore) {
            throw new Error("No active store found.");
        }

        // Fetch Products ONLY for this store to ensure correct pricing/IDs
        const allProducts = await StoreProduct.find({ storeId: defaultStore._id }).lean();

        const areaMap = new Map(allAreas.map(a => [a.name.toLowerCase(), a]));
        const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p]));

        // (CSV parsing happened above)

        // (CSV parsing happened above)

        for (const row of results) {
            try {
                // --- Normalize Keys ---
                const stdRow = {};
                Object.keys(row).forEach(k => {
                    // Remove BOM, trim, lowercase
                    const cleanKey = k.trim().toLowerCase().replace(/^[\uFEFF\xA0]+|[\uFEFF\xA0]+$/g, '');
                    stdRow[cleanKey] = row[k];
                });

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

                    errors.push(`Row has missing fields: ${missing.join(', ')}. Data: ${JSON.stringify(row)}`);
                    continue;
                }

                // --- A. Handle Area ---
                let areaId;
                const normalizedArea = areaName.trim().toLowerCase();
                if (areaMap.has(normalizedArea)) {
                    areaId = areaMap.get(normalizedArea)._id;
                } else {
                    // Create new Area
                    const newArea = await Area.create({
                        name: areaName.trim(),
                        createdBy: req.user?._id,
                    });
                    areaMap.set(normalizedArea, newArea);
                    areaId = newArea._id;
                    logs.push(`Created Area: ${areaName}`);
                }

                // --- B. Handle Product ---
                const normalizedProduct = ProductName.trim().toLowerCase();
                const product = productMap.get(normalizedProduct);
                if (!product) {
                    errors.push(`Product not found: ${ProductName}`);
                    continue;
                }
                const productId = product._id;

                // --- C. Handle Customer ---
                let customer = await Customer.findOne({ phone: Phone });
                if (!customer) {
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
                // Iterate over normalized keys that look like YYYY-MM-DD or DD/MM/YYYY
                const dateKeys = Object.keys(stdRow).filter(k =>
                    /^\d{4}-\d{2}-\d{2}$/.test(k) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(k)
                );

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

                    // Parse Date correctly handles both formats
                    let date;
                    if (dateStr.includes('/')) {
                        // Handle DD/MM/YYYY
                        const [day, month, year] = dateStr.split('/').map(Number);
                        date = new Date(year, month - 1, day);
                    } else {
                        // Handle YYYY-MM-DD
                        date = new Date(dateStr);
                    }

                    // Check if log exists for this Day + Area + Store
                    const query = {
                        date: {
                            $gte: new Date(date.setHours(0, 0, 0, 0)),
                            $lt: new Date(date.setHours(23, 59, 59, 999))
                        },
                        areaId: areaId,
                        storeId: defaultStore?._id
                    };

                    let log = await AttendanceLog.findOne(query);

                    if (!log) {
                        // Create bucket if missing
                        // Format date to YYYY-MM-DD for businessDate
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const businessDate = `${year}-${month}-${day}`;

                        log = new AttendanceLog({
                            storeId: defaultStore?._id,
                            date: date,
                            businessDate: businessDate,
                            areaId: areaId,
                            attendance: []
                        });
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
