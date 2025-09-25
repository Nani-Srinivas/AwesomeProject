import S from 'fluent-json-schema';
import {
    fetchUser,
    loginCustomer,
    loginDeliveryPartner,
    refreshToken,
    registerUser,
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

  const registerUserSchema = {
    body: S.object()
      .prop('name', S.string().required())
      .prop('email', S.string().format(S.FORMATS.EMAIL).required())
      .prop('password', S.string().required())
      .prop('role', S.string().enum(['Customer', 'DeliveryPartner']).required())
      .prop('phone', S.string().required()),
  };

export const authRoutes = async (fastify, options) => {
  
    fastify.post("/customer/login", { schema: loginCustomerSchema }, loginCustomer);
    fastify.post("/delivery/login", { schema: loginDeliveryPartnerSchema }, loginDeliveryPartner);
    fastify.post("/register", { schema: registerUserSchema }, registerUser);
    fastify.post("/refresh-token", refreshToken);
    fastify.get("/user", { preHandler: [verifyToken] }, fetchUser);
    fastify.patch("/user", { preHandler: [verifyToken] }, updateUser);
};