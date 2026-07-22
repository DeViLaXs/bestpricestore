# Get All Categories (with Search) API Documentation & Integration Guide

To optimize app performance and support dynamic lookups, the category search functionality has been moved from the frontend to the backend. The frontend should no longer retrieve all categories and filter them locally. Instead, it must pass the search query directly to the API endpoint.

---

## Endpoint Details

- **URL:** `/api/Categories`
- **Method:** `GET`
- **Authentication:** None required (Publicly accessible)
- **Query Parameters:**
  - `search` (optional, string): The keyword to filter categories by name. Matches category names containing the search term (case-insensitive).
    - If not supplied, all categories are returned.

---

## Response Schema (200 OK)

Returns an API envelope containing a list of category objects.

```json
{
  "statusCode": 200,
  "success": true,
  "errors": null,
  "data": [
    {
      "id": 1,
      "name": "Electronics"
    }
  ]
}
```

---

## Action Items for Frontend Integration

### 1. Update API Request Function
Modify your API call function to accept the optional search parameter.

**Example (TypeScript / JavaScript):**
```typescript
// BEFORE:
// const getAllCategories = () => axios.get('/api/Categories');

// AFTER:
const getAllCategories = (search?: string) => {
  const url = search ? `/api/Categories?search=${encodeURIComponent(search)}` : '/api/Categories';
  return axios.get(url);
};
```

### 2. Connect UI Search Bar to API Request
Trigger a new API fetch when the search input text changes. We recommend using a debounce function to prevent firing API requests on every single keystroke.

**Example (React Logic):**
```typescript
import { useState, useEffect } from 'react';
import useDebounce from './hooks/useDebounce'; // Custom debounce hook

const CategoryListScreen = () => {
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(debouncedSearch);
        setCategories(response.data.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, [debouncedSearch]);

  return (
    // Render UI search bar and bind onChange to setSearchText
  );
};
```

### 3. Remove Client-side Filtering Logic
Remove any local state filter loops (e.g. `categories.filter(c => c.name.includes(searchText))`) since the API now returns the pre-filtered subset of categories directly.
