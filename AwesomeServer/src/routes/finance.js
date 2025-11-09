// routes/finance.js
import { getVendorPayables } from "../controllers/Finance/FinanceController.js";
import { verifyToken } from "../middleware/auth.js";

export const financeRoutes = async (fastify, options) => {
  // Vendor Payables routes
  fastify.get('/finance/payables', { preHandler: [verifyToken] }, getVendorPayables);
};