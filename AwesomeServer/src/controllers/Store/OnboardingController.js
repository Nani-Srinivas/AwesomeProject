import MasterProduct from "../../models/Product/MasterProduct.js";
import Category from "../../models/Product/Category.js";
import Subcategory from "../../models/Product/Subcategory.js";
import StoreCategory from "../../models/Product/StoreCategory.js";
import StoreSubcategory from "../../models/Product/StoreSubcategory.js";
import StoreProduct from "../../models/Product/StoreProduct.js";
import Store from "../../models/Store/Store.js";
import { StoreManager } from "../../models/User/StoreManager.js";
import Brand from "../../models/Product/Brand.js";
import StoreBrand from "../../models/Product/StoreBrand.js";

export const getMasterCategories = async (req, reply) => {
  try {
    const categories = await Category.find({});
    return reply.status(200).send({
      success: true,
      message: 'Master categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching master categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getMasterProductsByCategories = async (req, reply) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds) {
      return reply.status(400).send({ message: 'categoryIds in request body is required' });
    }

    const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

    const products = await MasterProduct.find({ category: { $in: categoryIdArray } })
      .populate('category')
      .populate('subcategory');

    const categories = await Category.find({ _id: { $in: categoryIdArray } });
    const subcategories = await Subcategory.find({ categoryId: { $in: categoryIdArray } });

    const result = categories.map(cat => {
      const catSubcategories = subcategories.filter(sub => sub.categoryId.equals(cat._id));
      const catProducts = products.filter(prod => prod.category._id.equals(cat._id));
      return {
        category: cat,
        subcategories: catSubcategories,
        products: catProducts,
      };
    });

    return reply.status(200).send({
      success: true,
      message: 'Master products and subcategories fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching master products by categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getSubcategoriesByCategories = async (req, reply) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds) {
      return reply.status(400).send({ message: 'categoryIds in request body is required' });
    }

    const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

    const subcategories = await Subcategory.find({ categoryId: { $in: categoryIdArray } });

    return reply.status(200).send({
      success: true,
      message: 'Subcategories fetched successfully',
      data: subcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories by categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const importCatalog = async (req, reply) => {
  console.log('importCatalog controller called.');
  console.log('req.body:', req.body);
  console.log('req.user:', req.user);
  try {
    const { selectedMasterCategoryIds, selectedBrandIds, productsWithPricing } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.roles[0]; // Use roles[0] for consistency

    console.log('createdBy:', createdBy);
    console.log('createdByModel:', createdByModel);

    if (!createdBy || createdByModel !== 'StoreManager') {
      console.log('Unauthorized attempt to import catalog.');
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can import catalogs.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    console.log('Found store:', store ? store._id : 'None');
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // 1. Create StoreCategories
    console.log('Creating StoreCategories...');
    const masterCategories = await Category.find({ _id: { $in: selectedMasterCategoryIds } });
    const storeCategoriesMap = new Map(); // Map masterCategoryId to new StoreCategory

    for (const masterCat of masterCategories) {
      const newStoreCategory = new StoreCategory({
        storeId,
        masterCategoryId: masterCat._id,
        name: masterCat.name,
        description: masterCat.description,
        imageUrl: masterCat.imageUrl,
        createdBy,
        createdByModel,
      });
      await newStoreCategory.save();
      storeCategoriesMap.set(masterCat._id.toString(), newStoreCategory);
    }
    console.log(`Created ${storeCategoriesMap.size} StoreCategories.`);

    // 1.5 Create StoreBrands
    console.log('Creating StoreBrands...');
    const selectedMasterProductIds = productsWithPricing.map(p => p.masterProductId);
    const brandMasterProducts = await MasterProduct.find({ _id: { $in: selectedMasterProductIds } }).populate('subcategory');

    // Extract unique Brand IDs from MasterProducts AND explicit selections
    const productBrandIds = brandMasterProducts.map(p => p.brandId?.toString()).filter(Boolean);
    const explicitBrandIds = selectedBrandIds ? (Array.isArray(selectedBrandIds) ? selectedBrandIds : [selectedBrandIds]) : [];
    const uniqueBrandIds = [...new Set([...productBrandIds, ...explicitBrandIds])];

    const masterBrands = await Brand.find({ _id: { $in: uniqueBrandIds } });

    for (const masterBrand of masterBrands) {
      // Check if StoreBrand already exists (idempotency)
      const existingStoreBrand = await StoreBrand.findOne({ storeId, masterBrandId: masterBrand._id });
      if (!existingStoreBrand) {
        await StoreBrand.create({
          storeId,
          masterBrandId: masterBrand._id,
          name: masterBrand.name,
          description: masterBrand.description,
          imageUrl: masterBrand.imageUrl,
          createdBy,
          createdByModel,
          isActive: true
        });
      }
    }
    console.log(`Processed ${masterBrands.length} StoreBrands.`);

    // 1.6 Create storeBrandsMap for product mapping
    console.log('Creating storeBrandsMap for product linking...');
    const createdStoreBrands = await StoreBrand.find({ storeId });
    const storeBrandsMap = new Map();
    createdStoreBrands.forEach(sb => {
      storeBrandsMap.set(sb.masterBrandId.toString(), sb);
    });
    console.log(`Created storeBrandsMap with ${storeBrandsMap.size} brands.`);

    // 2. Create StoreSubcategories (for selected products)
    console.log('Creating StoreSubcategories...');
    // const selectedMasterProductIds = productsWithPricing.map(p => p.masterProductId); // Already defined above
    const masterProducts = await MasterProduct.find({ _id: { $in: selectedMasterProductIds } }).populate('subcategory');
    const masterSubcategoryIds = [...new Set(masterProducts.map(p => p.subcategory?._id).filter(Boolean))];
    const masterSubcategories = await Subcategory.find({ _id: { $in: masterSubcategoryIds } });
    const storeSubcategoriesMap = new Map(); // Map masterSubcategoryId to new StoreSubcategory

    for (const masterSubcat of masterSubcategories) {
      const parentStoreCategory = storeCategoriesMap.get(masterSubcat.categoryId.toString());
      if (parentStoreCategory) {
        const newStoreSubcategory = new StoreSubcategory({
          storeId,
          storeCategoryId: parentStoreCategory._id,
          masterSubcategoryId: masterSubcat._id,
          name: masterSubcat.name,
          description: masterSubcat.description,
          createdBy,
          createdByModel,
        });
        await newStoreSubcategory.save();
        storeSubcategoriesMap.set(masterSubcat._id.toString(), newStoreSubcategory);
      }
    }
    console.log(`Created ${storeSubcategoriesMap.size} StoreSubcategories.`);

    // 3. Create StoreProducts
    console.log('Creating StoreProducts...');
    for (const masterProd of masterProducts) {
      const pricingInfo = productsWithPricing.find(p => p.masterProductId === masterProd._id.toString());
      const parentStoreCategory = storeCategoriesMap.get(masterProd.category.toString());
      const parentStoreSubcategory = masterProd.subcategory ? storeSubcategoriesMap.get(masterProd.subcategory._id.toString()) : null;

      // Lookup StoreBrand using masterProduct's brandId
      const parentStoreBrand = masterProd.brandId ? storeBrandsMap.get(masterProd.brandId.toString()) : null;

      if (parentStoreCategory) {
        const newStoreProduct = new StoreProduct({
          storeId,
          masterProductId: masterProd._id,
          storeBrandId: parentStoreBrand ? parentStoreBrand._id : null, // Set storeBrandId
          name: masterProd.name,
          description: masterProd.description,
          costPrice: pricingInfo ? pricingInfo.costPrice : 0,
          sellingPrice: pricingInfo ? pricingInfo.sellingPrice : masterProd.basePrice,
          status: 'active',
          stock: 0, // Default initial stock
          storeCategoryId: parentStoreCategory._id,
          storeSubcategoryId: parentStoreSubcategory ? parentStoreSubcategory._id : null,
          images: masterProd.images,
          createdBy,
          createdByModel,
        });
        await newStoreProduct.save();
      }
    }
    console.log(`Created ${masterProducts.length} StoreProducts.`);

    // Update StoreManager's onboarding status - mark ALL steps as complete
    // Clear temporary selection arrays since data now exists in StoreCategory/Product records
    const updatedStoreManager = await StoreManager.findByIdAndUpdate(
      createdBy,
      {
        hasSelectedCategories: true,
        hasSelectedSubcategories: true,
        hasSelectedProducts: true,
        hasAddedProductPricing: true,
        additionalDetailsCompleted: true,  // Mark entire onboarding as complete
        selectedCategoryIds: [],           // Clear temporary state
        selectedSubcategoryIds: [],        // Clear temporary state
        selectedProductIds: []             // Clear temporary state
      },
      { new: true }
    );
    console.log('StoreManager onboarding completed:', {
      hasSelectedCategories: updatedStoreManager?.hasSelectedCategories,
      hasSelectedSubcategories: updatedStoreManager?.hasSelectedSubcategories,
      hasSelectedProducts: updatedStoreManager?.hasSelectedProducts,
      hasAddedProductPricing: updatedStoreManager?.hasAddedProductPricing,
      additionalDetailsCompleted: updatedStoreManager?.additionalDetailsCompleted,
    });

    return reply.status(200).send({
      success: true,
      message: 'Catalog imported successfully',
      data: { storeManager: updatedStoreManager }, // Return updated store manager data
    });
  } catch (error) {
    console.error('Error importing catalog:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateSelectedCategories = async (req, reply) => {
  console.log('updateSelectedCategories controller called.');
  console.log('req.user:', req.user);
  console.log('req.body:', req.body);
  try {
    const { categories: selectedCategoryIds } = req.body; // Get selected categories from body
    const createdBy = req.user?.id;
    const createdByModel = req.user?.roles[0];

    console.log('createdBy:', createdBy);
    console.log('createdByModel:', createdByModel);
    console.log('selectedCategoryIds from body:', selectedCategoryIds);

    if (!createdBy || createdByModel !== 'StoreManager') {
      console.log('Unauthorized attempt to update category selection.');
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can update category selection.' });
    }

    // Update the flag AND the IDs to persist state
    const updateResult = await StoreManager.findByIdAndUpdate(
      createdBy,
      {
        hasSelectedCategories: true,
        selectedCategoryIds: selectedCategoryIds
      },
      { new: true } // Return the updated document
    );
    console.log('StoreManager update result:', updateResult);

    return reply.status(200).send({
      success: true,
      message: 'Category selection status updated successfully',
      data: { storeManager: updateResult }, // Return updated store manager data
    });
  } catch (error) {
    console.error('Error updating category selection status:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateSelectedSubcategories = async (req, reply) => {
  console.log('updateSelectedSubcategories controller called.');
  try {
    const { subcategories: selectedSubcategoryIds } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.roles[0];

    if (!createdBy || createdByModel !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can update subcategory selection.' });
    }

    // Update the flag AND the IDs to persist state
    // Note: You might need to add selectedSubcategoryIds to StoreManager schema if not already there
    const updateResult = await StoreManager.findByIdAndUpdate(
      createdBy,
      {
        hasSelectedSubcategories: true,
        selectedSubcategoryIds: selectedSubcategoryIds
      },
      { new: true }
    );

    return reply.status(200).send({
      success: true,
      message: 'Subcategory selection status updated successfully',
      data: { storeManager: updateResult },
    });
  } catch (error) {
    console.error('Error updating subcategory selection status:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateSelectedProducts = async (req, reply) => {
  console.log('updateSelectedProducts controller called.');
  try {
    const { products: selectedProductIds } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.roles[0];

    if (!createdBy || createdByModel !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can update product selection.' });
    }

    // Update the IDs to persist state
    // We do NOT set hasSelectedProducts to true here, because that implies they are done with the step
    // and ready for pricing. We want them to go back to SelectProduct to confirm/continue.
    const updateResult = await StoreManager.findByIdAndUpdate(
      createdBy,
      {
        selectedProductIds: selectedProductIds
      },
      { new: true }
    );

    return reply.status(200).send({
      success: true,
      message: 'Product selection saved successfully',
      data: { storeManager: updateResult },
    });
  } catch (error) {
    console.error('Error updating product selection status:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};


