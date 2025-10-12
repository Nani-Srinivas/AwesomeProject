// import Category from "../../models/Product/Category.js";
// import Subcategory from "../../models/Product/Subcategory.js";
// import MasterProduct from "../../models/Product/MasterProduct.js";

// export const getMasterCategories = async (req, reply) => {
//   try {
//     const masterCategories = await Category.find({});

//     return reply.status(200).send({
//       success: true,
//       message: 'Master categories fetched successfully',
//       data: masterCategories,
//     });
//   } catch (error) {
//     console.error('Error fetching master categories:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const createMasterCategory = async (req, reply) => {
//   try {
//     const { name, description, imageUrl } = req.body;
//     const createdBy = req.user?.id;
//     const createdByModel = req.user?.role;

//     if (!createdBy || createdByModel !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master categories.' });
//     }

//     // Check for duplicate category name
//     const existingCategory = await Category.findOne({ name });
//     if (existingCategory) {
//       return reply.status(409).send({ message: 'A master category with this name already exists.' });
//     }

//     const newMasterCategory = new Category({
//       name,
//       description,
//       imageUrl,
//       createdBy,
//       createdByModel,
//     });

//     await newMasterCategory.save();

//     return reply.status(201).send({
//       success: true,
//       message: 'Master category created successfully',
//       data: newMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error creating master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const updateMasterCategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const { name, description, imageUrl } = req.body;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master categories.' });
//     }

//     // Check for duplicate category name, excluding the current category
//     const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
//     if (existingCategory) {
//       return reply.status(409).send({ message: 'A master category with this name already exists.' });
//     }

//     const updatedMasterCategory = await Category.findOneAndUpdate(
//       { _id: id },
//       { name, description, imageUrl },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMasterCategory) {
//       return reply.status(404).send({ message: 'Master category not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master category updated successfully',
//       data: updatedMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error updating master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const deleteMasterCategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master categories.' });
//     }

//     const deletedMasterCategory = await Category.findOneAndDelete({ _id: id });

//     if (!deletedMasterCategory) {
//       return reply.status(404).send({ message: 'Master category not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master category deleted successfully',
//       data: deletedMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error deleting master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const getMasterSubcategories = async (req, reply) => {
//   try {
//     const masterSubcategories = await Subcategory.find({});

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategories fetched successfully',
//       data: masterSubcategories,
//     });
//   } catch (error) {
//     console.error('Error fetching master subcategories:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const createMasterSubcategory = async (req, reply) => {
//   try {
//     const { name, categoryId } = req.body;
//     const createdBy = req.user?.id;
//     const createdByModel = req.user?.role;

//     if (!createdBy || createdByModel !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master subcategories.' });
//     }

//     // Validate categoryId
//     const categoryExists = await Category.findById(categoryId);
//     if (!categoryExists) {
//       return reply.status(400).send({ message: 'Invalid categoryId provided.' });
//     }

//     // Check for duplicate subcategory name within the category
//     const existingSubcategory = await Subcategory.findOne({ name, categoryId });
//     if (existingSubcategory) {
//       return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
//     }

//     const newMasterSubcategory = new Subcategory({
//       name,
//       categoryId,
//       createdBy,
//       createdByModel,
//     });

//     await newMasterSubcategory.save();

//     return reply.status(201).send({
//       success: true,
//       message: 'Master subcategory created successfully',
//       data: newMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error creating master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const updateMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const { name, categoryId } = req.body;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master subcategories.' });
//     }

//     // Validate categoryId if provided
//     if (categoryId) {
//       const categoryExists = await Category.findById(categoryId);
//       if (!categoryExists) {
//         return reply.status(400).send({ message: 'Invalid categoryId provided.' });
//       }
//     }

//     // Check for duplicate subcategory name within the category, excluding the current subcategory
//     const existingSubcategory = await Subcategory.findOne({ name, categoryId, _id: { $ne: id } });
//     if (existingSubcategory) {
//       return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
//     }

//     const updatedMasterSubcategory = await Subcategory.findOneAndUpdate(
//       { _id: id },
//       { name, categoryId },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory updated successfully',
//       data: updatedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error updating master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const deleteMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master subcategories.' });
//     }

//     const deletedMasterSubcategory = await Subcategory.findOneAndDelete({ _id: id });

//     if (!deletedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory deleted successfully',
//       data: deletedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error deleting master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const getMasterProducts = async (req, reply) => {
//   try {
//     const masterProducts = await MasterProduct.find({});

//     return reply.status(200).send({
//       success: true,
//       message: 'Master products fetched successfully',
//       data: masterProducts,
//     });
//   } catch (error) {
//     console.error('Error fetching master products:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const createMasterProduct = async (req, reply) => {
//   try {
//     const { name, description, basePrice, category, subcategory, images } = req.body;
//     const createdBy = req.user?.id;
//     const createdByModel = req.user?.role;

//     if (!createdBy || createdByModel !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master products.' });
//     }

//     // Validate category
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return reply.status(400).send({ message: 'Invalid category provided.' });
//     }

//     // Validate subcategory if provided
//     if (subcategory) {
//       const subcategoryExists = await Subcategory.findById(subcategory);
//       if (!subcategoryExists || String(subcategoryExists.categoryId) !== String(category)) {
//         return reply.status(400).send({ message: 'Invalid subcategory provided or it does not belong to the specified category.' });
//       }
//     }

//     // Check for duplicate product name
//     const existingProduct = await MasterProduct.findOne({ name });
//     if (existingProduct) {
//       return reply.status(409).send({ message: 'A master product with this name already exists.' });
//     }

//     const newMasterProduct = new MasterProduct({
//       name,
//       description,
//       basePrice,
//       category,
//       subcategory: subcategory || null,
//       images: images || [],
//       createdBy,
//       createdByModel,
//     });

//     await newMasterProduct.save();

//     return reply.status(201).send({
//       success: true,
//       message: 'Master product created successfully',
//       data: newMasterProduct,
//     });
//   } catch (error) {
//     console.error('Error creating master product:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const getMasterCategories = async (req, reply) => {
//   try {
//     const masterCategories = await Category.find({});

//     return reply.status(200).send({
//       success: true,
//       message: 'Master categories fetched successfully',
//       data: masterCategories,
//     });
//   } catch (error) {
//     console.error('Error fetching master categories:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const createMasterCategory = async (req, reply) => {
//   try {
//     const { name, description, imageUrl } = req.body;
//     const createdBy = req.user?.id;
//     const createdByModel = req.user?.role;

//     if (!createdBy || createdByModel !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master categories.' });
//     }

//     // Check for duplicate category name
//     const existingCategory = await Category.findOne({ name });
//     if (existingCategory) {
//       return reply.status(409).send({ message: 'A master category with this name already exists.' });
//     }

//     const newMasterCategory = new Category({
//       name,
//       description,
//       imageUrl,
//       createdBy,
//       createdByModel,
//     });

//     await newMasterCategory.save();

//     return reply.status(201).send({
//       success: true,
//       message: 'Master category created successfully',
//       data: newMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error creating master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const updateMasterCategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const { name, description, imageUrl } = req.body;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master categories.' });
//     }

//     // Check for duplicate category name, excluding the current category
//     const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
//     if (existingCategory) {
//       return reply.status(409).send({ message: 'A master category with this name already exists.' });
//     }

//     const updatedMasterCategory = await Category.findOneAndUpdate(
//       { _id: id },
//       { name, description, imageUrl },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMasterCategory) {
//       return reply.status(404).send({ message: 'Master category not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master category updated successfully',
//       data: updatedMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error updating master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const deleteMasterCategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master categories.' });
//     }

//     const deletedMasterCategory = await Category.findOneAndDelete({ _id: id });

//     if (!deletedMasterCategory) {
//       return reply.status(404).send({ message: 'Master category not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master category deleted successfully',
//       data: deletedMasterCategory,
//     });
//   } catch (error) {
//     console.error('Error deleting master category:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const getMasterSubcategories = async (req, reply) => {
//   try {
//     const masterSubcategories = await Subcategory.find({});

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategories fetched successfully',
//       data: masterSubcategories,
//     });
//   } catch (error) {
//     console.error('Error fetching master subcategories:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const createMasterSubcategory = async (req, reply) => {
//   try {
//     const { name, categoryId } = req.body;
//     const createdBy = req.user?.id;
//     const createdByModel = req.user?.role;

//     if (!createdBy || createdByModel !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master subcategories.' });
//     }

//     // Validate categoryId
//     const categoryExists = await Category.findById(categoryId);
//     if (!categoryExists) {
//       return reply.status(400).send({ message: 'Invalid categoryId provided.' });
//     }

//     // Check for duplicate subcategory name within the category
//     const existingSubcategory = await Subcategory.findOne({ name, categoryId });
//     if (existingSubcategory) {
//       return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
//     }

//     const newMasterSubcategory = new Subcategory({
//       name,
//       categoryId,
//       createdBy,
//       createdByModel,
//     });

//     await newMasterSubcategory.save();

//     return reply.status(201).send({
//       success: true,
//       message: 'Master subcategory created successfully',
//       data: newMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error creating master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const updateMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const { name, categoryId } = req.body;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master subcategories.' });
//     }

//     // Validate categoryId if provided
//     if (categoryId) {
//       const categoryExists = await Category.findById(categoryId);
//       if (!categoryExists) {
//         return reply.status(400).send({ message: 'Invalid categoryId provided.' });
//       }
//     }

//     // Check for duplicate subcategory name within the category, excluding the current subcategory
//     const existingSubcategory = await Subcategory.findOne({ name, categoryId, _id: { $ne: id } });
//     if (existingSubcategory) {
//       return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
//     }

//     const updatedMasterSubcategory = await Subcategory.findOneAndUpdate(
//       { _id: id },
//       { name, categoryId },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory updated successfully',
//       data: updatedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error updating master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const deleteMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master subcategories.' });
//     }

//     const deletedMasterSubcategory = await Subcategory.findOneAndDelete({ _id: id });

//     if (!deletedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory deleted successfully',
//       data: deletedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error deleting master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const deleteMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master subcategories.' });
//     }

//     const deletedMasterSubcategory = await Subcategory.findOneAndDelete({ _id: id });

//     if (!deletedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory deleted successfully',
//       data: deletedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error deleting master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };

// export const updateMasterSubcategory = async (req, reply) => {
//   try {
//     const { id } = req.params;
//     const { name, categoryId } = req.body;
//     const createdBy = req.user?.id;

//     if (!createdBy || req.user?.role !== 'Admin') {
//       return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master subcategories.' });
//     }

//     // Validate categoryId if provided
//     if (categoryId) {
//       const categoryExists = await Category.findById(categoryId);
//       if (!categoryExists) {
//         return reply.status(400).send({ message: 'Invalid categoryId provided.' });
//       }
//     }

//     // Check for duplicate subcategory name within the category, excluding the current subcategory
//     const existingSubcategory = await Subcategory.findOne({ name, categoryId, _id: { $ne: id } });
//     if (existingSubcategory) {
//       return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
//     }

//     const updatedMasterSubcategory = await Subcategory.findOneAndUpdate(
//       { _id: id },
//       { name, categoryId },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMasterSubcategory) {
//       return reply.status(404).send({ message: 'Master subcategory not found.' });
//     }

//     return reply.status(200).send({
//       success: true,
//       message: 'Master subcategory updated successfully',
//       data: updatedMasterSubcategory,
//     });
//   } catch (error) {
//     console.error('Error updating master subcategory:', error);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };


import Category from "../../models/Product/Category.js";
import Subcategory from "../../models/Product/Subcategory.js";
import MasterProduct from "../../models/Product/MasterProduct.js";

// ================= Master Categories =================

// ✅ Get all master categories
export const getMasterCategories = async (req, reply) => {
  try {
    const masterCategories = await Category.find({});
    return reply.status(200).send({
      success: true,
      message: 'Master categories fetched successfully',
      data: masterCategories,
    });
  } catch (error) {
    console.error('Error fetching master categories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Create master category (Admin only)
export const createMasterCategory = async (req, reply) => {
  try {
    const { name, description, imageUrl } = req.body;
    const createdBy = req.user?.id;
    const createdByModel = req.user?.role;

    if (!createdBy || createdByModel !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master categories.' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return reply.status(409).send({ message: 'A master category with this name already exists.' });
    }

    const newMasterCategory = new Category({
      name,
      description,
      imageUrl,
      createdBy,
      createdByModel,
    });

    await newMasterCategory.save();

    return reply.status(201).send({
      success: true,
      message: 'Master category created successfully',
      data: newMasterCategory,
    });
  } catch (error) {
    console.error('Error creating master category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Update master category (Admin only)
export const updateMasterCategory = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master categories.' });
    }

    const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
    if (existingCategory) {
      return reply.status(409).send({ message: 'A master category with this name already exists.' });
    }

    const updatedMasterCategory = await Category.findOneAndUpdate(
      { _id: id },
      { name, description, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedMasterCategory) {
      return reply.status(404).send({ message: 'Master category not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Master category updated successfully',
      data: updatedMasterCategory,
    });
  } catch (error) {
    console.error('Error updating master category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Delete master category (Admin only)
export const deleteMasterCategory = async (req, reply) => {
  try {
    const { id } = req.params;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master categories.' });
    }

    const deletedMasterCategory = await Category.findOneAndDelete({ _id: id });

    if (!deletedMasterCategory) {
      return reply.status(404).send({ message: 'Master category not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Master category deleted successfully',
      data: deletedMasterCategory,
    });
  } catch (error) {
    console.error('Error deleting master category:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ================= Master Subcategories =================

// ✅ Get all master subcategories
export const getMasterSubcategories = async (req, reply) => {
  try {
    const masterSubcategories = await Subcategory.find({});
    return reply.status(200).send({
      success: true,
      message: 'Master subcategories fetched successfully',
      data: masterSubcategories,
    });
  } catch (error) {
    console.error('Error fetching master subcategories:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Create master subcategory (Admin only)
export const createMasterSubcategory = async (req, reply) => {
  try {
    const { name, categoryId } = req.body;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master subcategories.' });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return reply.status(400).send({ message: 'Invalid categoryId provided.' });
    }

    const existingSubcategory = await Subcategory.findOne({ name, categoryId });
    if (existingSubcategory) {
      return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
    }

    const newMasterSubcategory = new Subcategory({
      name,
      categoryId,
      createdBy: req.user.id,
      createdByModel: req.user.role,
    });

    await newMasterSubcategory.save();

    return reply.status(201).send({
      success: true,
      message: 'Master subcategory created successfully',
      data: newMasterSubcategory,
    });
  } catch (error) {
    console.error('Error creating master subcategory:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Update master subcategory (Admin only)
export const updateMasterSubcategory = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master subcategories.' });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return reply.status(400).send({ message: 'Invalid categoryId provided.' });
      }
    }

    const existingSubcategory = await Subcategory.findOne({ name, categoryId, _id: { $ne: id } });
    if (existingSubcategory) {
      return reply.status(409).send({ message: 'A master subcategory with this name already exists in this category.' });
    }

    const updatedMasterSubcategory = await Subcategory.findOneAndUpdate(
      { _id: id },
      { name, categoryId },
      { new: true, runValidators: true }
    );

    if (!updatedMasterSubcategory) {
      return reply.status(404).send({ message: 'Master subcategory not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Master subcategory updated successfully',
      data: updatedMasterSubcategory,
    });
  } catch (error) {
    console.error('Error updating master subcategory:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Delete master subcategory (Admin only)
export const deleteMasterSubcategory = async (req, reply) => {
  try {
    const { id } = req.params;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete master subcategories.' });
    }

    const deletedMasterSubcategory = await Subcategory.findOneAndDelete({ _id: id });

    if (!deletedMasterSubcategory) {
      return reply.status(404).send({ message: 'Master subcategory not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Master subcategory deleted successfully',
      data: deletedMasterSubcategory,
    });
  } catch (error) {
    console.error('Error deleting master subcategory:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ================= Master Products =================

// ✅ Get all master products
export const getMasterProducts = async (req, reply) => {
  try {
    const masterProducts = await MasterProduct.find({});
    return reply.status(200).send({
      success: true,
      message: 'Master products fetched successfully',
      data: masterProducts,
    });
  } catch (error) {
    console.error('Error fetching master products:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Create master product (Admin only)
export const createMasterProduct = async (req, reply) => {
  try {
    const { name, description, basePrice, category, subcategory, images } = req.body;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can create master products.' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return reply.status(400).send({ message: 'Invalid category provided.' });
    }

    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists || String(subcategoryExists.categoryId) !== String(category)) {
        return reply.status(400).send({ message: 'Invalid subcategory provided or it does not belong to the specified category.' });
      }
    }

    const existingProduct = await MasterProduct.findOne({ name });
    if (existingProduct) {
      return reply.status(409).send({ message: 'A master product with this name already exists.' });
    }

    const newMasterProduct = new MasterProduct({
      name,
      description,
      basePrice,
      category,
      subcategory: subcategory || null,
      images: images || [],
      createdBy: req.user.id,
      createdByModel: req.user.role,
    });

    await newMasterProduct.save();

    return reply.status(201).send({
      success: true,
      message: 'Master product created successfully',
      data: newMasterProduct,
    });
  } catch (error) {
    console.error('Error creating master product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Update master product (Admin only)
export const updateMasterProduct = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, basePrice, category, subcategory, images } = req.body;

    if (!req.user?.id || req.user?.role !== 'Admin') {
      return reply.status(401).send({ message: 'Unauthorized: Only Admin can update master products.' });
    }

    // ✅ Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return reply.status(400).send({ message: 'Invalid category provided.' });
      }
    }

    // ✅ Validate subcategory if provided
    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (
        !subcategoryExists ||
        (category && String(subcategoryExists.categoryId) !== String(category))
      ) {
        return reply.status(400).send({
          message: 'Invalid subcategory provided or it does not belong to the specified category.',
        });
      }
    }

    // ✅ Check for duplicate product name (excluding current product)
    if (name) {
      const existingProduct = await MasterProduct.findOne({ name, _id: { $ne: id } });
      if (existingProduct) {
        return reply.status(409).send({ message: 'A master product with this name already exists.' });
      }
    }

    // ✅ Update product
    const updatedMasterProduct = await MasterProduct.findOneAndUpdate(
      { _id: id },
      { name, description, basePrice, category, subcategory: subcategory || null, images },
      { new: true, runValidators: true }
    );

    if (!updatedMasterProduct) {
      return reply.status(404).send({ message: 'Master product not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Master product updated successfully',
      data: updatedMasterProduct,
    });
  } catch (error) {
    console.error('Error updating master product:', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};
