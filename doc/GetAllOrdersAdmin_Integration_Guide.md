# Frontend Integration Guide: Server-Side Admin Orders Search & Filtering

To improve performance and handle large volumes of orders, the search (by store name/order number) and status filtering for the Admin Orders screen have been moved from the frontend to the backend. The frontend must no longer load all orders to perform local searching/filtering. Instead, it must pass search queries and status filters as query parameters to the API.

## API Changes

### Endpoint
* **URL**: `/api/admin/orders`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <admin-token>`
* **Query Parameters**:
  * `search` (optional, string): The keyword entered by the admin in the search box.
    * If the keyword is a number (e.g. `27`), the backend matches the specific **Order Number** (ID).
    * If the keyword is text (e.g. `Mukalla`), the backend searches the client's **StoreName** (case-insensitive partial match).
  * `orderStatusId` (optional, integer): Filters by status ID (e.g. `1` = Pending, `2` = Processing, `3` = Shipped, `4` = Delivered, `5` = Cancelled).

---

## Action Items for Frontend Integration

### 1. Update API Request Function
Modify your API call function for getting admin orders to accept the optional search and status parameters.

**Example (TypeScript / JavaScript):**
```typescript
// BEFORE:
// const getAllAdminOrders = () => axios.get('/api/admin/orders');

// AFTER:
const getAllAdminOrders = (search?: string, orderStatusId?: number) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (orderStatusId) params.append('orderStatusId', orderStatusId.toString());

  return axios.get(`/api/admin/orders?${params.toString()}`);
};
```

### 2. Connect UI Search Input and Tab Filters to API Requests
Instead of applying filtering and searching on a local state array, trigger a new API call whenever the search input changes (with debouncing recommended) or the status tab changes.

**Example (React Logic):**
```typescript
import { useState, useEffect } from 'react';
import useDebounce from './hooks/useDebounce'; // Custom or utility hook

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  
  // Debounce search text changes to prevent calling API on every keystroke
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllAdminOrders(debouncedSearch, selectedStatusId || undefined);
        setOrders(response.data.data);
      } catch (err) {
        console.error("Error retrieving admin orders:", err);
      }
    };
    fetchOrders();
  }, [debouncedSearch, selectedStatusId]);

  return (
    // Your UI components here
    // Bind input onChange -> setSearchText
    // Bind Tab click -> setSelectedStatusId
  );
};
```

### 3. Remove Local Filtering and Search Logic
Remove any client-side filtering code like `orders.filter(o => o.id === search || o.storeName.includes(search)...)` from your list rendering to clean up codebase footprint and avoid redundant logic.
