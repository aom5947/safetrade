# Getting Started with C2C Marketplace Backend

Welcome! This guide will help you get the C2C Marketplace backend up and running.

## What's Been Implemented

Based on the `c2c-marketplace-system-overview.md`, the following features are now implemented:

### ✅ Phase 1: Foundation (COMPLETE)
- Database schema with all 11 tables
- User authentication (JWT-based)
- Role system (buyer, seller, admin, super_admin)

### ✅ Phase 2: Core Listing Features (COMPLETE)
- **Listings Management**
  - Create, read, update, delete listings
  - Image upload support (UploadThing integration ready)
  - Status management (active, sold, expired, hidden, pending, rejected)
  - View and contact counting
  - Auto-expiration support (expires_at field)
  - Search and filtering (keyword, price range, location, category)
  - Sorting (newest, price_low, price_high, most_viewed)
  - Pagination

- **Categories System**
  - Hierarchical categories (main + subcategories)
  - Category management (CRUD operations)
  - Get listings by category
  - 8 main categories with 30+ subcategories seeded

### 🚧 Still To Implement (Future Phases)
- Phase 3: Real-time chat (Socket.io)
- Phase 3: Guest contact forms
- Phase 4: Reviews & ratings
- Phase 4: Saved listings
- Phase 5: Admin dashboard
- Phase 5: Report system
- Phase 5: Activity logs

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Database

1. **Create or use existing NeonDB database**
   - Sign up at https://neon.tech if you don't have an account
   - Create a new project
   - Copy the connection string

2. **Update .env file**
   ```env
   DATABASE_URL="your_neondb_connection_string"
   PORT=3000
   HOST=localhost
   API_PREFIX=/api/v1
   JWT_SECRET=your_secret_key
   ```

3. **Run database migrations**

   Follow the guide in `database/README.md`:

   ```bash
   # Connect to your database and run:
   psql "your_database_url" -f database/schema.sql
   psql "your_database_url" -f database/seed.sql
   ```

   Or use the Neon SQL Editor to copy/paste the SQL files.

### Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000` (or your configured PORT).

### Step 4: Test the API

Visit `http://localhost:3000/` to see the API info:

```json
{
  "success": true,
  "message": "C2C Marketplace API Server",
  "version": "3.0",
  "endpoints": {
    "users": "/api/v1/users",
    "listings": "/api/v1/listings",
    "categories": "/api/v1/categories",
    "health": "/database/health"
  }
}
```

## Test Accounts

The seed data includes these test accounts (password: `password123`):

| Role | Email | Use For |
|------|-------|---------|
| superadmin@marketplace.com | Super Admin | Full system access |
| admin@marketplace.com | Admin | User & listing moderation |
| seller1@test.com | Seller | Create and manage listings |
| seller2@test.com | Seller | Create and manage listings |
| buyer1@test.com | Buyer | Browse and interact with listings |

## API Examples

### 1. Sign In

```bash
POST http://localhost:3000/api/v1/users/signin
Content-Type: application/json

{
  "email": "seller1@test.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสําเร็จ",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### 2. Get All Listings

```bash
GET http://localhost:3000/api/v1/listings
# Optional query params: ?q=iphone&categoryId=1&minPrice=1000&maxPrice=50000&page=1&limit=20&sort=newest
```

### 3. Get Single Listing

```bash
GET http://localhost:3000/api/v1/listings/1
```

### 4. Create a Listing (Seller Only)

```bash
POST http://localhost:3000/api/v1/listings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "categoryId": 2,
  "title": "iPhone 14 Pro Max",
  "description": "Like new, used for 3 months only",
  "price": 35000,
  "location": "Bangkok",
  "images": [
    "https://uploadthing.com/image1.jpg",
    "https://uploadthing.com/image2.jpg"
  ]
}
```

### 5. Get All Categories

```bash
GET http://localhost:3000/api/v1/categories
```

Response includes hierarchical structure:
```json
{
  "success": true,
  "categories": [
    {
      "category_id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "subcategories": [
        {"name": "Phones", "slug": "phones"},
        {"name": "Laptops", "slug": "laptops"}
      ]
    }
  ]
}
```

### 6. Get Listings by Category

```bash
GET http://localhost:3000/api/v1/categories/electronics/listings?page=1&limit=20&sort=newest
```

## Available API Endpoints

### User Routes (`/api/v1/users`)
- `POST /signup` - Register new user (buyer/seller)
- `POST /signin` - Login
- `POST /super-signup` - Create admin (super admin only)
- `GET /verify-token` - Verify JWT token
- `PATCH /edit-profile` - Update profile
- `POST /change-password` - Change password
- `DELETE /delete-user` - Delete user (super admin only)

### Listing Routes (`/api/v1/listings`)
- `GET /` - Get all listings (with filters)
- `GET /:id` - Get single listing
- `POST /` - Create listing (seller only)
- `PUT /:id` - Update listing (owner only)
- `DELETE /:id` - Delete listing (owner/admin)
- `PATCH /:id/status` - Update status (owner only)
- `GET /my/listings` - Get seller's own listings
- `POST /:id/images` - Add images to listing
- `DELETE /images/:imageId` - Delete listing image

### Category Routes (`/api/v1/categories`)
- `GET /` - Get all categories
- `GET /:slug` - Get category by slug
- `GET /:slug/listings` - Get listings in category
- `POST /admin/create` - Create category (admin only)
- `PUT /admin/:id` - Update category (admin only)
- `DELETE /admin/:id` - Delete category (admin only)

## Project Structure

```
ver_3/
├── database/
│   ├── schema.sql          # Complete database schema
│   ├── seed.sql            # Initial data (categories, test users)
│   └── README.md           # Database setup guide
├── src/
│   ├── controllers/
│   │   ├── userControllers.js
│   │   ├── listingControllers.js
│   │   └── categoryControllers.js
│   ├── middlewares/
│   │   ├── jwtMiddleware.js
│   │   ├── roleMiddleware.js          # Role-based access control
│   │   └── superAdmin.js
│   ├── routes/
│   │   ├── userRouter.js
│   │   ├── listingRouter.js
│   │   └── categoryRouter.js
│   └── libs/
│       ├── pool-query.js              # Database connection
│       └── uploadthing.js             # File upload config
├── server.js                           # Main Express app
├── .env.example                        # Environment template
├── package.json
├── CLAUDE.md                           # Developer documentation
└── GETTING_STARTED.md                 # This file
```

## Development Tips

### Using Role-Based Middleware

```javascript
// Seller-only route
import { jwtWithRoleMiddleware, requireSeller } from '../middlewares/roleMiddleware.js'
router.post('/listings', jwtWithRoleMiddleware, requireSeller, createListing)

// Admin-only route
import { requireAdmin } from '../middlewares/roleMiddleware.js'
router.delete('/users/:id', jwtWithRoleMiddleware, requireAdmin, deleteUser)

// Multiple roles allowed
import { requireAnyRole } from '../middlewares/roleMiddleware.js'
router.post('/action', jwtWithRoleMiddleware, requireAnyRole(['seller', 'admin']), handler)
```

### Database Queries

```javascript
// Simple query
import { query } from './src/libs/pool-query.js'
const result = await query('SELECT * FROM listings WHERE listing_id = $1', [listingId])

// Transaction (multiple operations)
import { pool } from './src/libs/pool-query.js'
const client = await pool.connect()
try {
  await client.query('BEGIN')
  // ... multiple queries
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

## Testing

### Test User Creation (Already Seeded)

8 test accounts are already created with the seed data. All use password: `password123`

### Manual Testing with cURL or Postman

1. Sign in to get JWT token
2. Use token in `Authorization: Bearer TOKEN` header
3. Test protected endpoints

### Example cURL Commands

```bash
# Sign in
curl -X POST http://localhost:3000/api/v1/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"seller1@test.com","password":"password123"}'

# Get listings
curl http://localhost:3000/api/v1/listings

# Create listing (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/api/v1/listings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Item","description":"Test description","price":1000}'
```

## Next Steps

### 1. Image Upload Configuration

Update `src/libs/uploadthing.js` with your UploadThing configuration:
- Sign up at https://uploadthing.com
- Get your API keys
- Update UPLOADTHING_TOKEN in .env

### 2. Implement Remaining Features

Priority order (from c2c-marketplace-system-overview.md):

1. **Guest Contact System** - Allow non-logged-in users to contact sellers
2. **Reviews & Ratings** - Let buyers review sellers
3. **Saved Listings** - Bookmark/favorite functionality
4. **Real-time Chat** - Socket.io integration
5. **Admin Dashboard** - Stats and moderation tools
6. **Report System** - User-generated reports

### 3. Frontend Development

- Use React 19 + Tailwind CSS (as specified)
- Connect to API endpoints
- Implement authentication flow
- Build listing browsing and creation UI

### 4. Production Deployment

- Deploy backend to Railway.com or Render.com
- Deploy frontend to Vercel
- Configure environment variables
- Set up SSL/HTTPS
- Enable database backups

## Troubleshooting

### Server won't start
- Check if PORT is available
- Verify .env file exists and has DATABASE_URL
- Run `npm install` again

### Database connection errors
- Verify DATABASE_URL is correct
- Check if database exists
- Ensure schema.sql has been run
- Verify IP is whitelisted in Neon dashboard

### JWT token errors
- Ensure JWT_SECRET is set in .env
- Check token format: "Bearer TOKEN"
- Verify token hasn't expired (1 hour expiration)

### Permission denied errors
- Check user role in JWT payload
- Verify middleware order in routes
- Ensure user has required role for endpoint

## Resources

- **System Specification**: `c2c-marketplace-system-overview.md` (Complete feature spec in Thai)
- **Developer Guide**: `CLAUDE.md` (Technical documentation for AI assistants)
- **Database Guide**: `database/README.md` (Database setup and maintenance)
- **Environment Template**: `.env.example` (All required environment variables)

## Need Help?

1. Check CLAUDE.md for technical details
2. Review c2c-marketplace-system-overview.md for feature specifications
3. Look at existing controllers for code patterns
4. Check database schema in database/schema.sql

Happy coding! 🚀
