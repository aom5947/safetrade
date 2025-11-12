# API Usage Examples - Complete Endpoint Reference

This document provides **working examples** for every API endpoint in the C2C Marketplace Platform. Copy and paste these examples to test the API.

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Test Accounts](#test-accounts)
3. [User Endpoints](#user-endpoints)
4. [Listing Endpoints](#listing-endpoints)
5. [Category Endpoints](#category-endpoints)
6. [Review Endpoints](#review-endpoints)
7. [Saved Listing Endpoints](#saved-listing-endpoints)
8. [Report Endpoints](#report-endpoints)
9. [Conversation (Messaging) Endpoints](#conversation-messaging-endpoints)
10. [Guest Contact Endpoints](#guest-contact-endpoints)
11. [Admin Endpoints](#admin-endpoints)
12. [UploadThing File Upload](#uploadthing-file-upload)
13. [Error Responses](#error-responses)

---

## Base URL & Authentication

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:**
- Most endpoints require a JWT token obtained from the signin endpoint
- Include the token in the `Authorization` header: `Bearer YOUR_JWT_TOKEN`
- Tokens expire after 1 hour

---

## Test Accounts

All test accounts use password: `password123`

| Email | Role | Use Case |
|-------|------|----------|
| superadmin@marketplace.com | super_admin | Full system access |
| admin@marketplace.com | admin | User & listing moderation |
| seller1@test.com | seller | Create and manage listings |
| seller2@test.com | seller | Create and manage listings |
| buyer1@test.com | buyer | Browse and interact with listings |

---

## User Endpoints

### 1. Health Check

Check if user router is operational.

**Request:**
```http
GET /api/v1/users
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/users
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User router is operational"
}
```

---

### 2. User Signup (Public Registration)

Register a new user account. Only `buyer` and `seller` roles are allowed.

**Request:**
```http
POST /api/v1/users/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "username": "newuser123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "buyer"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword",
    "username": "newuser123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "buyer"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สมัครสมาชิกสำเร็จ",
  "id": 15
}
```

**Validation Rules:**
- All fields are required
- `role` must be `"buyer"` or `"seller"`
- Password minimum length: 4 characters
- Email and username must be unique

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Role ไม่ถูกต้อง กรุณาเลือก buyer หรือ seller เท่านั้น"
}
```

---

### 3. User Sign In

Login with email and password to get a JWT token.

**Request:**
```http
POST /api/v1/users/signin
Content-Type: application/json

{
  "email": "seller1@test.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller1@test.com",
    "password": "password123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสําเร็จ",
  "user": {
    "user_id": 3,
    "username": "seller1",
    "email": "seller1@test.com",
    "first_name": "ผู้ขาย",
    "last_name": "คนที่หนึ่ง",
    "phone": null,
    "user_role": "seller",
    "status": "active",
    "avatar_url": null,
    "email_verified": true,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6InNlbGxlciIsImlhdCI6MTczNjkzNDAwMCwiZXhwIjoxNzM2OTM3NjAwfQ.example_signature"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

---

### 4. Verify Token

Verify if a JWT token is still valid.

**Request:**
```http
GET /api/v1/users/verify-token
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/users/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "userId": 3
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Token ไม่ถูกต้อง"
}
```

---

### 5. Edit User Profile

Update user profile information. Requires authentication.

**Request:**
```http
PATCH /api/v1/users/edit-profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "first_name": "Updated Name",
  "last_name": "New Lastname",
  "username": "newusername",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/edit-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Name",
    "last_name": "New Lastname",
    "username": "newusername",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

**Updatable Fields:**
- `username` (must be unique)
- `email` (must be unique)
- `first_name`
- `last_name`
- `avatar_url`
- `newPassword` (will be hashed automatically)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "อัพเดทโปรไฟล์สำเร็จ",
  "user": {
    "user_id": 3,
    "username": "newusername",
    "email": "seller1@test.com",
    "first_name": "Updated Name",
    "last_name": "New Lastname",
    "avatar_url": "https://example.com/avatar.jpg",
    "user_role": "seller",
    "status": "active"
  }
}
```

---

### 6. Change Password

Change user password with verification of current password.

**Request:**
```http
POST /api/v1/users/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newsecurepassword"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newsecurepassword"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "เปลี่ยนรหัสผ่านสำเร็จ"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "รหัสผ่านเก่าไม่ถูกต้อง"
}
```

---

### 7. Create Admin Account (Super Admin Only)

Create an admin user account. Requires super admin authentication.

**Request:**
```http
POST /api/v1/users/super-signup
Authorization: Basic SUPER_ADMIN_CREDENTIALS
Content-Type: application/json

{
  "email": "newadmin@marketplace.com",
  "password": "adminpassword",
  "username": "newadmin",
  "first_name": "Admin",
  "last_name": "User"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/users/super-signup \
  -u "superadmin@marketplace.com:password123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@marketplace.com",
    "password": "adminpassword",
    "username": "newadmin",
    "first_name": "Admin",
    "last_name": "User"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สร้างบัญชี Admin สำเร็จ",
  "id": 20
}
```

---

### 8. Delete User (Super Admin Only)

Delete a user account. Requires super admin authentication.

**Request:**
```http
DELETE /api/v1/users/delete-user
Authorization: Basic SUPER_ADMIN_CREDENTIALS
Content-Type: application/json

{
  "user_id": 15
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/users/delete-user \
  -u "superadmin@marketplace.com:password123" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 15
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบบัญชีสำเร็จ",
  "deletedUser": {
    "user_id": 15,
    "email": "deleted@example.com",
    "username": "deleteduser"
  }
}
```

---

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
      "price": 35000.00,
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
    "price": 35000.00,
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
      "price": 65000.00,
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
    "price": 60000.00,
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

---

## Category Endpoints

### 18. Get All Categories (Public)

Get all categories with hierarchical structure (main categories and subcategories).

**Request:**
```http
GET /api/v1/categories
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/categories
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลหมวดหมู่สำเร็จ",
  "categories": [
    {
      "category_id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "icon": "📱",
      "parent_id": null,
      "display_order": 1,
      "is_active": true,
      "listing_count": 145,
      "subcategories": [
        {
          "category_id": 2,
          "name": "Phones",
          "slug": "phones",
          "icon": "📱",
          "listing_count": 50
        },
        {
          "category_id": 3,
          "name": "Laptops",
          "slug": "laptops",
          "icon": "💻",
          "listing_count": 35
        }
      ]
    },
    {
      "category_id": 8,
      "name": "Fashion",
      "slug": "fashion",
      "icon": "👔",
      "parent_id": null,
      "display_order": 2,
      "is_active": true,
      "listing_count": 89,
      "subcategories": []
    }
  ],
  "flat": [
    {
      "category_id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "parent_id": null
    },
    {
      "category_id": 2,
      "name": "Phones",
      "slug": "phones",
      "parent_id": 1
    }
  ]
}
```

---

### 19. Get Category by Slug (Public)

Get details of a specific category by its slug.

**Request:**
```http
GET /api/v1/categories/electronics
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/categories/electronics
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "icon": "📱",
    "parent_id": null,
    "display_order": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "ไม่พบหมวดหมู่"
}
```

---

### 20. Get Listings by Category (Public)

Get all listings in a specific category with pagination and sorting.

**Request:**
```http
GET /api/v1/categories/electronics/listings?page=1&limit=20&sort=newest
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sort` (optional): Sort order (`newest`, `price_low`, `price_high`, `most_viewed`)

**cURL:**
```bash
curl "http://localhost:3000/api/v1/categories/electronics/listings?page=1&limit=20&sort=newest"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศสำเร็จ",
  "category": {
    "category_id": 1,
    "name": "Electronics",
    "slug": "electronics"
  },
  "listings": [
    {
      "listing_id": 1,
      "title": "iPhone 14 Pro Max",
      "price": 35000.00,
      "location": "Bangkok",
      "images": [],
      "created_at": "2025-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 145,
    "itemsPerPage": 20
  }
}
```

---

### 21. Create Category (Admin Only)

Create a new category. Requires admin or super_admin role.

**Request:**
```http
POST /api/v1/categories/admin/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Books",
  "slug": "books",
  "icon": "📚",
  "parentId": null,
  "displayOrder": 10
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/categories/admin/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Books",
    "slug": "books",
    "icon": "📚",
    "displayOrder": 10
  }'
```

**Required Fields:**
- `name`
- `slug` (must be unique)

**Optional Fields:**
- `icon`
- `parentId` (ID of parent category for subcategories)
- `displayOrder` (default: 0)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สร้างหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Books",
    "slug": "books",
    "icon": "📚",
    "parent_id": null,
    "display_order": 10,
    "is_active": true
  }
}
```

**Error Response (403 Forbidden - Not Admin):**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์เข้าถึง ต้องเป็น admin หรือ super_admin เท่านั้น"
}
```

---

### 22. Update Category (Admin Only)

Update an existing category.

**Request:**
```http
PUT /api/v1/categories/admin/15
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Books & Magazines",
  "slug": "books-magazines",
  "icon": "📚📰",
  "displayOrder": 5,
  "isActive": true
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/categories/admin/15 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Books & Magazines",
    "displayOrder": 5
  }'
```

**Updatable Fields:**
- `name`
- `slug`
- `icon`
- `displayOrder`
- `isActive`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "อัพเดทหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Books & Magazines",
    "slug": "books-magazines",
    "icon": "📚📰",
    "display_order": 5,
    "is_active": true
  }
}
```

---

### 23. Delete Category (Admin Only)

Delete a category. Cannot delete categories with active listings.

**Request:**
```http
DELETE /api/v1/categories/admin/15
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/categories/admin/15 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Books & Magazines"
  }
}
```

**Error Response (400 Bad Request - Has Listings):**
```json
{
  "success": false,
  "message": "ไม่สามารถลบหมวดหมู่ที่มีประกาศอยู่ได้"
}
```

---

## Review Endpoints

### 24. Get Seller Reviews (Public)

Get all reviews for a specific seller with pagination and average rating.

**Request:**
```http
GET /api/v1/reviews/seller/:sellerId?limit=50&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of reviews per page (default: 50)
- `offset` (optional): Number of reviews to skip (default: 0)

**cURL:**
```bash
curl "http://localhost:3000/api/v1/reviews/seller/3?limit=50&offset=0"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลรีวิวเรียบร้อยแล้ว",
  "data": [
    {
      "review_id": 1,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "reviewer_id": 10,
      "reviewer_username": "buyer1",
      "reviewer_avatar": null,
      "rating": 5,
      "comment": "ผู้ขายดีมาก สินค้าตรงตามรูป จัดส่งเร็ว",
      "is_spam": false,
      "created_at": "2025-01-12T10:30:00.000Z"
    }
  ],
  "sellerRating": {
    "averageRating": 4.75,
    "totalReviews": 24
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 24
  }
}
```

---

### 25. Get Listing Reviews (Public)

Get all reviews for a specific listing.

**Request:**
```http
GET /api/v1/reviews/listing/:listingId?limit=50&offset=0
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/reviews/listing/5?limit=50&offset=0"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลรีวิวเรียบร้อยแล้ว",
  "data": [
    {
      "review_id": 1,
      "reviewer_id": 10,
      "reviewer_username": "buyer1",
      "reviewer_avatar": null,
      "rating": 5,
      "comment": "สินค้าดีมาก",
      "is_spam": false,
      "created_at": "2025-01-12T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 3
  }
}
```

---

### 26. Create Review (Authenticated)

Create a review for a seller based on a listing purchase.

**Request:**
```http
POST /api/v1/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "listingId": 5,
  "rating": 5,
  "comment": "ผู้ขายดีมาก สินค้าตรงตามรูป"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 5,
    "rating": 5,
    "comment": "ผู้ขายดีมาก สินค้าตรงตามรูป"
  }'
```

**Required Fields:**
- `listingId` (number)
- `rating` (number, 1-5)

**Optional Fields:**
- `comment` (string)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สร้างรีวิวเรียบร้อยแล้ว",
  "data": {
    "reviewId": 25,
    "createdAt": "2025-01-15T14:30:00.000Z",
    "newSellerRating": 4.8,
    "newSellerRatingCount": 25
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Rating ต้องเป็นตัวเลข 1-5"
}
```

---

### 27. Check If User Reviewed Listing (Authenticated)

Check if the authenticated user has already reviewed a specific listing.

**Request:**
```http
GET /api/v1/reviews/check/:listingId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/reviews/check/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasReviewed": true,
    "review": {
      "review_id": 25,
      "rating": 5,
      "comment": "ผู้ขายดีมาก",
      "created_at": "2025-01-15T14:30:00.000Z"
    }
  }
}
```

---

### 28. Delete Review (Authenticated)

Delete a review. Users can delete their own reviews; admins can delete any review.

**Request:**
```http
DELETE /api/v1/reviews/:reviewId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/reviews/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบรีวิวเรียบร้อยแล้ว"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์ลบรีวิวนี้"
}
```

---

### 29. Mark Review as Spam (Admin Only)

Mark or unmark a review as spam. This affects seller rating calculations.

**Request:**
```http
PATCH /api/v1/reviews/:reviewId/spam
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isSpam": true
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reviews/25/spam \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isSpam": true
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "อัปเดตสถานะรีวิวเรียบร้อยแล้ว",
  "data": {
    "newSellerRating": 4.75,
    "newSellerRatingCount": 24
  }
}
```

---

## Saved Listing Endpoints

### 30. Save Listing (Authenticated)

Bookmark/favorite a listing for later viewing.

**Request:**
```http
POST /api/v1/saved-listings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "listingId": 5
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/saved-listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 5
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "บันทึกประกาศเรียบร้อยแล้ว",
  "data": {
    "savedId": 15,
    "savedAt": "2025-01-15T15:00:00.000Z",
    "listingTitle": "iPhone 14 Pro Max"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "คุณได้บันทึกประกาศนี้ไว้แล้ว"
}
```

---

### 31. Unsave Listing (Authenticated)

Remove a listing from saved/favorites.

**Request:**
```http
DELETE /api/v1/saved-listings/:listingId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/saved-listings/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบประกาศที่บันทึกเรียบร้อยแล้ว"
}
```

---

### 32. Get Saved Listings (Authenticated)

Get all listings saved by the authenticated user.

**Request:**
```http
GET /api/v1/saved-listings?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/saved-listings?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลประกาศที่บันทึกเรียบร้อยแล้ว",
  "data": [
    {
      "saved_id": 15,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "listing_price": 35000.00,
      "listing_status": "active",
      "listing_location": "Bangkok",
      "seller_username": "seller1",
      "saved_at": "2025-01-15T15:00:00.000Z",
      "images": [
        {
          "image_url": "https://uploadthing.com/f/image1.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 8
  }
}
```

---

### 33. Check If Listing is Saved (Authenticated)

Check if a specific listing is saved by the authenticated user.

**Request:**
```http
GET /api/v1/saved-listings/check/:listingId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/saved-listings/check/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isSaved": true,
    "savedAt": "2025-01-15T15:00:00.000Z"
  }
}
```

---

### 34. Get Save Count (Public)

Get the number of users who have saved a specific listing.

**Request:**
```http
GET /api/v1/saved-listings/count/:listingId
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/saved-listings/count/5
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listingId": 5,
    "saveCount": 42
  }
}
```

---

## Report Endpoints

### 35. Submit Report (Public/Authenticated)

Report inappropriate content (listing, user, or review). Can be submitted anonymously or by authenticated users.

**Request:**
```http
POST /api/v1/reports
Content-Type: application/json

{
  "reportedType": "listing",
  "reportedId": 5,
  "reason": "เนื้อหาไม่เหมาะสม มีการหลอกลวง"
}
```

**Valid reportedType values:**
- `listing` - Report a listing
- `user` - Report a user
- `review` - Report a review

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{
    "reportedType": "listing",
    "reportedId": 5,
    "reason": "เนื้อหาไม่เหมาะสม มีการหลอกลวง"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "ส่งรายงานเรียบร้อยแล้ว ทีมงานจะตรวจสอบเร็วๆ นี้",
  "data": {
    "reportId": 50,
    "createdAt": "2025-01-15T16:00:00.000Z"
  }
}
```

---

### 36. Get All Reports (Admin Only)

Get all reports with optional filtering by type and status.

**Request:**
```http
GET /api/v1/reports?type=listing&status=pending&limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `type` (optional): Filter by type ('listing', 'user', 'review')
- `status` (optional): Filter by status ('pending', 'reviewing', 'resolved', 'rejected')
- `limit` (optional): Items per page (default: 50)
- `offset` (optional): Number to skip (default: 0)

**cURL:**
```bash
curl "http://localhost:3000/api/v1/reports?type=listing&status=pending&limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลรายงานเรียบร้อยแล้ว",
  "data": [
    {
      "report_id": 50,
      "reporter_id": 10,
      "reporter_username": "buyer1",
      "reported_type": "listing",
      "reported_id": 5,
      "reported_title": "iPhone 14 Pro Max",
      "reason": "เนื้อหาไม่เหมาะสม",
      "status": "pending",
      "reviewed_by": null,
      "created_at": "2025-01-15T16:00:00.000Z",
      "updated_at": "2025-01-15T16:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 12
  }
}
```

---

### 37. Get Report Details (Admin Only)

Get detailed information about a specific report including the reported item details.

**Request:**
```http
GET /api/v1/reports/:reportId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/reports/50 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "report": {
      "report_id": 50,
      "reporter_id": 10,
      "reporter_username": "buyer1",
      "reported_type": "listing",
      "reported_id": 5,
      "reason": "เนื้อหาไม่เหมาะสม",
      "status": "pending",
      "created_at": "2025-01-15T16:00:00.000Z"
    },
    "itemDetails": {
      "listing_id": 5,
      "title": "iPhone 14 Pro Max",
      "description": "...",
      "seller_id": 3,
      "seller_username": "seller1"
    }
  }
}
```

---

### 38. Get Report Statistics (Admin Only)

Get statistics about reports in the system.

**Request:**
```http
GET /api/v1/reports/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/reports/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalReports": 156,
    "byStatus": {
      "pending": 12,
      "reviewing": 5,
      "resolved": 130,
      "rejected": 9
    },
    "byType": {
      "listing": 98,
      "user": 35,
      "review": 23
    }
  }
}
```

---

### 39. Update Report Status (Admin Only)

Update the status of a report (mark as reviewing, resolved, or rejected).

**Request:**
```http
PATCH /api/v1/reports/:reportId/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "resolved"
}
```

**Valid status values:**
- `reviewing` - Admin is reviewing
- `resolved` - Issue resolved
- `rejected` - Report rejected (not valid)

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reports/50/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "อัปเดตสถานะรายงานเรียบร้อยแล้ว",
  "data": {
    "report_id": 50,
    "status": "resolved",
    "reviewed_by": 2,
    "updated_at": "2025-01-15T17:00:00.000Z"
  }
}
```

---

## Conversation (Messaging) Endpoints

All conversation endpoints require authentication.

### 40. Create or Get Conversation (Authenticated)

Create a new conversation or get existing conversation for a listing.

**Request:**
```http
POST /api/v1/conversations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "listingId": 5
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 5
  }'
```

**Response (201 Created - New Conversation):**
```json
{
  "success": true,
  "message": "สร้างการสนทนาเรียบร้อยแล้ว",
  "data": {
    "conversation_id": 25,
    "listing_id": 5,
    "listing_title": "iPhone 14 Pro Max",
    "buyer_id": 10,
    "seller_id": 3,
    "seller_username": "seller1",
    "created_at": "2025-01-15T18:00:00.000Z"
  }
}
```

**Response (200 OK - Existing Conversation):**
```json
{
  "success": true,
  "message": "พบการสนทนาที่มีอยู่",
  "data": {
    "conversation_id": 25,
    "listing_id": 5,
    "listing_title": "iPhone 14 Pro Max",
    "buyer_id": 10,
    "seller_id": 3
  }
}
```

---

### 41. Get User Conversations (Authenticated)

Get all conversations for the authenticated user.

**Request:**
```http
GET /api/v1/conversations?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/conversations?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลการสนทนาเรียบร้อยแล้ว",
  "data": [
    {
      "conversation_id": 25,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "listing_status": "active",
      "other_user_id": 3,
      "other_user_username": "seller1",
      "other_user_avatar": null,
      "last_message": "สนใจสินค้าครับ",
      "last_message_at": "2025-01-15T18:30:00.000Z",
      "unread_count": 2,
      "created_at": "2025-01-15T18:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 5
  }
}
```

---

### 42. Get Unread Message Count (Authenticated)

Get total unread message count for the authenticated user.

**Request:**
```http
GET /api/v1/conversations/unread-count
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl http://localhost:3000/api/v1/conversations/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 43. Get Conversation Messages (Authenticated)

Get all messages in a specific conversation.

**Request:**
```http
GET /api/v1/conversations/:conversationId/messages?limit=100&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/conversations/25/messages?limit=100&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลข้อความเรียบร้อยแล้ว",
  "data": {
    "messages": [
      {
        "message_id": 100,
        "conversation_id": 25,
        "sender_id": 10,
        "sender_username": "buyer1",
        "message_text": "สวัสดีครับ สนใจสินค้าครับ",
        "is_read": true,
        "created_at": "2025-01-15T18:30:00.000Z"
      },
      {
        "message_id": 101,
        "conversation_id": 25,
        "sender_id": 3,
        "sender_username": "seller1",
        "message_text": "สวัสดีครับ ยินดีครับ",
        "is_read": false,
        "created_at": "2025-01-15T18:32:00.000Z"
      }
    ],
    "conversation": {
      "conversation_id": 25,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "buyer_id": 10,
      "seller_id": 3
    }
  },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 15
  }
}
```

---

### 44. Send Message (Authenticated)

Send a message in a conversation.

**Request:**
```http
POST /api/v1/conversations/:conversationId/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "messageText": "สวัสดีครับ สนใจสินค้าครับ"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/conversations/25/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "สวัสดีครับ สนใจสินค้าครับ"
  }'
```

**Validation:**
- Message text is required
- Maximum length: 5000 characters

**Response (201 Created):**
```json
{
  "success": true,
  "message": "ส่งข้อความเรียบร้อยแล้ว",
  "data": {
    "message_id": 100,
    "conversation_id": 25,
    "sender_id": 10,
    "message_text": "สวัสดีครับ สนใจสินค้าครับ",
    "is_read": false,
    "created_at": "2025-01-15T18:30:00.000Z"
  }
}
```

---

### 45. Mark Messages as Read (Authenticated)

Mark all messages in a conversation as read.

**Request:**
```http
PATCH /api/v1/conversations/:conversationId/read
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/v1/conversations/25/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ทำเครื่องหมายข้อความว่าอ่านแล้ว",
  "data": {
    "markedCount": 3
  }
}
```

---

### 46. Delete Conversation (Authenticated)

Delete a conversation. Users can delete their own conversations; admins can delete any.

**Request:**
```http
DELETE /api/v1/conversations/:conversationId
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/conversations/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบการสนทนาเรียบร้อยแล้ว"
}
```

---

## Guest Contact Endpoints

### 47. Submit Guest Contact (Public)

Allow non-logged-in users to contact sellers about listings via a contact form.

**Request:**
```http
POST /api/v1/guest-contacts
Content-Type: application/json

{
  "listingId": 5,
  "contactName": "John Doe",
  "contactPhone": "081-234-5678",
  "contactEmail": "john@example.com",
  "message": "สนใจสินค้า ราคาต่อได้ไหมคะ"
}
```

**Required Fields:**
- `listingId` (number)
- `contactName` (string)
- `contactPhone` (string, must match phone format)
- `contactEmail` (string, must be valid email)

**Optional Fields:**
- `message` (string)

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/guest-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 5,
    "contactName": "John Doe",
    "contactPhone": "081-234-5678",
    "contactEmail": "john@example.com",
    "message": "สนใจสินค้า ราคาต่อได้ไหมคะ"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "ส่งข้อความติดต่อเรียบร้อยแล้ว ผู้ขายจะติดต่อกลับเร็วๆ นี้",
  "data": {
    "contactId": 50,
    "contactedAt": "2025-01-15T19:00:00.000Z",
    "listingTitle": "iPhone 14 Pro Max"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "รูปแบบอีเมลไม่ถูกต้อง"
}
```

---

### 48. Get Listing Guest Contacts (Seller Only)

Get all guest contact submissions for a specific listing.

**Request:**
```http
GET /api/v1/guest-contacts/listing/:listingId?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/guest-contacts/listing/5?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลการติดต่อเรียบร้อยแล้ว",
  "data": [
    {
      "contact_id": 50,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "contact_name": "John Doe",
      "contact_phone": "081-234-5678",
      "contact_email": "john@example.com",
      "message": "สนใจสินค้า ราคาต่อได้ไหมคะ",
      "contacted_at": "2025-01-15T19:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 8
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"
}
```

---

### 49. Get All Seller's Guest Contacts (Seller Only)

Get all guest contact submissions for all of the seller's listings.

**Request:**
```http
GET /api/v1/guest-contacts/my-contacts?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl "http://localhost:3000/api/v1/guest-contacts/my-contacts?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลการติดต่อทั้งหมดเรียบร้อยแล้ว",
  "data": [
    {
      "contact_id": 50,
      "listing_id": 5,
      "listing_title": "iPhone 14 Pro Max",
      "contact_name": "John Doe",
      "contact_phone": "081-234-5678",
      "contact_email": "john@example.com",
      "message": "สนใจสินค้า",
      "contacted_at": "2025-01-15T19:00:00.000Z"
    },
    {
      "contact_id": 51,
      "listing_id": 7,
      "listing_title": "MacBook Pro",
      "contact_name": "Jane Smith",
      "contact_phone": "082-345-6789",
      "contact_email": "jane@example.com",
      "message": "สนใจครับ",
      "contacted_at": "2025-01-15T20:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 15
  }
}
```

---

## Admin Endpoints

### 50. Create Admin Account (Super Admin Only)

Create a new admin user account. Requires super admin authentication via Basic Auth.

**Request:**
```http
POST /api/v1/admin/users
Authorization: Basic SUPER_ADMIN_CREDENTIALS
Content-Type: application/json

{
  "email": "newadmin@marketplace.com",
  "password": "adminpassword",
  "username": "newadmin",
  "first_name": "Admin",
  "last_name": "User"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/admin/users \
  -u "superadmin@marketplace.com:password123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@marketplace.com",
    "password": "adminpassword",
    "username": "newadmin",
    "first_name": "Admin",
    "last_name": "User"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สร้างบัญชี Admin สำเร็จ",
  "id": 20
}
```

---

### 51. Delete User Account (Super Admin Only)

Delete any user account. Requires super admin authentication.

**Request:**
```http
DELETE /api/v1/admin/users/:id
Authorization: Basic SUPER_ADMIN_CREDENTIALS
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/admin/users/15 \
  -u "superadmin@marketplace.com:password123"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบบัญชีสำเร็จ",
  "deletedUser": {
    "user_id": 15,
    "email": "deleted@example.com",
    "username": "deleteduser"
  }
}
```

---

### 52. Create Category (Admin Only)

Create a new category. Requires admin or super_admin JWT authentication.

**Request:**
```http
POST /api/v1/admin/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Sports Equipment",
  "slug": "sports-equipment",
  "icon": "⚽",
  "parentId": null,
  "displayOrder": 10
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/admin/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sports Equipment",
    "slug": "sports-equipment",
    "icon": "⚽",
    "displayOrder": 10
  }'
```

**Required Fields:**
- `name` (string)
- `slug` (string, must be unique)

**Optional Fields:**
- `icon` (string)
- `parentId` (number, for subcategories)
- `displayOrder` (number, default: 0)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "สร้างหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Sports Equipment",
    "slug": "sports-equipment",
    "icon": "⚽",
    "parent_id": null,
    "display_order": 10,
    "is_active": true
  }
}
```

---

### 53. Update Category (Admin Only)

Update an existing category.

**Request:**
```http
PUT /api/v1/admin/categories/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Sports & Recreation",
  "slug": "sports-recreation",
  "icon": "⚽🏀",
  "displayOrder": 5,
  "isActive": true
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/admin/categories/15 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sports & Recreation",
    "displayOrder": 5
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "อัพเดทหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Sports & Recreation",
    "slug": "sports-recreation",
    "display_order": 5
  }
}
```

---

### 54. Delete Category (Admin Only)

Delete a category. Cannot delete categories with active listings.

**Request:**
```http
DELETE /api/v1/admin/categories/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/admin/categories/15 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบหมวดหมู่สำเร็จ",
  "category": {
    "category_id": 15,
    "name": "Sports Equipment"
  }
}
```

---

## UploadThing File Upload

### 55. Upload Images

Upload images to UploadThing for use in listings.

**Important:** UploadThing configuration is in `src/libs/uploadthing.js`. You need to:
1. Sign up at https://uploadthing.com
2. Get your API token
3. Set `UPLOADTHING_TOKEN` in your `.env` file

**Request:**
```http
POST /api/uploadthing
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

files: [File1, File2]
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/uploadthing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

**Response (200 OK):**
```json
{
  "success": true,
  "files": [
    {
      "name": "image1.jpg",
      "size": 245678,
      "url": "https://utfs.io/f/abc123xyz.jpg",
      "key": "abc123xyz"
    },
    {
      "name": "image2.jpg",
      "size": 189234,
      "url": "https://utfs.io/f/def456uvw.jpg",
      "key": "def456uvw"
    }
  ]
}
```

**File Requirements:**
- Accepted types: images only (jpg, png, gif, webp)
- Max file size: configured via UploadThing dashboard
- Multiple files can be uploaded at once

**Usage in Listings:**

After uploading, use the returned URLs in your listing creation:

```json
{
  "title": "My Product",
  "description": "Description",
  "price": 1000,
  "images": [
    "https://utfs.io/f/abc123xyz.jpg",
    "https://utfs.io/f/def456uvw.jpg"
  ]
}
```

---

## Error Responses

### Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid data format |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions for the action |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Database error, server malfunction |

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message in Thai (or English for auth errors)"
}
```

### Authentication Errors

**Missing Token:**
```json
{
  "success": false,
  "message": "ไม่มี Authorization header"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Token ไม่ถูกต้อง"
}
```

**Expired Token:**
```json
{
  "success": false,
  "message": "Token หมดอายุแล้ว"
}
```

### Authorization Errors

**Insufficient Permissions:**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์เข้าถึง ต้องเป็น seller เท่านั้น"
}
```

**Not Resource Owner:**
```json
{
  "success": false,
  "message": "Unauthorized: You can only edit your own listings"
}
```

### Validation Errors

**Missing Required Fields:**
```json
{
  "success": false,
  "message": "ต้องระบุ title, description, และ price"
}
```

**Invalid Data Type:**
```json
{
  "success": false,
  "message": "ราคาต้องมากกว่าหรือเท่ากับ 0"
}
```

**Duplicate Entry:**
```json
{
  "success": false,
  "message": "Email นี้ถูกใช้งานแล้ว"
}
```

---

## Testing Workflow Examples

### Example 1: Create an Account and Post a Listing

```bash
# Step 1: Sign up as seller
curl -X POST http://localhost:3000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newseller@test.com",
    "password": "password123",
    "username": "newseller",
    "first_name": "New",
    "last_name": "Seller",
    "role": "seller"
  }'

# Step 2: Sign in to get token
curl -X POST http://localhost:3000/api/v1/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newseller@test.com",
    "password": "password123"
  }'

# Save the token from response
TOKEN="eyJhbGc..."

# Step 3: Create a listing
curl -X POST http://localhost:3000/api/v1/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 2,
    "title": "iPhone 15 Pro",
    "description": "Brand new, unopened",
    "price": 42000,
    "location": "Bangkok"
  }'
```

### Example 2: Browse Listings as Guest

```bash
# Get all listings
curl http://localhost:3000/api/v1/listings

# Search for iPhone
curl "http://localhost:3000/api/v1/listings?q=iphone"

# Filter by category and price
curl "http://localhost:3000/api/v1/listings?categoryId=2&minPrice=10000&maxPrice=50000"

# Get specific listing details
curl http://localhost:3000/api/v1/listings/1

# Get all categories
curl http://localhost:3000/api/v1/categories

# Get listings in Electronics category
curl "http://localhost:3000/api/v1/categories/electronics/listings"
```

### Example 3: Manage Your Listings as Seller

```bash
# Sign in first
TOKEN=$(curl -X POST http://localhost:3000/api/v1/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"seller1@test.com","password":"password123"}' | jq -r '.token')

# Get your listings
curl "http://localhost:3000/api/v1/listings/my/listings" \
  -H "Authorization: Bearer $TOKEN"

# Update a listing
curl -X PUT http://localhost:3000/api/v1/listings/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 33000}'

# Mark listing as sold
curl -X PATCH http://localhost:3000/api/v1/listings/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "sold"}'

# Delete a listing
curl -X DELETE http://localhost:3000/api/v1/listings/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Example 4: Admin Operations

```bash
# Sign in as admin
TOKEN=$(curl -X POST http://localhost:3000/api/v1/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketplace.com","password":"password123"}' | jq -r '.token')

# Create a new category
curl -X POST http://localhost:3000/api/v1/categories/admin/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sports Equipment",
    "slug": "sports-equipment",
    "icon": "⚽"
  }'

# Update category
curl -X PUT http://localhost:3000/api/v1/categories/admin/15 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayOrder": 3}'

# Delete any listing (admin privilege)
curl -X DELETE http://localhost:3000/api/v1/listings/25 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

1. **Token Expiration:** JWT tokens expire after 1 hour. You'll need to sign in again to get a new token.

2. **Response Language:** Most user-facing messages are in Thai as specified in the system requirements.

3. **Base64 Encoding for Basic Auth:** For super admin endpoints using Basic Auth:
   ```bash
   echo -n "superadmin@marketplace.com:password123" | base64
   # Use the result in: Authorization: Basic <result>
   ```

4. **Date Formats:** All dates use ISO 8601 format (e.g., `2025-01-15T10:30:00.000Z`)

5. **Pagination:** Default page size is 20 items. Maximum page size may be limited by server configuration.

6. **Image URLs:** After uploading to UploadThing, always use the full URL returned in the response.

7. **Role-Based Access:**
   - Public endpoints: No authentication required
   - User endpoints: Requires valid JWT token
   - Seller endpoints: Requires JWT token with `seller` role
   - Admin endpoints: Requires JWT token with `admin` or `super_admin` role

---

## Additional Resources

- **System Specification:** `c2c-marketplace-system-overview.md`
- **Developer Guide:** `CLAUDE.md`
- **Getting Started:** `GETTING_STARTED.md`
- **Database Schema:** `database/schema.sql`
- **Seed Data:** `database/seed.sql`

---

**Last Updated:** January 2025
**API Version:** 5.0 (Complete)

**Total Endpoints:** 55

## API Endpoint Summary

### User Management (8 endpoints)
- Public signup, signin, profile management
- Super admin user creation and deletion
- Token verification and password changes

### Listings (9 endpoints)
- Public browsing and search
- Seller listing management (CRUD)
- Image management
- Status updates

### Categories (6 endpoints)
- Public category browsing
- Admin category management (CRUD)
- Hierarchical category support

### Reviews (6 endpoints)
- Public review viewing
- User review creation and deletion
- Admin spam management

### Saved Listings (5 endpoints)
- Bookmark/favorite listings
- Check saved status
- Public save count

### Reports (5 endpoints)
- Public/anonymous reporting
- Admin report management
- Report statistics

### Conversations (7 endpoints)
- Private messaging between buyers and sellers
- Unread count tracking
- Message management

### Guest Contacts (3 endpoints)
- Anonymous contact forms
- Seller contact management

### Admin (4 endpoints)
- User account management (super admin)
- Category management (admin)

### File Upload (1 endpoint)
- UploadThing image uploads
