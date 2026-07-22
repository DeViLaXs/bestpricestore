# Frontend Integration Guide - Soft Delete API Changes

This document outlines the API changes for the soft-delete functionality of products and product images, intended for the frontend developer or an integration model to consume and implement.

---

## 1. Delete a Product (New Endpoint)

A new HTTP endpoint has been added to allow admins to soft-delete a product.

* **Endpoint**: `DELETE /api/products/{id}`
* **Headers**: 
  - `Authorization: Bearer <Admin_Token>`
* **Responses**:
  - `200 OK`: Product and all its images successfully soft-deleted.
    ```json
    {
      "statusCode": 200,
      "success": true,
      "message": "Product and its images have been successfully deleted softly.",
      "data": {
        "message": "Product and its images have been successfully deleted softly."
      }
    }
    ```
  - `404 Not Found`: Product with the specified ID does not exist.
  - `401 Unauthorized` / `403 Forbidden`: Token is missing, invalid, or user is not an Admin.

---

## 2. Product Image Soft Deletion on Product Edit (PUT)

When updating a product and its images via `PUT /api/products/{id}`:

* **No Payload Changes**: The payload format for updating a product remains exactly the same.
* **Backend Behavior Change**: Previously, removing an image from the `images` array in the request payload resulted in a hard delete of the database record and deletion of the asset from Cloudflare R2 storage. Now:
  - Removing an image from the request array will mark it as softly deleted (`IsDeleted = true`) in the database.
  - The image asset is **not** deleted from Cloudflare R2.
  - This allows historical orders referencing the image to still load and display the image correctly.
* **Frontend Recommendation**: Ensure that when a user deletes an image in the UI during an edit, the application sends the updated product images array (excluding the deleted image ID) to the `PUT /api/products/{id}` endpoint as it normally does.

---

## 3. Querying & Display Logic Changes

* **Active Browsing & Search**: Soft-deleted products and soft-deleted product images are automatically filtered out by the backend. They will **not** appear in searches, listings (`GET /api/products`), or product details pages.
* **Order History**: Historical orders returned via order endpoints (`GET /api/orders/{id}`) will continue to display the soft-deleted product name and image URL normally. No frontend changes are needed here.
