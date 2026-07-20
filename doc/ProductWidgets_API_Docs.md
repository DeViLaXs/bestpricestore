# Product Widgets API Documentation

This document describes the API endpoints for product widgets (Latest Products and Top Selling Products) to be used on the client home screen (الشاشة الرئيسية).

---

## Base URL
All URLs are relative to the application's base path, for example: `http://localhost:5194`

---

## 1. Get Latest Products
Retrieves the latest 5 active products in the system.

- **URL:** `/api/Products/latest`
- **Method:** `GET`
- **Authentication:** None required (Publicly accessible)

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 15,
      "name": "طقم لحاف شتوي",
      "price": 45000.0,
      "currencyId": 1,
      "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/quilts_set.jpeg"
    },
    {
      "id": 14,
      "name": "وسادة طبية مريحة",
      "price": 120.0,
      "currencyId": 2,
      "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/medical_pillow.jpeg"
    }
  ]
}
```

---

## 2. Get Top Selling Products
Retrieves the top 10 products based on the total quantity sold in **Delivered** orders.

- **URL:** `/api/Products/top-selling`
- **Method:** `GET`
- **Authentication:** None required (Publicly accessible)

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 1,
      "name": "وساده مريحه",
      "price": 1200.0,
      "currencyId": 1,
      "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/pillow.jpeg",
      "totalQuantitySold": 45
    },
    {
      "id": 5,
      "name": "مرتبة سرير مضغوطة",
      "price": 350.0,
      "currencyId": 2,
      "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/mattress.jpeg",
      "totalQuantitySold": 22
    }
  ]
}
```

---

### Response Field Descriptions

#### ProductBrowseResponseDTO (Latest Products)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | Unique identifier of the product |
| `name` | `string?` | Name of the product |
| `price` | `double` | Price of the product |
| `currencyId` | `int` | Currency lookup ID (`1` = YER, `2` = SAR) |
| `primaryImageUrl`| `string?` | URL of the primary product image variation |

#### ProductBestSellerResponseDTO (Top Selling Products)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | Unique identifier of the product |
| `name` | `string?` | Name of the product |
| `price` | `double` | Price of the product |
| `currencyId` | `int` | Currency lookup ID (`1` = YER, `2` = SAR) |
| `primaryImageUrl`| `string?` | URL of the primary product image variation |
| `totalQuantitySold`| `int` | Total sum of quantities ordered across all Delivered orders (OrderStatusId == 4) |
