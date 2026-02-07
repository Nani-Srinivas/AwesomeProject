import {
  register,
  verifyEmail,
  loginStoreManager,
  loginCustomer,
  loginDeliveryPartner,
  refreshToken,
  logout,
  fetchUser,
  updateUserProfile,
  testEndpoint,
  // refresh,
} from "../controllers/auth/auth.js";
import { verifyToken } from "../middleware/auth.js";

export const authRoutes = async (fastify, options) => {
  // Stricter rate limiting for auth endpoints to prevent brute force
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes'
      }
    }
  };

  // 🧪 TEST ENDPOINTS - No rate limit, no auth - for debugging
  fastify.get('/test', testEndpoint);
  fastify.post('/test', testEndpoint);
  fastify.get('/auth/test', testEndpoint);
  fastify.post('/auth/test', testEndpoint);

  fastify.post('/auth/register', authRateLimit, register);
  fastify.get('/auth/verify', verifyEmail);
  fastify.post("/auth/login/store-manager", authRateLimit, loginStoreManager);
  fastify.post("/customer/login", authRateLimit, loginCustomer);
  fastify.post("/delivery/login", authRateLimit, loginDeliveryPartner);
  fastify.post("/refresh-token", authRateLimit, refreshToken);
  fastify.post("/auth/logout", logout); // No rate limit on logout
  // fastify.post('/refresh', refresh);
  fastify.get("/user", { preHandler: [verifyToken] }, fetchUser);
  fastify.patch("/user/profile", { preHandler: [verifyToken] }, updateUserProfile);
};