import {
    createStore,
  } from "../controllers/Store/Store.js";
import { getMasterCategories, getMasterProductsByCategories, importCatalog, updateSelectedCategories } from "../controllers/Store/OnboardingController.js";
import { getStoreCategories, createStoreCategory, updateStoreCategory, getStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct } from "../controllers/Store/StoreController.js";
import { verifyToken } from "../middleware/auth.js";

export const storeRoutes = async (fastify, options) => {
    fastify.post('/store/create', {
    preHandler: [verifyToken]
  }, createStore);

  fastify.get('/store/onboarding/master-categories', {
    preHandler: [verifyToken]
  }, getMasterCategories);

  fastify.post('/store/onboarding/master-products-by-categories', {
    preHandler: [verifyToken]
  }, getMasterProductsByCategories);

  fastify.post('/store/onboarding/import-catalog', {
    preHandler: [verifyToken]
  }, importCatalog);

  fastify.post('/store/onboarding/update-categories-selection', {
    preHandler: [verifyToken]
  }, updateSelectedCategories);

  fastify.get('/store/categories', {
    preHandler: [verifyToken]
  }, getStoreCategories);

  fastify.post('/store/categories', {
    preHandler: [verifyToken]
  }, createStoreCategory);

  fastify.put('/store/categories/:id', {
    preHandler: [verifyToken]
  }, updateStoreCategory);

  fastify.get('/store/products', {
    preHandler: [verifyToken]
  }, getStoreProducts);

  fastify.post('/store/products', {
    preHandler: [verifyToken]
  }, createStoreProduct);

  fastify.put('/store/products/:id', {
    preHandler: [verifyToken]
  }, updateStoreProduct);

  fastify.delete('/store/products/:id', {
    preHandler: [verifyToken]
  }, deleteStoreProduct);
};