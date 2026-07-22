# Orders API Documentation

This document describes the order placement endpoint provided by the `OrdersController`.

---

## 1. Place Order

Creates a new order, validates stock availability, deducts stock for variations, and computes totals for YER and SAR currencies.

- **URL:** `/api/Orders`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)

### Request Headers

| Header          | Value                |
| --------------- | -------------------- |
| `Authorization` | `Bearer {jwt_token}` |
| `Content-Type`  | `application/json`   |

### Request Body (CreateOrderRequestDTO)

```json
{
  "items": [
    {
      "productImageId": 1,
      "quantity": 1
    },
    {
      "productImageId": 5,
      "quantity": 2
    }
  ]
}
```

#### Field Specifications

| Field                    | Type      | Required | Constraints  | Description                                                 |
| ------------------------ | --------- | -------- | ------------ | ----------------------------------------------------------- |
| `items`                  | `array`   | Yes      | Min 1 item   | List of items to purchase.                                  |
| `items[].productImageId` | `integer` | Yes      | -            | The unique ID of the product image variation being ordered. |
| `items[].quantity`       | `integer` | Yes      | Must be >= 1 | The quantity requested for this variation.                  |

---

### Responses

#### Success (201 Created)

Returns the created order details, including status lookup IDs, separate currency total amounts, and detailed lists of ordered products.

```json
{
  "statusCode": 201,
  "success": true,
  "errors": [],
  "data": {
    "id": 1,
    "userId": 16,
    "orderStatusId": 1,
    "totalAmountYer": 700.0,
    "totalAmountSar": 500.0,
    "createdAt": "2026-07-16T17:43:06.5440545Z",
    "items": [
      {
        "productId": 1,
        "productName": "وساده مريحه",
        "productImageId": 1,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
        "quantity": 1,
        "unitPrice": 700.0,
        "totalAmount": 700.0,
        "currencyId": 1
      },
      {
        "productId": 2,
        "productName": "عمر",
        "productImageId": 5,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg",
        "quantity": 2,
        "unitPrice": 250.0,
        "totalAmount": 500.0,
        "currencyId": 2
      }
    ]
  }
}
```

_Note: `orderStatusId: 1` corresponds to the `"Pending"` status seeded in the database._

#### Bad Request - Insufficient Stock (400 Bad Request)

If any item in the order exceeds available stock levels, the transaction is rolled back and an error is returned.

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": [
    "Insufficient stock for product 'عمر' (ID: 2, Variation ID: 5). Available: 1, Requested: 5."
  ]
}
```

#### Bad Request - Validation Failure (400 Bad Request)

If the payload violates data constraints (e.g. quantity less than 1).

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Items[0].Quantity": ["Quantity must be at least 1."]
  }
}
```

#### Unauthorized (401 Unauthorized)

If the bearer token is missing, expired, or invalid.

```json
{
  "statusCode": 401,
  "success": false,
  "data": null,
  "errors": ["User is not properly authenticated."]
}
```
