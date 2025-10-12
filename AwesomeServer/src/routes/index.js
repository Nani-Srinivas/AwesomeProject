//routes/index.js
import { authRoutes } from "./auth.js";
import { storeRoutes } from "./store.js";
import { areaRoutes } from "./Delivery.js"
import { userRoutes } from "./User.js";
import { productRoutes } from "./Product.js";
import customerRoutes from "./customer.js";
import {stockRoutes} from "./stock.js";
import {dailyFinancialRoutes} from "./dailyFinancial.js";
import { adminRoutes } from "./admin.js";


const prefix = "/api";

export const registerRoutes = async (fastify) => {
  fastify.register(authRoutes, { prefix: prefix });
  fastify.register(storeRoutes, { prefix: prefix });
  fastify.register(areaRoutes, { prefix: prefix });
  fastify.register(userRoutes, { prefix: prefix });
  fastify.register(productRoutes, { prefix: prefix });
  fastify.register(customerRoutes, { prefix: prefix });
  fastify.register(stockRoutes, { prefix: prefix });
  fastify.register(dailyFinancialRoutes, { prefix: prefix });
  fastify.register(adminRoutes, { prefix: prefix });
};
