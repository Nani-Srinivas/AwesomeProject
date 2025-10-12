//config/setup.js
import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/User/index.js";
import { User, Customer, StoreManager, DeliveryPartner, Admin } from "../models/User/index.js";
import Area from "../models/Delivery/Area.js";
import Category from "../models/Product/Category.js";
import Subcategory from "../models/Product/Subcategory.js";
import MasterProduct from "../models/Product/MasterProduct.js";
import StoreProduct from "../models/Product/StoreProduct.js";
import Store from "../models/Store/Store.js";
import Stock from "../models/Store/Stock.js";
import StoreCategory from "../models/Product/StoreCategory.js";
import Order from "../models/Order/Order.js";
import Invoice from "../models/Order/Invoice.js";


import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";

AdminJS.registerAdapter(AdminJSMongoose)

// Verify models are correctly exported
console.log('Available models:', Object.keys(Models));
console.log('Available models:', {
  Customer,
  StoreManager,
  DeliveryPartner,
  Admin,
  Area,
  Category,
  Subcategory,
  MasterProduct,
  StoreProduct,
  StoreCategory,
  Store,
  Stock,
  Order,
  Invoice
});

export const admin = new AdminJS({
  resources: [
    // User models
    {
      resource: Models.Customer,
      options: {
        properties: {
          __t: { isVisible: false },
          role: { isVisible: false },
          roles: {
            availableValues: [{ value: 'Customer', label: 'Customer' }],
          },
        },
        listProperties: ["name", "email", "phone", "role", "createdAt"],
        filterProperties: ["name", "email", "phone", "role", "createdAt"],
        editProperties: ['name', 'email', 'phone', 'roles', 'isSubscribed', 'deliveryCost', 'advanceAmount', 'typeOfRegistered', 'Bill', 'address.Apartment', 'address.FlatNo', 'address.zip', 'area'],
        newProperties: ['name', 'email', 'phone', 'password', 'roles', 'isSubscribed', 'deliveryCost', 'advanceAmount', 'typeOfRegistered', 'Bill', 'address.Apartment', 'address.FlatNo', 'address.zip', 'area'],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        properties: {
          __t: { isVisible: false },
          role: { isVisible: false },
          roles: {
            availableValues: [{ value: 'DeliveryPartner', label: 'Delivery Partner' }],
          },
        },
        listProperties: ["name", "email", "role", "createdAt"],
        filterProperties: ["name", "email", "role"],
        editProperties: ['name', 'email', 'phone', 'roles', 'aadhar', 'area'],
        newProperties: ['name', 'email', 'phone', 'password', 'roles', 'aadhar', 'area'],
      },
    },
    {
      resource: Models.Admin,
      options: {
        properties: {
          __t: { isVisible: false },
          role: { isVisible: false },
          roles: {
            availableValues: [{ value: 'Admin', label: 'Admin' }],
          },
        },
        listProperties: ["name", "email", "role", "createdAt"],
        filterProperties: ["name", "email", "role"],
        editProperties: ['name', 'email', 'phone', 'roles'],
        newProperties: ['name', 'email', 'phone', 'password', 'roles'],
      },
    },
    {
      resource: Models.StoreManager,
      options: {
        properties: {
          __t: { isVisible: false },
          role: { isVisible: false },
          roles: {
            availableValues: [{ value: 'StoreManager', label: 'Store Manager' }],
          },
        },
        listProperties: ["name", "email", "role", "createdAt"],
        filterProperties: ["name", "email", "role"],
        editProperties: ['name', 'email', 'phone', 'roles', 'storeId', 'additionalDetailsCompleted', 'location.coordinates'],
        newProperties: ['name', 'email', 'phone', 'password', 'roles', 'storeId', 'additionalDetailsCompleted', 'location.coordinates'],
      },
    },
    //
    // Delivery Models
    {
      resource: Area,
      options: {
        listProperties: ["name", "createdBy", "stockCount", "createdAt"],
        filterProperties: ["name", "stockCount", "createdBy"],
      },
    },
    // Product Models
    {
      resource: Category,
      options: {
        listProperties: ["name", "description", "createdByModel", "createdAt"],
        filterProperties: ["name", "createdByModel"],
        properties: {
          createdBy: {
            isVisible: false
          },
          createdByModel: {
            isVisible: false
          }
        },
        actions: {
          new: {
            before: async (request, context) => {
              console.log('Current Admin:', context.currentAdmin); // Debug
              const currentUser = context.currentAdmin;
              request.payload.createdBy = currentUser._id;
              request.payload.createdByModel = currentUser.roles[0];
              return request;
            }
          }
        }
      },
    },
    {
      resource: Subcategory,
      options: {
        listProperties: ["name", "categoryId", "createdByModel", "createdAt"],
        filterProperties: ["name", "categoryId", "createdByModel"],
        properties: {
          createdBy: {
            isVisible: false
          },
          createdByModel: {
            isVisible: false
          }
        },
                actions: {
          new: {
            before: async (request, context) => {
              console.log('Current Admin:', context.currentAdmin); // Debug
              const currentUser = context.currentAdmin;
              request.payload.createdBy = currentUser._id;
              request.payload.createdByModel = currentUser.roles[0];
              return request;
            }
          }
        }
      },
    },
    {
      resource: MasterProduct,
      options: {
        listProperties: ["name", "description", "categoryId", "subcategoryId", "createdByModel", "createdAt"],
        filterProperties: ["name", "categoryId"],
                properties: {
          createdBy: {
            isVisible: false
          },
          createdByModel: {
            isVisible: false
          }
        },
                actions: {
          new: {
            before: async (request, context) => {
              console.log('Current Admin:', context.currentAdmin); // Debug
              const currentUser = context.currentAdmin;
              request.payload.createdBy = currentUser._id;
              request.payload.createdByModel = currentUser.roles[0];
              return request;
            }
          }
        }
      },
    },
    {
      resource: StoreProduct,
      options: {
        listProperties: ["storeId", "masterProductId", "costPrice", "sellingPrice", "status", "createdAt"],
        filterProperties: ["storeId", "masterProductId", "status"],
                properties: {
          createdBy: {
            isVisible: false
          },
          createdByModel: {
            isVisible: false
          }
        },
                actions: {
          new: {
            before: async (request, context) => {
              console.log('Current Admin:', context.currentAdmin); // Debug
              const currentUser = context.currentAdmin;
              request.payload.createdBy = currentUser._id;
              request.payload.createdByModel = currentUser.roles[0];
              return request;
            }
          }
        }
      },
    },
    // {
    //   resource: StoreCategory,
    //   options: {
    //     listProperties: ["storeId", "categoryId", "priority", "createdAt"],
    //     filterProperties: ["storeId", "categoryId"],
    //   },
    // },


    
    // Store Models
    {
      resource: Store,
      options: {
        listProperties: ["name", "ownerId", "status", "createdAt"],
        filterProperties: ["name", "status", "ownerId"],
      },
    },
    {
      resource: Stock,
      options: {
        listProperties: ["storeProductId", "quantity", "createdAt"],
        filterProperties: ["storeProductId", "quantity"],
      },
    },
    // Order Models
    {
      resource: Order,
      options: {
        listProperties: ["orderId", "customerId", "storeId", "totalAmount", "status", "paymentStatus", "createdAt"],
        filterProperties: ["status", "paymentStatus", "storeId"],
      },
    },
    {
      resource: Invoice,
      options: {
        listProperties: ["orderId", "total", "paymentMethod", "status", "createdAt"],
        filterProperties: ["status", "paymentMethod"],
      },
    }
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