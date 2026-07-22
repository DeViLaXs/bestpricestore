# Frontend Integration Guide: Duplicate Category Name Validation

The category creation endpoint (`POST /api/Categories`) now enforces category name uniqueness. If the frontend attempts to create a category with a name that already exists (case-insensitive and trimmed of whitespace), the backend will reject the request with a `400 Bad Request` status.

---

## API Validation Updates

### Endpoint
* **URL**: `/api/Categories`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <admin-token>`
* **Request Body**:
  ```json
  {
    "name": "Electronics"
  }
  ```

### New Error Response (400 Bad Request)
If a category with the same name already exists in the system:
```json
{
  "statusCode": 400,
  "success": false,
  "errors": [
    "Category with name 'Electronics' already exists."
  ],
  "data": null
}
```

---

## Action Items for Frontend Integration

### 1. Update Category Creation Handler
Modify the UI category creation submission logic to handle API errors, specifically looking for `400 Bad Request` and displaying the backend's descriptive error message (e.g., in a toast or dialog alert).

**Example (TypeScript / JavaScript):**
```typescript
const handleCreateCategory = async (name: string) => {
  try {
    setIsSubmitting(true);
    const response = await axios.post('/api/Categories', { name });
    
    // Success: Category created successfully
    showSuccessToast("Category created successfully!");
    refreshCategoryList();
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      // Duplicate name error or invalid request model
      const apiErrors = error.response.data.errors;
      const errorMessage = apiErrors && apiErrors.length > 0 
        ? apiErrors[0] 
        : "Validation failed.";
      
      showErrorAlert("Creation Failed", errorMessage);
    } else {
      showErrorAlert("Error", "An unexpected error occurred.");
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. Add Pre-submission Client Validation (Optional but Recommended)
To save API calls, you can optionally check if the name entered by the user already exists in your local category list state before triggering the request:
```javascript
const nameExistsLocally = categories.some(
  c => c.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase()
);

if (nameExistsLocally) {
  showErrorAlert("Duplicate Name", "A category with this name already exists locally.");
  return;
}
```
