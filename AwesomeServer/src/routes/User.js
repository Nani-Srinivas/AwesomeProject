import {
    createDeliveryPartner,
    getDeliveryPartnersByStore,
    getSingleDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner
  } from "../controllers/User/User.js";
import { verifyToken } from "../middleware/auth.js";

export const userRoutes = async (fastify, options) => {
    fastify.post('/deliveryPartner/create', {preHandler: [verifyToken]}, createDeliveryPartner);
    fastify.get('/deliveryPartner/store', {preHandler: [verifyToken]}, getDeliveryPartnersByStore);
    fastify.get('/deliveryPartner/:id', {preHandler: [verifyToken]}, getSingleDeliveryPartner);
    fastify.patch('/deliveryPartner/update/:id', {preHandler: [verifyToken]}, updateDeliveryPartner);
    fastify.delete('/deliveryPartner/delete/:id', {preHandler: [verifyToken]}, deleteDeliveryPartner);
};