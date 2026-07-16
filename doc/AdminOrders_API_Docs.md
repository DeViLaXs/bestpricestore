# Admin Order Management API Documentation

This document describes the administrative endpoints for managing orders, including listing all user orders, checking product details, and updating status with transition sequence validation.

---

## Base URL
All URLs are relative to the application's base path, for example: `http://localhost:5194`

---

## 1. List All Orders
Retrieves a summary list of all orders placed by all users in the system, ordered by creation date descending.

- **URL:** `/api/admin/orders`
- **Method:** `GET`
- **Authentication Required:** Yes (Role: `Admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 11,
      "orderStatusId": 1,
      "totalAmountYer": 1200.0,
      "totalAmountSar": 250.0,
      "createdAt": "2026-07-16T19:20:29.3034814",
      "userId": 21,
      "storeName": "CustomerStore716573"
    },
    {
      "id": 10,
      "orderStatusId": 1,
      "totalAmountYer": 0.0,
      "totalAmountSar": 500.0,
      "createdAt": "2026-07-16T19:19:34.4174369",
      "userId": 19,
      "storeName": "CustomerStore100302"
    }
  ]
}
```

---

## 2. Get Order Details (Admin)
Retrieves complete product item details for any order in the system by ID.

- **URL:** `/api/admin/orders/{id}`
- **Method:** `GET`
- **Authentication Required:** Yes (Role: `Admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 11,
    "userId": 21,
    "orderStatusId": 1,
    "totalAmountYer": 1200.0,
    "totalAmountSar": 250.0,
    "createdAt": "2026-07-16T19:20:29.3034814",
    "items": [
      {
        "productId": 1,
        "productName": "وساده مريحه",
        "productImageId": 1,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
        "quantity": 1,
        "unitPrice": 1200.0,
        "totalAmount": 1200.0,
        "currencyId": 1
      },
      {
        "productId": 2,
        "productName": "عمر",
        "productImageId": 5,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg",
        "quantity": 1,
        "unitPrice": 250.0,
        "totalAmount": 250.0,
        "currencyId": 2
      }
    ]
  }
}
```

#### Errors
*   **404 Not Found**: If the order does not exist.

---

## 3. Update Order Status
Updates the status of an order. The request is subject to terminal status checks and strict sequential transition rules.

- **URL:** `/api/admin/orders/{id}/status`
- **Method:** `PUT`
- **Authentication Required:** Yes (Role: `Admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`
  - `Content-Type: application/json`

### Request Body (UpdateOrderStatusRequestDTO)
```json
{
  "orderStatusId": 2
}
```

### Business Rules & Constraints

1.  **Terminal States**:
    *   If the order is already in status **`Cancelled` (5)** or **`Delivered` (4)**, any status change request is rejected with `400 Bad Request`.
2.  **Strict State Transition Sequence**:
    *   **Pending (1)** can only transition to: **Processing (2)** or **Cancelled (5)**.
    *   **Processing (2)** can only transition to: **Shipped (3)** or **Cancelled (5)**.
    *   **Shipped (3)** can only transition to: **Delivered (4)** or **Cancelled (5)**.
    *   Any other transition (e.g. Pending (1) directly to Shipped (3)) is rejected with `400 Bad Request`.
3.  **Stock Restoration**:
    *   If an active order is transitionally updated **to Cancelled (5)**, the quantities ordered will be automatically restored back to the product image variation stock levels.

### Responses

#### Success (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 11,
    "userId": 21,
    "orderStatusId": 2,
    "totalAmountYer": 1200.0,
    "totalAmountSar": 250.0,
    "createdAt": "2026-07-16T19:20:29.3034814",
    "items": []
  }
}
```

#### Bad Request - Invalid Transition Sequence (400 Bad Request)
Returned if the requested transition skips states in the sequence.
```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": [
    "Invalid status transition from Pending (1) to Shipped (3). Allowed next states: Processing (2) or Cancelled (5)."
  ]
}
```

#### Bad Request - Terminal State Lock (400 Bad Request)
Returned if attempting to update a Delivered or Cancelled order.
```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": [
    "Cannot update status of a delivered order."
  ]
}
```
