# Qwen Code Project Overview

## Project Type
This is a full-stack grocery delivery management system consisting of:
- **Frontend**: React Native mobile application (TypeScript)
- **Backend**: Node.js server using Fastify framework with MongoDB database
- **Real-time communication**: Socket.IO for live updates
- **Admin panel**: AdminJS interface for management

## Project Architecture
```
C:\Users\LionO\Downloads\Awesome\
├───AwesomeProject/          # React Native mobile app
├───AwesomeServer/           # Node.js/Fastify server
├───.gitignore
├───bottomsheet.md           # Bottom sheet feature documentation
├───CUSTOMER_SCENARIO.md     # Customer form enhancement tasks
├───CustomerScreen.md        # Customer screen functionality
├───GEMINI.md                # Project overview and documentation
├───PDF_Implementation.md    # PDF generation and cloud storage
├───postman_test_payloads.md # API testing documentation
├───ProductScreen API Task.md # Product screen API integration
└───QWEN.md                  # This file
```

## Frontend (AwesomeProject)

### Tech Stack
- **Framework**: React Native
- **Language**: TypeScript
- **Navigation**: React Navigation (stack, native, material-top-tabs)
- **State Management**: Zustand
- **UI Components**: 
  - `@gorhom/bottom-sheet` for bottom sheets
  - `react-native-gesture-handler` for touch interactions
  - `react-native-vector-icons` for icons
  - `react-native-calendars` for calendar functionality
  - `react-native-maps` for maps
- **API Communication**: Axios with interceptors

### Key Features
- Multi-role authentication (Customers, Delivery Partners)
- Product browsing with category filtering
- Order management system
- PDF invoice generation and viewing
- Real-time delivery tracking
- Customer management with attendance tracking

### Frontend Scripts
- `npm start` - Start Metro bundler
- `npm run android` - Build and run on Android
- `npm run ios` - Build and run on iOS
- `npm run lint` - Lint code
- `npm run test` - Run tests

### Frontend Structure
```
AwesomeProject/
├───src/
│   ├───api/                 # API configuration and axios instances
│   ├───assets/              # Static assets
│   ├───components/          # Reusable UI components
│   ├───constants/           # App constants and configurations
│   ├───navigation/          # Navigation setup
│   ├───screens/             # Screen components
│   ├───services/            # Business logic services
│   ├───store/               # Zustand state management
│   ├───types/               # TypeScript type definitions
│   └───utils/               # Utility functions
└───...
```

## Backend (AwesomeServer)

### Tech Stack
- **Framework**: Fastify
- **Language**: JavaScript/Node.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: WebSocket support
- **Authentication**: JWT-based with role-based access
- **Admin Panel**: AdminJS
- **PDF Generation**: PDFKit
- **Cloud Storage**: Cloudinary

### Key Features
- RESTful API for mobile app
- Role-based authentication and authorization
- Product and inventory management
- Customer and delivery management
- Real-time order tracking via WebSockets
- PDF invoice generation and cloud storage
- Admin panel for data management

### Backend Scripts
- `npm start` - Start the server with nodemon

### Backend Structure
```
AwesomeServer/
├───src/
│   ├───config/              # Configuration files
│   ├───controllers/         # Request handling logic
│   ├───middleware/          # Authentication and validation
│   ├───models/              # Mongoose schemas
│   └───routes/              # API route definitions
└───app.js                   # Main application entry point
```

## Key Functionality

### Customer Management
- Add/edit customer details with address, delivery cost, advance amount, subscription status
- Product selection for required products
- Attendance tracking with extra products
- Bill generation and viewing

### Product Catalog
- Category and subcategory-based product browsing
- API-driven data fetching
- Search and filtering capabilities

### PDF Generation & Storage
- Invoice generation with PDFKit
- Cloud storage using Cloudinary
- Invoice history screen
- Download functionality

### Real-time Features
- WebSocket-based order tracking
- Live updates for delivery status

## Development Setup

### Prerequisites
- Node.js (>=20)
- React Native development environment
- MongoDB instance
- Android Studio/iOS Simulator for mobile testing

### Environment Variables
Both frontend and backend require `.env` files with appropriate configuration:
- Database connection strings
- API keys for cloud services
- JWT secrets
- Server ports

### API Integration Notes
- Client uses `http://10.0.2.2:3000/api` for Android emulator
- Server runs on port 3000 by default
- JWT authentication required for most endpoints

## Documentation Files
- `CUSTOMER_SCENARIO.md` - Customer form enhancements
- `CustomerScreen.md` - Customer screen functionality
- `ProductScreen API Task.md` - Product screen API integration
- `bottomsheet.md` - Bottom sheet implementation
- `PDF_Implementation.md` - PDF generation system
- `postman_test_payloads.md` - API testing examples

## Development Conventions
- TypeScript for type safety in frontend
- ESLint and Prettier for code formatting
- Zustand for state management instead of Redux
- Mongoose for MongoDB object modeling
- Fastify for high-performance API

## MVP Improvements & Future Enhancements

### Immediate MVP Improvements (High Priority, Quick Implementation)

1. **Customer Experience Enhancements**:
   - Add basic customer notifications for invoice generation (SMS/email)
   - Implement simple offline synchronization for delivery partners
   - Add customer phone number validation

2. **Payment System Improvements**:
   - Add basic payment status validation
   - Implement payment receipt generation
   - Add payment method validation (ensure transaction IDs are required for non-cash payments)

3. **UI/UX Improvements**:
   - Add loading states for all API calls
   - Implement basic error handling and user feedback
   - Add search functionality to customer list screen
   - Improve invoice view design with better product organization

4. **Backend Security**:
   - Add input validation for all API endpoints
   - Implement rate limiting for API requests
   - Add basic API documentation using Swagger/OpenAPI

5. **Data Management**:
   - Add customer and invoice search capabilities
   - Implement soft deletion for customer records
   - Add basic data export functionality

### Future Enhancements (For Post-MVP)

1. **Enhanced Invoice Management**:
   - Invoice scheduling and automated reminders for due dates
   - Recurring invoice generation for subscription-based customers
   - Invoice versioning and approval workflow

2. **Payment System Enhancements**:
   - Payment gateway integration (Stripe/Razorpay) for online payments
   - Payment reconciliation and dispute management
   - Bulk payment processing for multiple invoices

3. **Financial Reporting**:
   - Real-time financial dashboards (daily/weekly/monthly collections)
   - Aging reports for outstanding payments
   - Financial KPIs (ARPU, collection efficiency, etc.)

4. **Customer Experience**:
   - Customer portal for self-service invoice viewing
   - Payment link generation for customers
   - SMS/email notifications for invoice generation and payment due dates

5. **Operational Features**:
   - Multi-store support (currently appears to be single store)
   - Delivery route optimization
   - Inventory integration to prevent over-promising products

6. **Data Management**:
   - Data backup and recovery procedures
   - GDPR compliance for customer data
   - Advanced analytics and reporting

7. **Security & Compliance**:
   - Payment data encryption at rest
   - Audit trails for financial transactions
   - Two-factor authentication for financial operations

8. **Mobile App Enhancements**:
   - Offline mode for delivery partners
   - Push notifications for payment reminders
   - Biometric authentication for sensitive operations

9. **Business Intelligence**:
   - Customer segmentation based on payment behavior
   - Predictive analytics for payment defaults
   - Product demand forecasting based on delivery patterns

10. **Integration Capabilities**:
    - Accounting software integration (QuickBooks, Tally)
    - Bank reconciliation tools
    - ERP system integration

### Technical Improvements

1. **Backend Enhancements**:
   - Add more comprehensive error handling and logging
   - Implement caching for frequently accessed customer and invoice data
   - Add comprehensive API documentation

2. **Frontend Improvements**:
   - Implement proper state management for complex forms
   - Improve UI/UX for better accessibility
   - Add comprehensive form validation

3. **Database Optimizations**:
   - Add proper indexing for frequently queried fields
   - Implement data partitioning for historical data

4. **Monitoring & Analytics**:
   - Add application performance monitoring
   - Implement business metrics tracking
   - Add system health monitoring









   Today 05 Nov improvements
==================================================================
Changes
===================================================================
2. Payment System Improvements

  Add Basic Payment Status Validation

  Implementation Strategy:
   - Add validation to ensure payment status is properly set
   - Create helper functions to manage payment status updates

  Code Implementation:

  Update the payment controller in AwesomeServer/src/controllers/Finance/Payment.js:


  Add Payment Method Validation

  Implementation Strategy:
   - Ensure transaction IDs are required for non-cash payments
   - Add validation to prevent inconsistent data entry

  Code Implementation:

  This was already covered in the payment status validation section above, but the key additions are:
   - Transaction ID validation based on payment method
   - Proper error messages for invalid combinations
   - Comprehensive validation for all payment-related data


3. UI/UX Improvements

  Add Loading States for All API Calls

  Implementation Strategy:
   - Create a loading state management system
   - Add loading indicators to all screens that make API calls
   - Implement proper error handling with user feedback

  Code Implementation:

  First, create a loading context in AwesomeProject/src/contexts/LoadingContext.js:

Implement Basic Error Handling and User Feedback

  Implementation Strategy:
   - Create a global error handling utility
   - Implement proper error messages to users
   - Add retry mechanisms for failed operations

  Code Implementation:

  Create an error handler utility in AwesomeProject/src/utils/errorHandler.js:


 Add Search Functionality to Customer List Screen

  Implementation Strategy:
   - Enhance the existing search functionality to be more robust
   - Add search across multiple fields
   - Add debounced search to improve performance

  Code Implementation:

  Update CustomerListScreen.tsx with enhanced search functionality:


  4. Backend Security Improvements

  Add Input Validation for All API Endpoints

  Implementation Strategy:
   - Create validation middleware
   - Implement validation schemas for all request bodies
   - Use Joi or similar library for validation

  Code Implementation:

  Install Joi validation library:

   1 cd AwesomeServer
   2 npm install joi
   3 npm install @types/joi --save-dev # if using TypeScript for server

  Create a validation middleware in AwesomeServer/src/middleware/validation.js:



Implement Rate Limiting for API Requests

  Implementation Strategy:
   - Use fastify-rate-limit plugin
   - Set appropriate limits for different endpoints
   - Configure sliding window policies

  Code Implementation:

  Install the rate limiting package:

   1 cd AwesomeServer
   2 npm install fastify-rate-limit

  Update the main app file to include rate limiting:




  User Store:
  You are an expert React Native developer with experience in e-commerce and delivery applications. Your goal is to help me build and maintain this application, ensuring high-quality code and a great user experience.
You got a project where the user journey is as follows:
1. There are different stores managed by individuals storemanager which are located in different locations.

I am a one of the store manager where I open my store at morning 5am daily, i will start receiving inventory for the store daily of different products from different vendors (Products are same but the quantity varies, for different store it might be different) which i have ordered from various other platforms before, i will make a note on a book of these inventories i receive daily.

Eg: In the morning my first products are dairy products of different brands like heritage, Vijaya, amul, jersy...ect, i consider this brands a categories, and milk as subcategory 1, curd from that  brands subcategory 2, items like icecreams as subcategory 3, and so on, and products like cow milk 500ml, cow milk 1 liter, full cream milk 500ml...ect are subcategory milk products and total curd, probiotic curd, creamilicious Curd are subcategory curd products.

for now we will focus on one type of items in the store of dairy products to develop this application, as a store manager i have a door delivery to some radius of 2-5km from my store, to do that i have 5-10 delivery boys to delivery items, there are 2 types of deliveries, 1. Daily morning delivery items like milk, bread, fruits ect which are delivery to customers daily in the morning on the monthly subscription model and 2. Other products like icecreams which are delivered when they order from morning to night 10PM.

from my store there are different areas in the range of 5 KM, i maintain one book for one area, when a new customer visit my store and want the dairy products to delivery at there home i will ask for the area name and add that customer in that particular area book with all the products need daily to delivery. like a students attendance register i will add new customer flat number and apartment and products and remaining details like name, number..ect in other book of customers, this is because we mainly focus on the apartment name, flat number and products to delivery to mark daily attendance for the  customer by delivery boys. 

example Daily Order: like 2 packets of full cream milk 500ml, 6 eggs and bread packet daily at 204 sai sadan apartments, Rajeev Nagar colony.


for daily delivery items for specific area i have assigned a specific deliveyboy and in the morning when the deliveryboy reaches the store i will already arrange total number of items for a particular area in one big basket delivery boy will check the count of the products require to delivery in that area, the count will be same in most of the time but some times the customer will call and ask for more quantity, which are also recorded in the book as a requirement for customer from previous example 204 sai sadan apartments, Rajeev Nagar colony and tell the delivery boy that this 204 need more items for the day.

example Daily order required more item: like 2 packets of full cream milk 500ml, 6 eggs and bread packet daily + Curd 500ml Packet for a day 14-09-2025 at 204 sai sadan apartments, Rajeev Nagar colony.

Delivery boy will pick all the items required for the day for that area in a vehicle and will go for delivery the items, all deliveries need to complete before 7 AM in the morning so they will just delivery the at the customers door and rings the bell and leave apartment, most cases there will be more customers in different floors of the apartment ex: 101, 105, 201, 203, 204, 302 in sai sadan Apartment, in the same with different apartments too in that area, so the delivery boy will complete the delivery without any acknowledgement after reaching back to the store with the remaining items (return) he will return to me and starts adding the attendance of the customers like delivered a write mark, and not deliveried as cross, same as the school attendance register type, her also the same in the attendance register there will be apartment name flat number and product in the place of student name and as the dates on the top, the not deliveied (returns can be because of Float locked, or called and said no need for the day and so on).

this will happens for the month and in last day of the month and 1, 2 days of the new month i need to go through the attendance register and prepare the bills for the customers.

There is one more thing that is daily inventory also i need to pay the payables for the daily when i receive the inventory.


To overcome this pen and book and register i want to develop an application, there is 2nd type of delivery but we will do it later.

## Features Already Implemented

### Customer Management
- Add, edit, delete customers with details like name, phone, address, products needed
- Search functionality across customer information
- Filter customers by payment status (Paid, Unpaid, Partially Paid)
- Customer details view with comprehensive information

### Attendance Tracking
- Daily attendance logging for customers in specific areas
- Product-specific attendance marking (delivered/not delivered)
- Add extra products for specific dates
- Area-based attendance tracking
- Calendar-based date selection

### Billing & Invoice Generation
- Generate monthly and custom period invoices
- PDF invoice generation with Cloudinary storage
- Invoice history with download and share capabilities
- Invoice preview functionality
- Customer-specific invoice history

### Area Management
- Create, edit, delete delivery areas
- Assign customers to specific areas
- Track area-based attendance

### Delivery Partner Management
- Add, edit, delete delivery partners
- Track delivery partner status (active/inactive)

### Product Catalog
- Product categories and subcategories
- Product management with pricing
- Brand-based categorization (as mentioned in requirements)

### User Authentication & Roles
- Multi-role authentication (StoreManager, DeliveryPartner, Customer)
- JWT-based authentication system
- Role-based access control

### Store Management
- Store creation and setup
- Product category selection for stores

## Critical Missing Feature for MVP

### Inventory Management System (Top Priority)
- No interface to record daily inventory received from vendors
- No tracking of quantities received
- No payable management for inventory received
- The AddStockScreen is just a placeholder calendar component with no actual stock functionality
- No vendor management system
- No connection between received inventory and products available for customer delivery
- No tracking of product quantities received from different vendors
- No payable tracking for daily inventory received
- No link between inventory received and products available for delivery

### Additional Missing Features
- Limited payment status tracking (no clear payment confirmation process after invoice generation)
- No connection between attendance, billing, and actual payment status
- No delivery route optimization for efficient delivery
- No real-time tracking of delivery boys during delivery process
- No inventory-stock level tracking to ensure sufficient inventory for customer orders
- Limited offline functionality for delivery boys when they lose internet connectivity
- No SMS/email notifications for invoice generation to customers
- No customer communication channel to request extra items

## Recommended Next Steps for Quick MVP

### 1. Critical - Inventory Management System (Top Priority)
- Create a functional stock receiving interface
- Add ability to record daily inventory received from vendors
- Track quantities and create a basic inventory database
- Link inventory to product catalog
- Basic payable tracking for daily inventory received

### 2. Payment Status Tracking
- Add payment confirmation functionality to link with invoice generation
- Create simple payment status updates (paid/unpaid/partially paid)
- Connect payment status to customer records

### 3. Basic Reporting Dashboard
- Create a simple dashboard showing daily metrics:
  - Daily attendance summary
  - Daily delivery status
  - Daily inventory received
  - Daily payments collected

### 4. Offline Support for Delivery Boys (Quick Implementation)
- Implement basic offline mode for attendance tracking
- Add synchronization when internet connection is restored

### 5. Simple Communication
- Add basic notification system for invoice generation
- Add ability for customers to request extra items via the app

### 6. Delivery Route Helper
- Basic list of addresses/locations sorted by apartment/area for delivery boys

The most critical missing component is the **Inventory Management System**, which directly impacts the store manager's daily operations as described in the user story. The store manager receives inventory daily from vendors, needs to track what was received and payables, and this inventory needs to be linked to products available for customer delivery. This is the core operational gap that needs to be filled for the MVP to be viable for store managers.

