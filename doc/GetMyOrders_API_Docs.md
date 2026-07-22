# List My Orders (with Status Filtering) API Documentation

This document describes the updated `GET /api/Orders` endpoint, which retrieves a summary list of all orders belonging to the logged-in user and now supports server-side filtering by status.

---

## Endpoint Details

- **URL:** `/api/Orders`
- **Method:** `GET`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `orderStatusId` (optional, integer): Filters the retrieved list by status ID.
    - `1` = Pending (قيد المراجعة)
    - `2` = Processing (قيد المعالجة)
    - `3` = Shipped (تم الشحن)
    - `4` = Delivered (تم التوصيل)
    - `5` = Cancelled (ملغى)
    - **Note:** If not supplied, all orders for the authenticated user are returned.

---

## Response Schema (200 OK)

Returns an API envelope containing a list of order summary objects.

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

### Field Reference (data item)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique ID of the order. |
| `orderStatusId` | `integer` | The current status ID of the order (1=Pending, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled). |
| `totalAmountYer` | `double` | Total order amount in Yemeni Rials (YER). |
| `totalAmountSar` | `double` | Total order amount in Saudi Rials (SAR). |
| `createdAt` | `string` | The date and time the order was created. |
