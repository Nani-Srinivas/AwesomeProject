# Project Overview

This is a React Native project bootstrapped with `@react-native-community/cli`. The project is written in TypeScript and uses `jest` for testing. It includes a Fastify server with a MongoDB database.

This project is a full-stack grocery delivery management system. It consists of a React Native mobile application for the front-end and a Node.js (Fastify) server for the back-end.

**The application is designed to be used by multiple roles:**

*   **Customers:** Can browse products and place orders.
*   **Delivery Partners:** Manage deliveries.
*   **Store Managers:** Manage products, inventory, and other store-related operations.

**Here's a breakdown of the key features:**

**Mobile App (React Native):**

*   **Authentication:** Separate login flows for "Customers" and "Delivery Partners".
*   **Product Browsing:** Users can view products, filter them by category, and add them to a cart.
*   **Order Management:** Users can place and track orders.
*   **Home Screen:** A dashboard that displays services, customer information, and payables.
*   **State Management:** Uses Zustand for managing application state.

**Server (Fastify):**

*   **RESTful API:** Provides a comprehensive API for the mobile app to interact with.
*   **Database:** Uses MongoDB to store data.
*   **Real-time Communication:** Implements Socket.IO for real-time features like order tracking.
*   **Authentication:** Handles user authentication and authorization for different roles using JWT.
*   **Product and Inventory Management:** Endpoints for managing products, categories, and stock levels.
*   **Delivery Management:** Routes for managing delivery areas.
*   **Financial Tracking:** Includes routes for tracking daily financial data.
*   **Admin Panel:** An AdminJS interface for managing the entire application.

**In summary, this is a sophisticated application designed to manage all aspects of a grocery delivery business, from the customer-facing mobile app to the back-end administrative and logistical operations.**

## Client (React Native)

### Building and Running

#### Metro

To start the Metro dev server, run:

```sh
npm start
```

#### Android

To build and run the Android app, run:

```sh
npm run android
```

#### iOS

To build and run the iOS app, run:

```sh
npm run ios
```

### Testing

To run the tests, run:

```sh
npm run test
```

### Linting

To lint the code, run:

```sh
npm run lint
```

### Development Conventions

The project uses ESLint for linting and Prettier for code formatting. The configuration for these tools can be found in `.eslintrc.js` and `.prettierrc.js` respectively. The project uses a `.env` file for environment variables.

### Project Structure

The client-side code is located in the `AwesomeProject-main` directory.

```
AwesomeProject-main/
├───src/
│   ├───api/
│   ├───assets/
│   ├───components/
│   ├───constants/
│   ├───navigation/
│   ├───screens/
│   ├───services/
│   ├───store/
│   ├───types/
│   └───utils/
└───...
```

## Server (Fastify)

### Building and Running

To start the server, run:

```sh
npm start
```

### Development Conventions

The server is a Node.js project using Fastify, Mongoose, and Socket.IO. It uses an `.env` file for environment variables.

### Project Structure

The server-side code is located in the `AwesomeServer` directory.

```
AwesomeServer/
├───src/
│   ├───config/
│   ├───controllers/
│   ├───middleware/
│   ├───models/
│   └───routes/
└───...
```