// controllers/Finance/FinanceController.js
import Vendor from '../../models/Vendor.js';
import InventoryReceipt from '../../models/Inventory/InventoryReceipt.js';

// Get vendor payables summary
export const getVendorPayables = async (req, reply) => {
  try {
    const storeId = req.user.storeId;
    
    // Find all vendors
    const vendors = await Vendor.find({});
    
    // For each vendor, calculate total outstanding amount
    const vendorsWithPayables = await Promise.all(
      vendors.map(async (vendor) => {
        // Find all inventory receipts for this vendor that are not fully paid
        const receipts = await InventoryReceipt.find({ 
          vendorId: vendor._id,
          paymentStatus: { $in: ['pending', 'partial'] } // Only include pending or partially paid receipts
        });
        
        // Calculate total due amount
        const totalDue = receipts.reduce((sum, receipt) => sum + (receipt.totalAmount - (receipt.amountPaid || 0)), 0);
        
        // Find the last delivery date
        const lastReceipt = receipts.length > 0 
          ? receipts.reduce((latest, current) => 
              new Date(current.receivedDate || current.createdAt) > new Date(latest.receivedDate || latest.createdAt) ? current : latest
            ) 
          : null;
        
        // Determine status based on payment status
        let status = 'paid';
        if (receipts.some(r => r.paymentStatus === 'pending')) status = 'pending';
        if (receipts.some(r => r.paymentStatus === 'overdue')) status = 'overdue';
        if (totalDue > 0 && !receipts.some(r => r.paymentStatus === 'overdue')) status = 'pending'; // If there's due amount but not overdue
        
        // Calculate days overdue (for demo purposes - would implement proper calculation in real app)
        let daysOverdue = 0;
        if (status === 'overdue') {
          // Would normally calculate based on due date
          // For now, using dummy value for demonstration
          daysOverdue = 7; // Dummy value for demonstration
        }
        
        return {
          ...vendor.toObject(),
          totalDue: totalDue,
          lastDeliveryDate: lastReceipt ? (lastReceipt.receivedDate || lastReceipt.createdAt) : null,
          daysOverdue: daysOverdue,
          status
        };
      })
    );
    
    // Filter out vendors with zero due amounts (only return vendors with pending payables)
    const vendorsWithOutstanding = vendorsWithPayables.filter(vendor => vendor.totalDue > 0);

    return reply.code(200).send({
      success: true,
      message: 'Vendor payables fetched successfully',
      data: vendorsWithOutstanding
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};