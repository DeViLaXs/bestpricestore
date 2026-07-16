# Get Products & Details API Documentation

This document describes the product retrieval endpoints provided by the `ProductsController`. These endpoints allow fetching all products (with text search and category filtering) and retrieving detailed info for a specific product.

---

## 1. Get All Products

Retrieves a list of all products in the system. Supports searching by text and filtering by category.

- **URL:** `/api/products`
- **Method:** `GET`
- **Authentication:** None (Publicly accessible)

### Query Parameters

| Parameter    | Type      | Required | Description                                                                             |
| ------------ | --------- | -------- | --------------------------------------------------------------------------------------- |
| `search`     | `string`  | No       | Searches for products whose name or description contains the string (case-insensitive). |
| `categoryId` | `integer` | No       | Filters products to only return those matching the category ID.                         |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 12,
      "name": "كابل شاحن سريع",
      "description": "كابل شاحن تايب سي عالي الجودة يدعم الشحن السريع",
      "price": 45.0,
      "currencyId": 2,
      "currencyName": "ريال سعودي",
      "categoryId": 1,
      "categoryName": "إلكترونيات",
      "createdAt": "2026-07-15T13:48:00Z",
      "updatedAt": "2026-07-15T13:48:00Z",
      "isActive": true,
      "images": [
        {
          "id": 15,
          "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/3a79d363-2287-43f1-b9cd-0e3d937000af.png",
          "quantityInStock": 150,
          "isPrimary": true
        }
      ]
    }
  ]
}
```

---

## 2. Get Product By ID

Retrieves complete details of a single product variation (used when a product item in the list is clicked).

- **URL:** `/api/products/{id}`
- **Method:** `GET`
- **Authentication:** None (Publicly accessible)

### Path Parameters

| Parameter | Type      | Description                   |
| --------- | --------- | ----------------------------- |
| `id`      | `integer` | The unique ID of the product. |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 12,
    "name": "كابل شاحن سريع",
    "description": "كابل شاحن تايب سي عالي الجودة يدعم الشحن السريع",
    "price": 45.0,
    "currencyId": 2,
    "currencyName": "ريال سعودي",
    "categoryId": 1,
    "categoryName": "إلكترونيات",
    "createdAt": "2026-07-15T13:48:00Z",
    "updatedAt": "2026-07-15T13:48:00Z",
    "isActive": true,
    "images": [
      {
        "id": 15,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/3a79d363-2287-43f1-b9cd-0e3d937000af.png",
        "quantityInStock": 150,
        "isPrimary": true
      },
      {
        "id": 16,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/da037300-8459-467f-94ad-73000afdae62.png",
        "quantityInStock": 75,
        "isPrimary": false
      }
    ]
  }
}
```

**Not Found (404 Not Found):**

```json
{
  "statusCode": 404,
  "success": false,
  "data": null,
  "errors": ["Product not found."]
}
```
