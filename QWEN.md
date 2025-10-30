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