# Categories API Documentation

This document describes the category management endpoints provided by the `CategoriesController`. These endpoints allow fetching, creating, updating, and deleting product categories. 

> [!NOTE]
> Read operations (`GET`) are public, while write operations (`POST`, `PUT`, `DELETE`) are strictly locked to the `Admin` role.

---

## 1. Get All Categories

Retrieves a list of all categories in the system.

- **URL:** `/api/Categories`
- **Method:** `GET`
- **Authentication:** None required (Publicly accessible)

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
      "name": "Electronics"
    },
    {
      "id": 2,
      "name": "Clothing"
    }
  ]
}
```

## 2. Create Category

Creates a new category.

- **URL:** `/api/Categories`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {admin_jwt_token}` |
| `Content-Type` | `application/json` |

### Request Body
```json
{
  "name": "Home Appliances"
}
```
*Note: `name` is required and limited to 255 characters.*

### Responses

**Success (201 Created):**
```json
{
  "statusCode": 201,
  "success": true,
  "errors": null,
  "data": {
    "id": 3,
    "name": "Home Appliances"
  }
}
```

---

## 3. Update Category

Updates an existing category's name.

- **URL:** `/api/Categories/{id}`
- **Method:** `PUT`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | The ID of the category to update |

### Request Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {admin_jwt_token}` |
| `Content-Type` | `application/json` |

### Request Body
```json
{
  "name": "Smart Home Appliances"
}
```

### Responses

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": {
    "id": 3,
    "name": "Smart Home Appliances"
  }
}
```

**Not Found (404 Not Found):**
Returned if the category to update does not exist.

---

## 4. Delete Category

Deletes an existing category. 

> [!WARNING]
> Deleting a category will cascade and automatically delete all `Products`, `ProductImages`, and `CartItems` associated with it. If any products in this category have been ordered, those specific `OrderProduct` records will be deleted first to prevent conflicts, protecting the rest of the database structure.

- **URL:** `/api/Categories/{id}`
- **Method:** `DELETE`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | The ID of the category to delete |

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
  "errors": null,
  "data": {
    "message": "Category has been successfully deleted."
  }
}
```

**Not Found (404 Not Found):**
Returned if the category to delete does not exist.
