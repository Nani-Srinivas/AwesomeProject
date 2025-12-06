// models/index.js

//Import each discriminator model
import { Customer } from '../User/Customer.js';
import { StoreManager } from '../User/StoreManager.js';
import { DeliveryPartner } from '../User/DeliveryPartner.js';
import { Admin } from '../User/Admin.js';

// Re-export all models
export {
  Customer,
  StoreManager,
  DeliveryPartner,
  Admin,
};