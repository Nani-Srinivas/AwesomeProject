import {
  addStock,
    getStockByDate,
  } from "../controllers/Store/Stock.js";
import { verifyToken } from "../middleware/auth.js";

export const stockRoutes = async (fastify, options) => {
    fastify.post('/stocks/create', {preHandler: [verifyToken]}, addStock);
    fastify.get('/stocks/:date', {preHandler: [verifyToken]}, getStockByDate);
};