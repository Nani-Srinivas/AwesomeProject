## Add Extra Products Feature Implementation

This document outlines the step-by-step plan for implementing the "Add Extra Products to a Delivery" feature, utilizing a bottom sheet with a design inspired by the existing Order Screen.

### Phase 1: Frontend UI Implementation (AddExtraProductModal)

*   **Task 1.1: Create `AddExtraProductModal.tsx` Component**
    *   **Description:** Create a new React Native component that will serve as the bottom sheet.
    *   **Details:**
        *   Use a suitable bottom sheet library (e.g., `react-native-modalize` or `react-native-bottom-sheet`).
        *   The modal should be opened when the "Add" button is pressed on a `CustomerAttendanceItem`.
    *   **Status:** Completed

*   **Task 1.2: Implement Search Bar**
    *   **Description:** Add a search input field at the top of the bottom sheet to allow users to search for products by name.
    *   **Details:**
        *   Include a clear button for the search input.
        *   Implement basic client-side filtering for now; backend search will be integrated later.
    *   **Status:** Completed

*   **Task 1.3: Implement Category and Subcategory Filters (Order Screen Design)**
    *   **Description:** Replicate the category and subcategory filtering UI from `OrderScreen.tsx`.
    *   **Details:**
        *   **Left Panel:** Use a `FlatList` to display product categories. Reuse or adapt the `CategoryCard` component.
        *   **Right Panel:** Use a horizontal `ScrollView` for subcategory chips. Reuse or adapt the `SubcategoryChip` component.
    *   **Status:** Completed

*   **Task 1.4: Display Product List with Quantity Selectors**
    *   **Description:** Implement a `FlatList` to display products, similar to `OrderScreen.tsx`.
    *   **Details:**
        *   Create a new `ProductSelectionCard` component (or adapt `ProductCard`) that includes:
            *   Product Name, Image, Price.
            *   **Quantity Selector:** Plus/minus buttons and a text input for adjusting the quantity.
            *   **"Add" Button:** To temporarily add the selected product and quantity to a local state within the modal.
        *   Implement local state management within the modal to track selected products and their quantities.
    *   **Status:** Completed

*   **Task 1.5: Implement "Selected Products" Summary**
    *   **Description:** Add a persistent view at the bottom of the bottom sheet to show a summary of currently selected extra products (e.g., count, total items).
    *   **Details:** This provides immediate feedback to the user.
    *   **Status:** Completed

*   **Task 1.6: Implement Action Buttons**
    *   **Description:** Add "Cancel" and "Add Selected Products" buttons at the bottom of the bottom sheet.
    *   **Details:**
        *   "Cancel" should close the modal without saving changes.
        *   "Add Selected Products" should trigger a callback to the parent `AddAttendance` component with the selected extra products.
    *   **Status:** Completed

### Phase 2: Backend API Implementation

*   **Task 2.1: Create `GET /api/products/all` Endpoint**
    *   **Description:** Implement a new API endpoint on the Fastify server to fetch all available products.
    *   **Details:**
        *   The endpoint should return a list of products, including their `_id`, `name`, `price`, `category`, `subcategory`, and any other relevant display information (e.g., `image`).
        *   Consider adding optional query parameters for filtering by category/subcategory or searching by name for future enhancements.
    *   **Status:** Completed

### Phase 3: Frontend-Backend Integration

*   **Task 3.1: Fetch Products in `AddExtraProductModal`**
    *   **Description:** Modify `AddExtraProductModal.tsx` to call the `GET /api/products/all` endpoint when the modal is opened.
    *   **Details:**
        *   Implement loading states while fetching products.
        *   Handle potential API errors.
    *   **Status:** Completed

*   **Task 3.2: Integrate Selected Extra Products into `AddAttendance` Submission**
    *   **Description:** Modify the `handleSaveAttendance` function in `AddAttendance.tsx` to correctly process the extra products received from `AddExtraProductModal`.
    *   **Details:**
        *   Ensure the extra products are added to the `attendance` state for the specific customer.
        *   The `handleSubmit` function should then include these extra products when sending the payload to the `POST /attendance` endpoint.
    *   **Status:** Completed

*   **Task 3.3: Update `POST /attendance` Endpoint to Handle Extra Products**
    *   **Description:** Review and ensure the `submitAttendance` controller in `AwesomeServer/src/controllers/Attendance/attendanceController.js` correctly processes and stores extra products.
    *   **Details:**
        *   The `products` array within `customerAttendance` should be able to accommodate both subscribed and extra products.
        *   Ensure validation logic (e.g., `StoreProduct.findById`) works for all products.
    *   **Status:** Completed