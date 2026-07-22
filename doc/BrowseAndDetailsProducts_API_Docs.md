# Browse and Detail Products API Documentation

This document describes the endpoints provided by the `ProductsController`, `CurrenciesController`, and `CategoriesController` to support browsing products with pagination, category filtering, search, loading full details, and resolving currencies/categories.

---

## Screen Integration Flow

1. **Fetch and Populate Categories**: Call `GET /api/Categories` (documented below) to load the available product categories. Use this list to populate the horizontal category filter pills/tabs at the top of the browse screen. When a category is tapped, send its `id` as `categoryId` in the products request.
2. **Fetch and Cache Currencies**: Call `GET /api/Currencies` (documented below) once when the application loads. Keep this list in the frontend state/store so you can lookup the currency name/symbol using the `currencyId` returned by the product browse endpoint.
3. **List Products (Paginated)**: Call `GET /api/Products/browse` to populate the product grid. Use the query parameters `categoryId`, `search`, `pageNumber`, and `pageSize`.
4. **Fetch Details on Selection**: When the user clicks on a product card, fetch the full details by calling `GET /api/Products/{id}` using the product's `id`.

---

## 1. Browse Products (Paginated & Filtered)

Retrieves a paginated list of active products showing only primary image, name, price, and currency ID.

- **URL:** `/api/products/browse`
- **Method:** `GET`
- **Authentication:** None (Public)

### Request Query Parameters

| Parameter    | Type      | Required | Default | Description                                                |
| ------------ | --------- | -------- | ------- | ---------------------------------------------------------- |
| `search`     | `string`  | No       | -       | Substring query to filter products by Name or Description. |
| `categoryId` | `integer` | No       | -       | Category ID filter.                                        |
| `pageNumber` | `integer` | No       | `1`     | The page index to fetch (starts at 1).                     |
| `pageSize`   | `integer` | No       | `10`    | The number of products to return per page.                 |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "items": [
      {
        "id": 2,
        "name": "عمر",
        "price": 250.0,
        "currencyId": 2,
        "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg"
      },
      {
        "id": 1,
        "name": "وساده مريحه ريضية بعد التعديل",
        "price": 555550.0,
        "currencyId": 1,
        "primaryImageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 2,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## 2. Get Product Details by ID

Retrieves all details for a specific product by ID, including its full description, category/currency details, and all associated images (primary and gallery).

- **URL:** `/api/products/{id}`
- **Method:** `GET`
- **Authentication:** None (Public)

### Route Parameters

| Parameter | Type      | Required | Description                   |
| --------- | --------- | -------- | ----------------------------- |
| `id`      | `integer` | Yes      | The unique ID of the product. |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": {
    "id": 1,
    "name": "وساده مريحه ريضية بعد التعديل",
    "description": "وساده مريحه ريشية",
    "price": 555550.0,
    "currencyId": 1,
    "currencyName": "ريال يمني",
    "categoryId": 3,
    "categoryName": "مفروشات",
    "createdAt": "2026-07-15T14:26:47.8905989Z",
    "updatedAt": "2026-07-15T16:26:45.1436455Z",
    "isActive": true,
    "images": [
      {
        "id": 1,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
        "quantityInStock": 10,
        "isPrimary": true
      },
      {
        "id": 8,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/54b87df0-9007-4aeb-a7ce-8e89c437f931.jpeg",
        "quantityInStock": 1,
        "isPrimary": false
      },
      {
        "id": 9,
        "imageUrl": "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/e96c98c3-8d77-4617-8aa2-57cfa5fd1dd5.jpeg",
        "quantityInStock": 1,
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

---

## 3. Get All Categories (For Filter List)

Retrieves a list of all categories in the system so the frontend can populate the category filter pills at the top of the browsing screen.

- **URL:** `/api/Categories`
- **Method:** `GET`
- **Authentication:** None (Public)

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
      "name": "إلكترونيات"
    },
    {
      "id": 2,
      "name": "ملابس"
    },
    {
      "id": 3,
      "name": "مفروشات"
    }
  ]
}
```

---

## 4. Get All Currencies (For Lookup Mapping)

Retrieves the list of currencies so the frontend can display the currency name for a given `currencyId` on the product browsing cards.

- **URL:** `/api/Currencies`
- **Method:** `GET`
- **Authentication:** None (Public)

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

### Frontend Currency Resolution Example

```javascript
// 1. Fetch currencies once on app load
const currencies = [
  { id: 1, name: "ريال يمني" },
  { id: 2, name: "ريال سعودي" },
];

// 2. Resolve currency name for a product
const getCurrencyName = (currencyId) => {
  const currency = currencies.find((c) => c.id === currencyId);
  return currency ? currency.name : "Unknown Currency";
};

// Example usage:
const productName = "وساده مريحه";
const price = 250;
const currencyId = 2;
console.log(`${price} ${getCurrencyName(currencyId)}`); // Output: "250 ريال سعودي"
```
