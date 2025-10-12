import {
  getAllArea,
  getAreaByUser,
    createArea,
    updateArea,
    deleteArea
  } from "../controllers/Delivery/Area.js";
import { verifyToken } from "../middleware/auth.js";

export const areaRoutes = async (fastify, options) => { 
  fastify.post('/area/create', {preHandler: [verifyToken]}, createArea);
  fastify.get('/area', {preHandler: [verifyToken]}, getAllArea);
  fastify.get('/areabyuser', {preHandler: [verifyToken]}, getAreaByUser);
  fastify.patch('/area/update/:id', {preHandler: [verifyToken]}, updateArea);
  fastify.delete('/area/delete/:id', {preHandler: [verifyToken]}, deleteArea);
};