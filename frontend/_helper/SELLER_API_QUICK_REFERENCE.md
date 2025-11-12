# Seller API Quick Reference

## 🚀 Quick Start

Base URL: `http://localhost:3000/api/v1/sellers`

---

## Endpoints

### 1️⃣ Get Seller Profile
```bash
GET /api/v1/sellers/:userId
```

**Example:**
```bash
curl http://localhost:3000/api/v1/sellers/3
```

---

### 2️⃣ Get Seller Listings
```bash
GET /api/v1/sellers/:userId/listings
```

**Common Examples:**
```bash
# Active listings
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active"

# Search
curl "http://localhost:3000/api/v1/sellers/3/listings?q=iphone"

# Filter by price
curl "http://localhost:3000/api/v1/sellers/3/listings?minPrice=10000&maxPrice=50000"

# Sort by price
curl "http://localhost:3000/api/v1/sellers/3/listings?sort=price_asc"

# Sold items
curl "http://localhost:3000/api/v1/sellers/3/listings?status=sold"
```

**All Parameters:**
- `q` - Search query
- `categoryId` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `status` - active, sold, expired, pending (default: active)
- `sort` - newest, oldest, price_asc, price_desc (default: newest)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

---

### 3️⃣ Get Seller Reviews
```bash
GET /api/v1/sellers/:userId/reviews
```

**Examples:**
```bash
# First 20 reviews
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=20"

# Pagination
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=20&offset=20"
```

**Parameters:**
- `limit` - Reviews per page (default: 50, max: 100)
- `offset` - Offset for pagination (default: 0)

---

### 4️⃣ Get Seller Statistics
```bash
GET /api/v1/sellers/:userId/stats
```

**Example:**
```bash
curl http://localhost:3000/api/v1/sellers/3/stats
```

**Returns:**
- total_sales
- total_revenue
- average_rating
- total_reviews
- active_listings
- total_listings
- days_active
- response_rate
- trust_score

---

## JavaScript/Axios Examples

```javascript
const API = 'http://localhost:3000/api/v1';

// Get seller profile
const profile = await axios.get(`${API}/sellers/${sellerId}`);

// Get active listings
const listings = await axios.get(`${API}/sellers/${sellerId}/listings`, {
  params: { status: 'active', page: 1, limit: 20 }
});

// Search listings
const search = await axios.get(`${API}/sellers/${sellerId}/listings`, {
  params: { q: 'iphone', status: 'active' }
});

// Get reviews
const reviews = await axios.get(`${API}/sellers/${sellerId}/reviews`, {
  params: { limit: 20, offset: 0 }
});

// Get stats
const stats = await axios.get(`${API}/sellers/${sellerId}/stats`);
```

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "pagination": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (seller doesn't exist)
- `500` - Internal Server Error

---

## Complete Shop Page Load

```javascript
// Load everything for a shop profile page
const sellerId = 3;

const [profile, stats, listings, reviews] = await Promise.all([
  axios.get(`${API}/sellers/${sellerId}`),
  axios.get(`${API}/sellers/${sellerId}/stats`),
  axios.get(`${API}/sellers/${sellerId}/listings?status=active&limit=20`),
  axios.get(`${API}/sellers/${sellerId}/reviews?limit=10`)
]);
```

---

## Testing

Start the server:
```bash
npm start
# or
node server.js
```

Test endpoints:
```bash
# Health check
curl http://localhost:3000/

# Test seller profile
curl http://localhost:3000/api/v1/sellers/3

# Test with filtering
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active&sort=price_asc"
```

---

## Files

- **Routes:** `src/routes/sellerRouter.js`
- **Controllers:** `src/controllers/sellerControllers.js`
- **Reviews Controller:** `src/controllers/reviewControllers.js`
- **Server:** `server.js`

---

## Documentation

- **Full Testing Guide:** `SELLER_API_TESTING.md`
- **Implementation Summary:** `SELLER_API_IMPLEMENTATION_SUMMARY.md`
- **Requirements:** `API_REQUIREMENTS_EN.md`
