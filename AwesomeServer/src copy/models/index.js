// models/index.js
import { User } from './User/index.js';
import { Customer } from './User/Customer.js';
import { StoreManager } from './User/StoreManager.js';
import { DeliveryPartner } from './User/DeliveryPartner.js';
import { Admin } from './User/Admin.js';


// Export all models
export {
  User,
  // Discriminator models
  Customer,
  StoreManager,
  DeliveryPartner,
  Admin,
};

// models/index.js

// Import the base User model
//import { User } from './User/index.js';

// Import each discriminator model
// import { Customer } from './User/Customer.js';
// import { StoreManager } from './User/StoreManager.js';
// import { DeliveryPartner } from './User/DeliveryPartner.js';
// import { Admin } from './User/Admin.js';

// // Re-export all models
// export {
//   User,
//   Customer,
//   StoreManager,
//   DeliveryPartner,
//   Admin,
// };