// routes/inventory.js
import {
  createInventoryReceipt,
  getInventoryReceipts,
  getInventoryReceiptById,
  updateInventoryReceipt,
  addPaymentToReceipt
} from "../controllers/Inventory/InventoryReceiptController.js";
import { verifyToken } from "../middleware/auth.js";

export const inventoryRoutes = async (fastify, options) => {
  // Inventory Receipt routes
  fastify.post('/inventory/receipts', {preHandler: [verifyToken]}, createInventoryReceipt);
  fastify.get('/inventory/receipts', {preHandler: [verifyToken]}, getInventoryReceipts);
  fastify.get('/inventory/receipts/:id', {preHandler: [verifyToken]}, getInventoryReceiptById);
  fastify.put('/inventory/receipts/:id', {preHandler: [verifyToken]}, updateInventoryReceipt);
  fastify.post('/inventory/receipts/:id/payment', {preHandler: [verifyToken]}, addPaymentToReceipt);
};