## Listing Endpoints

### 9. Get All Listings (Public)

Get all active listings with optional filters and pagination.

**Request:**

```http
GET /api/v1/listings?q=iphone&categoryId=2&minPrice=1000&maxPrice=50000&location=Bangkok&sort=newest&page=1&limit=20
```

**Query Parameters:**

- `q` (optional): Search keyword (searches in title and description)
- `categoryId` (optional): Filter by category ID
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `location` (optional): Filter by location
- `sort` (optional): Sort order (`newest`, `price_low`, `price_high`, `most_viewed`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**cURL:**

```bash
curl "http://localhost:3000/api/v1/listings?q=iphone&categoryId=2&minPrice=1000&maxPrice=50000&sort=newest&page=1&limit=20"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศสำเร็จ",
  "listings": [
    {
      "listing_id": 1,
      "seller_id": 3,
      "seller_username": "seller1",
      "category_id": 2,
      "category_name": "Phones",
      "title": "iPhone 14 Pro Max 256GB",
      "description": "Like new condition, used for 3 months",
      "price": 35000.0,
      "location": "Bangkok",
      "location_lat": null,
      "location_lng": null,
      "status": "active",
      "view_count": 150,
      "contact_count": 5,
      "images": [
        {
          "image_id": 1,
          "image_url": "https://uploadthing.com/image1.jpg",
          "display_order": 1
        }
      ],
      "created_at": "2025-01-10T08:00:00.000Z",
      "updated_at": "2025-01-10T08:00:00.000Z",
      "expires_at": "2025-02-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20
  }
}
```

---

### 10. Get Single Listing (Public)

Get detailed information about a specific listing.

**Request:**

```http
GET /api/v1/listings/1
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/listings/1
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศสำเร็จ",
  "listing": {
    "listing_id": 1,
    "seller_id": 3,
    "seller_username": "seller1",
    "seller_first_name": "ผู้ขาย",
    "seller_last_name": "คนที่หนึ่ง",
    "seller_avatar": null,
    "category_id": 2,
    "category_name": "Phones",
    "category_slug": "phones",
    "title": "iPhone 14 Pro Max 256GB",
    "description": "Like new condition, used for 3 months only. All accessories included.",
    "price": 35000.0,
    "location": "Bangkok",
    "location_lat": 13.7563,
    "location_lng": 100.5018,
    "status": "active",
    "view_count": 151,
    "contact_count": 5,
    "images": [
      {
        "image_id": 1,
        "image_url": "https://uploadthing.com/image1.jpg",
        "display_order": 1
      },
      {
        "image_id": 2,
        "image_url": "https://uploadthing.com/image2.jpg",
        "display_order": 2
      }
    ],
    "created_at": "2025-01-10T08:00:00.000Z",
    "updated_at": "2025-01-10T08:00:00.000Z",
    "expires_at": "2025-02-10T08:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "ไม่พบประกาศ"
}
```

---

### 11. Create Listing (Seller Only)

Create a new product listing. Requires seller authentication.

**Request:**

```http
POST /api/v1/listings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "categoryId": 2,
  "title": "MacBook Pro 14-inch M3",
  "description": "Brand new, sealed in box. 16GB RAM, 512GB SSD",
  "price": 65000,
  "location": "Bangkok",
  "locationLat": 13.7563,
  "locationLng": 100.5018,
  "expiresAt": "2025-03-01T00:00:00.000Z",
  "images": [
    "https://uploadthing.com/f/abc123.jpg",
    "https://uploadthing.com/f/def456.jpg"
  ]
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 2,
    "title": "MacBook Pro 14-inch M3",
    "description": "Brand new, sealed in box",
    "price": 65000,
    "location": "Bangkok",
    "images": [
      "https://uploadthing.com/f/abc123.jpg"
    ]
  }'
```

**Required Fields:**

- `title`
- `description`
- `price` (must be >= 0)

**Optional Fields:**

- `categoryId`
- `location`
- `locationLat`
- `locationLng`
- `expiresAt` (ISO 8601 date string)
- `images` (array of image URLs)

**Response (201 Created):**

```json
{
  "success": true,
  "message": "สร้างประกาศสำเร็จ",
  "listingId": 25
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "ราคาต้องมากกว่าหรือเท่ากับ 0"
}
```

**Error Response (403 Forbidden - Not a Seller):**

```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์เข้าถึง ต้องเป็น seller เท่านั้น"
}
```

---

### 12. Get My Listings (Seller Only)

Get all listings created by the authenticated seller.

**Request:**

```http
GET /api/v1/listings/my/listings?page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**

```bash
curl "http://localhost:3000/api/v1/listings/my/listings?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศของคุณสำเร็จ",
  "listings": [
    {
      "listing_id": 25,
      "title": "MacBook Pro 14-inch M3",
      "description": "Brand new, sealed in box",
      "price": 65000.0,
      "status": "active",
      "view_count": 0,
      "contact_count": 0,
      "images": [],
      "created_at": "2025-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 20
  }
}
```

---

### 13. Update Listing (Seller Only)

Update an existing listing. Only the listing owner can update.

**Request:**

```http
PUT /api/v1/listings/25
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "MacBook Pro 14-inch M3 - Updated Price",
  "price": 60000,
  "description": "Price reduced! Brand new, sealed in box",
  "location": "Bangkok - Sukhumvit",
  "categoryId": 3
}
```

**cURL:**

```bash
curl -X PUT http://localhost:3000/api/v1/listings/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 14-inch M3 - Updated Price",
    "price": 60000
  }'
```

**Updatable Fields:**

- `title`
- `description`
- `price`
- `location`
- `locationLat`
- `locationLng`
- `categoryId`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "อัพเดทประกาศสำเร็จ",
  "listing": {
    "listing_id": 25,
    "title": "MacBook Pro 14-inch M3 - Updated Price",
    "price": 60000.0,
    "description": "Price reduced! Brand new, sealed in box",
    "updated_at": "2025-01-15T13:00:00.000Z"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "success": false,
  "message": "Unauthorized: You can only edit your own listings"
}
```

---

### 14. Update Listing Status (Seller Only)

Change the status of a listing (e.g., mark as sold, hide listing).

**Request:**

```http
PATCH /api/v1/listings/25/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "sold"
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:3000/api/v1/listings/25/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sold"
  }'
```

**Valid Status Values:**

- `active` - Visible to buyers
- `sold` - Marked as sold
- `expired` - Listing expired
- `hidden` - Hidden by seller
- `pending` - Pending admin approval
- `rejected` - Rejected by admin

**Response (200 OK):**

```json
{
  "success": true,
  "message": "อัพเดทสถานะสำเร็จ",
  "listing": {
    "listing_id": 25,
    "status": "sold",
    "updated_at": "2025-01-15T14:00:00.000Z"
  }
}
```

---

### 15. Delete Listing (Seller/Admin)

Delete a listing. Sellers can delete their own listings; admins can delete any listing.

**Request:**

```http
DELETE /api/v1/listings/25
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**

```bash
curl -X DELETE http://localhost:3000/api/v1/listings/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "ลบประกาศสำเร็จ",
  "listing": {
    "listing_id": 25,
    "title": "MacBook Pro 14-inch M3 - Updated Price"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 16. Add Images to Listing (Seller Only)

Add additional images to an existing listing.

**Request:**

```http
POST /api/v1/listings/25/images
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "images": [
    "https://uploadthing.com/f/newimage1.jpg",
    "https://uploadthing.com/f/newimage2.jpg"
  ]
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/listings/25/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "https://uploadthing.com/f/newimage1.jpg",
      "https://uploadthing.com/f/newimage2.jpg"
    ]
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "เพิ่มรูปภาพสำเร็จ",
  "images": [
    {
      "image_id": 50,
      "image_url": "https://uploadthing.com/f/newimage1.jpg",
      "display_order": 1
    },
    {
      "image_id": 51,
      "image_url": "https://uploadthing.com/f/newimage2.jpg",
      "display_order": 2
    }
  ]
}
```

---

### 17. Delete Listing Image (Seller Only)

Remove an image from a listing.

**Request:**

```http
DELETE /api/v1/listings/images/50
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**

```bash
curl -X DELETE http://localhost:3000/api/v1/listings/images/50 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "ลบรูปภาพสำเร็จ",
  "image": {
    "image_id": 50,
    "image_url": "https://uploadthing.com/f/newimage1.jpg"
  }
}
```
