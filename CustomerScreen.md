# Customer Screen Tasks

## Add Bill Functionality to Customer List

*   **Task 1: Update `CustomerCard` in `CustomerListScreen.tsx`**
    *   Add a "View Bill" icon button (`file-text`) to the `CustomerCard` component, next to the existing "Edit" and "Delete" icons.
*   **Task 2: Implement Navigation in `CustomerListScreen.tsx`**
    *   Create a `handleViewBillPress` function within the `CustomerListScreen` component.
    *   This function will take a `customer` object as an argument and navigate to the `StatementPeriodSelection` screen, passing the `customer._id` as a parameter.
*   **Task 3: Connect the `onPress` Event**
    *   Pass the `handleViewBillPress` function as a prop to the `CustomerCard`.
    *   Attach this function to the `onPress` event of the new "View Bill" icon button.
