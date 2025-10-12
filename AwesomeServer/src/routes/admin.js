import { verifyToken } from "../middleware/auth.js";
import {
  getMasterCategories,
  createMasterCategory,
  updateMasterCategory,
  deleteMasterCategory,
  getMasterSubcategories,
  createMasterSubcategory,
  updateMasterSubcategory,
  deleteMasterSubcategory,
  getMasterProducts,
  createMasterProduct,
  updateMasterProduct,
} from "../controllers/Admin/MasterCategoryController.js";

export const adminRoutes = async (fastify, options) => {
  fastify.get(
    "/admin/master-categories",
    {
      preHandler: [verifyToken],
    },
    getMasterCategories
  );

  fastify.post(
    "/admin/master-categories",
    {
      preHandler: [verifyToken],
    },
    createMasterCategory
  );

  fastify.put(
    "/admin/master-categories/:id",
    {
      preHandler: [verifyToken],
    },
    updateMasterCategory
  );

  fastify.delete(
    "/admin/master-categories/:id",
    {
      preHandler: [verifyToken],
    },
    deleteMasterCategory
  );

  fastify.get(
    "/admin/master-subcategories",
    {
      preHandler: [verifyToken],
    },
    getMasterSubcategories
  );

  fastify.post(
    "/admin/master-subcategories",
    {
      preHandler: [verifyToken],
    },
    createMasterSubcategory
  );

  fastify.put(
    "/admin/master-subcategories/:id",
    {
      preHandler: [verifyToken],
    },
    updateMasterSubcategory
  );

  fastify.delete(
    "/admin/master-subcategories/:id",
    {
      preHandler: [verifyToken],
    },
    deleteMasterSubcategory
  );

  fastify.get(
    "/admin/master-products",
    {
      preHandler: [verifyToken],
    },
    getMasterProducts
  );

  fastify.post(
    "/admin/master-products",
    {
      preHandler: [verifyToken],
    },
    createMasterProduct
  );

  fastify.put(
    "/admin/master-products/:id",
    {
      preHandler: [verifyToken],
    },
    updateMasterProduct
  );
};
