import MasterProduct from "../../models/Product/MasterProduct.js";
import Category from "../../models/Product/Category.js";
import Store from "../../models/Store/Store.js";
import StoreProduct from "../../models/Product/StoreProduct.js";
import StoreCategory from "../../models/Store/StoreCategory.js";
import StoreSubcategory from "../../models/Store/StoreSubcategory.js";

// MASTER PRODUCTS
export const getProducts = async (req, reply) => {
  try {
    const products = await MasterProduct.find();
    return reply.status(200).send({
      success: true,
      message: 'Products fetched successfully',
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getAllCategories = async (req, reply) => {
  try {
    const categories = await Category.find();
    return reply.status(200).send({
      success: true,
      message: 'categories fetched successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;
  try {
    const products = await MasterProduct.find({ category: categoryId })
      .select("-category")
      .exec();
    return reply.send({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

export const getMasterProductsByCategories = async (req, reply) => {
  try {
    const { categoryIds } = req.query;
    if (!categoryIds) {
      return reply.status(400).send({ message: 'Category IDs are required' });
    }

    const categoryIdArray = categoryIds.split(',');

    const products = await MasterProduct.find({ category: { $in: categoryIdArray } })
      .populate('category') // Populate category details
      .populate('subcategory'); // Populate subcategory details

    // Group products by category for the client
    const categorizedProducts = categoryIdArray.map(catId => {
      const categoryProducts = products.filter(product => product.category._id.toString() === catId);
      const uniqueSubcategories = [...new Set(categoryProducts.map(p => p.subcategory._id.toString()))]
        .map(subId => categoryProducts.find(p => p.subcategory._id.toString() === subId)?.subcategory);

      return {
        category: categoryProducts[0]?.category || { _id: catId, name: 'Unknown' }, // Fallback if no products in category
        subcategories: uniqueSubcategories.filter(Boolean), // Remove undefined
        products: categoryProducts.map(({ _id, name, basePrice, images }) => ({ _id, name, basePrice, images })),
      };
    });

    return reply.status(200).send({
      success: true,
      message: 'Master products by categories fetched successfully',
      data: categorizedProducts,
    });
  } catch (error) {
    console.error('Error fetching master products by categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const importCatalog = async (req, reply) => {
  try {
    const { selectedMasterCategoryIds, selectedMasterProductIds } = req.body;
    const storeManagerId = req.user.id; // Assuming user ID is available from verifyToken

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // Import Categories
    const masterCategories = await Category.find({ _id: { $in: selectedMasterCategoryIds } });
    const importedStoreCategories = await Promise.all(masterCategories.map(async (mc) => {
      let storeCategory = await StoreCategory.findOne({ storeId, masterCategoryId: mc._id });
      if (!storeCategory) {
        storeCategory = await StoreCategory.create({
          storeId,
          masterCategoryId: mc._id,
          name: mc.name,
          description: mc.description,
          imageUrl: mc.imageUrl,
          createdBy: storeManagerId,
          createdByModel: 'StoreManager',
        });
      }
      return storeCategory;
    }));

    // Import Products
    const masterProducts = await MasterProduct.find({ _id: { $in: selectedMasterProductIds } })
      .populate('category')
      .populate('subcategory');

    await Promise.all(masterProducts.map(async (mp) => {
      // Find or create corresponding StoreCategory and StoreSubcategory
      const storeCategory = importedStoreCategories.find(sc => sc.masterCategoryId.toString() === mp.category._id.toString());
      if (!storeCategory) {
        console.warn(`Master product ${mp.name} has no corresponding store category. Skipping.`);
        return;
      }

      let storeSubcategory = null;
      if (mp.subcategory) {
        storeSubcategory = await StoreSubcategory.findOne({ storeId, masterSubcategoryId: mp.subcategory._id });
        if (!storeSubcategory) {
          storeSubcategory = await StoreSubcategory.create({
            storeId,
            storeCategoryId: storeCategory._id,
            masterSubcategoryId: mp.subcategory._id,
            name: mp.subcategory.name,
            createdBy: storeManagerId,
            createdByModel: 'StoreManager',
          });
        }
      }

      let storeProduct = await StoreProduct.findOne({ storeId, masterProductId: mp._id });
      if (!storeProduct) {
        await StoreProduct.create({
          storeId,
          masterProductId: mp._id,
          name: mp.name,
          description: mp.description,
          price: mp.basePrice,
          images: mp.images,
          storeCategoryId: storeCategory._id,
          storeSubcategoryId: storeSubcategory ? storeSubcategory._id : null,
          createdBy: storeManagerId,
          createdByModel: 'StoreManager',
        });
      }
    }));

    return reply.status(200).send({ success: true, message: 'Catalog imported successfully!' });
  } catch (error) {
    console.error('Error importing catalog:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getStoreCategories = async (req, reply) => {
  try {
    const storeManagerId = req.user.id;
    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const categories = await StoreCategory.find({ storeId: store._id });
    return reply.status(200).send({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching store categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const createStoreCategory = async (req, reply) => {
  try {
    const { name, description, imageUrl, masterCategoryId } = req.body;
    const storeManagerId = req.user.id;

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const newCategory = await StoreCategory.create({
      storeId: store._id,
      name,
      description,
      imageUrl,
      masterCategoryId: masterCategoryId || null,
      createdBy: storeManagerId,
      createdByModel: 'StoreManager',
    });

    return reply.status(201).send({ success: true, message: 'Store category created successfully', data: newCategory });
  } catch (error) {
    console.error('Error creating store category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateStoreCategory = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isActive } = req.body;
    const storeManagerId = req.user.id;

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const updatedCategory = await StoreCategory.findOneAndUpdate(
      { _id: id, storeId: store._id },
      { name, description, imageUrl, isActive },
      { new: true }
    );

    if (!updatedCategory) {
      return reply.status(404).send({ message: 'Store category not found or not authorized.' });
    }

    return reply.status(200).send({ success: true, message: 'Store category updated successfully', data: updatedCategory });
  } catch (error) {
    console.error('Error updating store category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getStoreProducts = async (req, reply) => {
  try {
    const storeManagerId = req.user.id;
    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const products = await StoreProduct.find({ storeId: store._id })
      .populate('storeCategoryId')
      .populate('storeSubcategoryId')
      .populate('masterProductId');

    return reply.status(200).send({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching store products:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const createStoreProduct = async (req, reply) => {
  try {
    const { name, description, price, stock, isAvailable, images, storeCategoryId, storeSubcategoryId, masterProductId } = req.body;
    const storeManagerId = req.user.id;

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const newProduct = await StoreProduct.create({
      storeId: store._id,
      name,
      description,
      price,
      stock,
      isAvailable,
      images,
      storeCategoryId,
      storeSubcategoryId: storeSubcategoryId || null,
      masterProductId: masterProductId || null,
      createdBy: storeManagerId,
      createdByModel: 'StoreManager',
    });

    return reply.status(201).send({ success: true, message: 'Store product created successfully', data: newProduct });
  } catch (error) {
    console.error('Error creating store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateStoreProduct = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, isAvailable, images, storeCategoryId, storeSubcategoryId } = req.body;
    const storeManagerId = req.user.id;

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const updatedProduct = await StoreProduct.findOneAndUpdate(
      { _id: id, storeId: store._id },
      { name, description, price, stock, isAvailable, images, storeCategoryId, storeSubcategoryId },
      { new: true }
    );

    if (!updatedProduct) {
      return reply.status(404).send({ message: 'Store product not found or not authorized.' });
    }

    return reply.status(200).send({ success: true, message: 'Store product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Error updating store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const deleteStoreProduct = async (req, reply) => {
  try {
    const { id } = req.params;
    const storeManagerId = req.user.id;

    const store = await Store.findOne({ ownerId: storeManagerId });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const deletedProduct = await StoreProduct.findOneAndDelete({ _id: id, storeId: store._id });

    if (!deletedProduct) {
      return reply.status(404).send({ message: 'Store product not found or not authorized.' });
    }

    return reply.status(200).send({ success: true, message: 'Store product deleted successfully' });
  } catch (error) {
    console.error('Error deleting store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getAllProducts = async (req, reply) => {
  try {
    const products = await MasterProduct.find()
      .populate('category')
      .populate('subcategory');

    return reply.status(200).send({
      success: true,
      message: 'All products fetched successfully',
      data: products,
    });
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};