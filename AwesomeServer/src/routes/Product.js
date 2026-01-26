import {
  getProducts,
  getProductsByCategoryId,
  getStoreProducts,
  getStoreProductsByVendor,
  getStoreCategories,
  assignVendorToStoreCategory,
  getAllProducts,
  getStoreBrands,
  assignVendorToStoreBrand,
  getStoreProductsByVendorBrands,
  createStoreBrand,
} from "../controllers/Product/Product.js";
import { getCategories, getProducts as getCatalogProducts } from "../controllers/Product/Catalog.js";
import { verifyToken } from "../middleware/auth.js";

export const productRoutes = async (fastify, options) => {
  // Existing Master Product Routes
  fastify.get('/master-products', { preHandler: [verifyToken] }, getProducts);
  fastify.get('/master-products/:categoryId', { preHandler: [verifyToken] }, getProductsByCategoryId);

  // Store-specific routes
  fastify.get('/product/store', { preHandler: [verifyToken] }, getStoreProducts);
  fastify.get('/product/store-brands', { preHandler: [verifyToken] }, getStoreBrands);
  fastify.post('/product/store-brands', { preHandler: [verifyToken] }, createStoreBrand);
  fastify.put('/product/store-brands/:id', { preHandler: [verifyToken] }, assignVendorToStoreBrand);
  // Replaced /product/store-by-vendor with Brand-based version
  fastify.get('/product/store-by-vendor', { preHandler: [verifyToken] }, getStoreProductsByVendorBrands);

  // Deprecated or Secondary
  fastify.get('/product/store-old-by-vendor', { preHandler: [verifyToken] }, getStoreProductsByVendor);

  fastify.get('/product/store-categories', { preHandler: [verifyToken] }, getStoreCategories);
  fastify.put('/product/store-categories/:id', { preHandler: [verifyToken] }, assignVendorToStoreCategory);

  // Catalog Routes
  fastify.get('/api/categories', getCategories);
  fastify.get('/api/products', getCatalogProducts);
  fastify.get('/products/all', { preHandler: [verifyToken] }, getAllProducts);
};