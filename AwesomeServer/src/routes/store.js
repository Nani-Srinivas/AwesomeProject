import {
  createStore,
} from "../controllers/Store/Store.js";
import { getMasterCategories, getMasterProductsByCategories, importCatalog, updateSelectedCategories, getSubcategoriesByCategories, updateSelectedSubcategories, updateSelectedProducts } from "../controllers/Store/OnboardingController.js";
import { getStoreCategories, getStoreSubcategories, createStoreCategory, createStoreSubcategory, updateStoreCategory, deleteStoreCategory, deleteStoreSubcategory, getStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct } from "../controllers/Store/StoreController.js";
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

  fastify.post('/store/onboarding/subcategories-by-categories', {
    preHandler: [verifyToken]
  }, getSubcategoriesByCategories);

  fastify.post('/store/onboarding/update-selected-subcategories', {
    preHandler: [verifyToken]
  }, updateSelectedSubcategories);

  fastify.post('/store/onboarding/update-selected-products', {
    preHandler: [verifyToken]
  }, updateSelectedProducts);

  fastify.get('/store/categories', {
    preHandler: [verifyToken]
  }, getStoreCategories);

  fastify.get('/store/subcategories', {
    preHandler: [verifyToken]
  }, getStoreSubcategories);

  fastify.post('/store/categories', {
    preHandler: [verifyToken]
  }, createStoreCategory);

  fastify.post('/store/subcategories', {
    preHandler: [verifyToken]
  }, createStoreSubcategory);

  fastify.put('/store/categories/:id', {
    preHandler: [verifyToken]
  }, updateStoreCategory);

  fastify.delete('/store/categories/:id', {
    preHandler: [verifyToken]
  }, deleteStoreCategory);

  fastify.delete('/store/subcategories/:id', {
    preHandler: [verifyToken]
  }, deleteStoreSubcategory);

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