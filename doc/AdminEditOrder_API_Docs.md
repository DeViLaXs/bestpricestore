# Admin Edit Order Items API Documentation

This document describes the administrative endpoint for editing the items and quantities within an order (e.g. to handle returns or adjust quantities downwards).

---

## Base URL

All URLs are relative to the application's base path, for example: `http://localhost:5194`

---

## 1. Edit Order Items

Updates the items and quantities within an order. The API only allows **decreasing** quantities or **removing** items (setting quantity to `0` or omitting them).

- **URL:** `/api/admin/orders/{id}/items`
- **Method:** `PUT`
- **Authentication Required:** Yes (Role: `Admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`
  - `Content-Type: application/json`

### Request Body (EditOrderItemsRequestDTO)

```json
{
  "items": [
    {
      "productImageId": 1,
      "quantity": 2
    },
    {
      "productImageId": 5,
      "quantity": 0
    }
  ]
}
```

### Business Rules & Constraints

1. **Terminal States**:
   - If the order is in status **`Cancelled` (5)**, the edit request is rejected with `400 Bad Request`.
2. **Reductions Only**:
   - Quantities of items can only be **reduced** or **removed** (setting quantity to `0` or omitting them entirely from the `items` list).
   - Any attempt to **increase** the quantity of a product beyond its current ordered level will be rejected with `400 Bad Request` (recommending the representative place a new order for the additional amount).
3. **Stock Restoration**:
   - Any reduced/removed items will automatically have their stock difference **added back** to the variant's inventory (`ProductImage.QuantityInStock`).
4. **Totals Recalculation**:
   - The overall order totals (`TotalAmountYer` and `TotalAmountSar`) are recalculated automatically using the original unit price of the items.

### Responses

#### Success (200 OK)

Returns the updated order details containing the new totals and remaining items.

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 11,
    "userId": 21,
    "orderStatusId": 4,
    "totalAmountYer": 2400.0,
    "totalAmountSar": 0.0,
    "createdAt": "2026-07-16T19:20:29.3034814",
    "items": [
      {
        "productId": 1,
        "productName": "وساده مريحه",
        "productImageId": 1,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
        "quantity": 2,
        "unitPrice": 1200.0,
        "totalAmount": 2400.0,
        "currencyId": 1
      }
    ]
  }
}
```

#### Bad Request - Attempted Quantity Increase (400 Bad Request)

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": [
    "Increasing product quantity is not allowed. Representative must place a new order for additional quantities of variation ID 1."
  ]
}
```

#### Bad Request - Cancelled Order (400 Bad Request)

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": ["Cannot edit items of a cancelled order."]
}
```
