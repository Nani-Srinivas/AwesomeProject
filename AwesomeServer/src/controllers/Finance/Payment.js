// controllers/Finance/Payment.js
import Payment from '../../models/Finance/Payment.js';
import Invoice from '../../models/Invoice.js';
import { Customer } from '../../models/User/Customer.js';

// Record a new payment
export const recordPayment = async (req, reply) => {
  try {
    const { customerId, invoiceId, amount, paymentMethod, transactionId, notes } = req.body;

    // Validate required fields
    if (!customerId || !amount || !paymentMethod) {
      return reply.status(400).send({ 
        success: false, 
        message: 'CustomerId, amount, and paymentMethod are required' 
      });
    }

    // Fetch customer and invoice
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    let invoice;
    if (invoiceId) {
      invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Invoice not found' 
        });
      }
    }

    // Create payment record
    const payment = new Payment({
      customerId,
      invoiceId: invoice?._id,
      amount: Number(amount),
      paymentMethod,
      transactionId,
      notes,
      paymentStatus: 'Completed'
    });

    await payment.save();

    // Update invoice if payment is linked to an invoice
    if (invoice) {
      // Update invoice amounts and status
      const paidAmount = (invoice.paidAmount || 0) + Number(amount);
      const dueAmount = Math.max(0, (invoice.totalAmount || 0) - paidAmount);
      
      // Determine new invoice status
      let status = 'Generated';
      if (dueAmount === 0) {
        status = 'Paid';
      } else if (paidAmount > 0 && dueAmount > 0) {
        status = 'Partially Paid';
      }
      
      await Invoice.findByIdAndUpdate(invoice._id, {
        paidAmount,
        dueAmount,
        status,
        paidDate: dueAmount === 0 ? new Date() : invoice.paidDate // Only set paidDate if fully paid
      });
    }

    // Update customer's payment-related fields
    const updatedTotalPaid = (customer.totalAmountPaid || 0) + Number(amount);
    const updatedCurrentDue = Math.max(0, (customer.currentDueAmount || 0) - Number(amount));
    
    // Determine customer payment status
    let paymentStatus = 'Unpaid';
    if (updatedCurrentDue === 0) {
      paymentStatus = 'Paid';
    } else if (updatedCurrentDue > 0 && updatedTotalPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    await Customer.findByIdAndUpdate(customerId, {
      totalAmountPaid: updatedTotalPaid,
      currentDueAmount: updatedCurrentDue,
      paymentStatus,
      lastPaymentDate: new Date()
    });

    return reply.status(201).send({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (err) {
    console.error('Record Payment Error:', err);
    return reply.status(500).send({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get customer payment history
export const getCustomerPaymentHistory = async (req, reply) => {
  try {
    const { customerId } = req.params;
    
    const payments = await Payment.find({ customerId })
      .populate('customerId', 'name phone')
      .populate('invoiceId', 'billNo period grandTotal')
      .sort({ createdAt: -1 });

    if (!payments.length) {
      return reply.status(200).send({
        success: true,
        data: [],
        message: 'No payment history found for this customer'
      });
    }

    return reply.status(200).send({
      success: true,
      data: payments,
      message: 'Payment history fetched successfully'
    });
  } catch (err) {
    console.error('Get Payment History Error:', err);
    return reply.status(500).send({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get customer payment status summary
export const getCustomerPaymentStatus = async (req, reply) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        paymentStatus: customer.paymentStatus,
        currentDueAmount: customer.currentDueAmount,
        totalAmountPayable: customer.totalAmountPayable,
        totalAmountPaid: customer.totalAmountPaid,
        lastPaymentDate: customer.lastPaymentDate,
        paymentCycle: customer.paymentCycle,
        lastBillPeriod: customer.lastBillPeriod
      },
      message: 'Customer payment status fetched successfully'
    });
  } catch (err) {
    console.error('Get Payment Status Error:', err);
    return reply.status(500).send({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, reply) => {
  try {
    const { paymentId } = req.params;
    const { paymentStatus, notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        paymentStatus,
        notes: notes || payment.notes
      },
      { new: true }
    );

    // If status is updated to 'Failed' or 'Refunded', we might need to adjust the invoice and customer
    if (paymentStatus === 'Failed' || paymentStatus === 'Refunded') {
      if (payment.invoiceId) {
        // Revert invoice status changes
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
          const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
          
          let invoiceStatus = 'Generated';
          if (newDueAmount === 0) {
            invoiceStatus = 'Paid';
          } else if (newPaidAmount > 0 && newDueAmount > 0) {
            invoiceStatus = 'Partially Paid';
          }
          
          await Invoice.findByIdAndUpdate(payment.invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: invoiceStatus,
            paidDate: newPaidAmount === invoice.totalAmount ? new Date() : null // Unset paidDate if not fully paid
          });
        }
      }

      // Revert customer changes
      const failedCustomer = await Customer.findById(payment.customerId);
      if (failedCustomer) {
        const updatedTotalPaid = Math.max(0, (failedCustomer.totalAmountPaid || 0) - payment.amount);
        const updatedCurrentDue = (failedCustomer.currentDueAmount || 0) + payment.amount;
        
        let customerStatus = 'Unpaid';
        if (updatedCurrentDue === 0) {
          customerStatus = 'Paid';
        } else if (updatedCurrentDue > 0 && updatedTotalPaid > 0) {
          customerStatus = 'Partially Paid';
        }
        
        await Customer.findByIdAndUpdate(payment.customerId, {
          totalAmountPaid: updatedTotalPaid,
          currentDueAmount: updatedCurrentDue,
          paymentStatus: customerStatus
        });
      }
    } else if (paymentStatus === 'Completed') {
      // If status is updated to 'Completed', update invoice and customer accordingly
      if (payment.invoiceId) {
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          // Calculate new amounts based on all payments for this invoice
          // For now, we'll update based on this single payment
          const newPaidAmount = (invoice.paidAmount || 0) + payment.amount;
          const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
          
          let invoiceStatus = 'Generated';
          if (newDueAmount === 0) {
            invoiceStatus = 'Paid';
          } else if (newPaidAmount > 0 && newDueAmount > 0) {
            invoiceStatus = 'Partially Paid';
          }
          
          await Invoice.findByIdAndUpdate(payment.invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: invoiceStatus,
            paidDate: newDueAmount === 0 ? new Date() : invoice.paidDate
          });
        }
      }

      // Update customer changes for completed payment
      const completedCustomer = await Customer.findById(payment.customerId);
      if (completedCustomer) {
        const updatedTotalPaid = (completedCustomer.totalAmountPaid || 0) + payment.amount;
        const updatedCurrentDue = Math.max(0, (completedCustomer.currentDueAmount || 0) - payment.amount);
        
        let customerStatus = 'Unpaid';
        if (updatedCurrentDue === 0) {
          customerStatus = 'Paid';
        } else if (updatedCurrentDue > 0 && updatedTotalPaid > 0) {
          customerStatus = 'Partially Paid';
        }
        
        await Customer.findByIdAndUpdate(payment.customerId, {
          totalAmountPaid: updatedTotalPaid,
          currentDueAmount: updatedCurrentDue,
          paymentStatus: customerStatus,
          lastPaymentDate: new Date()
        });
      }
    }

    return reply.status(200).send({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment
    });
  } catch (err) {
    console.error('Update Payment Status Error:', err);
    return reply.status(500).send({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get all payments with optional filters
export const getAllPayments = async (req, reply) => {
  try {
    const { status, paymentMethod, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) filter.paymentStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (dateFrom || dateTo) {
      filter.paymentDate = {};
      if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(filter)
      .populate('customerId', 'name phone')
      .populate('invoiceId', 'billNo period grandTotal')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPayments = await Payment.countDocuments(filter);

    return reply.status(200).send({
      success: true,
      data: payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNextPage: page < Math.ceil(totalPayments / limit),
        hasPrevPage: page > 1
      },
      message: 'Payments fetched successfully'
    });
  } catch (err) {
    console.error('Get All Payments Error:', err);
    return reply.status(500).send({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};