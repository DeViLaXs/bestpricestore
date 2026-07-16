# Toggle Product Status (Soft Delete) API Documentation

This document describes the endpoints provided by the `ProductsController` to activate or deactivate products. These endpoints allow soft-deleting products (making them inactive) rather than hard-deleting them from the database.

---

## 1. Activate Product

Sets the product's status to active (`IsActive = true`), making it visible on Representative client screens.

- **URL:** `/api/products/{id}/activate`
- **Method:** `PUT`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | The unique ID of the product to activate. |

### Request Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {admin_jwt_token}` |

### Responses

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "message": "Product has been successfully activated."
  }
}
```

**Not Found (404 Not Found):**
```json
{
  "statusCode": 404,
  "success": false,
  "data": null,
  "errors": [
    "Product not found."
  ]
}
```

---

## 2. Deactivate Product

Sets the product's status to inactive (`IsActive = false`), soft-deleting it and hiding it from Representative client screens.

- **URL:** `/api/products/{id}/deactivate`
- **Method:** `PUT`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | The unique ID of the product to deactivate. |

### Request Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {admin_jwt_token}` |

### Responses

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "message": "Product has been successfully deactivated."
  }
}
```

**Not Found (404 Not Found):**
```json
{
  "statusCode": 404,
  "success": false,
  "data": null,
  "errors": [
    "Product not found."
  ]
}
```
