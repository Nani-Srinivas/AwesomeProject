// routes/vendor.js
import {
  createVendor,
  getVendors,
  updateVendor,
  getVendorById,
  deleteVendor,
  toggleVendorStatus,
  recordPaymentToVendor,
  getVendorPayments,
  getVendorPaymentById
} from "../controllers/Inventory/VendorController.js";
import { verifyToken } from "../middleware/auth.js";

export const vendorRoutes = async (fastify, options) => {
  // Vendor routes
  fastify.post('/vendors', {preHandler: [verifyToken]}, createVendor);
  fastify.get('/vendors', {preHandler: [verifyToken]}, getVendors);
  fastify.get('/vendors/:id', {preHandler: [verifyToken]}, getVendorById);
  fastify.put('/vendors/:id', {preHandler: [verifyToken]}, updateVendor);
  fastify.put('/vendors/:id/status', {preHandler: [verifyToken]}, toggleVendorStatus);
  fastify.post('/vendors/:id/payment', {preHandler: [verifyToken]}, recordPaymentToVendor);
  fastify.get('/vendors/:id/payments', {preHandler: [verifyToken]}, getVendorPayments);
  fastify.get('/vendors/:vendorId/payments/:paymentId', {preHandler: [verifyToken]}, getVendorPaymentById);
  fastify.delete('/vendors/:id', {preHandler: [verifyToken]}, deleteVendor);
};