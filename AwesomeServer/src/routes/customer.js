import { 
    getCustomers, 
    getSingleCustomer, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
} from '../controllers/User/Customer.js';
import { verifyToken } from "../middleware/auth.js";

export default async function customerRoutes(fastify, opts) {
    fastify.get('/customer', { preHandler: [verifyToken] }, getCustomers);
    fastify.get('/customer/:id', { preHandler: [verifyToken] }, getSingleCustomer);
    fastify.post('/customer/create', { preHandler: [verifyToken] }, createCustomer);
    fastify.patch('/customer/update/:id', { preHandler: [verifyToken] }, updateCustomer);
    fastify.delete('/customer/delete/:id', { preHandler: [verifyToken] }, deleteCustomer);
}
