# Project Overview

This is a React Native project bootstrapped with `@react-native-community/cli`. The project is written in TypeScript and uses `jest` for testing.

## Building and Running

### Metro

To start the Metro dev server, run:

```sh
npm start
```

### Android

To build and run the Android app, run:

```sh
npm run android
```

### iOS

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

## Development Conventions

The project uses ESLint for linting and Prettier for code formatting. The configuration for these tools can be found in `.eslintrc.js` and `.prettierrc.js` respectively.

## Project Structure

```
E:\Nani_Srinivas\RN\AwesomeProject\
├───.eslintrc.js
├───.gitignore
├───.prettierrc.js
├───.watchmanconfig
├───app.json
├───App.tsx
├───babel.config.js
├───Gemfile
├───GEMINI.md
├───index.js
├───jest.config.js
├───metro.config.js
├───package-lock.json
├───package.json
├───README.md
├───tsconfig.json
├───__tests__\
│   └───App.test.tsx
├───.bundle\
│   └───config
├───android\
│   ├───build.gradle
│   ├───gradle.properties
│   ├───gradlew
│   ├───gradlew.bat
│   ├───settings.gradle
│   ├───.gradle\
│   │   ├───file-system.probe
│   │   ├───8.14.3\
│   │   │   ├───gc.properties
│   │   │   ├───checksums\
│   │   │   │   ├───checksums.lock
│   │   │   │   ├───md5-checksums.bin
│   │   │   │   └───sha1-checksums.bin
│   │   │   ├───executionHistory\
│   │   │   │   ├───executionHistory.bin
│   │   │   │   └───executionHistory.lock
│   │   │   ├───expanded\
│   │   │   ├───fileChanges\
│   │   │   ├───fileHashes\
│   │   │   └───vcsMetadata\
│   │   ├───buildOutputCleanup\
│   │   │   ├───buildOutputCleanup.lock
│   │   │   ├───cache.properties
│   │   │   └───outputFiles.bin
│   │   ├───noVersion\
│   │   │   └───buildLogic.lock
│   │   └───vcs-1\
│   │       └───gc.properties
│   ├───.kotlin\
│   │   └───sessions\
│   ├───app\
│   │   ├───build.gradle
│   │   ├───debug.keystore
│   │   ├───proguard-rules.pro
│   │   ├───.cxx\
│   │   │   ├───Debug\
│   │   │   └───tools\
│   │   ├───build\
│   │   │   ├───generated\
│   │   │   ├───intermediates\
│   │   │   ├───kotlin\
│   │   │   ├───outputs\
│   │   │   └───tmp\
│   │   └───src\
│   │       └───main\
│   ├───build\
│   │   ├───generated\
│   │   │   └───autolinking
│   │   └───reports\
│   │       └───problems\
│   └───gradle\
│       └───wrapper\
│           ├───gradle-wrapper.jar
│           └───gradle-wrapper.properties
├───ios\
│   ├───.xcode.env
│   ├───Podfile
│   ├───AwesomeProject\
│   │   ├───AppDelegate.swift
│   │   ├───Info.plist
│   │   ├───LaunchScreen.storyboard
│   │   ├───PrivacyInfo.xcprivacy
│   │   └───Images.xcassets\
│   │       ├───Contents.json
│   │       └───AppIcon.appiconset\
│   └───AwesomeProject.xcodeproj\
│       ├───project.pbxproj
│       └───xcshareddata\
│           └───xcschemes\
├───node_modules
└───src\
    ├───App.tsx
    ├───api\
    │   └───axiosInstance.ts
    ├───assets\
    │   ├───animations\
    │   │   ├───confirm.json
│   │   ├───delivery_man.json
│   │   └───raining.json
│   ├───category\
│   │   ├───1.png
│   │   ├───2.png
│   │   ├───3.png
│   │   ├───4.png
│   │   ├───5.png
│   │   ├───6.png
│   │   ├───7.png
│   │   └───8.png
│   ├───fonts\
│   │   ├───Okra-Bold.ttf
│   │   ├───Okra-ExtraBold.ttf
│   │   ├───Okra-Medium.ttf
│   │   ├───Okra-MediumLight.ttf
│   │   └───Okra-Regular.ttf
│   ├───icons\
│   │   ├───bucket.png
│   │   ├───clock.png
│   │   ├───coupon.png
│   │   ├───delivery.png
│   │   ├───home.png
│   │   ├───my_pin.png
│   │   └───store.png
│   ├───images\
│   │   ├───cloud.png
│   │   ├───delivery_boy.png
│   │   └───logo.jpeg
│   └───products\
│       ├───1.png
│       ├───10.png
│       ├───11.png
│       ├───12.png
│       ├───13.png
│       ├───14.png
│       ├───15.png
│       ├───16.png
│       ├───2.png
│       ├───3.png
│       ├───4.png
│       ├───5.png
│       ├───6.png
│       ├───7.png
│       ├───8.png
│       ├───9.png
│       ├───c1.jpg
│       ├───c2.jpg
│       └───c3.jpeg
    ├───components\
    │   ├───area\
    │   │   └───AddAreaModal.tsx
│   │   ├───common\
│   │   │   ├───Button.tsx
│   │   │   └───SideMenu.tsx
│   │   └───deliveryBoy\
│   │       └───AddDeliveryBoyModal.tsx
│   ├───constants\
│   │   ├───colors.ts
│   │   └───strings.ts
│   ├───hooks\
│   ├───navigation\
│   │   ├───AppNavigator.tsx
│   │   ├───types.ts
│   │   └───stacks\
│   │       ├───AuthStack.tsx
│   │       └───MainStack.tsx
│   ├───screens\
│   │   ├───AddStock\
│   │   │   └───AddStockScreen.tsx
│   │   ├───Area\
│   │   │   └───AreaListScreen.tsx
│   │   ├───Attendance\
│   │   │   └───AddAttendance.tsx
│   │   ├───Auth\
│   │   │   ├───ForgotPasswordScreen.tsx
│   │   │   ├───LoginScreen.tsx
│   │   │   └───RegisterScreen.tsx
│   │   ├───Calendar\
│   │   │   └───CalendarScreen.tsx
│   │   ├───Customer\
│   │   │   └───CustomerListScreen.tsx
│   │   ├───Dashboard\
│   │   │   ├───DashboardScreen.tsx
│   │   │   └───components\
│   │   ├───DeliveryBoy\
│   │   │   └───DeliveryBoyListScreen.tsx
│   │   ├───Details\
│   │   │   └───DetailsScreen.tsx
│   │   ├───Home\
│   │   │   ├───HomeScreen.tsx
│   │   │   └───components\
│   │   └───Products\
│   │       └───ProductsScreen.tsx
│   ├───services\
│   │   ├───apiService.ts
│   │   └───secureStorageService.ts
│   ├───store\
│   │   └───userStore.ts
│   ├───styles\
│   └───utils\
│       └───helpers.ts


## Client Project Structure

**Note:** I am unable to access the file system for the client project. Please paste the directory structure for `E:\Nani_Srinivas\RN\173033_GA\GA\client` here.

```
<PASTE CLIENT PROJECT STRUCTURE HERE>
```

---

Yes, I have implemented dummy credentials for the login screen:

 Email:* test@example.com
 Password:* password

The login process is simulated with a 2-second delay. For registration, passwords must match and all
fields must be filled.


If you wish to start the app already logged in, you can uncomment the line // setIsLoggedIn(true); in
src/navigation/AppNavigator.tsx.


Please note that the onAddDeliveryBoy and onAddArea functions in their respective modals currently
only log the input data to the console and close the modal, as the focus was on UI implementation
without a backend.

---

## Authentication Improvement Tasks

This section outlines the tasks to improve the authentication functionality of the application.

*   **Task 1: Update `GEMINI.md` with the new tasks**
    *   **Status:** Completed
*   **Task 2: Implement the Missing Server Endpoints**
    *   **Task 2.1:** Uncomment the routes for `/customer/login` and `/delivery/login` in `AwesomeServer/src/routes/auth.js`.
        *   **Status:** Completed
    *   **Task 2.2:** Create the `loginCustomer` and `loginDeliveryPartner` functions in `AwesomeServer/src/controllers/auth/auth.js`.
        *   **Status:** Completed
*   **Task 3: Implement Refresh Token Logic on the Client**
    *   **Task 3.1:** Modify the `login` function in `LoginScreen.tsx` to securely store the `refreshToken`.
        *   **Status:** Completed
    *   **Task 3.2:** Enhance the response interceptor in `axiosInstance.ts` to handle token refreshing.
        *   **Status:** Completed
*   **Task 4: Standardize API Responses**
    *   **Task 4.1:** Ensure all login endpoints return a consistent JSON response.
        *   **Status:** Completed

## Future Task: Integrate with Client Project API

**Objective:** Update the application's API requests to align with the client project located at `E:\Nani_Srinivas\RN\173033_GA\GA\client`.

**Instructions:**
1.  Analyze the `client` project to identify the correct API endpoint URLs.
2.  Inspect the request/response structures used in the `client` project.
3.  Update the API service files (e.g., `src/services/apiService.ts`, `src/api/axiosInstance.ts`) in this project to use the new URLs and data structures.

```
```

## Attendance and Billing Feature Implementation

This feature will be implemented in three phases to build a complete and accurate system for managing daily subscription deliveries and generating monthly bills.

### Phase 1: Build the `AddAttendance` Screen UI

*   **Task 1.1: Fetch and Display Areas**
    *   **Description:** Modify the `AddAttendance` screen to fetch all available delivery areas from the server and display them in a dropdown menu.
    *   **Status:** Pending
*   **Task 1.2: Fetch and Display Customers by Area**
    *   **Description:** On area selection, call a new API endpoint to get a list of all subscribed customers in that area and display them. The list should include customer name, product details, and a checkbox.
    *   **Status:** Pending
*   **Task 1.3: Implement Exception Handling UI**
    *   **Description:** Add an "Edit" button to each customer row. This will trigger a modal allowing for quantity adjustments or marking a delivery as "Skipped".
    *   **Status:** Pending
*   **Task 1.4: Implement Submit Logic**
    *   **Description:** Add a "Submit Attendance" button that collects data for all checked/edited customers and prepares it for the backend.
    *   **Status:** Pending

### Phase 2: Create the Backend for Attendance

*   **Task 2.1: Create `AttendanceLog` Model**
    *   **Description:** Create a new Mongoose model (`AttendanceLog`) to store the permanent record of daily deliveries, including `customerId`, `date`, `status`, and `deliveredProducts`.
    *   **Status:** Pending
*   **Task 2.2: Create API Endpoint to Fetch Customers by Area**
    *   **Description:** Implement the `GET /api/customers/subscribed?areaId=...` endpoint to supply the `AddAttendance` screen with the necessary customer data.
    *   **Status:** Pending
*   **Task 2.3: Create API Endpoint to Submit Attendance**
    *   **Description:** Implement the `POST /api/attendance` endpoint. This will receive the daily attendance data from the client and create the corresponding `AttendanceLog` records in the database.
    *   **Status:** Pending

### Phase 3: Connect Attendance to Billing

*   **Task 3.1: Create/Update Invoice Generation Endpoint**
    *   **Description:** Build or modify the primary invoice generation endpoint (e.g., `GET /api/invoice`).
    *   **Status:** Pending
*   **Task 3.2: Change Invoice Data Source**
    *   **Description:** Update the invoice endpoint to use the new `AttendanceLog` collection as its primary source of truth for billable items, instead of the `Order` collection.
    *   **Status:** Pending
*   **Task 3.3: Implement Invoice Calculation Logic**
    *   **Description:** The endpoint will query the `AttendanceLog`, aggregate all delivered items within a date range for a customer, calculate the grand total, and return the final invoice data.
    *   **Status:** Pending

<!-- ## Production Readiness Suggestions

This section outlines suggestions to enhance the application's production readiness across security, error handling, API robustness, and code quality. Each suggestion will be addressed as a separate task.

### 1. Security Enhancements

#### Task 1.1: Secure Sensitive Data Storage
**Objective:** Ensure all sensitive user data is stored securely on the device.
**Details:** Verify that any sensitive user data (e.g., PII, session IDs, user preferences) that needs to persist on the device is stored using `secureStorageService` or a similar secure mechanism (e.g., `react-native-keychain`). Avoid storing sensitive data in plain `AsyncStorage` or local state that isn't cleared on logout.
**Status:** Completed

#### Task 1.2: Centralize API Key Management
**Objective:** Ensure all API keys and sensitive configurations are managed via environment variables.
**Details:** If there are any other API keys (e.g., for third-party services like analytics, maps, push notifications) that are currently hardcoded or exposed in the client-side bundle, move them to `.env` and access them via `process.env.YOUR_KEY_NAME`. For truly secret keys that should never reach the client, they must be managed on a backend server.
**Files to Review:** All files in `src`, especially `src/api`, `src/services`, and any component/screen files that might directly use third-party SDKs.
**Status:** Completed

#### Task 1.3: Implement Client-Side Input Validation
**Objective:** Provide immediate feedback to users and reduce invalid network requests.
**Details:** Implement robust client-side input validation for all user inputs (e.g., email format, password strength, required fields). This should be done in forms (e.g., login, registration, any data entry screens). Remember that client-side validation is for UX; server-side validation is mandatory for security.
**Status:** Completed

#### Task 1.4: Dependency Security Audit
**Objective:** Regularly check for and mitigate known vulnerabilities in project dependencies.
**Details:** Integrate a process to regularly audit dependencies for known vulnerabilities using tools like `npm audit` or Snyk. Keep dependencies updated to their latest stable versions. This is a process suggestion rather than a code change.
**Status:** Completed

### 2. Error Handling Enhancements

#### Task 2.1: Integrate Centralized Error Reporting
**Objective:** Automatically capture and report unhandled exceptions and API errors in production.
**Details:** Integrate a crash reporting service (e.g., Sentry, Bugsnag). The `.env` file already has `SENTRY_DSN`, indicating Sentry is a candidate. Configure the service to capture unhandled JavaScript errors and potentially network request failures.
**Files to Review:** `App.tsx`, `index.js`, `src/api/axiosInstance.ts`.
**Status:** Completed

#### Task 2.2: Improve Global API Error Handling
**Objective:** Provide user-friendly feedback for common API errors and handle network connectivity issues gracefully.
**Details:** In `axiosInstance.interceptors.response.use`, expand error handling beyond just 401. For other common HTTP error codes (e.g., 400, 404, 500), provide generic, user-friendly error messages (e.g., using `Alert.alert` or a toast notification library) instead of exposing raw API error details. Add a check for network connectivity before making API calls or handle network-related errors gracefully (e.g., `ERR_NETWORK` from Axios).
**Files to Review:** `src/api/axiosInstance.ts`.
**Status:** Completed

#### Task 2.3: Implement Specific API Error Handling in Components
**Objective:** Handle unique error scenarios for individual API calls.
**Details:** While global error handling is in place, individual API calls might need specific error handling. Consider wrapping API calls in `try...catch` blocks in the components/screens that use `apiService` to handle specific error scenarios (e.g., displaying a specific message for a failed login attempt, or showing a different UI state).
**Files to Review:** All screens and components that make API calls via `apiService`.
**Status:** Completed

#### Task 2.4: Design and Implement UI Error States
**Objective:** Provide clear visual feedback to users when errors occur.
**Details:** Design and implement clear UI feedback for errors. This includes:
*   Displaying error messages near the relevant input fields for validation errors.
*   Showing a toast or alert for general API errors.
*   Providing a retry mechanism for failed network requests.
**Files to Review:** All screens and components with user interaction or data display.
**Status:** Completed

### 3. API Calling Robustness Enhancements

#### Task 3.1: Implement API Call Retry Mechanism
**Objective:** Improve resilience against transient network failures.
**Details:** For transient network issues, consider implementing an automatic retry mechanism with exponential backoff for API calls. Libraries like `axios-retry` can be integrated with `axiosInstance`.
**Files to Review:** `src/api/axiosInstance.ts`.
**Status:** Completed

#### Task 3.2: Implement Request Cancellation
**Objective:** Prevent memory leaks and unnecessary state updates for unmounted components.
**Details:** Implement request cancellation using `AbortController` or `axios` cancellation tokens. This is crucial to prevent memory leaks and unnecessary state updates when components unmount while an API request is still in flight. This typically involves passing a cancellation token to API calls and canceling it in component cleanup effects. An example implementation can be found in `src/screens/ExampleApiCallScreen.tsx`.
**Files to Review:** `src/api/axiosInstance.ts`, and all components/screens making API calls.
**Status:** Completed

#### Task 3.3: Implement Loading States for API Calls
**Objective:** Provide clear feedback to the user during asynchronous operations.
**Details:** Implement clear loading indicators (e.g., activity indicators, skeleton loaders) for all asynchronous operations (API calls, data processing) to provide feedback to the user and prevent multiple submissions. This has been demonstrated in `LoginScreen.tsx` and `ExampleApiCallScreen.tsx`.
**Files to Review:** All screens and components that make API calls.
**Status:** Completed

### 4. Code Quality & Maintainability Enhancements

#### Task 4.1: Enforce Strong Typing
**Objective:** Leverage TypeScript effectively to prevent common errors and improve code clarity.
**Details:** Ensure all functions, component props, and state variables are strongly typed. Avoid `any` where possible. Define interfaces or types for API request/response payloads, especially for data coming from the backend. An example of defining a type for API response data has been added to `src/screens/ExampleApiCallScreen.tsx`.
**Files to Review:** All `.ts`/`.tsx` files.
**Status:** Completed

#### Task 4.2: Enhance Code Documentation
**Objective:** Improve code readability and maintainability.
**Details:** Add JSDoc comments for complex functions, components, and API service methods to explain their purpose, parameters, and return values. Focus on areas that are not immediately obvious from the code itself. A JSDoc comment has been added to the `get` method in `src/services/apiService.ts` as an example.
**Files to Review:** All `.ts`/`.tsx` files, especially `src/services`, `src/api`, `src/utils`, and complex components/screens.
**Status:** Completed

#### Task 4.3: Optimize Performance (Initial Review)
**Objective:** Identify and address obvious performance bottlenecks.
**Details:**
*   **Image Optimization:** Review usage of images. Suggest optimizing images (e.g., compress, use appropriate formats like WebP if supported) to reduce bundle size and improve loading times.
*   **List Optimization:** For long lists, ensure `FlatList` or `SectionList` are used with `getItemLayout` and `keyExtractor` for optimal performance.
*   **Memoization:** Consider using `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders of components and expensive computations, especially in frequently updated or complex components.
**Files to Review:** `src/assets`, `src/screens` (especially those with lists), and complex components.
**Status:** Completed

### 5. User Experience (UX) Enhancements

#### Task 5.1: Implement Consistent Loading Indicators
**Objective:** Provide clear and consistent visual feedback during data loading.
**Details:** Ensure all asynchronous operations (API calls, data processing) have consistent and clear loading indicators (e.g., a global spinner, skeleton loaders for specific content areas). This has been demonstrated in `LoginScreen.tsx` and `ExampleApiCallScreen.tsx`.
**Files to Review:** All screens and components that fetch data.
**Status:** Completed

#### Task 5.2: Design and Implement Empty States
**Objective:** Improve user experience when there is no data to display.
**Details:** Design and implement user-friendly empty states for lists or screens that might not have data (e.g., "No items found," "Your cart is empty," "No notifications").
**Files to Review:** Screens and components that display dynamic lists or content.
**Status:** Completed

#### Task 5.3: Basic Offline Experience
**Objective:** Provide a more robust experience when the network is unavailable.
**Details:** Consider implementing basic offline capabilities, such as caching data (e.g., using `AsyncStorage` for non-sensitive data, or a dedicated offline-first library) or providing informative messages when the network is unavailable.
**Files to Review:** `src/api/axiosInstance.ts`, `src/services/apiService.ts`, and relevant screens.
**Status:** Completed


This section outlines all remaining development tasks, categorized for clarity. All tasks are currently
  Pending.

  #### 1. Core Functionality & API Integration


   * Task 1.1: Integrate with Client Project API
   * Task 1.2: Implement `onAddDeliveryBoy` and `onAddArea` with API
   * Task 1.3: Implement `ForgotPasswordScreen` API Integration
   * Task 2.1: Implement Client-Side Input Validation (Application-Wide)
   * Task 2.2: Design and Implement Empty States (Application-Wide)
   * Task 2.3: Implement Basic Network Status Feedback
   * Task 2.4: UI/UX Development for Screens (Layouts, Static Elements)
   * Task 3.1: Enforce Strong Typing (Application-Wide)
   * Task 3.2: Enhance Code Documentation (Application-Wide)
   * Task 3.3: Optimize Performance (Initial Review & Implementation)
   * Task 3.4: Dependency Security Audit (Ongoing Process)
   * Task 4.1: Implement Specific API Error Handling in Components (Application-Wide)
   * Task 4.2: Implement Request Cancellation (Application-Wide)
   * Task 4.3: Implement Loading States for API Calls (Application-Wide)
   * Task 4.4: Basic Offline Experience (Conceptual/Initial)



Of course. Based on the files in your project, here is the step-by-step flow of how the login process works,
   from the button click to updating the state.

  ### Authentication Flow Breakdown

This document outlines the step-by-step process of user authentication, from the initial UI interaction on the client to the final database operation on the server.

#### 1. Client: User Interaction

*   **File:** `src/screens/Auth/LoginScreen.tsx`
*   **Action:** The user selects their role ("Customer" or "Delivery Partner") and enters their credentials (phone number for Customer, email/password for Delivery Partner).
*   **Trigger:** Pressing the "Login" button calls the `handleLogin` async function.

#### 2. Client: API Request

*   **File:** `src/screens/Auth/LoginScreen.tsx`
*   **Action:** Inside `handleLogin`, client-side validation is performed. If successful, the `loading` state is set to `true`.
*   **Trigger:** The `apiService.post` method is called, sending a request to either the `/customer/login` or `/delivery/login` endpoint with the user's credentials.

#### 3. Client: API Service Layer

*   **File:** `src/services/apiService.ts` -> `src/api/axiosInstance.ts`
*   **Action:** `apiService` acts as a wrapper, calling `axiosInstance.post`. The `axiosInstance` then constructs and sends the HTTP POST request to the server's base URL (defined by `API_URL` in your `.env` file).

#### 4. Server: Routing

*   **File:** `server/src/routes/auth.js`
*   **Action:** The Fastify server receives the request and matches the URL to a defined route.
*   **Trigger:** The corresponding controller function (`loginCustomer` or `loginDeliveryPartner`) is executed.

#### 5. Server: Controller & Database Interaction

*   **File:** `server/src/controllers/auth/auth.js`
*   **Action (Customer):
    1.  The `loginCustomer` function searches the `customers` collection in MongoDB using `Customer.findOne({ phone })`.
    2.  If the customer doesn't exist, a new one is created and saved to the database.
    3.  A JWT access token and refresh token are generated via `generateTokens`.
*   **Action (Delivery Partner):
    1.  The `loginDeliveryPartner` function finds the user by email in the `deliverypartners` collection.
    2.  It securely compares the provided password with the stored hash using `deliveryPartner.comparePassword(password)`.
    3.  If the credentials are valid, JWT tokens are generated.

#### 6. Server: Response

*   **File:** `server/src/models/user.js` -> `server/src/controllers/auth/auth.js`
*   **Action:**
    1.  Before sending the response, the `toJSON` transform method defined in `server/src/models/user.js` is automatically called by Mongoose. This method creates a "safe" user object by removing the `password` hash and `__v` field.
    2.  The controller sends a JSON response back to the client containing the `accessToken`, `refreshToken`, and the sanitized `customer` or `deliveryPartner` object.

#### 7. Client: Handling the Response

*   **File:** `src/screens/Auth/LoginScreen.tsx`
*   **Action:** The `await` for the `apiService.post` call resolves, and the `try` block continues.
*   **Trigger:** The `accessToken` and user object (`customer` or `deliveryPartner`) are destructured from the response data.

#### 8. Client: State Management & Secure Storage

*   **File:** `src/store/userStore.ts`
*   **Action:**
    1.  `setAuthToken(accessToken)` is called. This function saves the token to the device's secure storage (Keychain/Keystore) via `secureStorageService.saveAuthToken` and updates the `authToken` in the global Zustand state.
    2.  `setUser(user)` is called, which updates the `user` object in the global state (held in memory).

#### 9. Client: Navigation

*   **File:** `src/navigation/AppNavigator.tsx`
*   **Action:** The `AppNavigator` component, which listens to changes in `useUserStore`, automatically re-renders because the `authToken` is no longer null.
*   **Result:** The conditional logic `{authToken ? <MainStack /> : <AuthStack />}` now renders the `<MainStack />`, navigating the user to the main, authenticated part of the application.

This entire process ensures a secure and robust login experience, with clear separation of concerns between the client and server. -->



Attendance and Billing explaination:

Ah, that is a fantastic clue. The "Attendance" screen being the core of bill creation is a key piece of the puzzle. Based on
  that, I can infer the intended business logic.

  Here is my educated guess on how the "Attendance" screen is designed to work and how it's central to creating accurate bills:

  The Role of the "Attendance" Screen

  I believe the "Attendance" screen is not for employees, but for tracking daily customer deliveries, especially for customers
  who have a subscription.

  Many grocery delivery models are based on subscriptions (e.g., "deliver 1L of milk and a loaf of bread to me every morning").
  The "Attendance" screen would be the tool used by the delivery manager to confirm these daily subscription deliveries.

  Here's how I envision the workflow:

   1. Daily Delivery Roster: At the start of each day, the AddAttendance screen would load a list of all customers who are
      subscribed to receive products on that day.

   2. Marking "Attendance": A delivery person or manager would use this screen as their daily checklist. As they complete each
      delivery, they would "mark attendance" for that customer. This action would essentially mean: "Yes, John Doe received his
      subscribed items today."

   3. Handling Exceptions: This screen would also be crucial for handling exceptions, which is vital for accurate billing:
       * Customer on Vacation: If a customer has requested to pause deliveries, they would be marked as "Absent" or "Skipped" for
         the day, ensuring they are not billed.
       * Quantity Changes: If a customer requested a change for just one day (e.g., "only 1L of milk today instead of 2"), the
         manager could adjust the quantity on this screen before marking the delivery as complete.

  How This Creates the Bill

  This "attendance" process creates a daily, confirmed log of exactly what was delivered to each customer.

  This log becomes the single source of truth for generating bills.

  When you want to create an invoice for a customer for the month of February, the process is no longer a guess; it's a simple
  calculation:
   1. The system queries the attendance logs for that customer from Feb 1st to Feb 28th.
   2. It finds, for example, 25 days where delivery was marked as "Delivered".
   3. It then aggregates all the items and quantities from those 25 daily logs.
   4. It adds any applicable delivery fees.
   5. The final sum is the customer's accurate bill for the month.

  In summary, the "Attendance" screen is the missing link. It's the data-entry part of the process that creates the raw, daily
  records. The "Bill Generation" part that we discussed earlier is the reporting part that simply reads and summarizes those
  records. Without the attendance logs, there is no accurate data to summarize.

  This makes the system much more robust and accurate. Does this interpretation match your intended design?

> excelent, its correct upto the point, with minimal changes like we dont add the for indivisual customer, we will show the
  customers list according to the area selected from the dropdown(we need to populate the areas in the dropdown), the list will
  have customer details like name and total products count, along with requiredproducts along side a check box to mark the
  attendance for that customer, same for all the customers in the list which will reduce the repeated task of clicking of each
  customer and going to specific attendance screen and mark attendance for individuals, we will have all at once, this is my
  though if you have anything that have better solution i will be happy to implement, so try to understand the attendance screen
  and over all scenario of attendance and bills suggest me the steps.

Excellent, that clarification is incredibly helpful. Your vision for a bulk attendance screen based on area is much more
  efficient and a great improvement.

  I've fully understood the scenario now, from attendance to billing. You are right, we don't need to go into each customer
  individually. We can handle it all on one screen.

  I have one small suggestion to make your idea even more robust, and then I will lay out the complete implementation plan.

  Suggestion: Handling Exceptions

  Your plan is perfect for the "happy path" where every customer receives their standard order. But what happens if a customer
  is on vacation, or only wants one of their two subscribed products for the day?

  My suggestion is to add a small "Edit" button next to the checkbox for each customer.
   * The checkbox can be used for the standard case: "Yes, this customer received everything."
   * If there's an exception, the manager can tap "Edit" to open a small pop-up for just that customer. In that pop-up, they could
     adjust quantities or mark the delivery as "Skipped".

  This gives you the speed of the bulk checklist while still providing the flexibility to handle daily exceptions, which is
  critical for accurate billing.

  The Complete Plan: From Attendance to Bills

  Here are the steps to build this entire feature, incorporating your idea and my suggestion.

  Phase 1: Build the `AddAttendance` Screen

   1. Fetch Areas: Modify the AddAttendance screen to first fetch all available delivery areas from the server and display them in
      a dropdown menu.
   2. Fetch Customers by Area: When an area is selected, call a new API endpoint to get a list of all subscribed customers in that
      area.
   3. Display Customer List: Render the list as you described: Customer Name, product details, and a checkbox for each. I'll also
      add the "Edit" button for exceptions.
   4. Implement "Submit": Add a "Submit Attendance" button that collects the data for all checked (and edited) customers and sends
      it to a new backend endpoint.

  Phase 2: Create the Backend Logic

   1. New `AttendanceLog` Model: Create a new data model on the server called AttendanceLog. This will be our permanent record,
      storing the customerId, date, and a list of products that were confirmed as delivered.
   2. New API Endpoints:
       * Create an endpoint to fetch customers by area for the dropdown in Phase 1.
       * Create the endpoint that the "Submit Attendance" button will call. This endpoint will receive the daily delivery data and
         save it as new entries in our AttendanceLog collection.

  Phase 3: Connect Attendance to Billing

   1. Update the Invoice Logic: Once we are successfully logging daily attendance, we will create the server-side function to
      generate an invoice.
   2. Query Attendance Logs: This function will query the AttendanceLog collection (instead of the Order collection). It will find
      all delivered items for a specific customer within a date range.
   3. Calculate and Return Bill: It will then sum up all the items, add delivery fees, and return the final, accurate bill to the
      InvoiceScreen, just as we discussed before.

  This three-phase plan will create a complete, robust, and accurate system for managing subscription deliveries and billing.