## Task 5: Enhance Customer Forms with Additional Fields

*   **Task 5.1: Update "Add/Edit" Modals with New UI Fields (Basic)**
    *   **Description:** Add input fields for `address` (as a single field for simplicity), `deliveryCost`, `advanceAmount`, and a toggle for `isSubscribed` to both `AddCustomerModal.tsx` and `EditCustomerModal.tsx`. Use a `ScrollView` to contain the form fields.
    *   **Status:** Completed
*   **Task 5.2: Verify Handler Logic for New Fields**
    *   **Description:** Ensure the `handleSaveCustomer` and `handleAddNewCustomer` functions in `CustomerListScreen.tsx` correctly pass all the new fields from the modals to the API.
    *   **Status:** Completed

## Task 6: Implement "Required Products" Selection

*   **Task 6.1: Create Product Selector Component**
    *   **Description:** Create `ProductSelector.tsx` to fetch and display store products. Also, ensure the backend route `GET /product/store` is registered.
    *   **Status:** Completed
*   **Task 6.2: Integrate Product Selector into Customer Modals**
    *   **Description:** In both `AddCustomerModal.tsx` and `EditCustomerModal.tsx`, add a button to open the `ProductSelector` and state to manage selected products.
    *   **Status:** Completed
*   **Task 6.3: Display Selected Products in Modals**
    *   **Description:** Display the list of selected products with quantity adjustment and removal options within the modals.
    *   **Status:** Completed
*   **Task 6.4: Update Save Logic with Required Products**
    *   **Description:** Update the `onSave` payload in the modals to include the `requiredProduct` array.
    *   **Status:** Completed