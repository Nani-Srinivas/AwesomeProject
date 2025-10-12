### 1. Get Store Categories

*   **Endpoint:** `GET http://localhost:3000/store/categories`
*   **Description:** Fetches all categories associated with the authenticated StoreManager's store.
*   **Input for Postman:**
    *   **Method:** `GET`
    *   **URL:** `http://localhost:3000/store/categories`
    *   **Headers:**
        *   `Authorization`: `Bearer <YOUR_STORE_MANAGER_ACCESS_TOKEN>`
    *   **Body:** None (GET requests typically do not have a body).

---

### 2. Get Store Products

*   **Endpoint:** `GET http://localhost:3000/store/products`
*   **Description:** Fetches all products associated with the authenticated StoreManager's store.
*   **Input for Postman:**
    *   **Method:** `GET`
    *   **URL:** `http://localhost:3000/store/products` (You can add optional query parameters like `?storeCategoryId=<ID>&search=<TERM>`)
    *   **Headers:**
        *   `Authorization`: `Bearer <YOUR_STORE_MANAGER_ACCESS_TOKEN>`
    *   **Query Parameters (Optional - append to URL):**
        *   `storeCategoryId`: Filter products by a specific `StoreCategory` ID.
        *   `storeSubcategoryId`: Filter products by a specific `StoreSubcategory` ID.
        *   `search`: Search products by name (case-insensitive regex).
    *   **Body:** None (GET requests typically do not have a body).

---

### How to Obtain `<YOUR_STORE_MANAGER_ACCESS_TOKEN>`:

1.  **Login Request:**
    *   **Method:** `POST`
    *   **URL:** `http://localhost:3000/delivery/login` (or the appropriate login endpoint for a StoreManager)
    *   **Headers:** `Content-Type: application/json`
    *   **Body (raw JSON):**
        ```json
        {
          "email": "storemanager@example.com", // Replace with an actual StoreManager email
          "password": "your_password" // Replace with the StoreManager's password
        }
        ```
    *   **Action:** Send this request. From the successful response, copy the `accessToken` value.

---

**To test in Postman:**

1.  Perform the **Login Request** to get your `accessToken`.
2.  Use the obtained `accessToken` in the `Authorization: Bearer <token>` header for both the **Get Store Categories** and **Get Store Products** requests.
3.  Send the `GET` requests and observe the responses. This will help us determine if the server-side is responding as expected when directly hit.