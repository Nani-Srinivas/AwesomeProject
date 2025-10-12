import {
  getProducts,
  getProductsByCategoryId,
} from "../controllers/Product/Product.js";
import { verifyToken } from "../middleware/auth.js";

export const productRoutes = async (fastify, options) => {
  // Existing Master Product Routes
  fastify.get('/master-products', { preHandler: [verifyToken] }, getProducts);
  fastify.get('/master-products/:categoryId', { preHandler: [verifyToken] }, getProductsByCategoryId);
};