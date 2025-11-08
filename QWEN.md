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

## Visual Flow for Inventory Management System Implementation

### Flow 1: Add Stock Screen (Inventory Receipt)
**When clicked on "Add Stock" in the home screen:**
- See a "Receive Today's Inventory" header
- Select date (defaults to today)
- Display list of vendors to choose from (or "Add New Vendor" option)
- After selecting vendor, show product entry section
- Product entry: Search/select products, enter quantity, unit price, batch/lot number, expiry date
- Show running total amount at bottom
- Payment section: Select payment status (Paid, Partial, Pending), enter amount paid if partial, payment method
- Save button to create the inventory receipt

### Flow 2: Vendor Selection
**In Add Stock screen when selecting vendor:**
- Click on "Select Vendor" field
- See a modal/list of existing vendors with name, phone, and recent activity
- Option to "Add New Vendor" which opens vendor creation form
- After selecting vendor, return to product entry section

### Flow 3: Product Entry
**After vendor selection:**
- See "Add Products" section with "Add Product" button
- Click "Add Product" to see searchable list of products (from existing product catalog)
- Select product, then enter: quantity received, unit price, batch number, expiry date (if applicable)
- Each added product appears as a card in the list with all details
- Can edit or remove each product entry
- Total amount updates automatically as products are added

### Flow 4: Payment Section
**In Add Stock screen:**
- After adding products, see payment section
- Select payment status: "Paid", "Partial", or "Pending"
- If "Partial", show amount paid field and payment method selection
- If "Pending", show due date field (defaults to today)
- Save button creates the inventory receipt

### Flow 5: Vendor Management
**When clicked on "Vendors" in main menu:**
- See list of all vendors with name, phone, last delivery date, payment status
- Search bar at top to filter vendors
- "Add New Vendor" floating button
- Click on vendor to edit details or view history

### Flow 6: Add New Vendor
**From Vendors screen when clicking "Add New Vendor":**
- Form with fields: Vendor Name, Phone (required), Email, Address, Contact Person, Payment Terms, Notes
- Save button to create new vendor

### Flow 7: Inventory Receipts List
**When clicked on "Inventory Receipts" in main menu:**
- See list of all inventory receipts (most recent at top)
- Each receipt shows: Receipt number, vendor name, date received, total amount, payment status
- Filter button at top to filter by vendor, date range, or payment status
- Click on receipt to see detailed view

### Flow 8: Receipt Details
**When clicked on a receipt in the list:**
- See receipt header with: Receipt number, date, vendor details
- List of all products received with quantity, unit price, batch, expiry
- Payment details: Status, amount paid, payment method, transaction ID
- Option to add payment if status is pending/partial
- Option to edit receipt if needed

### Flow 9: Add Payment to Receipt
**From receipt details when payment status is pending/partial:**
- Click "Add Payment" button
- Enter amount paid
- Select payment method (Cash, Bank Transfer, Digital, etc.)
- Enter transaction ID if applicable
- Submit to update payment status

### Flow 10: Inventory Reports
**When clicked on "Inventory Reports" in main menu:**
- See dashboard with cards: "Today's Inventory", "Pending Payments", "Expiring Soon", "Low Stock"
- Click on any card to see detailed report
- "Today's Inventory" shows all items received today
- "Pending Payments" shows all unpaid/unpaid receipts
- "Expiring Soon" shows products expiring in next 7 days
- "Low Stock" shows items below minimum threshold

### Flow 11: Product Search
**When searching products in Add Stock screen:**
- Click on search field shows product catalog
- Filter by category, subcategory, and product name
- Results show products with name, price, and image
- Click on product to add to inventory receipt

### Flow 12: Barcode Scanning (Optional)
**In Add Stock screen:**
- Click "Scan Barcode" button
- Camera opens to scan product barcode
- Product automatically added to list if recognized
- If not recognized, show option to search manually

### Flow 13: Batch Management
**When entering product details:**
- See "Batch/Lot Number" field to enter specific batch
- See "Expiry Date" field for products with expiry dates
- System groups items by batch for tracking

### Flow 14: Stock Dashboard
**In home screen or navigation:**
- Clicking on "Stock" shows: Current stock levels, low stock alerts, recently received items
- Each product shows: Product name, current quantity, reserved quantity, available quantity
- Red alert for items below threshold

This flow creates a seamless experience for the store manager to receive inventory, track payables, and manage vendors all within the existing app structure.





//Add Stock By Vendor individual Product
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface InventoryItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export const AddStockScreen = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    batchNumber: '',
    expiryDate: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentStatus: 'pending' as 'paid' | 'partial' | 'pending',
    amountPaid: '',
    paymentMethod: '',
    transactionId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/vendors');
      if (response.data.success) {
        setVendors(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load vendors');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (search: string) => {
    try {
      // In a real app, this would call an API to search products
      // For now, we'll use a mock implementation
      const response = await apiService.get(`/product/store-products?search=${search}`);
      if (response.data.success) {
        setFilteredProducts(response.data.data);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      setFilteredProducts([]);
      console.error(error);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.productId || !newProduct.quantity || !newProduct.unitPrice) {
      Alert.alert('Error', 'Please fill in all required fields (Product, Quantity, Unit Price)');
      return;
    }

    const product = filteredProducts.find(p => p._id === newProduct.productId);
    if (!product) {
      Alert.alert('Error', 'Selected product not found');
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      product,
      quantity: parseInt(newProduct.quantity, 10),
      unitPrice: parseFloat(newProduct.unitPrice),
      batchNumber: newProduct.batchNumber,
      expiryDate: newProduct.expiryDate,
      notes: newProduct.notes,
    };

    setInventoryItems([...inventoryItems, newItem]);

    // Reset the form
    setNewProduct({
      productId: '',
      quantity: '',
      unitPrice: '',
      batchNumber: '',
      expiryDate: '',
      notes: '',
    });
    
    setShowProductSelector(false);
  };

  const handleSaveReceipt = async () => {
    if (!selectedVendor) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }

    if (inventoryItems.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = inventoryItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      // Prepare the receipt data
      const receiptData = {
        vendorId: selectedVendor._id,
        items: inventoryItems.map(item => ({
          storeProductId: item.product._id,
          receivedQuantity: item.quantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          notes: item.notes,
        })),
        totalAmount,
        paymentStatus: paymentDetails.paymentStatus,
        amountPaid: paymentDetails.paymentStatus === 'paid' ? totalAmount : 
                  paymentDetails.paymentStatus === 'partial' ? parseFloat(paymentDetails.amountPaid) || 0 : 0,
        paymentMethod: paymentDetails.paymentMethod || undefined,
        transactionId: paymentDetails.transactionId || undefined,
        notes: 'Inventory receipt',
      };

      // Save the inventory receipt
      const response = await apiService.post('/inventory/receipts', receiptData);

      if (response.data.success) {
        Alert.alert('Success', 'Inventory receipt saved successfully');
        
        // Reset the form
        setSelectedVendor(null);
        setInventoryItems([]);
        setPaymentDetails({
          paymentStatus: 'pending',
          amountPaid: '',
          paymentMethod: '',
          transactionId: '',
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save inventory receipt');
      }
    } catch (error) {
      console.error('Error saving inventory receipt:', error);
      Alert.alert('Error', 'Failed to save inventory receipt');
    }
  };

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowProductSelector(false);
  };

  const handleSearchProducts = (text: string) => {
    setSearchTerm(text);
    if (text.length > 0) {
      loadProducts(text);
      setShowProductSelector(true);
    } else {
      setShowProductSelector(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setNewProduct({
      ...newProduct,
      productId: product._id,
    });
    setShowProductSelector(false);
  };

  const removeItem = (id: string) => {
    setInventoryItems(inventoryItems.filter(item => item.id !== id));
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.inventoryItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemDetails}>
          Qty: {item.quantity} | Unit Price: ₹{item.unitPrice.toFixed(2)} | Batch: {item.batchNumber || 'N/A'}
        </Text>
        {item.expiryDate && (
          <Text style={styles.itemDetails}>Expiry: {item.expiryDate}</Text>
        )}
        {item.notes && (
          <Text style={styles.itemNotes}>Notes: {item.notes}</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>₹{(item.quantity * item.unitPrice).toFixed(2)}</Text>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
          <Feather name="trash-2" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductOption = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productOption}
      onPress={() => handleProductSelect(item)}
    >
      <Text style={styles.productOptionText}>{item.name}</Text>
      <Text style={styles.productOptionPrice}>₹{item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const totalAmount = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const pendingAmount = totalAmount - 
    (paymentDetails.paymentStatus === 'paid' ? totalAmount : 
     paymentDetails.paymentStatus === 'partial' ? parseFloat(paymentDetails.amountPaid) || 0 : 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Receive Inventory</Text>

      {/* Vendor Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Vendor</Text>
        {selectedVendor ? (
          <View style={styles.selectedVendor}>
            <Text style={styles.selectedVendorName}>{selectedVendor.name}</Text>
            <Text style={styles.selectedVendorInfo}>Phone: {selectedVendor.phone}</Text>
            {selectedVendor.email && <Text style={styles.selectedVendorInfo}>Email: {selectedVendor.email}</Text>}
            <TouchableOpacity 
              style={styles.changeVendorButton} 
              onPress={() => setSelectedVendor(null)}
            >
              <Text style={styles.changeVendorText}>Change Vendor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.placeholderText}>Select a vendor to begin</Text>
            <FlatList
              data={vendors}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vendorOption}
                  onPress={() => handleVendorSelect(item)}
                >
                  <Text style={styles.vendorOptionName}>{item.name}</Text>
                  <Text style={styles.vendorOptionPhone}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No vendors found</Text>
              }
            />
          </View>
        )}
      </View>

      {/* Product Selection (only if vendor is selected) */}
      {selectedVendor && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Products</Text>
            
            {/* Product Search */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Search Product</Text>
              <TextInput
                style={styles.input}
                placeholder="Search for products..."
                value={searchTerm}
                onChangeText={handleSearchProducts}
              />
            </View>
            
            {/* Product Selector Dropdown */}
            {showProductSelector && (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                renderItem={renderProductOption}
                style={styles.productSelector}
                ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
              />
            )}

            {/* Product Details Form */}
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  value={newProduct.quantity}
                  onChangeText={(text) => setNewProduct({...newProduct, quantity: text})}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Unit Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter unit price"
                  value={newProduct.unitPrice}
                  onChangeText={(text) => setNewProduct({...newProduct, unitPrice: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Batch Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Batch number"
                  value={newProduct.batchNumber}
                  onChangeText={(text) => setNewProduct({...newProduct, batchNumber: text})}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newProduct.expiryDate}
                  onChangeText={(text) => setNewProduct({...newProduct, expiryDate: text})}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes..."
                value={newProduct.notes}
                onChangeText={(text) => setNewProduct({...newProduct, notes: text})}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Feather name="plus" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Product to Receipt</Text>
            </TouchableOpacity>
          </View>

          {/* Current Items List */}
          {inventoryItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Receipt Items</Text>
              <FlatList
                data={inventoryItems}
                keyExtractor={(item) => item.id}
                renderItem={renderInventoryItem}
                ListFooterComponent={
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
                  </View>
                }
              />
            </View>
          )}

          {/* Payment Details */}
          {inventoryItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Status</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      paymentDetails.paymentStatus === 'paid' && styles.radioButtonSelected,
                    ]}
                    onPress={() => setPaymentDetails({...paymentDetails, paymentStatus: 'paid', amountPaid: totalAmount.toString()})}
                  >
                    <Text style={[
                      styles.radioText,
                      paymentDetails.paymentStatus === 'paid' && styles.radioTextSelected,
                    ]}>Paid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      paymentDetails.paymentStatus === 'partial' && styles.radioButtonSelected,
                    ]}
                    onPress={() => setPaymentDetails({...paymentDetails, paymentStatus: 'partial'})}
                  >
                    <Text style={[
                      styles.radioText,
                      paymentDetails.paymentStatus === 'partial' && styles.radioTextSelected,
                    ]}>Partial</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      paymentDetails.paymentStatus === 'pending' && styles.radioButtonSelected,
                    ]}
                    onPress={() => setPaymentDetails({...paymentDetails, paymentStatus: 'pending', amountPaid: '0'})}
                  >
                    <Text style={[
                      styles.radioText,
                      paymentDetails.paymentStatus === 'pending' && styles.radioTextSelected,
                    ]}>Pending</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {paymentDetails.paymentStatus === 'partial' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount Paid (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount paid"
                    value={paymentDetails.amountPaid}
                    onChangeText={(text) => setPaymentDetails({...paymentDetails, amountPaid: text})}
                    keyboardType="numeric"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cash, Bank Transfer, UPI, etc."
                  value={paymentDetails.paymentMethod}
                  onChangeText={(text) => setPaymentDetails({...paymentDetails, paymentMethod: text})}
                />
              </View>

              {paymentDetails.paymentMethod.toLowerCase() !== 'cash' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Transaction ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter transaction ID"
                    value={paymentDetails.transactionId}
                    onChangeText={(text) => setPaymentDetails({...paymentDetails, transactionId: text})}
                  />
                </View>
              )}

              {pendingAmount > 0 && (
                <View style={styles.pendingAmountContainer}>
                  <Text style={styles.pendingAmountText}>
                    Pending Amount: ₹{pendingAmount.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Save Button */}
          {inventoryItems.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveReceipt}
              >
                <Feather name="save" size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Save Inventory Receipt</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {!selectedVendor && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Select a vendor to start receiving inventory</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  selectedVendor: {
    padding: 12,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedVendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectedVendorInfo: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
  changeVendorButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeVendorText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
    textAlign: 'center',
  },
  vendorOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vendorOptionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  vendorOptionPhone: {
    fontSize: 14,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  productOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  productOptionPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  removeButton: {
    padding: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  radioButtonSelected: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: '#666',
  },
  radioTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pendingAmountContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  pendingAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#999',
  },
});

