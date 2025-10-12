//config/setup.js
import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";

AdminJS.registerAdapter(AdminJSMongoose)

// Verify models are correctly exported
console.log('Available models:', Object.keys(Models));

export const admin = new AdminJS({
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ["name", "email", "phone", "role", "createdAt"],
        filterProperties: ["name", "email", "phone", "role", "createdAt"],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ["name", "email", "role", "createdAt"],
        filterProperties: ["name", "email", "role"],
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ["name", "email", "role", "createdAt"],
        filterProperties: ["name", "email", "role"],
      },
    },
    {
      resource: Models.StoreManager,
      options: {
        listProperties: ["name", "email", "role", "storeId", "createdAt"],
        filterProperties: ["name", "email", "role", "storeId"],
      },
    },
  ],
  branding: {
    companyName: "Grocery Delivery App",
    withMadeWithLove: false,
    // logo: '../src/img/apple.png',
  },
  defaultTheme: dark.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: '/admin'
})

export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: 'adminjs'
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
    }
  )
}