// controllers/Inventory/VendorController.js
import Vendor from '../../models/Vendor.js';
import StoreCategory from '../../models/Product/StoreCategory.js';

// Create a new vendor
export const createVendor = async (req, reply) => {
  console.log('Create Vendor API called', req.body)
  try {
    const vendorData = req.body;

    // Check if required categories are provided
    if (!vendorData.assignedCategories || vendorData.assignedCategories.length === 0) {
      return reply.code(400).send({
        success: false,
        message: 'At least one store category must be assigned to the vendor'
      });
    }

    // Check if any of the selected categories are already assigned to other vendors
    const { default: StoreCategory } = await import('../../models/Product/StoreCategory.js');
    const existingCategories = await StoreCategory.find({
      _id: { $in: vendorData.assignedCategories },
      vendorId: { $exists: true, $ne: null } // Categories that already have a vendor assigned
    });

    if (existingCategories.length > 0) {
      const categoryNames = existingCategories.map(cat => cat.name).join(', ');
      return reply.code(400).send({
        success: false,
        message: `The following categories are already assigned to other vendors and cannot be assigned: ${categoryNames}`
      });
    }

    // Additional validation - make sure the categories exist
    const validCategories = await StoreCategory.find({
      _id: { $in: vendorData.assignedCategories }
    });
    
    if (validCategories.length !== vendorData.assignedCategories.length) {
      return reply.code(400).send({
        success: false,
        message: 'One or more assigned categories do not exist'
      });
    }

    const vendor = new Vendor(vendorData);
    await vendor.save();

    // Update the store categories to reference this vendor
    await StoreCategory.updateMany(
      { _id: { $in: vendorData.assignedCategories } },
      { vendorId: vendor._id }
    );

    return reply.code(201).send({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    if (error.code === 11000) {
      return reply.code(409).send({
        success: false,
        message: 'Vendor with this phone number already exists'
      });
    }

    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get all vendors
export const getVendors = async (req, reply) => {
  console.log("Get vender API is called")
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const vendors = await Vendor.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vendor.countDocuments(filter);

    return reply.code(200).send({
      success: true,
      message: 'Vendors fetched successfully',
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Update vendor
export const updateVendor = async (req, reply) => {
  console.log("Update API is Called")
  try {
    const { id } = req.params;
    const updates = req.body;

    // If assigned categories are being updated, check if any of the selected categories are already assigned to other vendors
    if (updates.assignedCategories && Array.isArray(updates.assignedCategories)) {
      const { default: StoreCategory } = await import('../../models/Product/StoreCategory.js');
      
      // Find categories that are already assigned to other vendors
      const existingCategories = await StoreCategory.find({
        _id: { $in: updates.assignedCategories },
        vendorId: { $exists: true, $ne: null, $ne: id } // Categories assigned to other vendors
      });

      if (existingCategories.length > 0) {
        const categoryNames = existingCategories.map(cat => cat.name).join(', ');
        return reply.code(400).send({
          success: false,
          message: `The following categories are already assigned to other vendors and cannot be assigned: ${categoryNames}`
        });
      }
    }

    // If assigned categories are being updated, update the StoreCategory records as well
    if (updates.assignedCategories && Array.isArray(updates.assignedCategories)) {
      // First, remove this vendorId from all store categories that currently reference it
      await StoreCategory.updateMany(
        { vendorId: id },
        { $unset: { vendorId: 1 } }
      );

      // Then update the store categories to reference this vendor
      await StoreCategory.updateMany(
        { _id: { $in: updates.assignedCategories } },
        { vendorId: id }
      );
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, reply) => {
  console.log("get Vendor By Id API is called")
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Vendor fetched successfully',
      data: vendor
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Delete vendor
export const deleteVendor = async (req, reply) => {
  console.log('Delete Vendor API is Called');
  try {
    const { id } = req.params;

    // Find the vendor first to check if it exists
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Remove vendor reference from all store categories that reference this vendor
    await StoreCategory.updateMany(
      { vendorId: id },
      { $unset: { vendorId: 1 } } // Remove the vendorId field
    );

    // Now delete the vendor
    await Vendor.findByIdAndDelete(id);

    return reply.code(200).send({
      success: true,
      message: 'Vendor deleted successfully and references cleared from store categories'
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

// Toggle vendor status (active/inactive)
export const toggleVendorStatus = async (req, reply) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status value
    if (!['active', 'inactive', 'blacklisted'].includes(status)) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid status. Valid values are: active, inactive, blacklisted'
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor status
    vendor.status = status;
    await vendor.save();

    return reply.code(200).send({
      success: true,
      message: `Vendor status updated to ${status}`,
      data: vendor
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};