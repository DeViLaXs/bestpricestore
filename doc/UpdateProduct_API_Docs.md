# Edit Product API Documentation

This document describes the product update/edit endpoint provided by the `ProductsController`.

---

## 1. Edit Product

Updates an existing product's details and synchronizes its image variations, cleaning up any removed or replaced image files from Cloudflare R2 storage automatically.

- **URL:** `/api/products/{id}`
- **Method:** `PUT`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Path Parameters

| Parameter | Type      | Description                             |
| --------- | --------- | --------------------------------------- |
| `id`      | `integer` | The unique ID of the product to update. |

### Request Headers

| Header          | Value                      |
| --------------- | -------------------------- |
| `Authorization` | `Bearer {admin_jwt_token}` |
| `Content-Type`  | `application/json`         |

### Request Body

```json
{
  "name": "كابل شاحن سريع معدل",
  "description": "كابل شاحن تايب سي عالي الجودة يدعم الشحن السريع - نسخة معدلة",
  "price": 50.0,
  "currencyId": 2,
  "categoryId": 1,
  "images": [
    {
      "id": 15,
      "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/3a79d363-2287-43f1-b9cd-0e3d937000af.png",
      "quantityInStock": 200,
      "isPrimary": true
    },
    {
      "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/new-image-uploaded.png",
      "quantityInStock": 100
    }
  ]
}
```

### R2 Storage Cleanup Rules (Automatic on Backend)

- **Image Deletion**: Any image variation currently stored in the database for this product that is **missing** from the request `images` list will be automatically deleted from Cloudflare R2 and removed from the database.
- **Image Replacement**: If an image variation `id` is sent, but its `imageUrl` is different from the one currently stored in the database:
  - The backend will delete the **old image file** from Cloudflare R2 first.
  - The backend will then update the database record with the new `imageUrl`.

### Request Parameters

| Field                      | Type      | Required | Description                                                                          |
| -------------------------- | --------- | -------- | ------------------------------------------------------------------------------------ |
| `name`                     | `string`  | Yes      | The name of the product (Max 255 chars).                                             |
| `description`              | `string`  | No       | Optional product description.                                                        |
| `price`                    | `double`  | Yes      | Price of the product (Must be > 0).                                                  |
| `currencyId`               | `integer` | Yes      | The ID of the currency.                                                              |
| `categoryId`               | `integer` | Yes      | The ID of the category.                                                              |
| `images`                   | `array`   | No       | List of product image objects representing the final state on the screen.            |
| `images[].id`              | `integer` | No       | Set for existing database image records. Omit or set to null for newly added images. |
| `images[].imageUrl`        | `string`  | Yes      | Public R2 URL from image upload.                                                     |
| `images[].quantityInStock` | `integer` | Yes      | Must be >= 0.                                                                        |
| `images[].isPrimary`       | `boolean` | No       | Flags image as primary.                                                              |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 12,
    "name": "كابل شاحن سريع معدل",
    "description": "كابل شاحن تايب سي عالي الجودة يدعم الشحن السريع - نسخة معدلة",
    "price": 50.0,
    "currencyId": 2,
    "currencyName": "ريال سعودي",
    "categoryId": 1,
    "categoryName": "إلكترونيات",
    "createdAt": "2026-07-15T13:48:00Z",
    "updatedAt": "2026-07-15T15:15:00Z",
    "isActive": true,
    "images": [
      {
        "id": 15,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/3a79d363-2287-43f1-b9cd-0e3d937000af.png",
        "quantityInStock": 200,
        "isPrimary": true
      },
      {
        "id": 17,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/new-image-uploaded.png",
        "quantityInStock": 100,
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
