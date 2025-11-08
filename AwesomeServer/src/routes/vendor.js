// routes/vendor.js
import {
  createVendor,
  getVendors,
  updateVendor,
  getVendorById,
  deleteVendor
} from "../controllers/Inventory/VendorController.js";
import { verifyToken } from "../middleware/auth.js";

export const vendorRoutes = async (fastify, options) => {
  // Vendor routes
  fastify.post('/vendors', {preHandler: [verifyToken]}, createVendor);
  fastify.get('/vendors', {preHandler: [verifyToken]}, getVendors);
  fastify.get('/vendors/:id', {preHandler: [verifyToken]}, getVendorById);
  fastify.put('/vendors/:id', {preHandler: [verifyToken]}, updateVendor);
  fastify.delete('/vendors/:id', {preHandler: [verifyToken]}, deleteVendor);
};