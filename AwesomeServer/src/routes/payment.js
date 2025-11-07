// routes/payment.js
import { 
    recordPayment, 
    getCustomerPaymentHistory, 
    getCustomerPaymentStatus, 
    updatePaymentStatus,
    getAllPayments,
    deletePayment
} from '../controllers/Finance/Payment.js';
import { verifyToken } from "../middleware/auth.js";

export default async function paymentRoutes(fastify, opts) {
    // Record a new payment
    fastify.post('/payment/receive', { preHandler: [verifyToken] }, recordPayment);
    
    // Get customer payment history
    fastify.get('/payment/history/:customerId', { preHandler: [verifyToken] }, getCustomerPaymentHistory);
    
    // Get customer payment status summary
    fastify.get('/payment/status/:customerId', { preHandler: [verifyToken] }, getCustomerPaymentStatus);
    
    // Update payment status
    fastify.patch('/payment/update/:paymentId', { preHandler: [verifyToken] }, updatePaymentStatus);
    
    // Delete a payment
    fastify.delete('/payment/:paymentId', { preHandler: [verifyToken] }, deletePayment);
    
    // Get all payments (with optional filters)
    fastify.get('/payment/list', { preHandler: [verifyToken] }, getAllPayments);
}