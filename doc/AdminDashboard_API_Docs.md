# Admin Dashboard API Documentation

This document describes the administrative endpoint for retrieving summary statistics and metrics displayed on the admin dashboard homepage.

---

## Base URL
All URLs are relative to the application's base path, for example: `http://localhost:5194`

---

## 1. Retrieve Dashboard Statistics
Gets dashboard summary statistics including sales figures, order status breakdown, inventory info, and representative metrics.

- **URL:** `/api/admin/dashboard`
- **Method:** `GET`
- **Authentication Required:** Yes (Role: `Admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "totalSalesYer": 356000.0,
    "totalSalesSar": 1000.0,
    "totalOrders": 17,
    "pendingOrdersCount": 1,
    "processingOrdersCount": 0,
    "shippedOrdersCount": 0,
    "deliveredOrdersCount": 7,
    "cancelledOrdersCount": 9,
    "totalActiveProducts": 3,
    "outOfStockProductsCount": 1,
    "totalRepresentatives": 20,
    "activeRepresentatives": 7
  }
}
```

### Response Field Descriptions

| Field | Type | Description | UI Equivalent (Arabic) |
| :--- | :--- | :--- | :--- |
| `totalSalesYer` | `double` | Total revenue in Yemeni Rials for all **Delivered** orders | إجمالي المبيعات (ريال يمني) |
| `totalSalesSar` | `double` | Total revenue in Saudi Riyals for all **Delivered** orders | إجمالي المبيعات (ريال سعودي) |
| `totalOrders` | `int` | Count of all orders placed in the system | إجمالي الطلبات |
| `pendingOrdersCount` | `int` | Count of orders with status Pending | قيد المراجعة |
| `processingOrdersCount`| `int` | Count of orders with status Processing | قيد المعالجة |
| `shippedOrdersCount` | `int` | Count of orders with status Shipped | تم الشحن |
| `deliveredOrdersCount` | `int` | Count of orders with status Delivered | تم التوصيل |
| `cancelledOrdersCount` | `int` | Count of orders with status Cancelled | ملغي |
| `totalActiveProducts` | `int` | Count of products currently active/displayed (`IsActive` is true) | إجمالي المنتجات المعروضة |
| `outOfStockProductsCount`| `int` | Count of products where all variations (images) are out of stock | منتجات نفد مخزونها |
| `totalRepresentatives` | `int` | Total count of representative users | إجمالي المندوبين |
| `activeRepresentatives`| `int` | Count of representative users who are currently active | المندوبين النشطين |

---

### Errors

#### Unauthorized (401 Unauthorized)
Returned if the token is invalid, expired, or missing.
```json
{
  "statusCode": 401,
  "success": false,
  "data": null,
  "errors": [
    "Unauthorized"
  ]
}
```

#### Forbidden (403 Forbidden)
Returned if the user does not have the `Admin` role.
```json
{
  "statusCode": 403,
  "success": false,
  "data": null,
  "errors": [
    "Forbidden"
  ]
}
```
