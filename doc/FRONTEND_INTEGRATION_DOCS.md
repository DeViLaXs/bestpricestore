# Backend Changes & Frontend Integration Guide

This document details all recent backend architectural, logic, and endpoint changes made to **BestPriceStore**. It serves as a comprehensive reference for frontend developers and AI agents re-integrating or updating the frontend application.

---

## Executive Summary of Changes

1. **Role-Based Product Visibility (`IsActive` & `IsDeleted`)**:
   - **Admin Users**: Can view both Active (`IsActive = true`) and Inactive (`IsActive = false`) products across all product endpoints.
   - **Representatives & Guest Users**: Can **only** view Active (`IsActive = true`) products. Inactive products are completely filtered out in list endpoints and return `404 Not Found` on detail endpoints.
   - **Soft-Deleted Items (`IsDeleted = true`)**: Never visible to any user (Admin or Representative) in regular GET queries.

2. **Order Placement Validation**:
   - Non-admin users (Representatives) cannot place orders for inactive products.

3. **Soft-Delete Quantity Reset**:
   - Soft-deleting a product or an individual product image variation resets `QuantityInStock` to `0` in the database.

4. **Return & Order Cancellation Restore Logic**:
   - When an order item is returned (via `PUT /api/admin/orders/{id}/items`) or when an order is cancelled:
     - The backend checks if the parent product or product image variation was soft-deleted (`IsDeleted = true`).
     - If so, it restores `IsDeleted = false` and adds the returned quantity back to `QuantityInStock`.
     - **Crucial Fix**: This check-and-restore logic now applies **only** to the specific items being returned/reduced, rather than indiscriminately un-deleting all products in the order.

---

## Detailed Endpoint Comparison & Changes

### 1. Product Retrieval Endpoints
* **`GET /api/Products`**
* **`GET /api/Products/browse`**
* **`GET /api/Products/{id}`**
* **`GET /api/Products/latest`**
* **`GET /api/Products/top-selling`**

| Aspect | Past Behavior | New Behavior |
| :--- | :--- | :--- |
| **`GET /api/Products` & `GET /api/Products/{id}`** | Returned products regardless of `IsActive` state to anyone. | Checks caller role via JWT token.<br>• **Admin**: Returns active & inactive products.<br>• **Representative / Guest**: Filters `IsActive == true`. Detail view returns `404 Not Found` for inactive products. |
| **`browse`, `latest`, `top-selling`** | Hardcoded `IsActive == true` for everyone, hiding inactive products from Admins. | Checks caller role via JWT token.<br>• **Admin**: Displays active & inactive products.<br>• **Representative / Guest**: Displays active products only. |
| **Authorization Header** | Optional / Ignored for product listing GET endpoints. | **Required for Admins**: Frontend **MUST** pass `Authorization: Bearer <token>` in GET requests if the logged-in user is an Admin so the backend recognizes their role. |

---

### 2. Order Placement (`POST /api/Orders`)

| Aspect | Past Behavior | New Behavior |
| :--- | :--- | :--- |
| **Validation** | Checked stock availability only. Allowed purchasing inactive products. | Validates product activity state.<br>• If `!isAdmin` and the requested product has `IsActive == false`, returns `400 Bad Request` with message: `"Product '{Name}' is not active and cannot be ordered."` |

---

### 3. Product & Image Soft-Deletion (`DELETE /api/Products/{id}` & `PUT /api/Products/{id}`)

| Aspect | Past Behavior | New Behavior |
| :--- | :--- | :--- |
| **`DELETE /api/Products/{id}`** (Product Delete) | Set `IsDeleted = true` for Product and ProductImages, keeping old stock quantity intact. | Sets `IsDeleted = true` for Product and ProductImages AND resets `QuantityInStock = 0` for all images of that product. |
| **`PUT /api/Products/{id}`** (Image Variation Removal) | Set `IsDeleted = true` for removed image IDs, keeping old stock quantity intact. | Sets `IsDeleted = true` for removed image IDs AND resets `QuantityInStock = 0` for those deleted images. |

---

### 4. Returns & Order Adjustments (`PUT /api/admin/orders/{id}/items`)

| Aspect | Past Behavior | New Behavior |
| :--- | :--- | :--- |
| **Return Processing** | Un-deleted soft-deleted products/images for **every** item in the order, even if that item was not being returned. | Isolates processing to items being returned or reduced.<br>If item is returned/reduced:<br>1. If parent `Product` is soft-deleted (`IsDeleted == true`), sets `Product.IsDeleted = false`.<br>2. If variation `ProductImage` is soft-deleted (`IsDeleted == true`), sets `ProductImage.IsDeleted = false`.<br>3. Restores stock: `QuantityInStock += returnedQuantity`. |

---

### 5. Order Cancellation (`PUT /api/Orders/{id}/cancel` & `PUT /api/admin/orders/{id}/status` [status = 5])

| Aspect | Past Behavior | New Behavior |
| :--- | :--- | :--- |
| **Cancellation Stock Restore** | Restored stock without checking/restoring soft-deleted flags. | Aligned with return logic. When an order is cancelled, it checks if any item's product/image was soft-deleted, un-deletes them (`IsDeleted = false`), and restores stock. |

---

## Action Items for Frontend Re-Integration

### 1. Ensure JWT Authorization Headers on GET Requests
- **Issue**: Previously, public GET requests might not have included the `Authorization` header.
- **Fix**: The HTTP client (Axios, Fetch wrapper, etc.) must include `Authorization: Bearer <token>` on all product `GET` endpoints when an Admin user is logged in. This enables the backend to serve inactive products to Admins.

### 2. Admin UI Updates for Inactive Products
- **Badges/Status**: In Admin product lists (`/api/Products`, `/api/Products/browse`), check `product.isActive`. Display visual indicators (e.g., an "Inactive" badge or muted styling) for `isActive === false`.
- **Toggle Endpoint**: Admins can toggle product state using:
  - `PUT /api/Products/{id}/activate`
  - `PUT /api/Products/{id}/deactivate`

### 3. Representative UI Behavior
- Representatives will automatically see only `IsActive === true` items.
- If a Representative attempts to access a bookmark/direct URL of an inactive product (`GET /api/Products/{id}`), handle the `404 Not Found` response gracefully (e.g., redirect to "Product Unavailable" page).

### 4. Error Handling on Order Placement
- Handle `400 Bad Request` during `POST /api/Orders` when a product becomes inactive prior to checkout. Show a user-friendly toast/alert: `"Product '{Name}' is no longer active."`

### 5. Order Item Returns (Admin Order Management)
- When using `PUT /api/admin/orders/{id}/items`, understand that returning a soft-deleted item automatically restores the product/image visibility in active product catalog listings with the updated stock. No extra manual un-delete step is required from the Admin UI.
