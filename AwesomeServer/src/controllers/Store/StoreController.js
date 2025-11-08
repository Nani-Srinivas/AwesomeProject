import StoreCategory from "../../models/Product/StoreCategory.js";
import StoreSubcategory from "../../models/Product/StoreSubcategory.js";
import StoreProduct from "../../models/Product/StoreProduct.js";
import Store from "../../models/Store/Store.js";
import Category from "../../models/Product/Category.js";
import MasterProduct from "../../models/Product/MasterProduct.js";

export const getStoreCategories = async (req, reply) => {
  console.log('getStoreCategories controller called.');
  console.log('req.user:', req.user);
  try {
    const createdBy = req.user?.id;
    if (!createdBy) {
      return reply.status(401).send({ message: 'Unauthorized: User ID not found.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    const storeCategories = await StoreCategory.find({ storeId })
      .populate('masterCategoryId');

    return reply.status(200).send({
      success: true,
      message: 'Store categories fetched successfully',
      data: storeCategories,
    });
  } catch (error) {
    console.error('Error fetching store categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const createStoreCategory = async (req, reply) => {
  try {
    const { name, description, imageUrl, masterCategoryId } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.role;

    if (!createdBy || createdByModel !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can create categories.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // Check if masterCategoryId is provided and valid
    if (masterCategoryId) {
      const masterCategoryExists = await Category.findById(masterCategoryId);
      if (!masterCategoryExists) {
        return reply.status(400).send({ message: 'Invalid masterCategoryId provided.' });
      }
      // Check if this master category is already linked to this store
      const existingStoreCategory = await StoreCategory.findOne({ storeId, masterCategoryId });
      if (existingStoreCategory) {
        return reply.status(409).send({ message: 'This master category is already linked to your store.' });
      }
    }

    // Check for duplicate store-specific category name
    const existingStoreCategoryByName = await StoreCategory.findOne({ storeId, name });
    if (existingStoreCategoryByName) {
      return reply.status(409).send({ message: 'A category with this name already exists in your store.' });
    }

    const newStoreCategory = new StoreCategory({
      storeId,
      masterCategoryId: masterCategoryId || null,
      name,
      description,
      imageUrl,
      createdBy,
      createdByModel,
    });

    await newStoreCategory.save();

    return reply.status(201).send({
      success: true,
      message: 'Store category created successfully',
      data: newStoreCategory,
    });
  } catch (error) {
    console.error('Error creating store category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateStoreCategory = async (req, reply) => {
  console.log("Upadte Store Catgory API is called");
  console.log("Request Body", req.body);
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isActive, vendorId } = req.body;
    const createdBy = req.user?.id;

    if (!createdBy || req.user?.role !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can update categories.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // Prepare update object
    const updateFields = { name, description, imageUrl, isActive };
    if (vendorId !== undefined) {
      updateFields.vendorId = vendorId;
    }

    const updatedCategory = await StoreCategory.findOneAndUpdate(
      { _id: id, storeId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return reply.status(404).send({ message: 'Store category not found or does not belong to your store.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Store category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating store category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getStoreProducts = async (req, reply) => {
  console.log('getStoreProducts controller called.');
  console.log('req.user:', req.user);
  try {
    const createdBy = req.user?.id;
    if (!createdBy) {
      return reply.status(401).send({ message: 'Unauthorized: User ID not found.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;
    const { storeCategoryId, storeSubcategoryId, search } = req.query;

    const query = { storeId };
    if (storeCategoryId) {
      query.storeCategoryId = storeCategoryId;
    }
    if (storeSubcategoryId) {
      query.storeSubcategoryId = storeSubcategoryId;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search by name
    }

    const storeProducts = await StoreProduct.find(query)
      .populate('masterProductId')
      .populate('storeCategoryId')
      .populate('storeSubcategoryId');

    return reply.status(200).send({
      success: true,
      message: 'Store products fetched successfully',
      data: storeProducts,
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const createStoreProduct = async (req, reply) => {
  try {
    const { name, description, price, stock, storeCategoryId, storeSubcategoryId, images, masterProductId } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.role;

    if (!createdBy || createdByModel !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can create products.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // Validate storeCategoryId if provided
    if (storeCategoryId) {
      const storeCategoryExists = await StoreCategory.findById(storeCategoryId);
      if (!storeCategoryExists || String(storeCategoryExists.storeId) !== String(storeId)) {
        return reply.status(400).send({ message: 'Invalid storeCategoryId provided or it does not belong to your store.' });
      }
    }

    // Validate storeSubcategoryId if provided
    if (storeSubcategoryId) {
      const storeSubcategoryExists = await StoreSubcategory.findById(storeSubcategoryId);
      if (!storeSubcategoryExists || String(storeSubcategoryExists.storeId) !== String(storeId) || String(storeSubcategoryExists.storeCategoryId) !== String(storeCategoryId)) {
        return reply.status(400).send({ message: 'Invalid storeSubcategoryId provided or it does not belong to your store/category.' });
      }
    }

    // Validate masterProductId if provided
    if (masterProductId) {
      const masterProductExists = await MasterProduct.findById(masterProductId);
      if (!masterProductExists) {
        return reply.status(400).send({ message: 'Invalid masterProductId provided.' });
      }
      // Check if this master product is already linked to this store
      const existingStoreProduct = await StoreProduct.findOne({ storeId, masterProductId });
      if (existingStoreProduct) {
        return reply.status(409).send({ message: 'This master product is already linked to your store.' });
      }
    }

    // Check for duplicate store-specific product name
    const existingStoreProductByName = await StoreProduct.findOne({ storeId, name });
    if (existingStoreProductByName) {
      return reply.status(409).send({ message: 'A product with this name already exists in your store.' });
    }

    const newStoreProduct = new StoreProduct({
      storeId,
      masterProductId: masterProductId || null,
      name,
      description,
      price,
      stock,
      storeCategoryId,
      storeSubcategoryId: storeSubcategoryId || null,
      images: images || [],
      createdBy,
      createdByModel,
    });

    await newStoreProduct.save();

    return reply.status(201).send({
      success: true,
      message: 'Store product created successfully',
      data: newStoreProduct,
    });
  } catch (error) {
    console.error('Error creating store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateStoreProduct = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, storeCategoryId, storeSubcategoryId, images, isAvailable } = req.body;
    const createdBy = req.user?.id;

    if (!createdBy || req.user?.role !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can update products.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    // Validate storeCategoryId if provided
    if (storeCategoryId) {
      const storeCategoryExists = await StoreCategory.findById(storeCategoryId);
      if (!storeCategoryExists || String(storeCategoryExists.storeId) !== String(storeId)) {
        return reply.status(400).send({ message: 'Invalid storeCategoryId provided or it does not belong to your store.' });
      }
    }

    // Validate storeSubcategoryId if provided
    if (storeSubcategoryId) {
      const storeSubcategoryExists = await StoreSubcategory.findById(storeSubcategoryId);
      if (!storeSubcategoryExists || String(storeSubcategoryExists.storeId) !== String(storeId) || String(storeSubcategoryExists.storeCategoryId) !== String(storeCategoryId)) {
        return reply.status(400).send({ message: 'Invalid storeSubcategoryId provided or it does not belong to your store/category.' });
      }
    }

    const updatedProduct = await StoreProduct.findOneAndUpdate(
      { _id: id, storeId },
      { name, description, price, stock, storeCategoryId, storeSubcategoryId, images, isAvailable },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return reply.status(404).send({ message: 'Store product not found or does not belong to your store.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Store product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const deleteStoreProduct = async (req, reply) => {
  try {
    const { id } = req.params;
    const createdBy = req.user?.id;

    if (!createdBy || req.user?.role !== 'StoreManager') {
      return reply.status(401).send({ message: 'Unauthorized: Only Store Managers can delete products.' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(404).send({ message: 'Store not found for this manager.' });
    }

    const storeId = store._id;

    const deletedProduct = await StoreProduct.findOneAndDelete({ _id: id, storeId });

    if (!deletedProduct) {
      return reply.status(404).send({ message: 'Store product not found or does not belong to your store.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Store product deleted successfully',
      data: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting store product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};
