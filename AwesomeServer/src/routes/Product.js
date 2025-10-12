import {
  getProducts,
  getProductsByCategoryId,
} from "../controllers/Product/Product.js";
import { getCategories, getProducts as getCatalogProducts } from "../controllers/Product/Catalog.js";
import { verifyToken } from "../middleware/auth.js";

export const productRoutes = async (fastify, options) => {
  // Existing Master Product Routes
  fastify.get('/master-products', { preHandler: [verifyToken] }, getProducts);
  fastify.get('/master-products/:categoryId', { preHandler: [verifyToken] }, getProductsByCategoryId);

  // Catalog Routes
  fastify.get('/api/categories', getCategories);
  fastify.get('/api/products', getCatalogProducts);
};