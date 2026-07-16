# User API Documentation

This document describes the user management endpoints provided by the `UsersController`. These endpoints are used for updating a user's profile and managing (approving/suspending) users.

---

## 1. Update Profile

Allows an authenticated user to update their own profile details. The User ID is securely extracted from the provided JWT token.

- **URL:** `/api/Users/profile`
- **Method:** `PATCH`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Headers

| Header          | Value                     |
| --------------- | ------------------------- |
| `Authorization` | `Bearer {your_jwt_token}` |
| `Content-Type`  | `application/json`        |

### Request Body

```json
{
  "storeName": "Mukalla Store",
  "phoneNumber": "774474895",
  "location": "Mukalla"
}
```

_Note: All fields are required._

### Responses

**Success (200 OK):**
Profile was successfully updated.

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": {
    "message": "Profile has been successfully updated."
  }
}
```

**Bad Request (400 Bad Request):**
Returned if no changes were made to the profile, or if validation fails.

```json
{
  "statusCode": 400,
  "success": false,
  "errors": null,
  "data": {
    "message": "No changes were made to the profile."
  }
}
```

---

## 2. Approve User

Approves a suspended or unapproved user, granting them access to the platform.

- **URL:** `/api/Users/{id}/approve`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Parameters

| Parameter | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `id`      | `integer` | The internal ID of the user to approve |

### Request Headers

| Header          | Value                      |
| --------------- | -------------------------- |
| `Authorization` | `Bearer {admin_jwt_token}` |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": {
    "message": "User has been successfully approved."
  }
}
```

**Bad Request (400 Bad Request):**
Returned if the user is already approved.

```json
{
  "statusCode": 400,
  "success": false,
  "errors": null,
  "data": {
    "message": "User is already approved."
  }
}
```

---

## 3. Suspend User

Suspends an active user, preventing them from logging in or using the platform.

- **URL:** `/api/Users/{id}/suspend`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Parameters

| Parameter | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `id`      | `integer` | The internal ID of the user to suspend |

### Request Headers

| Header          | Value                      |
| --------------- | -------------------------- |
| `Authorization` | `Bearer {admin_jwt_token}` |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": {
    "message": "User has been successfully suspended."
  }
}
```

**Bad Request (400 Bad Request):**
Returned if the user is already suspended.

```json
{
  "statusCode": 400,
  "success": false,
  "errors": null,
  "data": {
    "message": "User is already suspended."
  }
}
```

---

## 4. Get All Representatives

Retrieves a list of all users who have the role of "Representative". This allows the Admin to view their current status (`isActive`) in order to approve or suspend them.

- **URL:** `/api/Users/representatives`
- **Method:** `GET`
- **Authentication:** Required (Bearer Token)
- **Role Required:** Admin

### Request Headers

| Header          | Value                      |
| --------------- | -------------------------- |
| `Authorization` | `Bearer {admin_jwt_token}` |

### Responses

**Success (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": [
    {
      "id": 2,
      "storeName": "Mukalla Store",
      "phoneNumber": "774474895",
      "location": "Mukalla",
      "isActive": false
    },
    {
      "id": 5,
      "storeName": "Sanaa Supermarket",
      "phoneNumber": "777777777",
      "location": "Sanaa",
      "isActive": true
    }
  ]
}
```
