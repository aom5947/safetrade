# Database Setup Guide

This guide will help you set up the database for the C2C Marketplace platform.

## Prerequisites

- PostgreSQL database (NeonDB account recommended)
- Database connection URL
- psql CLI or database management tool (e.g., pgAdmin, DBeaver, or Neon Console)

## Step 1: Update Environment Variables

1. Copy `.env.example` to `.env` if you haven't already
2. Update the `DATABASE_URL` with your NeonDB connection string:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

## Step 2: Run Schema Creation

Connect to your database and run the schema file:

### Option A: Using psql CLI

```bash
psql "your_database_url_here" -f database/schema.sql
```

### Option B: Using Neon Console

1. Log in to your Neon account at https://console.neon.tech
2. Select your project
3. Go to the SQL Editor
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run" to execute

### Option C: Using pgAdmin or DBeaver

1. Connect to your database
2. Open a new SQL query window
3. Copy and paste the contents of `database/schema.sql`
4. Execute the query

## Step 3: Run Seed Data

After creating the schema, populate initial data:

### Using psql CLI

```bash
psql "your_database_url_here" -f database/seed.sql
```

### Using SQL Editor

Copy and paste the contents of `database/seed.sql` and execute.

## Step 4: Verify Installation

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- activity_logs
- categories
- conversations
- guest_contacts
- listing_images
- listings
- messages
- reports
- reviews
- saved_listings
- users

## Test Accounts

The seed file creates these test accounts (password: `password123`):

| Role | Email | Username |
|------|-------|----------|
| Super Admin | superadmin@marketplace.com | superadmin |
| Admin | admin@marketplace.com | admin |
| Seller | seller1@test.com | seller1 |
| Seller | seller2@test.com | seller2 |
| Seller | seller3@test.com | seller3 |
| Buyer | buyer1@test.com | buyer1 |
| Buyer | buyer2@test.com | buyer2 |
| Buyer | buyer3@test.com | buyer3 |

## Sample Data

The seed file includes:
- 8 main categories with subcategories (Electronics, Vehicles, Fashion, etc.)
- 9 sample listings with images
- Various listing statuses (active, sold, pending)

## Troubleshooting

### Error: relation already exists

If you see this error, tables already exist. You have two options:

1. **Drop all tables and start fresh** (⚠️ This will delete all data):

```sql
-- Run the DROP statements at the top of schema.sql (commented out)
```

2. **Keep existing data and manually add missing tables**

### Error: permission denied

Make sure your database user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
```

### Connection Issues

- Verify your DATABASE_URL is correct
- Check if your IP is whitelisted in Neon dashboard (if using Neon)
- Ensure SSL mode is properly configured

## Schema Overview

### Core Tables

1. **users** - User accounts with roles (buyer, seller, admin, super_admin)
2. **categories** - Hierarchical product categories
3. **listings** - Product listings with status tracking
4. **listing_images** - Images for listings

### Communication Tables

5. **conversations** - Chat conversations between buyers and sellers
6. **messages** - Individual chat messages
7. **guest_contacts** - Contact forms from non-logged-in users

### Social Features

8. **reviews** - Reviews and ratings for sellers
9. **saved_listings** - Users' saved/favorited listings
10. **reports** - User-generated reports for moderation

### Admin Features

11. **activity_logs** - Audit trail of system actions

## Next Steps

After setting up the database:

1. Start the backend server: `npm run dev`
2. Test the API endpoints using the test accounts
3. Check the API documentation in CLAUDE.md
4. Begin frontend development

## Backup & Maintenance

### Creating Backups

```bash
# Backup entire database
pg_dump "your_database_url" > backup_$(date +%Y%m%d).sql

# Backup specific table
pg_dump "your_database_url" -t table_name > table_backup.sql
```

### Restore from Backup

```bash
psql "your_database_url" < backup_file.sql
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [C2C Marketplace System Overview](../c2c-marketplace-system-overview.md)
