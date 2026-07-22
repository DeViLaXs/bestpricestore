# Carts API Documentation

This document describes the cart management endpoints provided by the `CartsController` to support adding items to the user's cart while checking stock levels.

---

## 1. Add Product to Cart

Adds a specific product variation (associated with an image ID) to the authenticated user's cart. If the user doesn't have an active cart, one is automatically created first.

- **URL:** `/api/Carts/add`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Any authenticated user (e.g. Representative)

### Request Headers

| Header          | Value                |
| --------------- | -------------------- |
| `Authorization` | `Bearer {jwt_token}` |
| `Content-Type`  | `application/json`   |

### Request Body

```json
{
  "productId": 1,
  "productImageId": 1,
  "quantity": 2
}
```

### Request Parameters

| Field            | Type      | Required | Range        | Description                                                                  |
| ---------------- | --------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| `productId`      | `integer` | Yes      | -            | The ID of the parent product.                                                |
| `productImageId` | `integer` | Yes      | -            | The ID of the image representing the specific product variation/color/style. |
| `quantity`       | `integer` | Yes      | Must be >= 1 | The quantity of the item to add.                                             |

### Business Validation Rules

1. **Variation Validation**: Verifies that the `productImageId` exists. If not found, returns `404 Not Found`.
2. **Product Association**: Verifies that the `productImageId` belongs to the specified `productId`. If they mismatch, returns `400 Bad Request`.
3. **Active Product**: Verifies that the product is active (`IsActive == true`). If inactive, returns `400 Bad Request`.
4. **Stock Limit Check**: Retrieves the variation's available stock (`QuantityInStock`). Checks if `existingCartQuantity + requestedQuantity <= QuantityInStock`. If it exceeds available stock, returns `400 Bad Request`.

---

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "message": "Product successfully added to cart."
  }
}
```

**Bad Request (400 Bad Request) - Mismatch / Inactive:**

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": ["The requested image variation does not belong to the specified product."]
}
```

**Bad Request (400 Bad Request) - Insufficient Stock:**

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": ["Insufficient stock. Only 10 items are available in stock for this variation."]
}
```

**Unauthorized (401 Unauthorized):**
_Returned if the Authorization header is missing or contains an invalid/expired token._

```json
{
  "statusCode": 401,
  "success": false,
  "data": null,
  "errors": ["User is not properly authenticated."]
}
```

**Not Found (404 Not Found):**
_Returned if the image variation ID does not exist._

```json
{
  "statusCode": 404,
  "success": false,
  "data": null,
  "errors": ["Product variation (image ID) not found."]
}
```
