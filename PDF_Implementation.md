# PDF Generation & Cloud Storage Implementation Plan

This document outlines the step-by-step plan to implement a robust PDF invoice generation and storage system using a cloud provider.

---

### **Phase 1: Backend - Create the PDF Generation & Cloud Service**

**Objective:** The server will generate the PDF, upload it to cloud storage, and save a reference to it in the database.

*   **Task 1.1: Set Up Cloud Storage & Server Environment**
    *   **Description:** Choose a cloud storage provider (e.g., AWS S3), create a storage "bucket," and add the necessary credentials (`ACCESS_KEY`, `SECRET_SECRET`, `BUCKET_NAME`) to the `AwesomeServer/.env` file.
    *   **Status:** Completed

*   **Task 1.2: Create New `Invoice` Model**
    *   **Description:** Create a new Mongoose model file (`Invoice.js`) in the `AwesomeServer/src/models/` directory. This model will store metadata for each generated invoice, including `customerId`, `period`, `invoiceUrl`, and `createdAt`.
    *   **Status:** Completed

*   **Task 1.3: Install Backend Dependencies**
    *   **Description:** Install the necessary Node.js libraries for PDF generation and cloud communication by running `npm install cloudinary pdfkit streamifier` in the `AwesomeServer` directory.
    *   **Status:** Completed

*   **Task 1.4: Implement PDF & Cloud Services**
    *   **Description:** Create new service files within the server for handling PDF generation with `pdfkit` and managing file uploads to the cloud provider.
    *   **Status:** Completed

*   **Task 1.5: Create New API Endpoints**
    *   **Description:** Implement two new endpoints:
        1.  `POST /invoices/generate`: Orchestrates the full process (fetches data, generates PDF, uploads to cloud, saves URL to the `Invoice` model).
        2.  `GET /invoices/:customerId`: Fetches a list of all previously generated invoices for a specific customer.
    *   **Status:** Completed

---

### **Phase 2: Frontend - Implement the User Experience**

**Objective:** The user will be able to generate, view, and download their saved invoices from within the app.

*   **Task 2.1: Implement `handleDownload` Function**
    *   **Description:** In `StatementPeriodSelectionScreen.tsx`, modify the `handleDownload` function to call the new `POST /invoices/generate` endpoint. Implement loading and success/error feedback for the user.
    *   **Status:** Completed

*   **Task 2.2: Create `InvoiceHistoryScreen.tsx`**
    *   **Description:** Create a new screen component that calls the `GET /invoices/:customerId` endpoint to fetch and display a list of all saved invoices for the user.
    *   **Status:** Completed

*   **Task 2.3: Implement Invoice Viewing**
    *   **Description:** On the `InvoiceHistoryScreen`, make each list item tappable. Tapping an invoice will open its `invoiceUrl` in the device's default web browser or an in-app webview.
    *   **Status:** Completed

*   **Task 2.4: Add Navigation**
    *   **Description:** Add the new `InvoiceHistoryScreen` to a navigation stack. Add a button or link (e.g., on the `BillsScreen` or a user's profile screen) that allows users to navigate to their invoice history.
    *   **Status:** Completed

*   **Task 2.5: (Optional) Implement Local Download**
    *   **Description:** On the `InvoiceHistoryScreen`, add a "Download" button to each invoice. This will download the file from the cloud URL and save it to the device's public "Downloads" folder using a library like `react-native-fs`.
    *   **Status:** Completed
