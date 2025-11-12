# Seller Profile API Testing Guide

## Overview
This guide demonstrates how to test all the Seller Profile APIs that have been implemented.

## Base URL
```
http://localhost:3000/api/v1
```

---

## API Endpoints Implemented

### ✅ Priority 1: Must Have (COMPLETED)

#### 1. Get Seller Profile
**Endpoint:** `GET /api/v1/sellers/:userId`

**Description:** Get basic seller information with statistics

**Example Request:**
```bash
curl http://localhost:3000/api/v1/sellers/3
```

**Example Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลผู้ขายสำเร็จ",
  "data": {
    "user_id": 3,
    "username": "seller1",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "rating_average": 4.5,
    "rating_count": 23,
    "trust_score": 85.50,
    "created_at": "2025-01-15T10:30:00.000Z",
    "listing_count": 15
  }
}
```

**Error Cases:**
```bash
# User not found or not a seller
curl http://localhost:3000/api/v1/sellers/999

# Response:
{
  "success": false,
  "message": "ไม่พบผู้ขายรายนี้"
}

# Invalid user ID
curl http://localhost:3000/api/v1/sellers/abc

# Response:
{
  "success": false,
  "message": "User ID ไม่ถูกต้อง"
}
```

---

#### 2. Get Seller's Listings
**Endpoint:** `GET /api/v1/sellers/:userId/listings`

**Description:** Get seller's product listings with advanced filtering, search, and pagination

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | - | Search query (title, description) |
| categoryId | number | - | Filter by category |
| minPrice | number | - | Minimum price |
| maxPrice | number | - | Maximum price |
| status | string | active | "active", "sold", "expired", "pending" |
| sort | string | newest | "newest", "oldest", "price_asc", "price_desc" |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |

**Example Requests:**

```bash
# Get active listings
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active"

# Get sold listings
curl "http://localhost:3000/api/v1/sellers/3/listings?status=sold"

# Search within seller's shop
curl "http://localhost:3000/api/v1/sellers/3/listings?q=iphone&status=active"

# Filter by price range
curl "http://localhost:3000/api/v1/sellers/3/listings?minPrice=10000&maxPrice=50000"

# Sort by price ascending
curl "http://localhost:3000/api/v1/sellers/3/listings?sort=price_asc"

# Pagination
curl "http://localhost:3000/api/v1/sellers/3/listings?page=2&limit=10"

# Combined filters
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active&categoryId=2&minPrice=5000&sort=price_desc&page=1&limit=20"
```

**Example Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศของผู้ขายสำเร็จ",
  "data": [
    {
      "listing_id": 1,
      "seller_id": 3,
      "category_id": 2,
      "title": "iPhone 15 Pro Max 256GB",
      "description": "Brand new, first owner, with box",
      "price": 42000.00,
      "location": "Bangkok",
      "location_lat": 13.7563,
      "location_lng": 100.5018,
      "status": "active",
      "view_count": 150,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z",
      "expires_at": "2025-02-15T10:30:00.000Z",
      "category_name": "Mobile & Tablets",
      "category_icon": "📱",
      "images": [
        {
          "image_id": 1,
          "image_url": "https://utfs.io/f/abc123.jpg",
          "display_order": 1
        }
      ]
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

#### 3. Get Seller's Reviews
**Endpoint:** `GET /api/v1/sellers/:userId/reviews`

**Description:** Get all reviews for a seller (aggregated from all their listings)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Reviews per page (max 100) |
| offset | number | 0 | Offset for pagination |

**Example Requests:**

```bash
# Get seller reviews (first page)
curl "http://localhost:3000/api/v1/sellers/3/reviews"

# Get with custom limit
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=20"

# Pagination
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=20&offset=20"
```

**Example Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลรีวิวของผู้ขายสำเร็จ",
  "data": [
    {
      "review_id": 1,
      "rating": 5,
      "comment": "Great seller! Fast shipping and good communication",
      "is_spam": false,
      "created_at": "2025-01-20T14:30:00.000Z",
      "listing_id": 5,
      "listing_title": "iPhone 15 Pro Max",
      "reviewer_id": 10,
      "reviewer_username": "buyer1",
      "reviewer_first_name": "Jane",
      "reviewer_last_name": "Smith",
      "reviewer_avatar": "https://example.com/avatar2.jpg"
    },
    {
      "review_id": 2,
      "rating": 4,
      "comment": "Good product, packaging could be better",
      "is_spam": false,
      "created_at": "2025-01-18T10:15:00.000Z",
      "listing_id": 8,
      "listing_title": "AirPods Pro",
      "reviewer_id": 12,
      "reviewer_username": "buyer2",
      "reviewer_first_name": "Mike",
      "reviewer_last_name": "Johnson",
      "reviewer_avatar": null
    }
  ],
  "sellerRating": {
    "average": 4.6,
    "count": 23
  },
  "pagination": {
    "total": 23,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### ✅ Priority 2: Recommended (COMPLETED)

#### 4. Get Seller Statistics
**Endpoint:** `GET /api/v1/sellers/:userId/stats`

**Description:** Get detailed seller statistics including revenue, sales, ratings, and activity metrics

**Example Request:**
```bash
curl http://localhost:3000/api/v1/sellers/3/stats
```

**Example Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูลสถิติผู้ขายสำเร็จ",
  "stats": {
    "total_sales": 8,
    "total_revenue": 156000.00,
    "average_rating": 4.6,
    "total_reviews": 23,
    "active_listings": 7,
    "total_listings": 15,
    "days_active": 9,
    "response_rate": 95,
    "trust_score": 85.50
  }
}
```

**Statistics Breakdown:**
- `total_sales`: Number of items sold
- `total_revenue`: Total revenue from all sold items (in THB)
- `average_rating`: Average rating from all reviews (0-5)
- `total_reviews`: Total number of reviews received
- `active_listings`: Number of currently active listings
- `total_listings`: Total number of all listings (active + sold + others)
- `days_active`: Number of days since account creation
- `response_rate`: Percentage of conversations the seller has responded to
- `trust_score`: Seller's trust score (0-100)

---

## Testing with JavaScript/Axios

### Frontend Integration Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// 1. Fetch seller profile
const fetchSellerProfile = async (sellerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sellers/${sellerId}`);
    console.log('Seller Profile:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller profile:', error.response?.data);
  }
};

// 2. Fetch seller listings with filters
const fetchSellerListings = async (sellerId, options = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sellers/${sellerId}/listings`, {
      params: {
        status: options.status || 'active',
        q: options.searchQuery,
        categoryId: options.categoryId,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        sort: options.sort || 'newest',
        page: options.page || 1,
        limit: options.limit || 20
      }
    });
    console.log('Listings:', response.data.data);
    console.log('Pagination:', response.data.pagination);
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error.response?.data);
  }
};

// 3. Fetch seller reviews
const fetchSellerReviews = async (sellerId, limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sellers/${sellerId}/reviews`, {
      params: { limit, offset }
    });
    console.log('Reviews:', response.data.data);
    console.log('Seller Rating:', response.data.sellerRating);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error.response?.data);
  }
};

// 4. Fetch seller statistics
const fetchSellerStats = async (sellerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sellers/${sellerId}/stats`);
    console.log('Statistics:', response.data.stats);
    return response.data.stats;
  } catch (error) {
    console.error('Error fetching stats:', error.response?.data);
  }
};

// Example usage in a React component
const ShopProfilePage = ({ sellerId }) => {
  useEffect(() => {
    const loadSellerData = async () => {
      // Load all seller data in parallel
      const [profile, stats, listings, reviews] = await Promise.all([
        fetchSellerProfile(sellerId),
        fetchSellerStats(sellerId),
        fetchSellerListings(sellerId, { status: 'active', page: 1, limit: 20 }),
        fetchSellerReviews(sellerId, 10, 0)
      ]);

      // Use the data to populate UI
      console.log({ profile, stats, listings, reviews });
    };

    loadSellerData();
  }, [sellerId]);
};
```

---

## Testing Scenarios

### Scenario 1: User visits a seller's shop page
```bash
# Step 1: Get seller profile
curl http://localhost:3000/api/v1/sellers/3

# Step 2: Get seller stats (for header display)
curl http://localhost:3000/api/v1/sellers/3/stats

# Step 3: Get active listings (default tab)
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active&page=1&limit=20"

# Step 4: Get reviews preview
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=5"
```

### Scenario 2: User searches within seller's shop
```bash
# User searches for "iphone"
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active&q=iphone"
```

### Scenario 3: User filters by category and price
```bash
# User filters: Electronics category, price 10,000-50,000 THB
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active&categoryId=2&minPrice=10000&maxPrice=50000&sort=price_asc"
```

### Scenario 4: User views sold items tab
```bash
# Switch to sold items tab
curl "http://localhost:3000/api/v1/sellers/3/listings?status=sold&page=1"
```

### Scenario 5: User views all reviews
```bash
# Load reviews page
curl "http://localhost:3000/api/v1/sellers/3/reviews?limit=20&offset=0"
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "User ID ไม่ถูกต้อง"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "ไม่พบผู้ขายรายนี้"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ขาย"
}
```

---

## Performance Considerations

### Optimizations Implemented:
1. **Database Indexing**: All foreign keys and frequently queried fields have indexes
2. **Pagination**: All list endpoints support pagination to limit data transfer
3. **Efficient Queries**: Uses LEFT JOIN and aggregation for optimal performance
4. **Filtering**: Database-level filtering reduces data processing
5. **Image Aggregation**: Images are aggregated using JSON functions

### Recommended Caching Strategy:
```javascript
// Cache seller profile (changes infrequently)
// Cache TTL: 5 minutes
app.get('/api/v1/sellers/:userId', cache(300), getSellerProfile);

// Cache stats (can be slightly outdated)
// Cache TTL: 2 minutes
app.get('/api/v1/sellers/:userId/stats', cache(120), getSellerStats);
```

---

## Complete Feature Checklist

### ✅ Implemented Features

**Priority 1 (Must Have):**
- [x] GET /api/v1/sellers/:userId - Seller profile
- [x] GET /api/v1/sellers/:userId/listings - Seller's listings with:
  - [x] Search functionality (title, description)
  - [x] Category filtering
  - [x] Price range filtering
  - [x] Status filtering (active, sold, expired, pending)
  - [x] Sorting (newest, oldest, price_asc, price_desc)
  - [x] Pagination
- [x] GET /api/v1/sellers/:userId/reviews - Aggregated seller reviews

**Priority 2 (Recommended):**
- [x] GET /api/v1/sellers/:userId/stats - Detailed statistics

**Additional Features:**
- [x] Input validation for all endpoints
- [x] Error handling with appropriate status codes
- [x] Comprehensive JSDoc documentation
- [x] Database indexes for performance
- [x] Response rate calculation
- [x] Trust score display

### 🔮 Future Enhancements (Priority 3)

**Follow System:**
- [ ] POST /api/v1/sellers/:userId/follow
- [ ] DELETE /api/v1/sellers/:userId/unfollow
- [ ] GET /api/v1/sellers/:userId/is-following
- [ ] GET /api/v1/sellers/:userId/followers-count

**Additional Stats:**
- [ ] Average response time (when messaging timestamps available)
- [ ] Response time trends
- [ ] Sales velocity metrics

---

## Database Schema Requirements

The following tables are required and already exist:

```sql
-- users table (with seller role)
-- listings table (with seller_id foreign key)
-- reviews table (with reviewed_user_id for seller reviews)
-- conversations table (for response rate calculation)
-- messages table (for response metrics)
-- categories table (for filtering)
-- listing_images table (for product images)
```

All required indexes are in place for optimal query performance.

---

## Summary

All **Priority 1 (Must Have)** and **Priority 2 (Recommended)** seller profile APIs have been successfully implemented and are ready for production use!

**API Endpoints Available:**
1. ✅ GET /api/v1/sellers/:userId
2. ✅ GET /api/v1/sellers/:userId/listings (with full filtering & pagination)
3. ✅ GET /api/v1/sellers/:userId/reviews
4. ✅ GET /api/v1/sellers/:userId/stats

**Ready for Frontend Integration!** 🚀
