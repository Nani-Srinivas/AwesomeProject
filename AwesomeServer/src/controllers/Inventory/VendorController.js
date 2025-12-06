// controllers/Inventory/VendorController.js
import Vendor from '../../models/Vendor.js';
import StoreCategory from '../../models/Product/StoreCategory.js';
import Store from '../../models/Store/Store.js';

// Create a new vendor
export const createVendor = async (req, reply) => {
  console.log('Create Vendor API called', req.body)
  try {
    const vendorData = req.body;
    const createdBy = req.user?.id;

    // Get store for this manager
    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.code(404).send({
        success: false,
        message: 'Store not found for this manager'
      });
    }

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

    // Additional validation - make sure the categories exist and belong to this store
    const validCategories = await StoreCategory.find({
      _id: { $in: vendorData.assignedCategories },
      storeId: store._id  // Ensure categories belong to this store
    });

    if (validCategories.length !== vendorData.assignedCategories.length) {
      return reply.code(400).send({
        success: false,
        message: 'One or more assigned categories do not exist or do not belong to your store'
      });
    }

    // Create vendor with storeId
    const vendor = new Vendor({
      ...vendorData,
      storeId: store._id  // Add storeId
    });
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
  console.log("Get vendor API is called");
  try {
    const { page = 1, limit = 10, status } = req.query;
    const createdBy = req.user?.id;

    // Get store for this manager
    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.code(404).send({
        success: false,
        message: 'Store not found for this manager'
      });
    }

    const filter = { storeId: store._id };  // Filter by storeId
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

// Record payment for a vendor
export const recordPaymentToVendor = async (req, reply) => {
  console.log("Recording Payment to Vendor API is called");
  console.log('req', req.body);
  try {
    const { id } = req.params;
    const { amount, method, transactionId, notes } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return reply.code(400).send({
        success: false,
        message: 'Payment amount is required and must be greater than 0'
      });
    }

    // Validate payment method
    const validMethods = ['cash', 'bank_transfer', 'digital', 'cheque'];
    if (!validMethods.includes(method)) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid payment method. Valid methods: cash, bank_transfer, digital, cheque'
      });
    }

    // If payment method requires transaction ID, validate it
    if (['bank_transfer', 'digital', 'cheque'].includes(method) && !transactionId) {
      return reply.code(400).send({
        success: false,
        message: 'Transaction ID is required for this payment method'
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if the payment amount exceeds the payable amount
    if (amount > vendor.payableAmount) {
      return reply.code(400).send({
        success: false,
        message: `Payment amount cannot exceed payable amount of ₹${vendor.payableAmount}`
      });
    }

    // Update vendor's payable amount
    const newPayableAmount = vendor.payableAmount - amount;
    vendor.payableAmount = Math.max(0, newPayableAmount); // Ensure it doesn't go below zero

    // Update payment status based on remaining payable amount
    if (newPayableAmount <= 0) {
      vendor.paymentStatus = 'paid';
    } else if (newPayableAmount < vendor.payableAmount + amount) {
      // If we paid some amount but still have some due, it's partial
      vendor.paymentStatus = 'partial';
    }

    await vendor.save();

    // Update related inventory receipts to reflect payment
    // We'll first find and update receipts that are fully paid as we apply the payment
    // This requires accessing the InventoryReceipt model
    const InventoryReceipt = (await import('../../models/Inventory/InventoryReceipt.js')).default;
    const VendorPayment = (await import('../../models/Finance/VendorPayment.js')).default;

    // Get all pending and partial receipts for this vendor, sorted by date
    const receipts = await InventoryReceipt.find({
      vendorId: id,
      paymentStatus: { $in: ['pending', 'partial'] }
    }).sort({ receivedDate: 1, createdAt: 1 });

    let remainingPayment = amount;
    const appliedToReceipts = []; // Track which receipts this payment applies to

    for (const receipt of receipts) {
      if (remainingPayment <= 0) break;

      const dueForReceipt = receipt.totalAmount - receipt.amountPaid;
      const paymentForReceipt = Math.min(dueForReceipt, remainingPayment);

      // Update the receipt's payment information
      receipt.amountPaid += paymentForReceipt;

      if (receipt.amountPaid >= receipt.totalAmount) {
        receipt.paymentStatus = 'paid';
      } else if (receipt.amountPaid > 0) {
        receipt.paymentStatus = 'partial';
      }

      await receipt.save();

      // Track which receipts were paid and how much
      appliedToReceipts.push({
        receiptId: receipt._id,
        amountApplied: paymentForReceipt
      });

      // Reduce remaining payment
      remainingPayment -= paymentForReceipt;
    }

    // Create a payment record to track this transaction
    const paymentRecord = new VendorPayment({
      vendorId: id,
      amount: parseFloat(amount),
      method: method,
      transactionId: transactionId || undefined,
      notes: notes || undefined,
      createdBy: req.user.id, // Assuming the user ID is available from auth
      appliedToReceipts: appliedToReceipts
    });

    await paymentRecord.save();

    return reply.code(200).send({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        vendor,
        paymentRecord
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

// Get vendor payments
export const getVendorPayments = async (req, reply) => {
  try {
    const { id } = req.params; // vendor id
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Validate vendor exists
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    const VendorPayment = (await import('../../models/Finance/VendorPayment.js')).default;

    // Build filter
    const filter = { vendorId: id };
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Get payments
    const payments = await VendorPayment.find(filter)
      .populate('createdBy', 'name phone')
      .populate('appliedToReceipts.receiptId', 'receiptNumber receivedDate totalAmount amountPaid paymentStatus')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VendorPayment.countDocuments(filter);

    return reply.code(200).send({
      success: true,
      message: 'Vendor payments fetched successfully',
      data: payments,
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

// Get a specific vendor payment
export const getVendorPaymentById = async (req, reply) => {
  try {
    const { vendorId, paymentId } = req.params;

    // Validate vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    const VendorPayment = (await import('../../models/Finance/VendorPayment.js')).default;

    // Find payment for this vendor
    const payment = await VendorPayment.findOne({
      _id: paymentId,
      vendorId: vendorId
    })
      .populate('createdBy', 'name phone')
      .populate('appliedToReceipts.receiptId', 'receiptNumber receivedDate totalAmount amountPaid paymentStatus');

    if (!payment) {
      return reply.code(404).send({
        success: false,
        message: 'Payment not found for this vendor'
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Payment fetched successfully',
      data: payment
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};