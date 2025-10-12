# Store Manager Onboarding & Product/Category Management Implementation Plan

## Scenario Overview

When a store manager first logs into the application, they need to:
1.  Select categories they deal with from a list of admin-defined master categories.
2.  Based on selected categories, select subcategories and products to add to their store's catalog.
3.  Manage their store's products and categories, including adding new, local products/categories not defined by the admin.

## Key Principles & Industry Standards

*   **Master Data Management (MDM):** Differentiating between admin-defined global data and store-specific data.
*   **Multi-Tenancy:** Ensuring data isolation and management for individual stores.
*   **Catalog Inheritance/Linking:** Allowing stores to link to master items while enabling store-specific overrides.
*   **Clear Ownership:** Tracking who created/owns each data entity.
*   **Scalability & Flexibility:** Designing for future growth and customization.

## Proposed Data Model Enhancements

### Existing Models (Admin-defined):

*   **`MasterProduct`**: (AwesomeServer/src/models/Product/MasterProduct.js)
    *   `name`, `description`, `basePrice`, `category` (ref `Category`), `subcategory` (ref `Subcategory`), `images`, `createdBy`, `createdByModel`.
*   **`Category`**: (AwesomeServer/src/models/Product/Category.js) - Renamed to `MasterCategory` conceptually.
    *   `name`, `description`, `imageUrl`, `createdBy`, `createdByModel`.
*   **`Subcategory`**: (AwesomeServer/src/models/Product/Subcategory.js) - Renamed to `MasterSubcategory` conceptually.
    *   `name`, `categoryId` (ref `Category`), `createdBy`, `createdByModel`.

### New/Enhanced Models (Store-specific):

1.  **`StoreCategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Category', default: null }` (Links to a master category, can be null for store-created categories)
    *   `name`: `{ type: String, required: true }` (Store-specific name, or inherited from master)
    *   `description`: `String`
    *   `imageUrl`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }` (Store can enable/disable categories)
    *   `timestamps: true`

2.  **`StoreSubcategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }` (Links to a `StoreCategory`)
    *   `masterSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Subcategory', default: null }` (Links to a master subcategory, can be null for store-created subcategories)
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }`
    *   `timestamps: true`

3.  **`StoreProduct` Model:** (AwesomeServer/src/models/Product/StoreProduct.js - Ensure it has these fields)
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterProductId`: `{ type: Schema.Types.ObjectId, ref: 'MasterProduct', default: null }`
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `price`: `{ type: Number, min: 0, required: true }`
    *   `stock`: `{ type: Number, min: 0, default: 0 }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }`
    *   `storeSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreSubcategory', default: null }`
    *   `images`: `[String]`
    *   `isAvailable`: `{ type: Boolean, default: true }`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `timestamps: true`

## Proposed API Endpoints & Workflow

### A. Initial Store Setup (First-Time Store Manager Login)

1.  **`GET /store/onboarding/master-categories`**
    *   **Purpose:** Fetch all `MasterCategory` items.
    *   **Response:** `[{ _id, name, imageUrl, ... }]`

2.  **`GET /store/onboarding/master-products-by-categories?categoryIds=[id1,id2]`**
    *   **Purpose:** Fetch `MasterProduct`s and their associated `MasterSubcategory`s for selected categories.
    *   **Request:** Array of `MasterCategory` IDs.
    *   **Response:** `[{ category: { _id, name }, subcategories: [{ _id, name }], products: [{ _id, name, basePrice, ... }] }]`

3.  **`POST /store/onboarding/import-catalog`**
    *   **Purpose:** Create initial `StoreCategory`, `StoreSubcategory`, and `StoreProduct` entries based on selections.
    *   **Request Body:**
        ```json
        {
          "selectedMasterCategoryIds": ["id1", "id2"],
          "selectedMasterProductIds": ["prodId1", "prodId2"]
        }
        ```

### B. Ongoing Store Management APIs

1.  **`GET /store/categories`**
    *   **Purpose:** List all `StoreCategory` items for the current store.

2.  **`POST /store/categories`**
    *   **Purpose:** Create a new `StoreCategory` (either linked to `MasterCategory` or new).

3.  **`PUT /store/categories/:id`**
    *   **Purpose:** Update an existing `StoreCategory`.

4.  **`GET /store/products`**
    *   **Purpose:** List all `StoreProduct` items for the current store, with filtering.

5.  **`POST /store/products`**
    *   **Purpose:** Add a new `StoreProduct` (linked to `MasterProduct` or new local product).

6.  **`PUT /store/products/:id`**
    *   **Purpose:** Update an existing `StoreProduct` (price, stock, availability).

7.  **`DELETE /store/products/:id`**
    *   **Purpose:** Remove a `StoreProduct`.

### C. Admin APIs (for Master Data Management)

1.  **`GET /admin/master-categories`**, **`POST /admin/master-categories`**, **`PUT /admin/master-categories/:id`**, **`DELETE /admin/master-categories/:id`**
2.  **`GET /admin/master-subcategories`**, **`POST /admin/master-subcategories`**, **`PUT /admin/master-subcategories/:id`**, **`DELETE /admin/master-subcategories/:id`**
3.  **`GET /admin/master-products`**, **`POST /admin/master-products`**, **`PUT /admin/master-products/:id`**, **`DELETE /admin/master-products/:id`**

## UI/UX Flow Suggestions

*   **First-Time Login Onboarding Wizard:** A multi-step process for store managers to select their initial catalog.
*   **Product/Category Management Dashboard:** Dedicated screens for store managers to manage their store's catalog.

## Security & Authorization

*   **Role-Based Access Control (RBAC):** Use `verifyToken` middleware.
*   **Ownership Checks:** Backend must verify `storeId` for all store-specific operations.

## Implementation Tasks

### Server-Side (AwesomeServer)

1.  **Task 1: Create `StoreCategory` Model**
    *   **Status:** Completed
2.  **Task 2: Create `StoreSubcategory` Model**
    *   **Status:** Completed
3.  **Task 3: Update `StoreProduct` Model** (if needed, to match proposed fields)
    *   **Status:** Completed
4.  **Task 4: Implement Onboarding Controllers & Routes**
    *   **Task 4.1:** Add `GET /store/onboarding/master-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.2:** Add `GET /store/onboarding/master-products-by-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.3:** Add `POST /store/onboarding/import-catalog` route and controller.
    *   **Status:** Completed
5.  **Task 5: Implement Ongoing Store Management Controllers & Routes**
    *   **Task 5.1:** Add `GET /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.2:** Add `POST /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.3:** Add `PUT /store/categories/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.4:** Add `GET /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.5:** Add `POST /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.6:** Add `PUT /store/products/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.7:** Add `DELETE /store/products/:id` route and controller.
    *   **Status:** Completed
6.  **Task 6: Implement Admin Controllers & Routes** (for Master data management)
    *   **Status:** Pending (Will be implemented if explicitly requested, as the focus is on store manager onboarding)

### Client-Side (AwesomeProject)

*   **Task 7: Create `storeCatalogService`**
    *   **Status:** Completed
*   **Task 8: Implement Onboarding Screens**
    *   **Task 8.1:** Create `SelectCategoriesScreen`.
    *   **Status:** Completed
    *   **Task 8.2:** Create `SelectProductsScreen`.
    *   **Status:** Completed
*   **Task 9: Integrate Onboarding APIs**
    *   **Status:** Completed
# Store Manager Onboarding & Product/Category Management Implementation Plan

## Scenario Overview

When a store manager first logs into the application, they need to:
1.  Select categories they deal with from a list of admin-defined master categories.
2.  Based on selected categories, select subcategories and products to add to their store's catalog.
3.  Manage their store's products and categories, including adding new, local products/categories not defined by the admin.

## Key Principles & Industry Standards

*   **Master Data Management (MDM):** Differentiating between admin-defined global data and store-specific data.
*   **Multi-Tenancy:** Ensuring data isolation and management for individual stores.
*   **Catalog Inheritance/Linking:** Allowing stores to link to master items while enabling store-specific overrides.
*   **Clear Ownership:** Tracking who created/owns each data entity.
*   **Scalability & Flexibility:** Designing for future growth and customization.

## Proposed Data Model Enhancements

### Existing Models (Admin-defined):

*   **`MasterProduct`**: (AwesomeServer/src/models/Product/MasterProduct.js)
    *   `name`, `description`, `basePrice`, `category` (ref `Category`), `subcategory` (ref `Subcategory`), `images`, `createdBy`, `createdByModel`.
*   **`Category`**: (AwesomeServer/src/models/Product/Category.js) - Renamed to `MasterCategory` conceptually.
    *   `name`, `description`, `imageUrl`, `createdBy`, `createdByModel`.
*   **`Subcategory`**: (AwesomeServer/src/models/Product/Subcategory.js) - Renamed to `MasterSubcategory` conceptually.
    *   `name`, `categoryId` (ref `Category`), `createdBy`, `createdByModel`.

### New/Enhanced Models (Store-specific):

1.  **`StoreCategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Category', default: null }` (Links to a master category, can be null for store-created categories)
    *   `name`: `{ type: String, required: true }` (Store-specific name, or inherited from master)
    *   `description`: `String`
    *   `imageUrl`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }` (Store can enable/disable categories)
    *   `timestamps: true`

2.  **`StoreSubcategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }` (Links to a `StoreCategory`)
    *   `masterSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Subcategory', default: null }` (Links to a master subcategory, can be null for store-created subcategories)
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }`
    *   `timestamps: true`

3.  **`StoreProduct` Model:** (AwesomeServer/src/models/Product/StoreProduct.js - Ensure it has these fields)
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterProductId`: `{ type: Schema.Types.ObjectId, ref: 'MasterProduct', default: null }`
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `price`: `{ type: Number, min: 0, required: true }`
    *   `stock`: `{ type: Number, min: 0, default: 0 }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }`
    *   `storeSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreSubcategory', default: null }`
    *   `images`: `[String]`
    *   `isAvailable`: `{ type: Boolean, default: true }`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `timestamps: true`

## Proposed API Endpoints & Workflow

### A. Initial Store Setup (First-Time Store Manager Login)

1.  **`GET /store/onboarding/master-categories`**
    *   **Purpose:** Fetch all `MasterCategory` items.
    *   **Response:** `[{ _id, name, imageUrl, ... }]`

2.  **`GET /store/onboarding/master-products-by-categories?categoryIds=[id1,id2]`**
    *   **Purpose:** Fetch `MasterProduct`s and their associated `MasterSubcategory`s for selected categories.
    *   **Request:** Array of `MasterCategory` IDs.
    *   **Response:** `[{ category: { _id, name }, subcategories: [{ _id, name }], products: [{ _id, name, basePrice, ... }] }]`

3.  **`POST /store/onboarding/import-catalog`**
    *   **Purpose:** Create initial `StoreCategory`, `StoreSubcategory`, and `StoreProduct` entries based on selections.
    *   **Request Body:**
        ```json
        {
          "selectedMasterCategoryIds": ["id1", "id2"],
          "selectedMasterProductIds": ["prodId1", "prodId2"]
        }
        ```

### B. Ongoing Store Management APIs

1.  **`GET /store/categories`**
    *   **Purpose:** List all `StoreCategory` items for the current store.

2.  **`POST /store/categories`**
    *   **Purpose:** Create a new `StoreCategory` (either linked to `MasterCategory` or new).

3.  **`PUT /store/categories/:id`**
    *   **Purpose:** Update an existing `StoreCategory`.

4.  **`GET /store/products`**
    *   **Purpose:** List all `StoreProduct` items for the current store, with filtering.

5.  **`POST /store/products`**
    *   **Purpose:** Add a new `StoreProduct` (linked to `MasterProduct` or new local product).

6.  **`PUT /store/products/:id`**
    *   **Purpose:** Update an existing `StoreProduct` (price, stock, availability).

7.  **`DELETE /store/products/:id`**
    *   **Purpose:** Remove a `StoreProduct`.

### C. Admin APIs (for Master Data Management)

1.  **`GET /admin/master-categories`**, **`POST /admin/master-categories`**, **`PUT /admin/master-categories/:id`**, **`DELETE /admin/master-categories/:id`**
2.  **`GET /admin/master-subcategories`**, **`POST /admin/master-subcategories`**, **`PUT /admin/master-subcategories/:id`**, **`DELETE /admin/master-subcategories/:id`**
3.  **`GET /admin/master-products`**, **`POST /admin/master-products`**, **`PUT /admin/master-products/:id`**, **`DELETE /admin/master-products/:id`**

## UI/UX Flow Suggestions

*   **First-Time Login Onboarding Wizard:** A multi-step process for store managers to select their initial catalog.
*   **Product/Category Management Dashboard:** Dedicated screens for store managers to manage their store's catalog.

## Security & Authorization

*   **Role-Based Access Control (RBAC):** Use `verifyToken` middleware.
*   **Ownership Checks:** Backend must verify `storeId` for all store-specific operations.

## Implementation Tasks

### Server-Side (AwesomeServer)

1.  **Task 1: Create `StoreCategory` Model**
    *   **Status:** Completed
2.  **Task 2: Create `StoreSubcategory` Model**
    *   **Status:** Completed
3.  **Task 3: Update `StoreProduct` Model** (if needed, to match proposed fields)
    *   **Status:** Completed
4.  **Task 4: Implement Onboarding Controllers & Routes**
    *   **Task 4.1:** Add `GET /store/onboarding/master-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.2:** Add `GET /store/onboarding/master-products-by-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.3:** Add `POST /store/onboarding/import-catalog` route and controller.
    *   **Status:** Completed
5.  **Task 5: Implement Ongoing Store Management Controllers & Routes**
    *   **Task 5.1:** Add `GET /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.2:** Add `POST /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.3:** Add `PUT /store/categories/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.4:** Add `GET /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.5:** Add `POST /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.6:** Add `PUT /store/products/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.7:** Add `DELETE /store/products/:id` route and controller.
    *   **Status:** Completed
6.  **Task 6: Implement Admin Controllers & Routes** (for Master data management)
    *   **Status:** Pending (Will be implemented if explicitly requested, as the focus is on store manager onboarding)

### Client-Side (AwesomeProject)

*   **Task 7: Create `storeCatalogService`**
    *   **Status:** Completed
*   **Task 8: Implement Onboarding Screens**
    *   **Task 8.1:** Create `SelectCategoriesScreen`.
    *   **Status:** Completed
    *   **Task 8.2:** Create `SelectProductsScreen`.
    *   **Status:** Completed
*   **Task 9: Integrate Onboarding APIs**
    *   **Status:** Completed
*   **Task 10: Implement Store Catalog Management Screens**
    *   **Status:** Completed
# Store Manager Onboarding & Product/Category Management Implementation Plan

## Scenario Overview

When a store manager first logs into the application, they need to:
1.  Select categories they deal with from a list of admin-defined master categories.
2.  Based on selected categories, select subcategories and products to add to their store's catalog.
3.  Manage their store's products and categories, including adding new, local products/categories not defined by the admin.

## Key Principles & Industry Standards

*   **Master Data Management (MDM):** Differentiating between admin-defined global data and store-specific data.
*   **Multi-Tenancy:** Ensuring data isolation and management for individual stores.
*   **Catalog Inheritance/Linking:** Allowing stores to link to master items while enabling store-specific overrides.
*   **Clear Ownership:** Tracking who created/owns each data entity.
*   **Scalability & Flexibility:** Designing for future growth and customization.

## Proposed Data Model Enhancements

### Existing Models (Admin-defined):

*   **`MasterProduct`**: (AwesomeServer/src/models/Product/MasterProduct.js)
    *   `name`, `description`, `basePrice`, `category` (ref `Category`), `subcategory` (ref `Subcategory`), `images`, `createdBy`, `createdByModel`.
*   **`Category`**: (AwesomeServer/src/models/Product/Category.js) - Renamed to `MasterCategory` conceptually.
    *   `name`, `description`, `imageUrl`, `createdBy`, `createdByModel`.
*   **`Subcategory`**: (AwesomeServer/src/models/Product/Subcategory.js) - Renamed to `MasterSubcategory` conceptually.
    *   `name`, `categoryId` (ref `Category`), `createdBy`, `createdByModel`.

### New/Enhanced Models (Store-specific):

1.  **`StoreCategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Category', default: null }` (Links to a master category, can be null for store-created categories)
    *   `name`: `{ type: String, required: true }` (Store-specific name, or inherited from master)
    *   `description`: `String`
    *   `imageUrl`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }` (Store can enable/disable categories)
    *   `timestamps: true`

2.  **`StoreSubcategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }` (Links to a `StoreCategory`)
    *   `masterSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Subcategory', default: null }` (Links to a master subcategory, can be null for store-created subcategories)
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }`
    *   `timestamps: true`

3.  **`StoreProduct` Model:** (AwesomeServer/src/models/Product/StoreProduct.js - Ensure it has these fields)
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterProductId`: `{ type: Schema.Types.ObjectId, ref: 'MasterProduct', default: null }`
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `price`: `{ type: Number, min: 0, required: true }`
    *   `stock`: `{ type: Number, min: 0, default: 0 }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }`
    *   `storeSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreSubcategory', default: null }`
    *   `images`: `[String]`
    *   `isAvailable`: `{ type: Boolean, default: true }`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `timestamps: true`

## Proposed API Endpoints & Workflow

### A. Initial Store Setup (First-Time Store Manager Login)

1.  **`GET /store/onboarding/master-categories`**
    *   **Purpose:** Fetch all `MasterCategory` items.
    *   **Response:** `[{ _id, name, imageUrl, ... }]`

2.  **`GET /store/onboarding/master-products-by-categories?categoryIds=[id1,id2]`**
    *   **Purpose:** Fetch `MasterProduct`s and their associated `MasterSubcategory`s for selected categories.
    *   **Request:** Array of `MasterCategory` IDs.
    *   **Response:** `[{ category: { _id, name }, subcategories: [{ _id, name }], products: [{ _id, name, basePrice, ... }] }]`

3.  **`POST /store/onboarding/import-catalog`**
    *   **Purpose:** Create initial `StoreCategory`, `StoreSubcategory`, and `StoreProduct` entries based on selections.
    *   **Request Body:**
        ```json
        {
          "selectedMasterCategoryIds": ["id1", "id2"],
          "selectedMasterProductIds": ["prodId1", "prodId2"]
        }
        ```

### B. Ongoing Store Management APIs

1.  **`GET /store/categories`**
    *   **Purpose:** List all `StoreCategory` items for the current store.

2.  **`POST /store/categories`**
    *   **Purpose:** Create a new `StoreCategory` (either linked to `MasterCategory` or new).

3.  **`PUT /store/categories/:id`**
    *   **Purpose:** Update an existing `StoreCategory`.

4.  **`GET /store/products`**
    *   **Purpose:** List all `StoreProduct` items for the current store, with filtering.

5.  **`POST /store/products`**
    *   **Purpose:** Add a new `StoreProduct` (linked to `MasterProduct` or new local product).

6.  **`PUT /store/products/:id`**
    *   **Purpose:** Update an existing `StoreProduct` (price, stock, availability).

7.  **`DELETE /store/products/:id`**
    *   **Purpose:** Remove a `StoreProduct`.

### C. Admin APIs (for Master Data Management)

1.  **`GET /admin/master-categories`**, **`POST /admin/master-categories`**, **`PUT /admin/master-categories/:id`**, **`DELETE /admin/master-categories/:id`**
2.  **`GET /admin/master-subcategories`**, **`POST /admin/master-subcategories`**, **`PUT /admin/master-subcategories/:id`**, **`DELETE /admin/master-subcategories/:id`**
3.  **`GET /admin/master-products`**, **`POST /admin/master-products`**, **`PUT /admin/master-products/:id`**, **`DELETE /admin/master-products/:id`**

## UI/UX Flow Suggestions

*   **First-Time Login Onboarding Wizard:** A multi-step process for store managers to select their initial catalog.
*   **Product/Category Management Dashboard:** Dedicated screens for store managers to manage their store's catalog.

## Security & Authorization

*   **Role-Based Access Control (RBAC):** Use `verifyToken` middleware.
*   **Ownership Checks:** Backend must verify `storeId` for all store-specific operations.

## Implementation Tasks

### Server-Side (AwesomeServer)

1.  **Task 1: Create `StoreCategory` Model**
    *   **Status:** Completed
2.  **Task 2: Create `StoreSubcategory` Model**
    *   **Status:** Completed
3.  **Task 3: Update `StoreProduct` Model** (if needed, to match proposed fields)
    *   **Status:** Completed
4.  **Task 4: Implement Onboarding Controllers & Routes**
    *   **Task 4.1:** Add `GET /store/onboarding/master-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.2:** Add `GET /store/onboarding/master-products-by-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.3:** Add `POST /store/onboarding/import-catalog` route and controller.
    *   **Status:** Completed
5.  **Task 5: Implement Ongoing Store Management Controllers & Routes**
    *   **Task 5.1:** Add `GET /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.2:** Add `POST /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.3:** Add `PUT /store/categories/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.4:** Add `GET /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.5:** Add `POST /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.6:** Add `PUT /store/products/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.7:** Add `DELETE /store/products/:id` route and controller.
    *   **Status:** Completed
6.  **Task 6: Implement Admin Controllers & Routes** (for Master data management)
    *   **Status:** Pending (Will be implemented if explicitly requested, as the focus is on store manager onboarding)

### Client-Side (AwesomeProject)

*   **Task 7: Create `storeCatalogService`**
    *   **Status:** Completed
*   **Task 8: Implement Onboarding Screens**
    *   **Task 8.1:** Create `SelectCategoriesScreen`.
    *   **Status:** Completed
    *   **Task 8.2:** Create `SelectProductsScreen`.
    *   **Status:** Completed
*   **Task 9: Integrate Onboarding APIs**
    *   **Status:** Completed
*   **Task 10: Implement Store Catalog Management Screens**
    *   **Status:** Completed
# Store Manager Onboarding & Product/Category Management Implementation Plan

## Scenario Overview

When a store manager first logs into the application, they need to:
1.  Select categories they deal with from a list of admin-defined master categories.
2.  Based on selected categories, select subcategories and products to add to their store's catalog.
3.  Manage their store's products and categories, including adding new, local products/categories not defined by the admin.

## Key Principles & Industry Standards

*   **Master Data Management (MDM):** Differentiating between admin-defined global data and store-specific data.
*   **Multi-Tenancy:** Ensuring data isolation and management for individual stores.
*   **Catalog Inheritance/Linking:** Allowing stores to link to master items while enabling store-specific overrides.
*   **Clear Ownership:** Tracking who created/owns each data entity.
*   **Scalability & Flexibility:** Designing for future growth and customization.

## Proposed Data Model Enhancements

### Existing Models (Admin-defined):

*   **`MasterProduct`**: (AwesomeServer/src/models/Product/MasterProduct.js)
    *   `name`, `description`, `basePrice`, `category` (ref `Category`), `subcategory` (ref `Subcategory`), `images`, `createdBy`, `createdByModel`.
*   **`Category`**: (AwesomeServer/src/models/Product/Category.js) - Renamed to `MasterCategory` conceptually.
    *   `name`, `description`, `imageUrl`, `createdBy`, `createdByModel`.
*   **`Subcategory`**: (AwesomeServer/src/models/Product/Subcategory.js) - Renamed to `MasterSubcategory` conceptually.
    *   `name`, `categoryId` (ref `Category`), `createdBy`, `createdByModel`.

### New/Enhanced Models (Store-specific):

1.  **`StoreCategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Category', default: null }` (Links to a master category, can be null for store-created categories)
    *   `name`: `{ type: String, required: true }` (Store-specific name, or inherited from master)
    *   `description`: `String`
    *   `imageUrl`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }` (Store can enable/disable categories)
    *   `timestamps: true`

2.  **`StoreSubcategory` Model:**
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }` (Links to a `StoreCategory`)
    *   `masterSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'Subcategory', default: null }` (Links to a master subcategory, can be null for store-created subcategories)
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `isActive`: `{ type: Boolean, default: true }`
    *   `timestamps: true`

3.  **`StoreProduct` Model:** (AwesomeServer/src/models/Product/StoreProduct.js - Ensure it has these fields)
    *   `storeId`: `{ type: Schema.Types.ObjectId, ref: 'Store', required: true }`
    *   `masterProductId`: `{ type: Schema.Types.ObjectId, ref: 'MasterProduct', default: null }`
    *   `name`: `{ type: String, required: true }`
    *   `description`: `String`
    *   `price`: `{ type: Number, min: 0, required: true }`
    *   `stock`: `{ type: Number, min: 0, default: 0 }`
    *   `storeCategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreCategory', required: true }`
    *   `storeSubcategoryId`: `{ type: Schema.Types.ObjectId, ref: 'StoreSubcategory', default: null }`
    *   `images`: `[String]`
    *   `isAvailable`: `{ type: Boolean, default: true }`
    *   `createdBy`: `{ type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true }`
    *   `createdByModel`: `{ type: String, enum: ['Admin', 'StoreManager'], required: true }`
    *   `timestamps: true`

## Proposed API Endpoints & Workflow

### A. Initial Store Setup (First-Time Store Manager Login)

1.  **`GET /store/onboarding/master-categories`**
    *   **Purpose:** Fetch all `MasterCategory` items.
    *   **Response:** `[{ _id, name, imageUrl, ... }]`

2.  **`GET /store/onboarding/master-products-by-categories?categoryIds=[id1,id2]`**
    *   **Purpose:** Fetch `MasterProduct`s and their associated `MasterSubcategory`s for selected categories.
    *   **Request:** Array of `MasterCategory` IDs.
    *   **Response:** `[{ category: { _id, name }, subcategories: [{ _id, name }], products: [{ _id, name, basePrice, ... }] }]`

3.  **`POST /store/onboarding/import-catalog`**
    *   **Purpose:** Create initial `StoreCategory`, `StoreSubcategory`, and `StoreProduct` entries based on selections.
    *   **Request Body:**
        ```json
        {
          "selectedMasterCategoryIds": ["id1", "id2"],
          "selectedMasterProductIds": ["prodId1", "prodId2"]
        }
        ```

### B. Ongoing Store Management APIs

1.  **`GET /store/categories`**
    *   **Purpose:** List all `StoreCategory` items for the current store.

2.  **`POST /store/categories`**
    *   **Purpose:** Create a new `StoreCategory` (either linked to `MasterCategory` or new).

3.  **`PUT /store/categories/:id`**
    *   **Purpose:** Update an existing `StoreCategory`.

4.  **`GET /store/products`**
    *   **Purpose:** List all `StoreProduct` items for the current store, with filtering.

5.  **`POST /store/products`**
    *   **Purpose:** Add a new `StoreProduct` (linked to `MasterProduct` or new local product).

6.  **`PUT /store/products/:id`**
    *   **Purpose:** Update an existing `StoreProduct` (price, stock, availability).

7.  **`DELETE /store/products/:id`**
    *   **Purpose:** Remove a `StoreProduct`.

### C. Admin APIs (for Master Data Management)

1.  **`GET /admin/master-categories`**, **`POST /admin/master-categories`**, **`PUT /admin/master-categories/:id`**, **`DELETE /admin/master-categories/:id`**
2.  **`GET /admin/master-subcategories`**, **`POST /admin/master-subcategories`**, **`PUT /admin/master-subcategories/:id`**, **`DELETE /admin/master-subcategories/:id`**
3.  **`GET /admin/master-products`**, **`POST /admin/master-products`**, **`PUT /admin/master-products/:id`**, **`DELETE /admin/master-products/:id`**

## UI/UX Flow Suggestions

*   **First-Time Login Onboarding Wizard:** A multi-step process for store managers to select their initial catalog.
*   **Product/Category Management Dashboard:** Dedicated screens for store managers to manage their store's catalog.

## Security & Authorization

*   **Role-Based Access Control (RBAC):** Use `verifyToken` middleware.
*   **Ownership Checks:** Backend must verify `storeId` for all store-specific operations.

## Implementation Tasks

### Server-Side (AwesomeServer)

1.  **Task 1: Create `StoreCategory` Model**
    *   **Status:** Completed
2.  **Task 2: Create `StoreSubcategory` Model**
    *   **Status:** Completed
3.  **Task 3: Update `StoreProduct` Model** (if needed, to match proposed fields)
    *   **Status:** Completed
4.  **Task 4: Implement Onboarding Controllers & Routes**
    *   **Task 4.1:** Add `GET /store/onboarding/master-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.2:** Add `GET /store/onboarding/master-products-by-categories` route and controller.
    *   **Status:** Completed
    *   **Task 4.3:** Add `POST /store/onboarding/import-catalog` route and controller.
    *   **Status:** Completed
5.  **Task 5: Implement Ongoing Store Management Controllers & Routes**
    *   **Task 5.1:** Add `GET /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.2:** Add `POST /store/categories` route and controller.
    *   **Status:** Completed
    *   **Task 5.3:** Add `PUT /store/categories/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.4:** Add `GET /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.5:** Add `POST /store/products` route and controller.
    *   **Status:** Completed
    *   **Task 5.6:** Add `PUT /store/products/:id` route and controller.
    *   **Status:** Completed
    *   **Task 5.7:** Add `DELETE /store/products/:id` route and controller.
    *   **Status:** Completed
6.  **Task 6: Implement Admin Controllers & Routes** (for Master data management)
    *   **Status:** Pending (Will be implemented if explicitly requested, as the focus is on store manager onboarding)

### Client-Side (AwesomeProject)

*   **Task 7: Create `storeCatalogService`**
    *   **Status:** Completed
*   **Task 8: Implement Onboarding Screens**
    *   **Task 8.1:** Create `SelectCategoriesScreen`.
    *   **Status:** Completed
    *   **Task 8.2:** Create `SelectProductsScreen`.
    *   **Status:** Completed
*   **Task 9: Integrate Onboarding APIs**
    *   **Status:** Completed
*   **Task 10: Implement Store Catalog Management Screens**
    *   **Status:** Completed
*   **Task 11: Integrate Store Catalog Management APIs**
    *   **Status:** Completed
