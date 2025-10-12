import {
    register,
    verifyEmail,
    loginStoreManager,
    loginCustomer,
    loginDeliveryPartner,
    refreshToken,
    fetchUser,
    // refresh,
  } from "../controllers/auth/auth.js";
import { verifyToken } from "../middleware/auth.js";

export const authRoutes = async (fastify, options) => {
    fastify.post('/auth/register', register);
    fastify.get('/auth/verify', verifyEmail);
    fastify.post("/auth/login/store-manager", loginStoreManager);
    fastify.post("/customer/login", loginCustomer);
    fastify.post("/delivery/login", loginDeliveryPartner);
    fastify.post("/refresh-token", refreshToken);
    // fastify.post('/refresh', refresh);
    fastify.get("/user", { preHandler: [verifyToken] }, fetchUser);
};