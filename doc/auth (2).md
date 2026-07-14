# Authentication Endpoints Documentation

This document provides all the necessary details to integrate with the authentication endpoints for the BestPriceStore application, specifically the `/api/Auth/Register` and `/api/Auth/Login` endpoints.

---

## 1. Register Endpoint

- **URL**: `/api/Auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication Required**: No

### Description
This endpoint allows a new user to create an account. Upon successful registration, the user is automatically assigned the role of **"Representative"**, and their account status (`IsActive`) is set to `false` pending administrative approval. 

The response will contain a long-lived JWT token that can be used for subsequent authenticated requests.

### Request Body (RegisterRequestDTO)

```json
{
  "StoreName": "johndoe",
  "PhoneNumber": "+1234567890",
  "Password": "password123",
  "PasswordConfirmation": "password123",
  "Location": "New York, USA"
}
```

#### Field Requirements:
- `StoreName` (string, required): Minimum length 2, maximum length 50.
- `PhoneNumber` (string, required): Valid phone number format, maximum length 100.
- `Password` (string, required): Minimum length 6. No special characters, uppercase, or lowercase letters are strictly required.
- `PasswordConfirmation` (string, required): Must exactly match the `Password` field.
- `Location` (string, optional): The physical location or address of the user.

### Responses

#### Successful Registration (201 Created)
Returns the generated JWT token along with user details.

```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "id": 1,
    "storeName": "johndoe",
    "phoneNumber": "+1234567890",
    "location": "New York, USA",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isActive": false,
    "role": "Representative"
  },
  "errors": null
}
```

#### Validation / Registration Errors (400 Bad Request)
If the request is malformed, passwords do not match, or validation fails (e.g., store name already taken).

```json
{
  "statusCode": 400,
  "success": false,
  "data": null,
  "errors": [
    "Passwords do not match",
    "StoreName 'johndoe' is already taken."
  ]
}
```

---

## 2. Login Endpoint

- **URL**: `/api/Auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication Required**: No

### Description
Authenticates an existing user using their **phone number** and **password**. Upon successful authentication, a JWT token is returned.

### Request Body (LoginRequestDTO)

```json
{
  "PhoneNumber": "+1234567890",
  "Password": "password123"
}
```

#### Field Requirements:
- `PhoneNumber` (string, required): Valid phone number format matching the registered user.
- `Password` (string, required): Minimum length 6.

### Responses

#### Successful Login (200 OK)
Returns the generated JWT token and user details.

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": 1,
    "storeName": "johndoe",
    "phoneNumber": "+1234567890",
    "location": "New York, USA",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isActive": true,
    "role": "Representative"
  },
  "errors": null
}
```

#### Unauthorized (401 Unauthorized)
If the phone number is not found or the password is incorrect.

```json
{
  "statusCode": 401,
  "success": false,
  "data": null,
  "errors": [
    "Invalid phone number or password."
  ]
}
```

---

## 3. Get Current User (Me) Endpoint

- **URL**: `/api/Auth/me`
- **Method**: `GET`
- **Authentication Required**: Yes (Bearer Token)

### Description
Returns the details and role of the currently authenticated user based on their JWT token. This is extremely useful for the frontend to rehydrate user state on page reloads.

### Request Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {your_jwt_token}` |

### Responses

#### Success (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": {
    "id": 1,
    "storeName": "johndoe",
    "phoneNumber": "+1234567890",
    "location": "New York, USA",
    "isActive": true,
    "role": "Representative"
  }
}
```

#### Unauthorized (401 Unauthorized)
If the user's token is invalid, missing, or expired.

---

## Notes for Integrators
- The JWT Token provided in the successful response has an expiration date set 100 years in the future, effectively making it unexpired for testing and long-term agent integrations.
- Always include the token in the `Authorization` header as a Bearer token (`Authorization: Bearer <token>`) when calling protected endpoints.
