// controllers/Inventory/InventoryReceiptController.js
import InventoryReceipt from '../../models/Inventory/InventoryReceipt.js';
import Vendor from '../../models/Vendor.js';
import ProductStock from '../../models/ProductStock.js';  // Use the new ProductStock model
import StoreProduct from '../../models/Product/StoreProduct.js';
import Store from '../../models/Store/Store.js';

// Create a new inventory receipt
export const createInventoryReceipt = async (req, reply) => {
  try {
    const {
      vendorId,
      items,
      totalAmount,
      paymentStatus,
      amountPaid,
      paymentMethod,
      transactionId,
      notes
    } = req.body;
    
    const storeId = req.user.storeId; // Assuming storeId is available in the user object
    const receivedBy = req.user.id;

    // Validate vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return reply.code(404).send({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Validate all products exist and update stock
    for (const item of items) {
      const product = await StoreProduct.findById(item.storeProductId);
      if (!product) {
        return reply.code(404).send({
          success: false,
          message: `StoreProduct with ID ${item.storeProductId} not found`
        });
      }

      // Update stock for each item
      let stock = await ProductStock.findOne({ storeProductId: item.storeProductId, storeId });
      if (!stock) {
        // Create new stock entry if it doesn't exist
        stock = new ProductStock({
          storeProductId: item.storeProductId,
          storeId,
          currentQuantity: 0,
          availableQuantity: 0,
          lastUpdatedBy: receivedBy
        });
      }

      // Update quantities
      stock.currentQuantity += item.receivedQuantity;
      stock.availableQuantity += item.receivedQuantity;
      
      // Add to restock history
      stock.restockHistory.push({
        quantity: item.receivedQuantity,
        date: new Date(),
        reason: 'Purchase',
        referenceId: null, // Will be set after creating the receipt
        referenceType: 'InventoryReceipt'
      });
      
      // Update cost price if needed
      if (item.unitPrice) {
        stock.costPrice = item.unitPrice;
      }
      
      // Handle expiry dates if provided
      if (item.batchNumber && item.expiryDate) {
        const existingBatchIndex = stock.expiryDates.findIndex(
          batch => batch.batchNumber === item.batchNumber
        );
        
        if (existingBatchIndex !== -1) {
          stock.expiryDates[existingBatchIndex].quantity += item.receivedQuantity;
        } else {
          stock.expiryDates.push({
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            quantity: item.receivedQuantity
          });
        }
      }

      await stock.save();
    }

    // Generate receipt number
    const receiptCount = await InventoryReceipt.countDocuments();
    const receiptNumber = `INV-${Date.now()}-${receiptCount + 1}`;

    // Create the inventory receipt
    const inventoryReceipt = new InventoryReceipt({
      receiptNumber,
      storeId,
      vendorId,
      receivedBy,
      items,
      totalAmount,
      paymentStatus,
      amountPaid,
      paymentMethod,
      transactionId,
      notes
    });

    // Update the referenceId in restock history to point to this receipt
    for (const item of items) {
      const stock = await ProductStock.findOne({ storeProductId: item.storeProductId, storeId });
      const lastHistoryIndex = stock.restockHistory.length - 1;
      if (lastHistoryIndex >= 0) {
        stock.restockHistory[lastHistoryIndex].referenceId = inventoryReceipt._id;
        await stock.save();
      }
    }

    await inventoryReceipt.save();

    return reply.code(201).send({
      success: true,
      message: 'Inventory receipt created successfully',
      data: inventoryReceipt
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get all inventory receipts for a store
export const getInventoryReceipts = async (req, reply) => {
  try {
    const storeId = req.user.storeId;
    const { page = 1, limit = 10, vendorId, paymentStatus, startDate, endDate } = req.query;

    const filter = { storeId };
    
    if (vendorId) filter.vendorId = vendorId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.receivedDate = {};
      if (startDate) filter.receivedDate.$gte = new Date(startDate);
      if (endDate) filter.receivedDate.$lte = new Date(endDate);
    }

    const receipts = await InventoryReceipt.find(filter)
      .populate('vendorId', 'name phone email')
      .populate('receivedBy', 'name phone')
      .populate('items.storeProductId', 'name price')
      .sort({ receivedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryReceipt.countDocuments(filter);

    return reply.code(200).send({
      success: true,
      message: 'Inventory receipts fetched successfully',
      data: receipts,
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

// Get a specific inventory receipt by ID
export const getInventoryReceiptById = async (req, reply) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const receipt = await InventoryReceipt.findOne({ _id: id, storeId })
      .populate('vendorId', 'name phone email address contactPerson')
      .populate('receivedBy', 'name phone')
      .populate('items.storeProductId', 'name price');

    if (!receipt) {
      return reply.code(404).send({
        success: false,
        message: 'Inventory receipt not found'
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Inventory receipt fetched successfully',
      data: receipt
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Update an inventory receipt (for corrections)
export const updateInventoryReceipt = async (req, reply) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;
    const updates = req.body;

    // Find the existing receipt
    const existingReceipt = await InventoryReceipt.findOne({ _id: id, storeId });
    if (!existingReceipt) {
      return reply.code(404).send({
        success: false,
        message: 'Inventory receipt not found'
      });
    }

    // If payment info is being updated, validate the payment status
    if (updates.paymentStatus) {
      if (updates.paymentStatus === 'paid') {
        updates.amountPaid = existingReceipt.totalAmount;
      } else if (updates.paymentStatus === 'partial') {
        if (!updates.amountPaid || updates.amountPaid <= 0) {
          return reply.code(400).send({
            success: false,
            message: 'Amount paid is required for partial payment status'
          });
        }
        if (updates.amountPaid > existingReceipt.totalAmount) {
          return reply.code(400).send({
            success: false,
            message: 'Amount paid cannot exceed total amount'
          });
        }
      }
    }

    // Update the receipt
    const updatedReceipt = await InventoryReceipt.findOneAndUpdate(
      { _id: id, storeId },
      updates,
      { new: true }
    )
    .populate('vendorId', 'name phone email')
    .populate('receivedBy', 'name phone')
    .populate('items.storeProductId', 'name price');

    return reply.code(200).send({
      success: true,
      message: 'Inventory receipt updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Add payment to an inventory receipt
export const addPaymentToReceipt = async (req, reply) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;
    const { amountPaid, paymentMethod, transactionId } = req.body;

    const receipt = await InventoryReceipt.findOne({ _id: id, storeId });
    if (!receipt) {
      return reply.code(404).send({
        success: false,
        message: 'Inventory receipt not found'
      });
    }

    // Update payment information
    if (amountPaid) {
      const totalPaid = receipt.amountPaid + amountPaid;
      
      if (totalPaid > receipt.totalAmount) {
        return reply.code(400).send({
          success: false,
          message: 'Total payment amount exceeds total amount due'
        });
      }
      
      receipt.amountPaid = totalPaid;
      
      if (totalPaid === receipt.totalAmount) {
        receipt.paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        receipt.paymentStatus = 'partial';
      }
    }

    if (paymentMethod) {
      receipt.paymentMethod = paymentMethod;
    }

    if (transactionId) {
      receipt.transactionId = transactionId;
    }

    receipt.paymentDate = new Date();

    const updatedReceipt = await receipt.save();

    return reply.code(200).send({
      success: true,
      message: 'Payment added successfully',
      data: updatedReceipt
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};