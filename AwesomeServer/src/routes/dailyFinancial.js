import {
  listDailyFinancial,
  getMonthSummary
  } from "../controllers/Finance/financialController.js";
import { verifyToken } from "../middleware/auth.js";

export const dailyFinancialRoutes = async (fastify, options) => {
    fastify.get('/financials/:date', {preHandler: [verifyToken]}, listDailyFinancial);
    fastify.get('/financials/summary', {preHandler: [verifyToken]}, getMonthSummary);
};