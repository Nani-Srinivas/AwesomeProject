// // models/index.js
// export * from './Customer.js'
// export * from '../StoreManager.js';
// export * from './DeliveryPartner.js';
// export * from './Admin.js';
// export * from './User.js';

// models/index.js
//Import the base User model
import { User } from '../User/User.js';

//Import each discriminator model
import { Customer } from '../User/Customer.js';
import { StoreManager } from '../User/StoreManager.js';
import { DeliveryPartner } from '../User/DeliveryPartner.js';
import { Admin } from '../User/Admin.js';

// Re-export all models
export {
  User,
  Customer,
  StoreManager,
  DeliveryPartner,
  Admin,
};