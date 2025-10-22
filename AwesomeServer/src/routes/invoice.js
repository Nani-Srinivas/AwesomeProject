import { getInvoice } from '../controllers/invoiceController.js';

export const invoiceRoutes = async (fastify, options) => {
  fastify.get('/invoice', getInvoice);
};

