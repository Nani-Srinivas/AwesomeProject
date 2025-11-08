// controllers/Inventory/VendorController.js
import Vendor from '../../models/Vendor.js';

// Create a new vendor
export const createVendor = async (req, reply) => {
  console.log('Create Vendor API called', req.body)
  try {
    const vendorData = req.body;

    const vendor = new Vendor(vendorData);
    await vendor.save();

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
  try {
    const { id } = req.params;
    const updates = req.body;

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
      success: true,
      message: error.message || 'Internal server error'
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, reply) => {
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
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};