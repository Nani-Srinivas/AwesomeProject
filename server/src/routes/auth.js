import S from 'fluent-json-schema';
import {
    fetchUser,
    loginCustomer,
    loginDeliveryPartner,
    refreshToken,
  } from "../controllers/auth/auth.js";
import { updateUser } from "../controllers/tracking/user.js";
import { verifyToken } from "../middleware/auth.js";

const loginCustomerSchema = {
    body: S.object()
      .prop('phone', S.string().required()),
  };
  
  const loginDeliveryPartnerSchema = {
    body: S.object()
      .prop('email', S.string().format(S.FORMATS.EMAIL).required())
      .prop('password', S.string().required()),
  };

export const authRoutes = async (fastify, options) => {
  
    fastify.post("/customer/login", { schema: loginCustomerSchema }, loginCustomer);
    fastify.post("/delivery/login", { schema: loginDeliveryPartnerSchema }, loginDeliveryPartner);
    fastify.post("/refresh-token", refreshToken);
    fastify.get("/user", { preHandler: [verifyToken] }, fetchUser);
    fastify.patch("/user", { preHandler: [verifyToken] }, updateUser);
};