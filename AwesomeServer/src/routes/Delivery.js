import {
  getAllArea,
  getAreaByUser,
    createArea,
    updateArea,
    deleteArea
  } from "../controllers/Delivery/Area.js";
import {
    createDeliveryBoy,
    getAllDeliveryBoys,
    getDeliveryBoysByArea,
    updateDeliveryBoy,
    deleteDeliveryBoy
} from "../controllers/Delivery/DeliveryBoy.js";
import { verifyToken } from "../middleware/auth.js";

export const areaRoutes = async (fastify, options) => { 
  fastify.post('/delivery/area/create', {preHandler: [verifyToken]}, createArea);
  fastify.get('/delivery/area', {preHandler: [verifyToken]}, getAllArea);
  fastify.get('/delivery/areabyuser', {preHandler: [verifyToken]}, getAreaByUser);
  fastify.patch('/delivery/area/update/:id', {preHandler: [verifyToken]}, updateArea);
  fastify.delete('/delivery/area/delete/:id', {preHandler: [verifyToken]}, deleteArea);

  fastify.post('/delivery/delivery-boy/create', {preHandler: [verifyToken]}, createDeliveryBoy);
  fastify.get('/delivery/delivery-boys', {preHandler: [verifyToken]}, getAllDeliveryBoys);
  fastify.get('/delivery/delivery-boys/:areaId', {preHandler: [verifyToken]}, getDeliveryBoysByArea);
  fastify.patch('/delivery/delivery-boy/update/:id', {preHandler: [verifyToken]}, updateDeliveryBoy);
  fastify.delete('/delivery/delivery-boy/delete/:id', {preHandler: [verifyToken]}, deleteDeliveryBoy);
};