import { AttendanceLog } from '../models/AttendanceLog.js';
import { Customer } from '../models/User/Customer.js'; // Assuming Customer model is here
import  StoreProduct  from '../models/Product/StoreProduct.js'; // Assuming StoreProduct model is here

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
  console.log('Server received invoice request:', JSON.stringify(request.query, null, 2));
  try {
    const { customerId, period } = request.query;

    if (!customerId || !period) {
      return reply.code(400).send({ message: 'Customer ID and period are required.' });
    }

    // Parse the period (e.g., "October 2025") into start and end dates
    const [monthName, yearString] = period.split(' ');
    const year = parseInt(yearString, 10);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-indexed month

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

    // Fetch customer details
    const customer = await Customer.findById(customerId).select('name address phone deliveryCost').lean();
    if (!customer) {
      return reply.code(404).send({ message: 'Customer not found.' });
    }

    // Query AttendanceLog for delivered products for this customer within the period
    const attendanceRecords = await AttendanceLog.find({
      date: { $gte: startDate, $lte: endDate },
      'attendance.customerId': customerId,
    }).sort({ date: 1 }).lean(); // Sort by date ascending

    // Structure: Map of { date: { productId: quantity } }
    const dateWiseMap = new Map();

    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      const customerAttendance = record.attendance.find(
        att => att.customerId.toString() === customerId
      );

      if (customerAttendance) {
        if (!dateWiseMap.has(dateKey)) {
          dateWiseMap.set(dateKey, new Map());
        }
        const productsMap = dateWiseMap.get(dateKey);

        customerAttendance.products.forEach(productEntry => {
          if (productEntry.status === 'delivered') {
            const pId = productEntry.productId.toString();
            const currentQty = productsMap.get(pId) || 0;
            productsMap.set(pId, currentQty + productEntry.quantity);
          }
        });
      }
    });

    // Get all unique product IDs
    const allProductIds = new Set();
    dateWiseMap.forEach(productsMap => {
      productsMap.forEach((qty, pId) => allProductIds.add(pId));
    });

    // Fetch product details
    const storeProducts = await StoreProduct.find({
      _id: { $in: Array.from(allProductIds) },
    }).select('name price').lean();

    const productMap = new Map(storeProducts.map(p => [p._id.toString(), p]));

    // Build invoice items (one row per date with product details array)
    let totalItemsAmount = 0;
    const invoiceItems = [];

    // Sort dates
    const sortedDates = Array.from(dateWiseMap.keys()).sort();

    sortedDates.forEach(date => {
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
      fromDate: startDate.toISOString().split('T')[0],
      toDate: endDate.toISOString().split('T')[0],
      company: {
        name: 'Your Company Name', // TODO: Make this configurable
        address: '12445 Street Name, Denver Co, 58786', // TODO: Make this configurable
        phone: '76785875855', // TODO: Make this configurable
      },
      customer: {
        name: customer.name,
        address: `${customer.address?.FlatNo || ''}, ${customer.address?.Apartment || ''}, ${customer.address?.city || ''}`,
        phone: customer.phone,
      },
      items: invoiceItems,
      deliveryCharges: deliveryCharges.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };

    return reply.code(200).send(invoiceData);
  } catch (error) {
    console.error('Error generating invoice:', error);
    return reply.code(500).send({ message: 'Internal server error.' });
  }
};