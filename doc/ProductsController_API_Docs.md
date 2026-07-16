# Products & Screen Integration API Documentation

This document describes the product management endpoints provided by the `ProductsController` and explains the full integration flow for the **Add Product** screen.

---

## Screen Integration Flow (Step-by-Step)

To implement the **Add Product** screen, the frontend developer/model should call the following endpoints in sequence:

1. **Fetch Currencies**: Call `GET /api/Currencies` to fetch the available currencies (e.g., Yemeni Riyal, Saudi Riyal) to populate the currency selection options.
2. **Fetch Categories**: Call `GET /api/Categories` to fetch categories to populate the category selection dropdown.
3. **Upload Image(s)**: For each image selected/added by the user, immediately call `POST /api/Images/upload` to upload the raw image. Receive the public image URL from the response.
4. **Save Product**: When the admin clicks **Save Product (حفظ المنتج)**, compile all user inputs—including the category ID, currency ID, and the list of uploaded image URLs along with their stock quantities—and call `POST /api/products`.

---

## 1. Create Product Endpoint

Creates a new product in the system and stores the uploaded image URLs with their stock quantities.

- **URL:** `/api/products`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Headers

| Header          | Value                      |
| --------------- | -------------------------- |
| `Authorization` | `Bearer {admin_jwt_token}` |
| `Content-Type`  | `application/json`         |

### Request Body

```json
{
  "name": "كابل شاحن سريع",
  "description": "كابل شاحن تايب سي عالي الجودة يدعم الشحن السريع",
  "price": 45.0,
  "currencyId": 2,
  "categoryId": 1,
  "images": [
    {
      "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/3a79d363-2287-43f1-b9cd-0e3d937000af.png",
      "quantityInStock": 150
    },
    {
      "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/da037300-8459-467f-94ad-73000afdae62.png",
      "quantityInStock": 75
    }
  ]
}
```

### Request Parameters Details

| Field                      | Type      | Required | Constraints                  | Description                                                                                                                            |
| -------------------------- | --------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                     | `string`  | Yes      | Max 255 chars                | The name of the product.                                                                                                               |
| `description`              | `string`  | No       | -                            | Optional product description.                                                                                                          |
| `price`                    | `double`  | Yes      | Must be > 0                  | Price of the product.                                                                                                                  |
| `currencyId`               | `integer` | Yes      | Must match valid Currency ID | The ID of the currency.                                                                                                                |
| `categoryId`               | `integer` | Yes      | Must match valid Category ID | The ID of the category.                                                                                                                |
| `images`                   | `array`   | No       | -                            | List of product image objects.                                                                                                         |
| `images[].imageUrl`        | `string`  | Yes      | Must be a valid URL          | The public R2 URL returned from the image upload.                                                                                      |
| `images[].quantityInStock` | `integer` | Yes      | Must be >= 0                 | Stock quantity for this specific image variation.                                                                                      |
| `images[].isPrimary`       | `boolean` | No       | Defaults to `false`          | Sets this image variation as the primary. If not provided, the backend automatically flags the **first image** in the list as primary. |

### Responses

**Success (201 Created):**

```json
{
  "statusCode": 201,
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

**Bad Request (400 Bad Request):**
_Returned if the validation fails (e.g. invalid Price, Category ID, or Currency ID)._

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": ["Category with ID 999 does not exist."]
}
```

---

## 2. Helper Endpoint: Fetch Currencies

Retrieves all supported currencies in the system (used to display currency options on the screen).

- **URL:** `/api/Currencies`
- **Method:** `GET`
- **Authentication:** None (Publicly accessible)

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 1,
      "name": "ريال يمني"
    },
    {
      "id": 2,
      "name": "ريال سعودي"
    }
  ]
}
```

---

## 3. Helper Endpoint: Fetch Categories

Retrieves all available categories in the system (used to populate the Category combo box on the screen).

- **URL:** `/api/Categories`
- **Method:** `GET`
- **Authentication:** None (Publicly accessible)

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": [
    {
      "id": 1,
      "name": "إلكترونيات"
    },
    {
      "id": 2,
      "name": "ملابس"
    }
  ]
}
```
