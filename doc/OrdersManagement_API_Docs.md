# User Order Management API Documentation

This document describes the API endpoints for listing user orders, viewing order details, canceling pending orders, and resolving order status IDs.

---

## Base URL

All URLs are relative to the application's base path, for example: `http://localhost:5194`

---

## 1. Get Order Statuses

Returns all available order status definitions. The frontend should call this endpoint to match `orderStatusId` integer values (e.g. `1`, `5`) with their display names (e.g. `Pending`, `Cancelled`).

- **URL:** `/api/OrderStatuses`
- **Method:** `GET`
- **Authentication Required:** No (Public)

### Response (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 1,
      "name": "Pending"
    },
    {
      "id": 2,
      "name": "Processing"
    },
    {
      "id": 3,
      "name": "Shipped"
    },
    {
      "id": 4,
      "name": "Delivered"
    },
    {
      "id": 5,
      "name": "Cancelled"
    }
  ]
}
```

---

## 2. List My Orders

Retrieves a summary list of all orders placed by the currently logged-in user. The results are ordered by creation date descending.

- **URL:** `/api/Orders`
- **Method:** `GET`
- **Authentication Required:** Yes (Bearer Token)
- **Headers:**
  - `Authorization: Bearer <your_jwt_token>`

### Response (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 8,
      "orderStatusId": 1,
      "totalAmountYer": 1200.0,
      "totalAmountSar": 250.0,
      "createdAt": "2026-07-16T18:39:05.0450581"
    }
  ]
}
```

#### Field Specifications (Order Summary)

- `id` (integer): The unique order identifier.
- `orderStatusId` (integer): Matches the ID of the order status. Call `/api/OrderStatuses` to map this to its text name.
- `totalAmountYer` (double): The sum of all items in this order priced in Yemeni Rial.
- `totalAmountSar` (double): The sum of all items in this order priced in Saudi Rial.
- `createdAt` (string/datetime): Timestamp when the order was placed.

---

## 3. Get Order Details

Retrieves complete product details for a specific order. Call this when a user clicks on an order from the list.

- **URL:** `/api/Orders/{id}`
- **Method:** `GET`
- **Authentication Required:** Yes (Bearer Token)
- **Headers:**
  - `Authorization: Bearer <your_jwt_token>`

### Response (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 8,
    "userId": 18,
    "orderStatusId": 1,
    "totalAmountYer": 1200.0,
    "totalAmountSar": 250.0,
    "createdAt": "2026-07-16T18:39:05.0450581",
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

#### Field Specifications (Order Item Details)

- `items[].productId` (integer): ID of the parent product.
- `items[].productName` (string): Name of the product.
- `items[].productImageId` (integer): ID of the specific image/variation purchased.
- `items[].imageUrl` (string): Image URL for the variation.
- `items[].quantity` (integer): Quantity purchased.
- `items[].unitPrice` (double): Single item unit price.
- `items[].totalAmount` (double): Item total (`unitPrice * quantity`).
- `items[].currencyId` (integer): Currency ID of the product price (`1` = YER, `2` = SAR).

#### Errors

- **404 Not Found**: If the order does not exist OR is owned by another user.
  ```json
  {
    "statusCode": 404,
    "success": false,
    "data": null,
    "errors": ["Order not found."]
  }
  ```

---

## 4. Cancel Order

Cancels an order. Cancellation is **only** allowed if the order's current status is `Pending` (`orderStatusId: 1`). Canceling an order releases/restores the product variation stock levels back to the inventory.

- **URL:** `/api/Orders/{id}/cancel`
- **Method:** `PUT`
- **Authentication Required:** Yes (Bearer Token)
- **Headers:**
  - `Authorization: Bearer <your_jwt_token>`

### Response (200 OK)

Returns the updated order payload showing `orderStatusId: 5` (Cancelled).

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 8,
    "userId": 18,
    "orderStatusId": 5,
    "totalAmountYer": 1200.0,
    "totalAmountSar": 250.0,
    "createdAt": "2026-07-16T18:39:05.0450581"
  }
}
```

#### Errors

- **400 Bad Request**: If the order is not in `Pending` status (e.g. already Processing, Shipped, or Cancelled).
  ```json
  {
    "statusCode": 400,
    "success": false,
    "data": null,
    "errors": ["Only orders with 'Pending' status can be cancelled."]
  }
  ```
- **404 Not Found**: If the order does not exist or is owned by another user.
