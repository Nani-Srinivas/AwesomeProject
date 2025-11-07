// controllers/Finance/Payment.js
import Payment from '../../models/Finance/Payment.js';
import Invoice from '../../models/Invoice.js';
import { Customer } from '../../models/User/Customer.js';

// Helper function to validate payment status
const validatePaymentStatus = (status) => {
  const validStatuses = ['Pending', 'Completed', 'Failed', 'Refunded', 'Processing'];
  return validStatuses.includes(status);
};

// Record a new payment
export const recordPayment = async (req, reply) => {
  try {
    const { customerId, invoiceId, amount, paymentMethod, transactionId, notes, allocations } = req.body;

    // Validate required fields
    if (!customerId || !amount || !paymentMethod) {
      return reply.status(400).send({ 
        success: false, 
        message: 'CustomerId, amount, and paymentMethod are required' 
      });
    }

    // Additional validations
    if (amount <= 0) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Validate payment method
    const validPaymentMethods = ['Cash', 'Online', 'Card', 'UPI', 'Net Banking', 'Pay Later'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Invalid payment method' 
      });
    }

    // Transaction ID validation
    if (paymentMethod === 'Cash' && transactionId) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Transaction ID should not be provided for cash payments' 
      });
    }
    
    if (paymentMethod !== 'Cash' && (!transactionId || transactionId.trim() === '')) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Transaction ID is required for non-cash payments' 
      });
    }

    // Fetch customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Handle payment allocation - either to specific invoice or multiple invoices
    let updatedInvoices = [];
    
    if (allocations && allocations.length > 0) {
      // Payment allocated to multiple invoices
      let totalAllocated = 0;
      
      for (const allocation of allocations) {
        const invoice = await Invoice.findById(allocation.invoiceId);
        if (!invoice) {
          return reply.status(404).send({ 
            success: false, 
            message: `Invoice ${allocation.invoiceId} not found` 
          });
        }

        // Check if the allocated amount is valid
        const availableAmount = invoice.dueAmount || 0;
        if (allocation.amount > availableAmount) {
          return reply.status(400).send({ 
            success: false, 
            message: `Allocation amount ${allocation.amount} exceeds invoice due amount ${availableAmount} for invoice ${invoice.billNo}` 
          });
        }

        // Update the invoice
        const newPaidAmount = (invoice.paidAmount || 0) + allocation.amount;
        const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
        
        let newStatus = 'Generated';
        if (newDueAmount === 0) {
          newStatus = 'Paid';
        } else if (newPaidAmount > 0 && newDueAmount > 0) {
          newStatus = 'Partially Paid';
        }
        
        await Invoice.findByIdAndUpdate(invoice._id, {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus,
          paidDate: newDueAmount === 0 ? new Date() : invoice.paidDate // Only set paidDate if fully paid
        });
        
        updatedInvoices.push(invoice._id);
        totalAllocated += allocation.amount;
      }
      
      // Check if total allocated matches the payment amount
      if (totalAllocated !== Number(amount)) {
        return reply.status(400).send({ 
          success: false, 
          message: `Total allocation amount (${totalAllocated}) does not match payment amount (${amount})` 
        });
      }
    } else if (invoiceId) {
      // Payment allocated to a single specific invoice
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Invoice not found' 
        });
      }

      // Check if the payment amount is valid for this invoice
      const availableAmount = invoice.dueAmount || 0;
      if (Number(amount) > availableAmount) {
        return reply.status(400).send({ 
          success: false, 
          message: `Payment amount ${amount} exceeds invoice due amount ${availableAmount} for invoice ${invoice.billNo}` 
        });
      }

      // Update the invoice
      const newPaidAmount = (invoice.paidAmount || 0) + Number(amount);
      const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
      
      let newStatus = 'Generated';
      if (newDueAmount === 0) {
        newStatus = 'Paid';
      } else if (newPaidAmount > 0 && newDueAmount > 0) {
        newStatus = 'Partially Paid';
      }
      
      await Invoice.findByIdAndUpdate(invoiceId, {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        status: newStatus,
        paidDate: newDueAmount === 0 ? new Date() : invoice.paidDate // Only set paidDate if fully paid
      });
      
      updatedInvoices.push(invoice._id);
    } else {
      // Payment without specific invoice allocation - apply to oldest unpaid invoices first
      const invoices = await Invoice.find({ 
        customerId,
        status: { $ne: 'Paid' }
      }).sort({ createdAt: 1 }); // Sort by creation date (oldest first)

      let remainingPayment = Number(amount);
      let totalAllocated = 0;
      
      for (const invoice of invoices) {
        if (remainingPayment <= 0) break;
        
        const availableForPayment = Math.min(invoice.dueAmount || 0, remainingPayment);
        
        const newPaidAmount = (invoice.paidAmount || 0) + availableForPayment;
        const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
        
        let newStatus = 'Generated';
        if (newDueAmount === 0) {
          newStatus = 'Paid';
        } else if (newPaidAmount > 0 && newDueAmount > 0) {
          newStatus = 'Partially Paid';
        }
        
        await Invoice.findByIdAndUpdate(invoice._id, {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus,
          paidDate: newDueAmount === 0 ? new Date() : invoice.paidDate // Only set paidDate if fully paid
        });
        
        updatedInvoices.push(invoice._id);
        totalAllocated += availableForPayment;
        remainingPayment -= availableForPayment;
      }
      
      // If payment amount exceeds total outstanding invoices, add to credit
      if (remainingPayment > 0) {
        const paymentCustomer = await Customer.findById(customerId);
        await Customer.findByIdAndUpdate(customerId, {
          creditBalance: (paymentCustomer.creditBalance || 0) + remainingPayment
        });
      }
    }

    // Create payment record with proper status validation
    const payment = new Payment({
      customerId,
      invoiceId: updatedInvoices.length === 1 ? updatedInvoices[0] : null, // For backward compatibility
      allocations: allocations || (invoiceId ? [{ invoiceId, amount: Number(amount) }] : []),
      amount: Number(amount),
      paymentMethod,
      transactionId: paymentMethod === 'Cash' ? undefined : transactionId, // Don't save transaction ID for cash
      notes,
      paymentStatus: 'Completed' // Default to Completed for new payments
    });

    await payment.save();

    // Update customer's last payment date
    await Customer.findByIdAndUpdate(customerId, {
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

    // Calculate financial status from invoices and payments (real-time calculation)
    const invoices = await Invoice.find({ customerId });
    const payments = await Payment.find({ 
      customerId, 
      paymentStatus: 'Completed' 
    });

    // Calculate totals
    const totalAmountPayable = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalAmountPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Calculate current due = sum of due amounts from all unpaid invoices
    const currentDueAmount = invoices
      .filter(inv => inv.status !== 'Paid')
      .reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);

    // Determine payment status
    let calculatedPaymentStatus = 'Unpaid';
    if (currentDueAmount === 0) {
      calculatedPaymentStatus = 'Paid';
    } else if (currentDueAmount > 0 && totalAmountPaid > 0) {
      calculatedPaymentStatus = 'Partially Paid';
    }

    return reply.status(200).send({
      success: true,
      data: {
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        paymentStatus: calculatedPaymentStatus, // Calculate on-the-fly, not from customer model
        currentDueAmount, // Calculate on-the-fly, not from customer model
        totalAmountPayable, // Calculate on-the-fly, not from customer model
        totalAmountPaid, // Calculate on-the-fly, not from customer model
        creditBalance: customer.creditBalance || 0, // Include credit balance
        lastPaymentDate: customer.lastPaymentDate,
        paymentCycle: customer.paymentCycle,
        lastBillPeriod: customer.lastBillPeriod
      },
      message: 'Customer payment status calculated successfully'
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

    // Validate payment status
    if (paymentStatus && !validatePaymentStatus(paymentStatus)) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Invalid payment status. Valid statuses are: Pending, Completed, Failed, Refunded, Processing' 
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Store original status to determine reversal direction
    const originalStatus = payment.paymentStatus;
    const newStatus = paymentStatus || originalStatus;

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        paymentStatus: newStatus, // Only update if provided
        notes: notes || payment.notes
      },
      { new: true }
    );

    // Determine how to reverse or apply the payment based on status change
    if (originalStatus === 'Completed' && (newStatus === 'Failed' || newStatus === 'Refunded')) {
      // Payment was originally completed, now it's being reverted
      if (payment.allocations && payment.allocations.length > 0) {
        // Handle multiple invoice allocations
        for (const allocation of payment.allocations) {
          const invoice = await Invoice.findById(allocation.invoiceId);
          if (!invoice) continue;

          const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - allocation.amount);
          const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
          
          let invoiceStatus = 'Generated';
          if (newDueAmount === 0) {
            invoiceStatus = 'Paid';
          } else if (newPaidAmount > 0 && newDueAmount > 0) {
            invoiceStatus = 'Partially Paid';
          } else if (newPaidAmount === 0) {
            invoiceStatus = 'Generated';
          }
          
          await Invoice.findByIdAndUpdate(allocation.invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: invoiceStatus,
            paidDate: newPaidAmount === invoice.totalAmount ? null : invoice.paidDate // Unset paidDate if not fully paid
          });
        }
      } else if (payment.invoiceId) {
        // Handle single invoice allocation (backward compatibility)
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
          const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
          
          let invoiceStatus = 'Generated';
          if (newDueAmount === 0) {
            invoiceStatus = 'Paid';
          } else if (newPaidAmount > 0 && newDueAmount > 0) {
            invoiceStatus = 'Partially Paid';
          } else if (newPaidAmount === 0) {
            invoiceStatus = 'Generated';
          }
          
          await Invoice.findByIdAndUpdate(payment.invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: invoiceStatus,
            paidDate: newPaidAmount === invoice.totalAmount ? null : invoice.paidDate // Unset paidDate if not fully paid
          });
        }
      }

      // Update customer's credit balance if payment was previously creating credit
      const customer = await Customer.findById(payment.customerId);
      let creditToRemove = 0;
      
      // Logic to determine if original payment created credit
      // This requires checking how much was applied to invoices vs total payment amount
      const invoices = await Invoice.find({ customerId: payment.customerId });
      const currentDue = invoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);
      
      if (payment.amount > currentDue) {
        // Original payment exceeded due amount, so some became credit
        const originalCreditAdded = Math.max(0, payment.amount - currentDue);
        const newCreditBalance = Math.max(0, (customer.creditBalance || 0) - originalCreditAdded);
        await Customer.findByIdAndUpdate(payment.customerId, {
          creditBalance: newCreditBalance
        });
      }

    } else if ((originalStatus === 'Pending' || originalStatus === 'Failed') && newStatus === 'Completed') {
      // Payment is being updated from incomplete to complete, apply to invoices
      if (payment.allocations && payment.allocations.length > 0) {
        // Handle multiple invoice allocations
        for (const allocation of payment.allocations) {
          const invoice = await Invoice.findById(allocation.invoiceId);
          if (!invoice) continue;

          const newPaidAmount = (invoice.paidAmount || 0) + allocation.amount;
          const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
          
          let invoiceStatus = 'Generated';
          if (newDueAmount === 0) {
            invoiceStatus = 'Paid';
          } else if (newPaidAmount > 0 && newDueAmount > 0) {
            invoiceStatus = 'Partially Paid';
          }
          
          await Invoice.findByIdAndUpdate(allocation.invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: invoiceStatus,
            paidDate: newDueAmount === 0 ? new Date() : invoice.paidDate
          });
        }
      } else if (payment.invoiceId) {
        // Handle single invoice allocation (backward compatibility)
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
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

      // Update customer's last payment date
      await Customer.findByIdAndUpdate(payment.customerId, {
        lastPaymentDate: new Date()
      });
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

// Delete a payment
export const deletePayment = async (req, reply) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return reply.status(404).send({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Reverse the payment effect from invoices
    if (payment.allocations && payment.allocations.length > 0) {
      // Handle multiple invoice allocations
      for (const allocation of payment.allocations) {
        const invoice = await Invoice.findById(allocation.invoiceId);
        if (!invoice) continue;

        // Restore the invoice's paid and due amounts
        const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - allocation.amount);
        const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
        
        let invoiceStatus = 'Generated';
        if (newDueAmount === 0) {
          invoiceStatus = 'Paid';
        } else if (newPaidAmount > 0 && newDueAmount > 0) {
          invoiceStatus = 'Partially Paid';
        } else if (newPaidAmount === 0) {
          invoiceStatus = 'Generated';
        }
        
        await Invoice.findByIdAndUpdate(allocation.invoiceId, {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: invoiceStatus,
          paidDate: newDueAmount === 0 ? null : invoice.paidDate // Unset paidDate if not fully paid
        });
      }
    } else if (payment.invoiceId) {
      // Handle single invoice allocation (backward compatibility)
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        // Restore the invoice's paid and due amounts
        const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
        const newDueAmount = Math.max(0, (invoice.totalAmount || 0) - newPaidAmount);
        
        let invoiceStatus = 'Generated';
        if (newDueAmount === 0) {
          invoiceStatus = 'Paid';
        } else if (newPaidAmount > 0 && newDueAmount > 0) {
          invoiceStatus = 'Partially Paid';
        } else if (newPaidAmount === 0) {
          invoiceStatus = 'Generated';
        }
        
        await Invoice.findByIdAndUpdate(payment.invoiceId, {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: invoiceStatus,
          paidDate: newDueAmount === 0 ? null : invoice.paidDate // Unset paidDate if not fully paid
        });
      }
    }

    // Adjust customer's credit balance if the original payment created credit
    const customer = await Customer.findById(payment.customerId);
    if (customer && payment.paymentStatus === 'Completed') {
      // Calculate how much credit was potentially added by this payment
      const invoices = await Invoice.find({ customerId: payment.customerId });
      const currentDue = invoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);
      
      if (payment.amount > currentDue) {
        // This payment created credit, so reduce credit balance
        const creditAdded = Math.max(0, payment.amount - currentDue);
        const newCreditBalance = Math.max(0, (customer.creditBalance || 0) - creditAdded);
        await Customer.findByIdAndUpdate(payment.customerId, {
          creditBalance: newCreditBalance
        });
      }
    }

    // Delete the payment record
    await Payment.findByIdAndDelete(paymentId);

    return reply.status(200).send({
      success: true,
      message: 'Payment deleted successfully',
      deletedPaymentId: paymentId
    });
  } catch (err) {
    console.error('Delete Payment Error:', err);
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