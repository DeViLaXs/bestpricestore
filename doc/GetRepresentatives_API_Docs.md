# Get Representatives (with Search) API Documentation & Integration Guide

To optimize performance and simplify state management, the representatives search functionality has been moved from the frontend to the backend. The frontend must no longer retrieve all representatives and filter them locally. Instead, it must pass the search query parameter directly to the API.

---

## Endpoint Details

- **URL:** `/api/Users/representatives`
- **Method:** `GET`
- **Authentication:** Required (Bearer Token, Role: `Admin`)
- **Query Parameters:**
  - `search` (optional, string): The keyword to filter representatives.
    - Matches against **StoreName**, **Location**, or **PhoneNumber** (case-insensitive partial match).
    - If not supplied, all representatives are returned.

---

## Response Schema (200 OK)

Returns an API envelope containing a list of representative profile objects.

```json
{
  "statusCode": 200,
  "success": true,
  "errors": [],
  "data": [
    {
      "id": 18,
      "storeName": "Mukalla Store1",
      "phoneNumber": "777123456",
      "location": "Mukalla",
      "isActive": true
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
// const getAllRepresentatives = () => axios.get('/api/Users/representatives');

// AFTER:
const getAllRepresentatives = (search?: string) => {
  const url = search 
    ? `/api/Users/representatives?search=${encodeURIComponent(search)}` 
    : '/api/Users/representatives';
  return axios.get(url);
};
```

### 2. Connect UI Search Bar to API Request
Trigger a new API fetch when the search input changes. We recommend using a debounce function to prevent firing API requests on every single keystroke.

**Example (React Logic):**
```typescript
import { useState, useEffect } from 'react';
import useDebounce from './hooks/useDebounce'; // Custom debounce hook

const RepresentativesScreen = () => {
  const [reps, setReps] = useState([]);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const response = await getAllRepresentatives(debouncedSearch);
        setReps(response.data.data);
      } catch (err) {
        console.error("Failed to load representatives:", err);
      }
    };
    fetchRepresentatives();
  }, [debouncedSearch]);

  return (
    // Render UI search bar and bind onChange to setSearchText
  );
};
```

### 3. Remove Client-side Filtering Logic
Remove any local filtering loops (e.g. `reps.filter(r => r.storeName.includes(searchText) || r.location.includes(searchText)...)`) from your component as the API response will already be pre-filtered.
