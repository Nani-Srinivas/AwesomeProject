// import { invoiceController } from '../controllers/invoiceController.js';

// export const invoiceRoutes = async (fastify, options) => {
//   // Route to generate, upload, and save an invoice
//   fastify.post('/invoices/generate', {
//     // Add schema validation if desired
//     handler: invoiceController.generateInvoice,
//   });

//   // Route to get all invoices for a specific customer
//   fastify.get('/invoices/:customerId', {
//     // Add schema validation if desired
//     handler: invoiceController.getInvoicesForCustomer,
//   });
// };

import { getInvoice, generateInvoice, getCustomerInvoices, regenerateInvoice, deleteInvoice } from '../controllers/invoiceController.js';

export const invoiceRoutes = async (fastify, options) => {
  fastify.get('/invoice', getInvoice);
  fastify.post('/invoice/generate', generateInvoice);
  fastify.get('/invoice/customer/:customerId', getCustomerInvoices);
  fastify.post('/invoice/regenerate/:invoiceId', regenerateInvoice);
  fastify.delete('/invoice/:invoiceId', deleteInvoice);
};
