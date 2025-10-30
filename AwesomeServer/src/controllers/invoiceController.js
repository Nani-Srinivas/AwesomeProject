// import { AttendanceLog } from '../models/AttendanceLog.js';
// import { Customer } from '../models/User/Customer.js'; // Assuming Customer model is here
// import  StoreProduct  from '../models/Product/StoreProduct.js'; // Assuming StoreProduct model is here

// export const getInvoice = async (request, reply) => {
//   console.log('Server received invoice request:', JSON.stringify(request.query, null, 2));
//   try {
//     const { customerId, period } = request.query;

//     if (!customerId || !period) {
//       return reply.code(400).send({ message: 'Customer ID and period are required.' });
//     }

//     // Parse the period (e.g., "October 2025") into start and end dates
//     const [monthName, yearString] = period.split(' ');
//     const year = parseInt(yearString, 10);
//     const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-indexed month

//     const startDate = new Date(year, monthIndex, 1);
//     const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

//     // Fetch customer details
//     const customer = await Customer.findById(customerId).select('name address phone deliveryCost').lean();
//     if (!customer) {
//       return reply.code(404).send({ message: 'Customer not found.' });
//     }

//     // Query AttendanceLog for delivered products for this customer within the period
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       'attendance.customerId': customerId,
//     }).lean();

//     const productAggregates = {}; // { productId: { quantity: number, dates: Set<string> } }

//     attendanceRecords.forEach(record => {
//       const customerAttendance = record.attendance.find(
//         att => att.customerId.toString() === customerId
//       );

//       if (customerAttendance) {
//         customerAttendance.products.forEach(productEntry => {
//           if (productEntry.status === 'delivered') {
//             const pId = productEntry.productId.toString();
//             if (!productAggregates[pId]) {
//               productAggregates[pId] = { quantity: 0, dates: new Set() };
//             }
//             productAggregates[pId].quantity += productEntry.quantity;
//             productAggregates[pId].dates.add(record.date.toISOString().split('T')[0]);
//           }
//         });
//       }
//     });

//     // Fetch product details for aggregated products
//     const productIds = Object.keys(productAggregates);
//     const storeProducts = await StoreProduct.find({
//       _id: { $in: productIds },
//     }).select('name price').lean();

//     const productMap = new Map(storeProducts.map(p => [p._id.toString(), p]));

//     let totalItemsAmount = 0;
//     const invoiceItems = [];

//     for (const pId of productIds) {
//       const productInfo = productMap.get(pId);
//       if (productInfo) {
//         const aggregated = productAggregates[pId];
//         const itemTotal = aggregated.quantity * productInfo.price;
//         totalItemsAmount += itemTotal;

//         invoiceItems.push({
//           date: Array.from(aggregated.dates).sort().join(', '), // Display all delivery dates
//           product: productInfo.name,
//           qty: `${aggregated.quantity} qty`,
//           sp: productInfo.price.toFixed(2),
//           total: itemTotal.toFixed(2),
//         });
//       }
//     }

//     const deliveryCharges = customer.deliveryCost || 0; // Use customer's delivery cost or default to 0
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${customerId.substring(0, 5)}`, // Simple unique bill number
//       fromDate: startDate.toISOString().split('T')[0],
//       toDate: endDate.toISOString().split('T')[0],
//       company: {
//         name: 'Your Company Name', // TODO: Make this configurable
//         address: '12445 Street Name, Denver Co, 58786', // TODO: Make this configurable
//         phone: '76785875855', // TODO: Make this configurable
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ''}, ${customer.address?.Apartment || ''}, ${customer.address?.city || ''}`,
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//     };

//     return reply.code(200).send(invoiceData);
//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     return reply.code(500).send({ message: 'Internal server error.' });
//   }
// };

// export const getInvoice = async (request, reply) => {
//   console.log('Server received invoice request:', JSON.stringify(request.query, null, 2));
//   try {
//     const { customerId, period } = request.query;

//     if (!customerId || !period) {
//       return reply.code(400).send({ message: 'Customer ID and period are required.' });
//     }

//     // Parse the period (e.g., "October 2025") into start and end dates
//     const [monthName, yearString] = period.split(' ');
//     const year = parseInt(yearString, 10);
//     const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-indexed month

//     const startDate = new Date(year, monthIndex, 1);
//     const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

//     // Fetch customer details
//     const customer = await Customer.findById(customerId).select('name address phone deliveryCost').lean();
//     if (!customer) {
//       return reply.code(404).send({ message: 'Customer not found.' });
//     }

//     // Query AttendanceLog for delivered products for this customer within the period
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       'attendance.customerId': customerId,
//     }).sort({ date: 1 }).lean(); // Sort by date ascending

//     // Structure: Array of { date, productId, quantity }
//     const dateWiseProducts = [];

//     attendanceRecords.forEach(record => {
//       const customerAttendance = record.attendance.find(
//         att => att.customerId.toString() === customerId
//       );

//       if (customerAttendance) {
//         customerAttendance.products.forEach(productEntry => {
//           if (productEntry.status === 'delivered') {
//             dateWiseProducts.push({
//               date: record.date.toISOString().split('T')[0],
//               productId: productEntry.productId.toString(),
//               quantity: productEntry.quantity,
//             });
//           }
//         });
//       }
//     });

//     // Get unique product IDs
//     const productIds = [...new Set(dateWiseProducts.map(item => item.productId))];

//     // Fetch product details
//     const storeProducts = await StoreProduct.find({
//       _id: { $in: productIds },
//     }).select('name price').lean();

//     const productMap = new Map(storeProducts.map(p => [p._id.toString(), p]));

//     // Build invoice items (date-wise, product-wise)
//     let totalItemsAmount = 0;
//     const invoiceItems = [];

//     dateWiseProducts.forEach(item => {
//       const productInfo = productMap.get(item.productId);
//       if (productInfo) {
//         const itemTotal = item.quantity * productInfo.price;
//         totalItemsAmount += itemTotal;

//         invoiceItems.push({
//           date: item.date,
//           product: productInfo.name,
//           qty: `${item.quantity} qty`,
//           sp: productInfo.price.toFixed(2),
//           total: itemTotal.toFixed(2),
//         });
//       }
//     });

//     const deliveryCharges = customer.deliveryCost || 0;
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${customerId.substring(0, 5)}`,
//       fromDate: startDate.toISOString().split('T')[0],
//       toDate: endDate.toISOString().split('T')[0],
//       company: {
//         name: 'Your Company Name', // TODO: Make this configurable
//         address: '12445 Street Name, Denver Co, 58786', // TODO: Make this configurable
//         phone: '76785875855', // TODO: Make this configurable
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ''}, ${customer.address?.Apartment || ''}, ${customer.address?.city || ''}`,
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//     };

//     return reply.code(200).send(invoiceData);
//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     return reply.code(500).send({ message: 'Internal server error.' });
//   }
// };

// export const getInvoice = async (request, reply) => {
//   console.log('Server received invoice request:', JSON.stringify(request.query, null, 2));
//   try {
//     const { customerId, period } = request.query;

//     if (!customerId || !period) {
//       return reply.code(400).send({ message: 'Customer ID and period are required.' });
//     }

//     // Parse the period (e.g., "October 2025") into start and end dates
//     const [monthName, yearString] = period.split(' ');
//     const year = parseInt(yearString, 10);
//     const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-indexed month

//     const startDate = new Date(year, monthIndex, 1);
//     const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

//     // Fetch customer details
//     const customer = await Customer.findById(customerId).select('name address phone deliveryCost').lean();
//     if (!customer) {
//       return reply.code(404).send({ message: 'Customer not found.' });
//     }

//     // Query AttendanceLog for delivered products for this customer within the period
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       'attendance.customerId': customerId,
//     }).sort({ date: 1 }).lean(); // Sort by date ascending

//     // Structure: Map of { date: { productId: quantity } }
//     const dateWiseMap = new Map();

//     attendanceRecords.forEach(record => {
//       const dateKey = record.date.toISOString().split('T')[0];
//       const customerAttendance = record.attendance.find(
//         att => att.customerId.toString() === customerId
//       );

//       if (customerAttendance) {
//         if (!dateWiseMap.has(dateKey)) {
//           dateWiseMap.set(dateKey, new Map());
//         }
//         const productsMap = dateWiseMap.get(dateKey);

//         customerAttendance.products.forEach(productEntry => {
//           if (productEntry.status === 'delivered') {
//             const pId = productEntry.productId.toString();
//             const currentQty = productsMap.get(pId) || 0;
//             productsMap.set(pId, currentQty + productEntry.quantity);
//           }
//         });
//       }
//     });

//     // Get all unique product IDs
//     const allProductIds = new Set();
//     dateWiseMap.forEach(productsMap => {
//       productsMap.forEach((qty, pId) => allProductIds.add(pId));
//     });

//     // Fetch product details
//     const storeProducts = await StoreProduct.find({
//       _id: { $in: Array.from(allProductIds) },
//     }).select('name price').lean();

//     const productMap = new Map(storeProducts.map(p => [p._id.toString(), p]));

//     // Build invoice items (one row per date with all products combined)
//     let totalItemsAmount = 0;
//     const invoiceItems = [];

//     // Sort dates
//     const sortedDates = Array.from(dateWiseMap.keys()).sort();

//     sortedDates.forEach(date => {
//       const productsMap = dateWiseMap.get(date);
//       let dateTotal = 0;
//       const productDetails = [];

//       productsMap.forEach((quantity, productId) => {
//         const productInfo = productMap.get(productId);
//         if (productInfo) {
//           const itemTotal = quantity * productInfo.price;
//           dateTotal += itemTotal;
//           productDetails.push({
//             name: productInfo.name,
//             quantity: quantity,
//             price: productInfo.price,
//           });
//         }
//       });

//       totalItemsAmount += dateTotal;

//       // Format product details as a string
//       const productString = productDetails
//         .map(p => `${p.name} (${p.quantity})`)
//         .join(', ');

//       const qtyString = productDetails
//         .map(p => `${p.quantity}`)
//         .join(', ');

//       const spString = productDetails
//         .map(p => p.price.toFixed(2))
//         .join(', ');

//       invoiceItems.push({
//         date: date,
//         product: productString,
//         qty: qtyString,
//         sp: spString,
//         total: dateTotal.toFixed(2),
//       });
//     });

//     const deliveryCharges = customer.deliveryCost || 0;
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${customerId.substring(0, 5)}`,
//       fromDate: startDate.toISOString().split('T')[0],
//       toDate: endDate.toISOString().split('T')[0],
//       company: {
//         name: 'Your Company Name', // TODO: Make this configurable
//         address: '12445 Street Name, Denver Co, 58786', // TODO: Make this configurable
//         phone: '76785875855', // TODO: Make this configurable
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ''}, ${customer.address?.Apartment || ''}, ${customer.address?.city || ''}`,
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//     };

//     return reply.code(200).send(invoiceData);
//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     return reply.code(500).send({ message: 'Internal server error.' });
//   }
// };

export const getInvoice = async (request, reply) => {
  console.log(
    "Server received invoice request:",
    JSON.stringify(request.query, null, 2)
  );
  try {
    const { customerId, period } = request.query;

    if (!customerId || !period) {
      return reply
        .code(400)
        .send({ message: "Customer ID and period are required." });
    }

    // Parse the period (e.g., "October 2025") into start and end dates
    const [monthName, yearString] = period.split(" ");
    const year = parseInt(yearString, 10);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-indexed month

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

    // Fetch customer details
    const customer = await Customer.findById(customerId)
      .select("name address phone deliveryCost")
      .lean();
    if (!customer) {
      return reply.code(404).send({ message: "Customer not found." });
    }

    // Query AttendanceLog for delivered products for this customer within the period
    const attendanceRecords = await AttendanceLog.find({
      date: { $gte: startDate, $lte: endDate },
      "attendance.customerId": customerId,
    })
      .sort({ date: 1 })
      .lean(); // Sort by date ascending

    // Structure: Map of { date: { productId: quantity } }
    const dateWiseMap = new Map();

    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      const customerAttendance = record.attendance.find(
        (att) => att.customerId.toString() === customerId
      );

      if (customerAttendance) {
        if (!dateWiseMap.has(dateKey)) {
          dateWiseMap.set(dateKey, new Map());
        }
        const productsMap = dateWiseMap.get(dateKey);

        customerAttendance.products.forEach((productEntry) => {
          if (productEntry.status === "delivered") {
            const pId = productEntry.productId.toString();
            const currentQty = productsMap.get(pId) || 0;
            productsMap.set(pId, currentQty + productEntry.quantity);
          }
        });
      }
    });

    // Get all unique product IDs
    const allProductIds = new Set();
    dateWiseMap.forEach((productsMap) => {
      productsMap.forEach((qty, pId) => allProductIds.add(pId));
    });

    // Fetch product details
    const storeProducts = await StoreProduct.find({
      _id: { $in: Array.from(allProductIds) },
    })
      .select("name price")
      .lean();

    const productMap = new Map(storeProducts.map((p) => [p._id.toString(), p]));

    // Build invoice items (one row per date with product details array)
    let totalItemsAmount = 0;
    const invoiceItems = [];

    // Sort dates
    const sortedDates = Array.from(dateWiseMap.keys()).sort();

    sortedDates.forEach((date) => {
      const productsMap = dateWiseMap.get(date);
      let dateTotal = 0;
      const products = [];

      productsMap.forEach((quantity, productId) => {
        const productInfo = productMap.get(productId);
        if (productInfo) {
          const itemTotal = quantity * productInfo.price;
          dateTotal += itemTotal;
          products.push({
            name: productInfo.name,
            quantity: quantity,
            price: productInfo.price,
            itemTotal: itemTotal,
          });
        }
      });

      totalItemsAmount += dateTotal;

      invoiceItems.push({
        date: date,
        products: products, // Array of product objects
        total: dateTotal.toFixed(2),
      });
    });

    const deliveryCharges = customer.deliveryCost || 0;
    const grandTotal = totalItemsAmount + deliveryCharges;

    const invoiceData = {
      billNo: `INV-${Date.now()}-${customerId.substring(0, 5)}`,
      fromDate: startDate.toISOString().split("T")[0],
      toDate: endDate.toISOString().split("T")[0],
      company: {
        name: "Your Company Name", // TODO: Make this configurable
        address: "12445 Street Name, Denver Co, 58786", // TODO: Make this configurable
        phone: "76785875855", // TODO: Make this configurable
      },
      customer: {
        name: customer.name,
        address: `${customer.address?.FlatNo || ""}, ${
          customer.address?.Apartment || ""
        }, ${customer.address?.city || ""}`,
        phone: customer.phone,
      },
      items: invoiceItems,
      deliveryCharges: deliveryCharges.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };

    return reply.code(200).send(invoiceData);
    console.log("Invoice data:", invoiceData);
  } catch (error) {
    console.error("Error generating invoice:", error);
    return reply.code(500).send({ message: "Internal server error." });
  }
};

// controllers/invoiceController.js
import Invoice from "../models/Invoice.js";
import { AttendanceLog } from "../models/AttendanceLog.js";
import { Customer } from "../models/User/Customer.js"; // Assuming Customer model is here
import StoreProduct from "../models/Product/StoreProduct.js"; // Assuming StoreProduct model is here
import { renderHtmlToPdfBuffer } from "../utils/pdfHelper.js";
import cloudinary from "../config/cloudinary.js";

// ✅ POST /invoice/generate
// export const generateInvoice = async (request, reply) => {
//   try {
//     const { customerId, period, generatedBy } = request.body;

//     if (!customerId || !period) {
//       return reply
//         .code(400)
//         .send({ message: "customerId and period are required" });
//     }

//     // --- Parse the billing period ---
//     const cleaned = period.replace(/\s+/g, "");
//     const match = cleaned.match(/^([A-Za-z]+)(\d{4})$/);
//     if (!match) {
//       return reply
//         .code(400)
//         .send({ message: 'period format invalid. Use e.g. "October 2025"' });
//     }

//     const [, monthName, yearString] = match;
//     const year = parseInt(yearString, 10);
//     const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
//     const startDate = new Date(year, monthIndex, 1);
//     const endDate = new Date(year, monthIndex + 1, 0);

//     // --- Fetch customer ---
//     const customer = await Customer.findById(customerId)
//       .select("name address phone deliveryCost")
//       .lean();
//     if (!customer)
//       return reply.code(404).send({ message: "Customer not found" });

//     // --- Fetch attendance records ---
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       "attendance.customerId": customerId,
//     })
//       .sort({ date: 1 })
//       .lean();

//     // --- Build date-wise map of delivered products ---
//     const dateWiseMap = new Map();

//     attendanceRecords.forEach((record) => {
//       const dateKey = record.date.toISOString().split("T")[0];
//       const customerAttendance = record.attendance.find(
//         (att) => att.customerId.toString() === customerId
//       );

//       if (customerAttendance) {
//         if (!dateWiseMap.has(dateKey)) dateWiseMap.set(dateKey, new Map());
//         const productsMap = dateWiseMap.get(dateKey);

//         customerAttendance.products.forEach((prod) => {
//           if (prod.status === "delivered") {
//             const pId = prod.productId.toString();
//             const current = productsMap.get(pId) || 0;
//             productsMap.set(pId, current + prod.quantity);
//           }
//         });
//       }
//     });

//     // --- Get all product IDs and fetch details ---
//     const allProductIds = new Set();
//     dateWiseMap.forEach((productsMap) => {
//       productsMap.forEach((_qty, pId) => allProductIds.add(pId));
//     });

//     const storeProducts = await StoreProduct.find({
//       _id: { $in: Array.from(allProductIds) },
//     })
//       .select("name price")
//       .lean();

//     const productMap = new Map(storeProducts.map((p) => [p._id.toString(), p]));

//     // --- Build invoice items ---
//     let totalItemsAmount = 0;
//     const invoiceItems = [];

//     const sortedDates = Array.from(dateWiseMap.keys()).sort();
//     sortedDates.forEach((date) => {
//       const productsMap = dateWiseMap.get(date);
//       let dateTotal = 0;
//       const products = [];

//       productsMap.forEach((quantity, productId) => {
//         const productInfo = productMap.get(productId);
//         if (productInfo) {
//           const itemTotal = quantity * productInfo.price;
//           dateTotal += itemTotal;
//           products.push({
//             name: productInfo.name,
//             quantity,
//             price: productInfo.price,
//             itemTotal,
//           });
//         }
//       });

//       totalItemsAmount += dateTotal;

//       invoiceItems.push({
//         date,
//         products,
//         total: dateTotal.toFixed(2),
//       });
//     });

//     const deliveryCharges = customer.deliveryCost || 0;
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     // --- Build invoice data ---
//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${customerId.toString().substring(0, 5)}`,
//       fromDate: startDate.toISOString().split("T")[0],
//       toDate: endDate.toISOString().split("T")[0],
//       company: {
//         name: process.env.COMPANY_NAME || "Your Company Name",
//         address:
//           process.env.COMPANY_ADDRESS || "12445 Street Name, Denver Co, 58786",
//         phone: process.env.COMPANY_PHONE || "0000000000",
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ""}, ${
//           customer.address?.Apartment || ""
//         }, ${customer.address?.city || ""}`,
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//     };

//     // --- Generate HTML for PDF ---
//     const html = buildHtmlFromInvoiceData(invoiceData);

//     // --- Render HTML to PDF ---
//     const pdfBuffer = await renderHtmlToPdfBuffer(html);

//     // --- Upload to Cloudinary ---
//     const publicId = `invoices/${customerId.toString()}/${invoiceData.billNo}`;
//     const uploadResult = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: "auto", // ✅ detects pdf automatically
//           format: "pdf", // ✅ ensures Cloudinary tags it as PDF
//           folder: "invoices", // ✅ organized storage
//           public_id: publicId,
//           overwrite: true,
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );
//       uploadStream.end(pdfBuffer);
//     });
    

    

//     // --- Save invoice metadata in MongoDB ---
//     const invoiceDoc = await Invoice.create({
//       billNo: invoiceData.billNo,
//       customerId,
//       fromDate: invoiceData.fromDate,
//       toDate: invoiceData.toDate,
//       items: invoiceData.items,
//       deliveryCharges: invoiceData.deliveryCharges,
//       grandTotal: invoiceData.grandTotal,
//       cloudinary: {
//         public_id: uploadResult.public_id,
//         url: uploadResult.url,
//         secure_url: uploadResult.secure_url,
//         bytes: uploadResult.bytes,
//         resource_type: uploadResult.resource_type,
//       },
//       generatedBy: generatedBy || "system",
//     });
//     console.log(cloudinary.url(uploadResult.public_id))
//     // --- Return combined result ---
//     return reply.code(201).send({
//       message: "Invoice generated successfully",
//       preview: invoiceData,
//       pdf: {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id,
//       },
//       dbRecord: {
//         id: invoiceDoc._id,
//         billNo: invoiceDoc.billNo,
//       },
//     }, 
//   );
//   } catch (error) {
//     console.error("Error generating invoice:", error);
//     return reply.code(500).send({ message: "Internal server error." });
//   }
// };

// // ---------------- Helper: Build HTML Template ----------------
// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// function buildHtmlFromInvoiceData(data) {
//   const productsHTML = data.items
//     .map(
//       (i) => `
//       <tr>
//         <td>${i.date}</td>
//         <td>
//           ${i.products
//             .map(
//               (p) =>
//                 `${escapeHtml(p.name)} (${p.quantity} × ₹${p.price.toFixed(2)})`
//             )
//             .join("<br/>")}
//         </td>
//         <td>₹${i.total}</td>
//       </tr>`
//     )
//     .join("");

//   return `<!DOCTYPE html>
//   <html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
//   <style>
//     *{margin:0;padding:0;box-sizing:border-box;}
//     body{font-family:Arial,sans-serif;padding:20px;background:white;}
//     .invoice-container{max-width:800px;margin:0 auto;}
//     .header{text-align:right;margin-bottom:20px;}
//     .header h1{font-size:24px;margin-bottom:8px;}
//     .info-row{display:flex;justify-content:space-between;margin-bottom:20px;}
//     table{width:100%;border-collapse:collapse;margin-bottom:20px;}
//     th, td { border: 1px solid #000; padding: 8px; text-align: left; }
//     th { background-color: #ddddddff; }
//   </style></head><body>
//   <div class="invoice-container">
//     <div class="header">
//       <h1>Invoice</h1>
//       <p>Bill#: ${data.billNo}</p>
//       <p>Period: ${data.fromDate} → ${data.toDate}</p>
//     </div>
//     <div class="info-row">
//       <div>
//         <h3>${data.company.name}</h3>
//         <p>${data.company.address}</p>
//         <p>P: ${data.company.phone}</p>
//       </div>
//       <div>
//         <p><strong>Bill To:</strong> ${data.customer.name}</p>
//         <p><strong>Address:</strong> ${data.customer.address}</p>
//         <p><strong>Phone:</strong> ${data.customer.phone}</p>
//       </div>
//     </div>
//       <table border="1" width="100%" cellspacing="0" cellpadding="8">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Products</th>
//             <th>Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${productsHTML}
//         </tbody>
//       </table>
//     <div style="text-align:right;">
//       <p>Delivery Charges: ₹${data.deliveryCharges}</p>
//       <p style="font-size:18px;font-weight:700;">Grand Total: ₹${data.grandTotal}</p>
//     </div>
//   </div>
//   </body></html>`;
// }


// controllers/invoiceController.js
/**
 * POST /invoice/generate
 * body: { customerId, period }    OR   { customerId, from, to }
 */
// export const generateInvoice = async (request, reply) => {
//   try {
//     const { customerId, period, from, to, generatedBy } = request.body || {};

//     if (!customerId) {
//       return reply.code(400).send({ message: "customerId is required" });
//     }

//     // Determine date range
//     let startDate, endDate;
//     if (from && to) {
//       startDate = new Date(from);
//       endDate = new Date(to);
//       // normalize
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (period) {
//       // Accept "October 2025", "Oct 2025", "October, 2025"
//       const parts = period.replace(",", " ").trim().split(/\s+/);
//       if (parts.length < 2) {
//         return reply.code(400).send({ message: 'period format invalid. Use "October 2025" or provide from/to' });
//       }
//       const monthName = parts[0];
//       const year = parseInt(parts[1], 10);
//       if (isNaN(year)) return reply.code(400).send({ message: "period year invalid" });
//       const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
//       startDate = new Date(year, monthIndex, 1);
//       endDate = new Date(year, monthIndex + 1, 0);
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       return reply.code(400).send({ message: "Either period or from/to must be provided" });
//     }

//     // Fetch customer
//     const customer = await Customer.findById(customerId).select("name address phone deliveryCost").lean();
//     if (!customer) return reply.code(404).send({ message: "Customer not found" });

//     // Fetch attendance using elemMatch for the customer
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       attendance: { $elemMatch: { customerId } },
//     }).sort({ date: 1 }).lean();

//     if (!attendanceRecords || attendanceRecords.length === 0) {
//       return reply.code(404).send({ message: "No attendance records found for this period." });
//     }

//     // Build date-wise map of delivered products
//     const dateWiseMap = new Map();
//     for (const record of attendanceRecords) {
//       const dateKey = record.date.toISOString().split("T")[0];
//       const customerAttendance = (record.attendance || []).find(att => String(att.customerId) === String(customerId));
//       if (!customerAttendance) continue;
//       if (!dateWiseMap.has(dateKey)) dateWiseMap.set(dateKey, new Map());
//       const productsMap = dateWiseMap.get(dateKey);
//       for (const prod of (customerAttendance.products || [])) {
//         if (prod.status === "delivered") {
//           const pId = String(prod.productId);
//           const current = productsMap.get(pId) || 0;
//           productsMap.set(pId, current + (prod.quantity || 0));
//         }
//       }
//     }

//     // Collect all product ids
//     const allProductIds = Array.from(new Set([...Array.from(dateWiseMap.values()).flatMap(m => Array.from(m.keys()))]));
//     const storeProducts = allProductIds.length > 0
//       ? await StoreProduct.find({ _id: { $in: allProductIds } }).select("name price").lean()
//       : [];

//     const productMap = new Map(storeProducts.map(p => [String(p._id), p]));

//     // Build invoice items
//     let totalItemsAmount = 0;
//     const invoiceItems = [];
//     const sortedDates = Array.from(dateWiseMap.keys()).sort();
//     for (const date of sortedDates) {
//       const productsMap = dateWiseMap.get(date);
//       let dateTotal = 0;
//       const products = [];
//       for (const [productId, quantity] of productsMap.entries()) {
//         const productInfo = productMap.get(productId);
//         if (!productInfo) continue;
//         const itemTotal = (quantity || 0) * (productInfo.price || 0);
//         dateTotal += itemTotal;
//         products.push({
//           name: productInfo.name,
//           quantity,
//           price: productInfo.price,
//           itemTotal: itemTotal.toFixed(2),
//         });
//       }
//       if (products.length > 0) {
//         totalItemsAmount += dateTotal;
//         invoiceItems.push({ date, products, total: dateTotal.toFixed(2) });
//       }
//     }

//     const deliveryCharges = parseFloat(customer.deliveryCost || 0);
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${String(customerId).slice(0, 6)}`,
//       fromDate: startDate.toISOString().split("T")[0],
//       toDate: endDate.toISOString().split("T")[0],
//       company: {
//         name: process.env.COMPANY_NAME || "Your Company",
//         address: process.env.COMPANY_ADDRESS || "Company address",
//         phone: process.env.COMPANY_PHONE || "0000000000",
//         logo: process.env.COMPANY_LOGO || null,
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ""} ${customer.address?.Apartment || ""} ${customer.address?.city || ""}`.trim(),
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//       generatedAt: new Date(),
//     };

//     const html = buildHtmlFromInvoiceData(invoiceData);
//     const pdfBuffer = await renderHtmlToPdfBuffer(html);

//     // Upload PDF to Cloudinary (wrapped in try/catch)
//     let uploadResult;
//     try {
//       uploadResult = await new Promise((resolve, reject) => {
//         const publicId = `invoices/${customerId}/${invoiceData.billNo}`;
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             resource_type: "auto",
//             format: "pdf",
//             folder: "invoices",
//             public_id: publicId,
//             overwrite: true,
//           },
//           (err, res) => (err ? reject(err) : resolve(res))
//         );
//         uploadStream.end(pdfBuffer);
//       });
//     } catch (uploadErr) {
//       console.error("Cloudinary upload failed:", uploadErr);
//       return reply.code(500).send({ message: "Failed to upload PDF to storage." });
//     }

//     // Save invoice metadata
//     const invoiceDoc = await Invoice.create({
//       billNo: invoiceData.billNo,
//       customerId,
//       fromDate: invoiceData.fromDate,
//       toDate: invoiceData.toDate,
//       items: invoiceData.items,
//       deliveryCharges: invoiceData.deliveryCharges,
//       grandTotal: invoiceData.grandTotal,
//       cloudinary: {
//         public_id: uploadResult.public_id,
//         url: uploadResult.url,
//         secure_url: uploadResult.secure_url,
//         bytes: uploadResult.bytes,
//         resource_type: uploadResult.resource_type,
//       },
//       generatedBy: generatedBy || "system",
//       generatedAt: invoiceData.generatedAt,
//     });

//     console.log("Invoice uploaded:", uploadResult.secure_url);

//     return reply.code(201).send({
//       message: "Invoice generated successfully",
//       preview: invoiceData,
//       pdf: {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id,
//       },
//       dbRecord: { id: invoiceDoc._id, billNo: invoiceDoc.billNo },
//     });
//   } catch (error) {
//     console.error("Error generating invoice:", error);
//     return reply.code(500).send({ message: "Internal server error." });
//   }
// };

// // ---------------- Helper: Build HTML Template ----------------
// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// function money(val) {
//   return Number(val).toLocaleString("en-IN", { style: "currency", currency: "INR" });
// }

// function buildHtmlFromInvoiceData(data) {
//   const productsHTML = data.items
//     .map(
//       (i) => `
//       <tr>
//         <td style="vertical-align:top;padding:8px;border:1px solid #ddd">${escapeHtml(i.date)}</td>
//         <td style="vertical-align:top;padding:8px;border:1px solid #ddd">
//           ${i.products
//             .map((p) => `${escapeHtml(p.name)} (${p.quantity} × ${money(p.price)})`)
//             .join("<br/>")}
//         </td>
//         <td style="vertical-align:top;padding:8px;border:1px solid #ddd">${money(i.total)}</td>
//       </tr>`
//     )
//     .join("");

//   return `<!DOCTYPE html>
//   <html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
//   <style>
//     body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:20px;}
//     .invoice{max-width:800px;margin:0 auto;}
//     .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
//     .company{font-weight:700}
//     table{width:100%;border-collapse:collapse;margin-top:12px;}
//     th,td{border:1px solid #ddd;padding:8px;text-align:left;}
//     th{background:#f2f2f2;}
//     .totals{margin-top:12px;text-align:right;}
//   </style></head><body>
//   <div class="invoice">
//     <div class="header">
//       <div>
//         <div class="company">${escapeHtml(data.company.name)}</div>
//         <div>${escapeHtml(data.company.address)}</div>
//         <div>Phone: ${escapeHtml(data.company.phone)}</div>
//       </div>
//       <div style="text-align:right">
//         ${data.company.logo ? `<img src="${escapeHtml(data.company.logo)}" alt="logo" style="max-height:80px" />` : ""}
//         <div>Bill#: ${escapeHtml(data.billNo)}</div>
//         <div>Period: ${escapeHtml(data.fromDate)} → ${escapeHtml(data.toDate)}</div>
//       </div>
//     </div>

//     <div>
//       <strong>Bill To:</strong> ${escapeHtml(data.customer.name)} <br/>
//       <strong>Address:</strong> ${escapeHtml(data.customer.address)} <br/>
//       <strong>Phone:</strong> ${escapeHtml(data.customer.phone)}
//     </div>

//     <table>
//       <thead><tr><th>Date</th><th>Products</th><th>Total</th></tr></thead>
//       <tbody>
//         ${productsHTML}
//       </tbody>
//     </table>

//     <div class="totals">
//       <div>Delivery Charges: ${money(data.deliveryCharges)}</div>
//       <div style="font-size:18px;font-weight:700;">Grand Total: ${money(data.grandTotal)}</div>
//     </div>
//   </div>
//   </body></html>`;
// }



// =====================================================
// INVOICE CONTROLLER - Backend with Duplicate Prevention
// =====================================================


// ==================== GENERATE INVOICE ====================
import mongoose from "mongoose";

// export const generateInvoice = async (request, reply) => {
//   try {
//     const { customerId, period, from, to, generatedBy } = request.body || {};
//     console.log("Request body:", request.body);

//     if (!customerId) {
//       return reply.code(400).send({ message: "customerId is required" });
//     }

//     // ------------------------------
//     // 🗓️ Determine date range
//     // ------------------------------
//     let startDate, endDate, periodString;

//     if (from && to) {
//       startDate = new Date(from);
//       endDate = new Date(to);
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//       periodString = `${from}_to_${to}`;
//     } else if (period) {
//       const parts = period.replace(",", " ").trim().split(/\s+/);
//       if (parts.length < 2) {
//         return reply.code(400).send({ 
//           message: 'Invalid period format. Use "October 2025" or provide from/to dates.' 
//         });
//       }

//       const monthName = parts[0];
//       const year = parseInt(parts[1], 10);
//       if (isNaN(year)) {
//         return reply.code(400).send({ message: "Invalid year in period." });
//       }

//       const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
//       startDate = new Date(year, monthIndex, 1);
//       endDate = new Date(year, monthIndex + 1, 0);
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//       periodString = period.trim().replace(/\s+/g, " ");
//       console.log("Period string:", periodString);
//     } else {
//       return reply.code(400).send({ message: "Either period or from/to must be provided" });
//     }

//     // ------------------------------
//     // ⚠️ Check for existing invoice
//     // ------------------------------
//     const normalizedPeriod = periodString.trim().replace(/\s+/g, " ");
//     console.log("Normalized period:", normalizedPeriod);

//     const existingInvoice = await Invoice.findOne({
//       customerId: new mongoose.Types.ObjectId(customerId),
//       period: normalizedPeriod,
//     });
//     console.log("Existing invoice:", existingInvoice);

//     if (existingInvoice) {
//       console.log("Existing invoice found:", existingInvoice._id);
//       return reply.code(409).send({
//         message: "Invoice already exists for this period",
//         existingInvoice: {
//           id: existingInvoice._id,
//           billNo: existingInvoice.billNo,
//           period: existingInvoice.period,
//           url: existingInvoice.cloudinary?.secure_url,
//         },
//       });
//     }

//     // ------------------------------
//     // 👤 Fetch Customer
//     // ------------------------------
//     const customer = await Customer.findById(customerId)
//       .select("name address phone deliveryCost")
//       .lean();

//     if (!customer) {
//       return reply.code(404).send({ message: "Customer not found" });
//     }

//     // ------------------------------
//     // 🗓️ Fetch Attendance
//     // ------------------------------
//     const attendanceRecords = await AttendanceLog.find({
//       date: { $gte: startDate, $lte: endDate },
//       attendance: { $elemMatch: { customerId } },
//     }).sort({ date: 1 }).lean();

//     if (!attendanceRecords?.length) {
//       return reply.code(404).send({ message: "No attendance records found for this period." });
//     }

//     // ------------------------------
//     // 🧮 Build product map
//     // ------------------------------
//     const dateWiseMap = new Map();

//     for (const record of attendanceRecords) {
//       const dateKey = record.date.toISOString().split("T")[0];
//       const customerAttendance = (record.attendance || [])
//         .find(att => String(att.customerId) === String(customerId));

//       if (!customerAttendance) continue;

//       if (!dateWiseMap.has(dateKey)) dateWiseMap.set(dateKey, new Map());

//       const productsMap = dateWiseMap.get(dateKey);
//       for (const prod of (customerAttendance.products || [])) {
//         if (prod.status === "delivered") {
//           const pId = String(prod.productId);
//           const current = productsMap.get(pId) || 0;
//           productsMap.set(pId, current + (prod.quantity || 0));
//         }
//       }
//     }

//     const allProductIds = Array.from(
//       new Set([...Array.from(dateWiseMap.values()).flatMap(m => Array.from(m.keys()))])
//     );

//     const storeProducts = allProductIds.length
//       ? await StoreProduct.find({ _id: { $in: allProductIds } })
//           .select("name price").lean()
//       : [];

//     const productMap = new Map(storeProducts.map(p => [String(p._id), p]));

//     // ------------------------------
//     // 🧾 Build invoice data
//     // ------------------------------
//     let totalItemsAmount = 0;
//     const invoiceItems = [];
//     const sortedDates = Array.from(dateWiseMap.keys()).sort();

//     for (const date of sortedDates) {
//       const productsMap = dateWiseMap.get(date);
//       let dateTotal = 0;
//       const products = [];

//       for (const [productId, quantity] of productsMap.entries()) {
//         const productInfo = productMap.get(productId);
//         if (!productInfo) continue;

//         const itemTotal = (quantity || 0) * (productInfo.price || 0);
//         dateTotal += itemTotal;
//         products.push({
//           name: productInfo.name,
//           quantity,
//           price: productInfo.price,
//           itemTotal: itemTotal.toFixed(2),
//         });
//       }

//       if (products.length > 0) {
//         totalItemsAmount += dateTotal;
//         invoiceItems.push({ date, products, total: dateTotal.toFixed(2) });
//       }
//     }

//     const deliveryCharges = parseFloat(customer.deliveryCost || 0);
//     const grandTotal = totalItemsAmount + deliveryCharges;

//     const invoiceData = {
//       billNo: `INV-${Date.now()}-${String(customerId).slice(0, 6)}`,
//       period: normalizedPeriod,
//       fromDate: startDate.toISOString().split("T")[0],
//       toDate: endDate.toISOString().split("T")[0],
//       company: {
//         name: process.env.COMPANY_NAME || "Your Company",
//         address: process.env.COMPANY_ADDRESS || "Company address",
//         phone: process.env.COMPANY_PHONE || "0000000000",
//         logo: process.env.COMPANY_LOGO || null,
//       },
//       customer: {
//         name: customer.name,
//         address: `${customer.address?.FlatNo || ""} ${customer.address?.Apartment || ""} ${customer.address?.city || ""}`.trim(),
//         phone: customer.phone,
//       },
//       items: invoiceItems,
//       deliveryCharges: deliveryCharges.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//       generatedAt: new Date(),
//     };

//     // ------------------------------
//     // 🧱 Generate PDF & upload
//     // ------------------------------
//     const html = buildHtmlFromInvoiceData(invoiceData);
//     const pdfBuffer = await renderHtmlToPdfBuffer(html);

//     const publicId = `invoices/${customerId}/${invoiceData.billNo}`;
//     const uploadResult = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: "auto",
//           format: "pdf",
//           public_id: publicId,
//           overwrite: true,
//         },
//         (err, res) => (err ? reject(err) : resolve(res))
//       );
//       uploadStream.end(pdfBuffer);
//     });

//     // ------------------------------
//     // 💾 Save invoice in DB
//     // ------------------------------
//     const invoiceDoc = await Invoice.create({
//       billNo: invoiceData.billNo,
//       customerId,
//       period: normalizedPeriod,
//       fromDate: invoiceData.fromDate,
//       toDate: invoiceData.toDate,
//       items: invoiceData.items,
//       deliveryCharges: invoiceData.deliveryCharges,
//       grandTotal: invoiceData.grandTotal,
//       cloudinary: {
//         public_id: uploadResult.public_id,
//         url: uploadResult.url,
//         secure_url: uploadResult.secure_url,
//         bytes: uploadResult.bytes,
//         resource_type: uploadResult.resource_type,
//       },
//       generatedBy: generatedBy || "system",
//       generatedAt: invoiceData.generatedAt,
//     });

//     console.log("✅ Invoice generated:", uploadResult.secure_url);

//     return reply.code(201).send({
//       message: "Invoice generated successfully",
//       invoice: {
//         id: invoiceDoc._id,
//         billNo: invoiceDoc.billNo,
//         period: invoiceDoc.period,
//         fromDate: invoiceDoc.fromDate,
//         toDate: invoiceDoc.toDate,
//         grandTotal: invoiceDoc.grandTotal,
//         url: uploadResult.secure_url,
//         generatedAt: invoiceDoc.generatedAt,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error generating invoice:", error);
//     return reply.code(500).send({ message: "Internal server error." });
//   }
// };




// ==================== GET ALL INVOICES FOR CUSTOMER ====================


export const generateInvoice = async (request, reply) => {
  try {
    const { customerId, period, from, to, generatedBy } = request.body || {};
    console.log("Request body:", request.body);

    if (!customerId) {
      return reply.code(400).send({ message: "customerId is required" });
    }

    // ------------------------------
    // 🗓️ Determine date range
    // ------------------------------
    let startDate, endDate, periodString;

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      periodString = `${from}_to_${to}`;
    } else if (period) {
      const parts = period.replace(",", " ").trim().split(/\s+/);
      if (parts.length < 2) {
        return reply.code(400).send({
          message: 'Invalid period format. Use "October 2025" or provide from/to dates.',
        });
      }

      const monthName = parts[0];
      const year = parseInt(parts[1], 10);
      if (isNaN(year)) {
        return reply.code(400).send({ message: "Invalid year in period." });
      }

      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      startDate = new Date(year, monthIndex, 1);
      endDate = new Date(year, monthIndex + 1, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      periodString = period.trim().replace(/\s+/g, " ");
      console.log("Period string:", periodString);
    } else {
      return reply.code(400).send({ message: "Either period or from/to must be provided" });
    }

    const normalizedPeriod = periodString.trim().replace(/\s+/g, " ");
    console.log("Normalized period:", normalizedPeriod);

    // ------------------------------
    // ⚠️ Prevent overlapping invoices
    // ------------------------------
    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    // 1️⃣ Direct overlap check using fromDate/toDate
    const overlappingInvoice = await Invoice.findOne({
      customerId: customerObjectId,
      $and: [
        { fromDate: { $lte: endDate } },
        { toDate: { $gte: startDate } },
      ],
    }).lean();

    if (overlappingInvoice) {
      return reply.code(409).send({
        message: "Invoice already exists overlapping this date range",
        existingInvoice: {
          id: overlappingInvoice._id,
          billNo: overlappingInvoice.billNo,
          period: overlappingInvoice.period,
          fromDate: overlappingInvoice.fromDate,
          toDate: overlappingInvoice.toDate,
          url: overlappingInvoice.cloudinary?.secure_url,
        },
      });
    }

    // 2️⃣ Fallback: check for legacy period-based invoices (e.g., "October 2025")
    const legacyInvoices = await Invoice.find({
      customerId: customerObjectId,
      period: { $exists: true, $ne: null },
    })
      .select("period billNo cloudinary")
      .lean();

    for (const inv of legacyInvoices) {
      const p = (inv.period || "").trim();
      if (!p) continue;

      // Handle "YYYY-MM-DD_to_YYYY-MM-DD"
      const customMatch = p.match(/^(\d{4}-\d{2}-\d{2})_to_(\d{4}-\d{2}-\d{2})$/);
      if (customMatch) {
        const legacyFrom = new Date(customMatch[1]);
        legacyFrom.setHours(0, 0, 0, 0);
        const legacyTo = new Date(customMatch[2]);
        legacyTo.setHours(23, 59, 59, 999);

        const overlap = !(legacyTo < startDate || legacyFrom > endDate);
        if (overlap) {
          return reply.code(409).send({
            message: "Invoice already exists overlapping this custom date range",
            existingInvoice: {
              id: inv._id,
              billNo: inv.billNo,
              period: inv.period,
              url: inv.cloudinary?.secure_url,
            },
          });
        }
      }

      // Handle "October 2025"
      const parts = p.replace(",", " ").trim().split(/\s+/);
      if (parts.length >= 2) {
        const monthName = parts[0];
        const year = parseInt(parts[1], 10);
        if (!isNaN(year)) {
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
          const legacyFrom = new Date(year, monthIndex, 1);
          const legacyTo = new Date(year, monthIndex + 1, 0);
          legacyFrom.setHours(0, 0, 0, 0);
          legacyTo.setHours(23, 59, 59, 999);

          const overlap = !(legacyTo < startDate || legacyFrom > endDate);
          if (overlap) {
            return reply.code(409).send({
              message: "Invoice already exists overlapping this monthly period",
              existingInvoice: {
                id: inv._id,
                billNo: inv.billNo,
                period: inv.period,
                url: inv.cloudinary?.secure_url,
              },
            });
          }
        }
      }
    }

    // ------------------------------
    // 👤 Fetch Customer
    // ------------------------------
    const customer = await Customer.findById(customerId)
      .select("name address phone deliveryCost")
      .lean();

    if (!customer) {
      return reply.code(404).send({ message: "Customer not found" });
    }

    // ------------------------------
    // 🗓️ Fetch Attendance
    // ------------------------------
    const attendanceRecords = await AttendanceLog.find({
      date: { $gte: startDate, $lte: endDate },
      attendance: { $elemMatch: { customerId } },
    })
      .sort({ date: 1 })
      .lean();

    if (!attendanceRecords?.length) {
      return reply.code(404).send({ message: "No attendance records found for this period." });
    }

    // ------------------------------
    // 🧮 Build product map
    // ------------------------------
    const dateWiseMap = new Map();

    for (const record of attendanceRecords) {
      const dateKey = record.date.toISOString().split("T")[0];
      const customerAttendance = (record.attendance || []).find(
        (att) => String(att.customerId) === String(customerId)
      );

      if (!customerAttendance) continue;
      if (!dateWiseMap.has(dateKey)) dateWiseMap.set(dateKey, new Map());

      const productsMap = dateWiseMap.get(dateKey);
      for (const prod of customerAttendance.products || []) {
        if (prod.status === "delivered") {
          const pId = String(prod.productId);
          const current = productsMap.get(pId) || 0;
          productsMap.set(pId, current + (prod.quantity || 0));
        }
      }
    }

    const allProductIds = Array.from(
      new Set([...Array.from(dateWiseMap.values()).flatMap((m) => Array.from(m.keys()))])
    );

    const storeProducts = allProductIds.length
      ? await StoreProduct.find({ _id: { $in: allProductIds } })
          .select("name price")
          .lean()
      : [];

    const productMap = new Map(storeProducts.map((p) => [String(p._id), p]));

    // ------------------------------
    // 🧾 Build invoice data
    // ------------------------------
    let totalItemsAmount = 0;
    const invoiceItems = [];
    const sortedDates = Array.from(dateWiseMap.keys()).sort();

    for (const date of sortedDates) {
      const productsMap = dateWiseMap.get(date);
      let dateTotal = 0;
      const products = [];

      for (const [productId, quantity] of productsMap.entries()) {
        const productInfo = productMap.get(productId);
        if (!productInfo) continue;

        const itemTotal = (quantity || 0) * (productInfo.price || 0);
        dateTotal += itemTotal;
        products.push({
          name: productInfo.name,
          quantity,
          price: productInfo.price,
          itemTotal: itemTotal.toFixed(2),
        });
      }

      if (products.length > 0) {
        totalItemsAmount += dateTotal;
        invoiceItems.push({ date, products, total: dateTotal.toFixed(2) });
      }
    }

    const deliveryCharges = parseFloat(customer.deliveryCost || 0);
    const grandTotal = totalItemsAmount + deliveryCharges;

    const invoiceData = {
      billNo: `INV-${Date.now()}-${String(customerId).slice(0, 6)}`,
      period: normalizedPeriod,
      fromDate: startDate,
      toDate: endDate,
      company: {
        name: process.env.COMPANY_NAME || "Your Company",
        address: process.env.COMPANY_ADDRESS || "Company address",
        phone: process.env.COMPANY_PHONE || "0000000000",
        logo: process.env.COMPANY_LOGO || null,
      },
      customer: {
        name: customer.name,
        address: `${customer.address?.FlatNo || ""} ${customer.address?.Apartment || ""} ${
          customer.address?.city || ""
        }`.trim(),
        phone: customer.phone,
      },
      items: invoiceItems,
      deliveryCharges: deliveryCharges.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      generatedAt: new Date(),
    };

    // ------------------------------
    // 🧱 Generate PDF & upload
    // ------------------------------
    const html = buildHtmlFromInvoiceData(invoiceData);
    const pdfBuffer = await renderHtmlToPdfBuffer(html);

    const publicId = `invoices/${customerId}/${invoiceData.billNo}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          format: "pdf",
          public_id: publicId,
          overwrite: true,
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      uploadStream.end(pdfBuffer);
    });

    // ------------------------------
    // 💾 Save invoice in DB
    // ------------------------------
    const invoiceDoc = await Invoice.create({
      billNo: invoiceData.billNo,
      customerId,
      period: normalizedPeriod,
      fromDate: invoiceData.fromDate,
      toDate: invoiceData.toDate,
      items: invoiceData.items,
      deliveryCharges: invoiceData.deliveryCharges,
      grandTotal: invoiceData.grandTotal,
      cloudinary: {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,
        bytes: uploadResult.bytes,
        resource_type: uploadResult.resource_type,
      },
      generatedBy: generatedBy || "system",
      generatedAt: invoiceData.generatedAt,
    });

    console.log("✅ Invoice generated:", uploadResult.secure_url);

    return reply.code(201).send({
      message: "Invoice generated successfully",
      invoice: {
        id: invoiceDoc._id,
        billNo: invoiceDoc.billNo,
        period: invoiceDoc.period,
        fromDate: invoiceDoc.fromDate,
        toDate: invoiceDoc.toDate,
        grandTotal: invoiceDoc.grandTotal,
        url: uploadResult.secure_url,
        generatedAt: invoiceDoc.generatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    return reply.code(500).send({ message: "Internal server error." });
  }
};


export const getCustomerInvoices = async (request, reply) => {
  try {
    const { customerId } = request.params;

    if (!customerId) {
      return reply.code(400).send({ message: "customerId is required" });
    }

    const invoices = await Invoice.find({ customerId })
      .sort({ generatedAt: -1 })
      .select('billNo period fromDate toDate grandTotal cloudinary.secure_url generatedAt')
      .lean();

    return reply.code(200).send({
      count: invoices.length,
      invoices: invoices.map(inv => ({
        id: inv._id,
        billNo: inv.billNo,
        period: inv.period,
        fromDate: inv.fromDate,
        toDate: inv.toDate,
        grandTotal: inv.grandTotal,
        url: inv.cloudinary?.secure_url,
        generatedAt: inv.generatedAt,
      }))
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return reply.code(500).send({ message: "Internal server error." });
  }
};

// ==================== DELETE & REGENERATE INVOICE ====================
export const regenerateInvoice = async (request, reply) => {
  console.log("Regenerating invoice...");
  console.log("Request body:", request.body);
  try {
    const { invoiceId } = request.params;
    const { generatedBy } = request.body || {};

    // Find the existing invoice
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return reply.code(404).send({ message: "Invoice not found" });
    }

    // Validate that the customer still exists before regenerating
    const customer = await Customer.findById(existingInvoice.customerId);
    if (!customer) {
      return reply.code(404).send({ message: "Customer not found. Cannot regenerate invoice." });
    }

    // Delete from Cloudinary
    if (existingInvoice.cloudinary?.public_id) {
      try {
        // Use the same resource_type as was used when uploading
        await cloudinary.uploader.destroy(existingInvoice.cloudinary.public_id, {
          resource_type: existingInvoice.cloudinary.resource_type || 'raw'
        });
        console.log(`Deleted old invoice from Cloudinary: ${existingInvoice.cloudinary.public_id}`);
      } catch (cloudErr) {
        console.error("Failed to delete from Cloudinary:", cloudErr);
        // Don't return error here, still try to delete from DB
      }
    }

    // Delete from database
    await Invoice.findByIdAndDelete(invoiceId);
    console.log(`Deleted old invoice from DB: ${invoiceId}`);

    // Extract period info for regeneration
    const { customerId, period, fromDate, toDate } = existingInvoice;

    // Regenerate with the same period information
    let regenerateBody;
    if (period.includes('_to_')) {
      // This is a custom date range
      const [from, to] = period.split('_to_');
      regenerateBody = { customerId, from, to, generatedBy };
    } else if (fromDate && toDate) {
      // Use fromDate and toDate if available
      regenerateBody = { 
        customerId, 
        from: new Date(fromDate).toISOString().split('T')[0],
        to: new Date(toDate).toISOString().split('T')[0],
        generatedBy 
      };
    } else {
      // This is a monthly period (e.g. "October 2025")
      regenerateBody = { customerId, period, generatedBy };
    }

    console.log("Regenerating with body:", regenerateBody);

    // Temporarily store the original request body to restore later
    const originalBody = { ...request.body };
    
    // Set the body for the regeneration
    request.body = regenerateBody;
    
    // Call generate invoice internally
    const result = await generateInvoice(request, reply);
    
    // Restore the original request body
    request.body = originalBody;
    
    return result;

  } catch (error) {
    console.error("Error regenerating invoice:", error);
    return reply.code(500).send({ message: "Internal server error during regeneration." });
  }
};

// ==================== DELETE INVOICE ====================
export const deleteInvoice = async (request, reply) => {
  console.log("Deleting invoice...");
  try {
    const { invoiceId } = request.params;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return reply.code(404).send({ message: "Invoice not found" });
    }

    // Delete from Cloudinary
    if (invoice.cloudinary?.public_id) {
      try {
        // Use the same resource_type as was used when uploading
        await cloudinary.uploader.destroy(invoice.cloudinary.public_id, {
          resource_type: invoice.cloudinary.resource_type || 'raw'
        });
      } catch (cloudErr) {
        console.warn("Cloudinary deletion warning:", cloudErr);
      }
    }

    // Delete from database
    await Invoice.findByIdAndDelete(invoiceId);

    return reply.code(200).send({ 
      message: "Invoice deleted successfully",
      deletedInvoiceId: invoiceId 
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return reply.code(500).send({ message: "Internal server error." });
  }
};

// ==================== HELPER FUNCTIONS ====================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(val) {
  return Number(val).toLocaleString("en-IN", { 
    style: "currency", 
    currency: "INR" 
  });
}

function buildHtmlFromInvoiceData(data) {
  const productsHTML = data.items
    .map(i => `
      <tr>
        <td style="vertical-align:top;padding:8px;border:1px solid #ddd">${escapeHtml(i.date)}</td>
        <td style="vertical-align:top;padding:8px;border:1px solid #ddd">
          ${i.products
            .map(p => `${escapeHtml(p.name)} (${p.quantity} × ${money(p.price)})`)
            .join("<br/>")}
        </td>
        <td style="vertical-align:top;padding:8px;border:1px solid #ddd">${money(i.total)}</td>
      </tr>`)
    .join("");

  return `<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:20px;}
    .invoice{max-width:800px;margin:0 auto;}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
    .company{font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:12px;}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;}
    th{background:#f2f2f2;}
    .totals{margin-top:12px;text-align:right;}
  </style></head><body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="company">${escapeHtml(data.company.name)}</div>
        <div>${escapeHtml(data.company.address)}</div>
        <div>Phone: ${escapeHtml(data.company.phone)}</div>
      </div>
      <div style="text-align:right">
        ${data.company.logo ? `<img src="${escapeHtml(data.company.logo)}" alt="logo" style="max-height:80px" />` : ""}
        <div>Bill#: ${escapeHtml(data.billNo)}</div>
        <div>Period: ${escapeHtml(data.fromDate)} → ${escapeHtml(data.toDate)}</div>
      </div>
    </div>

    <div>
      <strong>Bill To:</strong> ${escapeHtml(data.customer.name)} <br/>
      <strong>Address:</strong> ${escapeHtml(data.customer.address)} <br/>
      <strong>Phone:</strong> ${escapeHtml(data.customer.phone)}
    </div>

    <table>
      <thead><tr><th>Date</th><th>Products</th><th>Total</th></tr></thead>
      <tbody>${productsHTML}</tbody>
    </table>

    <div class="totals">
      <div>Delivery Charges: ${money(data.deliveryCharges)}</div>
      <div style="font-size:18px;font-weight:700;">Grand Total: ${money(data.grandTotal)}</div>
    </div>
  </div>
  </body></html>`;
}
