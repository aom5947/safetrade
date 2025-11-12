# API Endpoints Required for Seller Profile System

## 📊 Overview

After analyzing the `API_EXAMPLES.md` file, we found that **the current API lacks endpoints for Public Seller Profile View**. These endpoints are necessary for users to view seller information, products, and reviews.

---

## 🔍 Existing APIs vs Required APIs

### ✅ Existing APIs (Partially Usable)
- `GET /api/v1/listings` - Get all listings (but no seller filtering)
- `GET /api/v1/listings/:id` - Get listing details
- `GET /api/v1/reviews?listingId=X` - Get reviews for a listing (but not aggregated by seller)

### ❌ Missing APIs (Need to Add)
- View seller profile with statistics
- Get all listings from a seller (filtered by status)
- Get aggregated reviews for a seller (from all products)
- Detailed seller statistics

---

## 📋 API Endpoints to Add

### Priority 1: Must Have (REQUIRED)

---

## 1️⃣ Get Seller Profile

### Endpoint
```http
GET /api/v1/sellers/:userId
```

### 🎯 Why Add This?
- **No existing API provides public seller profile view**
- Need to display basic seller information and statistics
- Need to verify if seller exists and is active
- Required for Shop Profile header display

### 📦 Use Cases
**Usage Scenarios:**
- Display seller name, avatar, registration date
- Show basic statistics: total listings, sold items, active days
- Verify seller is still active

**Frontend Usage:**
```javascript
// When accessing /shop/:sellerId page
useEffect(() => {
  const fetchSellerProfile = async () => {
    const response = await axios.get(`/api/v1/sellers/${sellerId}`);
    setSeller(response.data.seller);
  };
  fetchSellerProfile();
}, [sellerId]);
```

### Request Example
```bash
curl http://localhost:3000/api/v1/sellers/3
```

### Response Example
```json
{
  "success": true,
  "seller": {
    "user_id": 3,
    "username": "seller1",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z",
    "stats": {
      "total_listings": 15,
      "sold_count": 8,
      "active_listings": 7,
      "days_active": 9
    }
  }
}
```

### Error Responses
```json
// 404 - Seller not found
{
  "success": false,
  "message": "Seller not found"
}

// 404 - User is not a seller
{
  "success": false,
  "message": "Seller not found"
}
```

---

## 2️⃣ Get Seller's Listings

### Endpoint
```http
GET /api/v1/sellers/:userId/listings
```

### 🎯 Why Add This?
- **Current API** (`GET /api/v1/listings?sellerId=X`) **doesn't support sellerId filtering**
- Need to display products from a specific seller only
- Need to separate active and sold listings
- Need to search within seller's shop
- Need pagination for large product catalogs

### 📦 Use Cases
**Usage Scenarios:**
- "Active Listings" tab - show active products
- "Sold Items" tab - show sold products
- Search within shop
- Sorting and pagination

**Frontend Usage:**
```javascript
// When clicking "Active Listings" tab
const fetchActiveListings = async () => {
  const response = await axios.get(`/api/v1/sellers/${sellerId}/listings`, {
    params: {
      status: 'active',
      page: 1,
      limit: 20
    }
  });
  setListings(response.data.listings);
};

// When searching products
const searchListings = async (query) => {
  const response = await axios.get(`/api/v1/sellers/${sellerId}/listings`, {
    params: {
      status: 'active',
      q: query,
      page: 1
    }
  });
  setListings(response.data.listings);
};
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | active | "active" or "sold" |
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max 50) |
| q | string | No | - | Search query (title, description) |

### Request Examples
```bash
# Get active listings
curl "http://localhost:3000/api/v1/sellers/3/listings?status=active"

# Get sold listings
curl "http://localhost:3000/api/v1/sellers/3/listings?status=sold"

# Search listings
curl "http://localhost:3000/api/v1/sellers/3/listings?q=iphone"

# Pagination
curl "http://localhost:3000/api/v1/sellers/3/listings?page=2&limit=10"
```

### Response Example
```json
{
  "success": true,
  "listings": [
    {
      "listing_id": 1,
      "seller_id": 3,
      "category_id": 2,
      "title": "iPhone 15 Pro Max",
      "description": "Brand new, first owner",
      "price": 42000,
      "status": "active",
      "images": ["https://utfs.io/f/abc123.jpg"],
      "location": "Bangkok",
      "created_at": "2025-01-15T10:30:00.000Z",
      "category_name": "Mobile & Tablets",
      "category_slug": "electronics",
      "seller_username": "seller1",
      "seller_avatar": "https://example.com/avatar.jpg",
      "save_count": 5,
      "avg_rating": 4.5,
      "review_count": 3
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 3️⃣ Get Seller's Reviews

### Endpoint
```http
GET /api/v1/sellers/:userId/reviews
```

### 🎯 Why Add This?
- **Current API** (`GET /api/v1/reviews?listingId=X`) **only supports single listing reviews**
- Need to view aggregated reviews from all seller's products
- Need to calculate seller's average rating
- Need to show all review history in one place

### 📦 Use Cases
**Usage Scenarios:**
- "Reviews" tab - show all seller reviews
- Display seller's average rating
- Show total review count
- Pagination for large review lists

**Frontend Usage:**
```javascript
// When clicking "Reviews" tab
const fetchSellerReviews = async () => {
  const response = await axios.get(`/api/v1/sellers/${sellerId}/reviews`, {
    params: {
      page: 1,
      limit: 20
    }
  });
  setReviews(response.data.reviews);
  setReviewStats(response.data.stats);
};

// Display average rating
<div>
  ⭐ {reviewStats.average_rating.toFixed(1)} 
  ({reviewStats.total_reviews} reviews)
</div>
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |

### Request Example
```bash
curl "http://localhost:3000/api/v1/sellers/3/reviews?page=1&limit=20"
```

### Response Example
```json
{
  "success": true,
  "reviews": [
    {
      "review_id": 1,
      "listing_id": 5,
      "listing_title": "iPhone 15 Pro Max",
      "user_id": 10,
      "reviewer_username": "buyer1",
      "reviewer_avatar": "https://example.com/avatar.jpg",
      "rating": 5,
      "comment": "Great product, fast shipping, kind seller",
      "status": "approved",
      "created_at": "2025-01-20T14:30:00.000Z"
    },
    {
      "review_id": 2,
      "listing_id": 8,
      "listing_title": "AirPods Pro",
      "user_id": 12,
      "reviewer_username": "buyer2",
      "reviewer_avatar": null,
      "rating": 4,
      "comment": "Good product but shipping was a bit slow",
      "status": "approved",
      "created_at": "2025-01-18T10:15:00.000Z"
    }
  ],
  "stats": {
    "total_reviews": 23,
    "average_rating": 4.6
  },
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

### Priority 2: Should Have (RECOMMENDED)

---

## 4️⃣ Detailed Seller Statistics

### Endpoint
```http
GET /api/v1/sellers/:userId/stats
```

### 🎯 Why Add This?
- **First endpoint provides basic stats** but lacks detailed insights
- Need to display total revenue
- Need accurate average rating
- May add response rate, response time (if messaging system exists)

### 📦 Use Cases
**Usage Scenarios:**
- Display additional statistics on profile page
- Use for analytics
- Show badges or achievements

**Frontend Usage:**
```javascript
const fetchSellerStats = async () => {
  const response = await axios.get(`/api/v1/sellers/${sellerId}/stats`);
  setStats(response.data.stats);
};

// Display statistics
<div>
  <p>Total Revenue: ${stats.total_revenue.toLocaleString()}</p>
  <p>Total Sales: {stats.total_sales} items</p>
  <p>Average Rating: {stats.average_rating.toFixed(1)} ⭐</p>
</div>
```

### Request Example
```bash
curl http://localhost:3000/api/v1/sellers/3/stats
```

### Response Example
```json
{
  "success": true,
  "stats": {
    "total_sales": 8,
    "total_revenue": 156000,
    "average_rating": 4.6,
    "total_reviews": 23,
    "response_rate": 95,
    "average_response_time": 120
  }
}
```

---

### Priority 3: Nice to Have (OPTIONAL)

---

## 5️⃣ Follow/Unfollow Seller

### Endpoints
```http
POST /api/v1/sellers/:userId/follow
DELETE /api/v1/sellers/:userId/unfollow
```

### 🎯 Why Add This?
- Increase engagement between buyers and sellers
- Notify when seller posts new products
- Build community and loyalty

### 📦 Use Cases
```javascript
const handleFollow = async () => {
  await axios.post(`/api/v1/sellers/${sellerId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setIsFollowing(true);
};

const handleUnfollow = async () => {
  await axios.delete(`/api/v1/sellers/${sellerId}/unfollow`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setIsFollowing(false);
};
```

---

## 6️⃣ Check Follow Status

### Endpoint
```http
GET /api/v1/sellers/:userId/is-following
```

### 🎯 Why Add This?
- Check if current user follows this seller
- Display "Follow" or "Following" button

### Response Example
```json
{
  "success": true,
  "isFollowing": true
}
```

---

## 7️⃣ Get Follower Count

### Endpoint
```http
GET /api/v1/sellers/:userId/followers-count
```

### 🎯 Why Add This?
- Show seller credibility
- Display shop popularity

### Response Example
```json
{
  "success": true,
  "followersCount": 1234
}
```

---

## 📊 API Summary

### Required (Must Have Before Launch)
✅ **Priority 1:**
1. `GET /api/v1/sellers/:userId` - Seller profile
2. `GET /api/v1/sellers/:userId/listings` - Seller's listings
3. `GET /api/v1/sellers/:userId/reviews` - Seller's reviews

### Recommended (Improves User Experience)
⭐ **Priority 2:**
4. `GET /api/v1/sellers/:userId/stats` - Detailed statistics

### Optional (Future Enhancement)
💡 **Priority 3:**
5. `POST /api/v1/sellers/:userId/follow` - Follow seller
6. `DELETE /api/v1/sellers/:userId/unfollow` - Unfollow seller
7. `GET /api/v1/sellers/:userId/is-following` - Check follow status
8. `GET /api/v1/sellers/:userId/followers-count` - Follower count

---

## 🔄 Alternative: Use Existing APIs

### Option: Instead of Adding New Endpoints

If you prefer not to add new endpoints, you can **enhance existing APIs**:

#### 1. Add sellerId parameter to GET /api/v1/listings
```http
GET /api/v1/listings?sellerId=3&status=active
```
**Pros:** No new endpoints needed
**Cons:** No seller profile and statistics data

#### 2. Add sellerId parameter to GET /api/v1/reviews
```http
GET /api/v1/reviews?sellerId=3
```
**Pros:** Uses existing API structure
**Cons:** Doesn't aggregate reviews from all seller's products

### ⚠️ Recommendation
**Should add new endpoints** (`/api/v1/sellers/*`) because:
- Clear indication of public seller view
- Doesn't complicate existing APIs
- Easier to maintain and add features
- Better RESTful design

---

## 🛠️ Required Database Schema

### users table
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url TEXT,
  user_role ENUM('buyer', 'seller', 'admin', 'super_admin'),
  status ENUM('active', 'suspended', 'deleted'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### listings table
```sql
CREATE TABLE listings (
  listing_id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  category_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'sold', 'deleted'),
  images JSON,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(user_id)
);
```

### reviews table
```sql
CREATE TABLE reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  status ENUM('pending', 'approved', 'spam'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### seller_followers table (Optional - for Priority 3)
```sql
CREATE TABLE seller_followers (
  follower_id INT NOT NULL,
  seller_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, seller_id),
  FOREIGN KEY (follower_id) REFERENCES users(user_id),
  FOREIGN KEY (seller_id) REFERENCES users(user_id)
);
```

---

## 📝 Implementation Checklist

### Backend Developer
- [ ] Create `routes/sellerRoutes.js` file
- [ ] Implement endpoint 1: `GET /sellers/:userId`
- [ ] Implement endpoint 2: `GET /sellers/:userId/listings`
- [ ] Implement endpoint 3: `GET /sellers/:userId/reviews`
- [ ] Implement endpoint 4: `GET /sellers/:userId/stats` (optional)
- [ ] Add routes to `server.js`
- [ ] Test all endpoints with Postman/cURL
- [ ] Update `API_EXAMPLES.md`
- [ ] Setup error handling and validation

### Frontend Developer
- [ ] Update `ShopProfile.jsx` component
- [ ] Integrate API endpoints
- [ ] Implement loading states
- [ ] Implement error handling
- [ ] Test pagination
- [ ] Test search functionality
- [ ] Test all tabs (Active/Reviews/Sold)
- [ ] Responsive design testing

### QA Testing
- [ ] Test fetching existing seller data
- [ ] Test fetching non-existent seller (404)
- [ ] Test fetching active/sold listings separately
- [ ] Test pagination
- [ ] Test search functionality
- [ ] Test performance (sellers with many products)
- [ ] Test error scenarios

---

## 🎯 Recommended Timeline

### Week 1: Core APIs (Priority 1)
- Day 1-2: Implement `GET /sellers/:userId`
- Day 3-4: Implement `GET /sellers/:userId/listings`
- Day 5: Implement `GET /sellers/:userId/reviews`

### Week 2: Integration & Testing
- Day 1-2: Frontend integration
- Day 3-4: Testing & bug fixing
- Day 5: Deploy to staging

### Week 3: Optional Features (Priority 2-3)
- Implement additional endpoints as needed

---

## 💡 Best Practices

### 1. Caching
```javascript
// Cache seller profile data that rarely changes
app.get('/api/v1/sellers/:userId', cache(300), sellerController.getProfile);
```

### 2. Rate Limiting
```javascript
// Limit API calls
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/v1/sellers', limiter);
```

### 3. Validation
```javascript
// Validate sellerId
if (!userId || isNaN(userId)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid seller ID'
  });
}
```

### 4. Optimization
```javascript
// Use LEFT JOIN instead of multiple queries
// Use indexes on seller_id, status columns
// Limit response size with pagination
```

---

## 📚 References

- [API_EXAMPLES.md](./API_EXAMPLES.md) - Current API documentation
- [seller-profile-routes.js](./seller-profile-routes.js) - Backend implementation
- [ShopProfileComplete.jsx](./ShopProfileComplete.jsx) - Frontend component
- [SELLER_PROFILE_SETUP_GUIDE.md](./SELLER_PROFILE_SETUP_GUIDE.md) - Setup guide

---

**Created by:** Claude
**Date:** November 2025
**Version:** 1.0
