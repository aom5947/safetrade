-- ============================================
-- C2C Marketplace Seed Data
-- ============================================
-- Description: Initial data for categories and test users
-- Run this after schema.sql
-- ============================================

-- ============================================
-- SEED CATEGORIES
-- ============================================

-- Main Categories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active) VALUES
('Electronics', 'electronics', '📱', NULL, 1, TRUE),
('Home & Living', 'home-living', '🏠', NULL, 3, TRUE),
('Fashion', 'fashion', '👕', NULL, 4, TRUE),
('Sports & Hobbies', 'sports-hobbies', '⚽', NULL, 5, TRUE),
('Books & Media', 'books-media', '📚', NULL, 6, TRUE),
('Services', 'services', '🛠️', NULL, 8, TRUE);

-- Electronics Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Phones', 'phones', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Laptops', 'laptops', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Cameras', 'cameras', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Gaming', 'gaming', NULL, category_id, 4, TRUE FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Tablets', 'tablets', NULL, category_id, 5, TRUE FROM categories WHERE slug = 'electronics';

-- Home & Living Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Furniture', 'furniture', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'home-living'
UNION ALL
SELECT 'Appliances', 'appliances', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'home-living'
UNION ALL
SELECT 'Home Decor', 'home-decor', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'home-living'
UNION ALL
SELECT 'Kitchen', 'kitchen', NULL, category_id, 4, TRUE FROM categories WHERE slug = 'home-living'
UNION ALL
SELECT 'Garden', 'garden', NULL, category_id, 5, TRUE FROM categories WHERE slug = 'home-living';

-- Fashion Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Clothing', 'clothing', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'fashion'
UNION ALL
SELECT 'Shoes', 'shoes', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'fashion'
UNION ALL
SELECT 'Bags', 'bags', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'fashion'
UNION ALL
SELECT 'Accessories', 'accessories', NULL, category_id, 4, TRUE FROM categories WHERE slug = 'fashion'
UNION ALL
SELECT 'Watches', 'watches', NULL, category_id, 5, TRUE FROM categories WHERE slug = 'fashion';

-- Sports & Hobbies Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Sports Equipment', 'sports-equipment', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'sports-hobbies'
UNION ALL
SELECT 'Fitness', 'fitness', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'sports-hobbies'
UNION ALL
SELECT 'Musical Instruments', 'musical-instruments', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'sports-hobbies'
UNION ALL
SELECT 'Art & Crafts', 'art-crafts', NULL, category_id, 4, TRUE FROM categories WHERE slug = 'sports-hobbies';

-- Books & Media Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Books', 'books', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'books-media'
UNION ALL
SELECT 'Movies & Music', 'movies-music', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'books-media'
UNION ALL
SELECT 'Games', 'games', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'books-media';

-- Services Subcategories
INSERT INTO categories (name, slug, icon, parent_id, display_order, is_active)
SELECT 'Home Services', 'home-services', NULL, category_id, 1, TRUE FROM categories WHERE slug = 'services'
UNION ALL
SELECT 'Tutoring', 'tutoring', NULL, category_id, 2, TRUE FROM categories WHERE slug = 'services'
UNION ALL
SELECT 'Beauty & Wellness', 'beauty-wellness', NULL, category_id, 3, TRUE FROM categories WHERE slug = 'services';

-- ============================================
-- SEED TEST USERS (with bcrypt hashed passwords)
-- ============================================
-- Password for all test users: "password123"
-- Bcrypt hash: $2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau

-- Super Admin
INSERT INTO users (username, email, password, first_name, last_name, user_role, email_verified, status, is_verified)
VALUES ('superadmin', 'superadmin@marketplace.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Super', 'Admin', 'super_admin', TRUE, 'active', TRUE);

-- Admin
INSERT INTO users (username, email, password, first_name, last_name, user_role, email_verified, status, is_verified)
VALUES ('admin', 'admin@marketplace.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Admin', 'User', 'admin', TRUE, 'active', TRUE);

-- Test Sellers
INSERT INTO users (username, email, password, first_name, last_name, phone, user_role, email_verified, status, rating_average, rating_count, is_verified, listing_count)
VALUES
('seller1', 'seller1@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'John', 'Seller', '081-234-5678', 'seller', TRUE, 'active', 4.50, 10, TRUE, 5),
('seller2', 'seller2@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Jane', 'Merchant', '082-345-6789', 'seller', TRUE, 'active', 4.80, 15, TRUE, 8),
('seller3', 'seller3@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Bob', 'Store', '083-456-7890', 'seller', TRUE, 'active', 4.20, 5, FALSE, 2);

-- Test Buyers
INSERT INTO users (username, email, password, first_name, last_name, phone, user_role, email_verified, status)
VALUES
('buyer1', 'buyer1@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Alice', 'Buyer', '084-567-8901', 'buyer', TRUE, 'active'),
('buyer2', 'buyer2@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Charlie', 'Customer', '085-678-9012', 'buyer', TRUE, 'active'),
('buyer3', 'buyer3@test.com', '$2a$10$rKZJQQNwGQP7Cx8e7K5j/uXV8qWh4XM0IG5YFLKqNgqG8YHpH5gau', 'Diana', 'Shopper', '086-789-0123', 'buyer', TRUE, 'active');

-- ============================================
-- SEED TEST LISTINGS
-- ============================================

-- Get category IDs for use in listings
DO $$
DECLARE
    electronics_id INTEGER;
    phones_id INTEGER;
    laptops_id INTEGER;
    vehicles_id INTEGER;
    cars_id INTEGER;
    furniture_id INTEGER;
    seller1_id INTEGER;
    seller2_id INTEGER;
    seller3_id INTEGER;
BEGIN
    -- Get category IDs
    SELECT category_id INTO electronics_id FROM categories WHERE slug = 'electronics';
    SELECT category_id INTO phones_id FROM categories WHERE slug = 'phones';
    SELECT category_id INTO laptops_id FROM categories WHERE slug = 'laptops';
    SELECT category_id INTO vehicles_id FROM categories WHERE slug = 'vehicles';
    SELECT category_id INTO cars_id FROM categories WHERE slug = 'cars';
    SELECT category_id INTO furniture_id FROM categories WHERE slug = 'furniture';

    -- Get seller IDs
    SELECT user_id INTO seller1_id FROM users WHERE username = 'seller1';
    SELECT user_id INTO seller2_id FROM users WHERE username = 'seller2';
    SELECT user_id INTO seller3_id FROM users WHERE username = 'seller3';

    -- Insert sample listings
    INSERT INTO listings (seller_id, category_id, title, description, price, location, status, view_count, contact_count, expires_at)
    VALUES
    (seller1_id, phones_id, 'iPhone 13 Pro 256GB - Like New', 'Excellent condition iPhone 13 Pro with 256GB storage. Used for 6 months, no scratches. Includes original box and accessories.', 25000.00, 'Bangkok', 'active', 45, 5, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    (seller1_id, laptops_id, 'MacBook Air M2 2022', 'Brand new sealed MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Still under warranty.', 38000.00, 'Bangkok', 'active', 120, 8, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    (seller1_id, electronics_id, 'Sony WH-1000XM4 Headphones', 'Premium noise-cancelling headphones in perfect condition. Used only a few times.', 8500.00, 'Bangkok', 'active', 30, 3, CURRENT_TIMESTAMP + INTERVAL '30 days'),

    (seller2_id, cars_id, 'Toyota Camry 2018', '2018 Toyota Camry in excellent condition. Well maintained, full service history. 65,000 km.', 650000.00, 'Chiang Mai', 'active', 200, 15, CURRENT_TIMESTAMP + INTERVAL '60 days'),
    (seller2_id, furniture_id, 'Modern Sofa Set', 'Beautiful 3-seater sofa with matching armchairs. Like new condition, smoke-free home.', 15000.00, 'Bangkok', 'active', 55, 7, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    (seller2_id, phones_id, 'Samsung Galaxy S23 Ultra', 'Latest Samsung flagship phone, 512GB, black color. Used for 2 months only.', 32000.00, 'Phuket', 'active', 90, 12, CURRENT_TIMESTAMP + INTERVAL '30 days'),

    (seller3_id, laptops_id, 'Gaming Laptop ASUS ROG', 'High-performance gaming laptop. RTX 3060, Intel i7, 16GB RAM, 512GB SSD.', 45000.00, 'Bangkok', 'active', 65, 4, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    (seller3_id, electronics_id, 'iPad Pro 11" 2021', 'iPad Pro with Magic Keyboard and Apple Pencil. Perfect for work and creativity.', 28000.00, 'Bangkok', 'pending', 0, 0, CURRENT_TIMESTAMP + INTERVAL '30 days');

    -- Insert a sold listing
    INSERT INTO listings (seller_id, category_id, title, description, price, location, status, view_count, contact_count, created_at)
    VALUES (seller1_id, phones_id, 'iPhone 12 128GB', 'Good condition iPhone 12. Battery health 85%. No box but includes charger.', 15000.00, 'Bangkok', 'sold', 150, 25, CURRENT_TIMESTAMP - INTERVAL '15 days');

END $$;

-- ============================================
-- SEED LISTING IMAGES
-- ============================================

-- Add placeholder images for listings (you can replace these with real UploadThing URLs later)
INSERT INTO listing_images (listing_id, image_url, display_order)
VALUES
(1, 'https://via.placeholder.com/800x600?text=iPhone+13+Pro', 0),
(1, 'https://via.placeholder.com/800x600?text=iPhone+13+Pro+Back', 1),
(2, 'https://via.placeholder.com/800x600?text=MacBook+Air+M2', 0),
(3, 'https://via.placeholder.com/800x600?text=Sony+Headphones', 0),
(4, 'https://via.placeholder.com/800x600?text=Toyota+Camry', 0),
(4, 'https://via.placeholder.com/800x600?text=Camry+Interior', 1),
(5, 'https://via.placeholder.com/800x600?text=Modern+Sofa', 0),
(6, 'https://via.placeholder.com/800x600?text=Galaxy+S23', 0),
(7, 'https://via.placeholder.com/800x600?text=Gaming+Laptop', 0),
(8, 'https://via.placeholder.com/800x600?text=iPad+Pro', 0);

-- ============================================
-- VERIFICATION
-- ============================================

-- Count records
DO $$
DECLARE
    category_count INTEGER;
    user_count INTEGER;
    listing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO listing_count FROM listings;

    RAISE NOTICE 'Seed data created successfully:';
    RAISE NOTICE '- Categories: %', category_count;
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Listings: %', listing_count;
END $$;

-- Display test credentials
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'TEST ACCOUNTS (password: password123)';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Super Admin: superadmin@marketplace.com';
    RAISE NOTICE 'Admin: admin@marketplace.com';
    RAISE NOTICE 'Seller 1: seller1@test.com';
    RAISE NOTICE 'Seller 2: seller2@test.com';
    RAISE NOTICE 'Seller 3: seller3@test.com';
    RAISE NOTICE 'Buyer 1: buyer1@test.com';
    RAISE NOTICE 'Buyer 2: buyer2@test.com';
    RAISE NOTICE 'Buyer 3: buyer3@test.com';
    RAISE NOTICE '==============================================';
END $$;
