import { verifyToken } from "../middleware/auth.js";
import {
  getMasterCategories,
  createMasterCategory,
  updateMasterCategory,
  deleteMasterCategory,
  getMasterSubcategories,
  getSubcategoriesByBrands,
  createMasterSubcategory,
  updateMasterSubcategory,
  deleteMasterSubcategory,
  getMasterProducts,
  createMasterProduct,
  updateMasterProduct,
} from "../controllers/Admin/MasterCategoryController.js";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/Admin/BrandController.js";
import { bulkUpload, getBulkUploadForm } from "../controllers/Admin/BulkUploadController.js";

export const adminRoutes = async (fastify, options) => {
  // Add custom parser specifically for this route context to avoid AdminJS conflicts
  fastify.addContentTypeParser('multipart/form-data', (req, payload, done) => {
    done(null, payload);
  });

  // Brand routes
  fastify.get(
    "/admin/brands",
    {
      preHandler: [verifyToken],
    },
    getBrands
  );

  fastify.post(
    "/admin/brands",
    {
      preHandler: [verifyToken],
    },
    createBrand
  );

  fastify.put(
    "/admin/brands/:id",
    {
      preHandler: [verifyToken],
    },
    updateBrand
  );

  fastify.delete(
    "/admin/brands/:id",
    {
      preHandler: [verifyToken],
    },
    deleteBrand
  );

  // Category routes
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

  // Get subcategories filtered by brand IDs (for onboarding)
  fastify.get(
    "/admin/subcategories-by-brands",
    {
      preHandler: [verifyToken],
    },
    getSubcategoriesByBrands
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

  // Bulk Upload UI
  fastify.get(
    "/admin/bulk-upload",
    getBulkUploadForm
  );

  // Bulk Upload API
  fastify.post(
    "/admin/bulk-upload",
    {
      // preHandler: [verifyToken], // Uncomment if you want auth
    },
    bulkUpload
  );
};
