-- ============================================
-- C2C Marketplace Database Schema
-- ============================================
-- Database: PostgreSQL (NeonDB)
-- Description: Complete schema for C2C marketplace platform
-- ============================================

-- Drop existing tables if needed (use with caution in production)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS saved_listings CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS guest_contacts CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;
-- DROP TABLE IF EXISTS listing_images CASCADE;
-- DROP TABLE IF EXISTS listings CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS wallet_transactions CASCADE;
-- DROP TABLE IF EXISTS user_wallets CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS user_status CASCADE;
-- DROP TYPE IF EXISTS listing_status CASCADE;
-- DROP TYPE IF EXISTS report_type CASCADE;
-- DROP TYPE IF EXISTS report_status CASCADE;

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE listing_status AS ENUM ('pending', 'active', 'sold', 'expired', 'hidden', 'rejected');
CREATE TYPE report_type AS ENUM ('listing', 'user', 'review');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');

-- ============================================
-- TABLE 1: users
-- ============================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    user_role user_role NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    rating_average NUMERIC(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
    rating_count INTEGER DEFAULT 0,
    trust_score NUMERIC(5,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    listing_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- TABLE 2: categories
-- ============================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    parent_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- TABLE 3: listings
-- ============================================

CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    location TEXT,
    location_lat NUMERIC(10,8),
    location_lng NUMERIC(11,8),
    status listing_status DEFAULT 'active',
    view_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for listings
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_expires_at ON listings(expires_at);

-- Full-text search index for title and description
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || description));

-- ============================================
-- TABLE 4: listing_images
-- ============================================

CREATE TABLE listing_images (
    image_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for listing_images
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- ============================================
-- TABLE 5: conversations
-- ============================================

CREATE TABLE conversations (
    conversation_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, buyer_id, seller_id)
);

-- Index for conversations
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- TABLE 6: messages
-- ============================================

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

-- ============================================
-- TABLE 7: guest_contacts
-- ============================================

CREATE TABLE guest_contacts (
    contact_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    message TEXT,
    contacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for guest_contacts
CREATE INDEX idx_guest_contacts_listing_id ON guest_contacts(listing_id);
CREATE INDEX idx_guest_contacts_contacted_at ON guest_contacts(contacted_at DESC);

-- ============================================
-- TABLE 8: reviews
-- ============================================

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewed_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_spam BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, reviewer_id)
);

-- Index for reviews
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- TABLE 9: saved_listings
-- ============================================

CREATE TABLE saved_listings (
    saved_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Index for saved_listings
CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings(listing_id);

-- ============================================
-- TABLE 10: reports
-- ============================================

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    reported_type report_type NOT NULL,
    reported_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    resolved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for reports
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_type ON reports(reported_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- TABLE 11: activity_logs
-- ============================================

CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp on users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (Optional - for common queries)
-- ============================================

-- View for listings with seller info
CREATE VIEW listings_with_seller AS
SELECT
    l.*,
    u.username as seller_username,
    u.first_name as seller_first_name,
    u.last_name as seller_last_name,
    u.avatar_url as seller_avatar,
    u.rating_average as seller_rating,
    u.rating_count as seller_rating_count,
    c.name as category_name,
    c.slug as category_slug
FROM listings l
JOIN users u ON l.seller_id = u.user_id
LEFT JOIN categories c ON l.category_id = c.category_id;

-- ============================================
-- INITIAL SETUP COMMENTS
-- ============================================

-- To run this schema:
-- 1. Connect to your NeonDB database
-- 2. Execute this entire file
-- 3. Run the seed.sql file to populate initial data
-- 4. Verify tables with: \dt
-- 5. Verify indexes with: \di

COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE listings IS 'Product listings posted by sellers';
COMMENT ON TABLE categories IS 'Hierarchical categories for listings';
COMMENT ON TABLE conversations IS 'Chat conversations between buyers and sellers';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE reviews IS 'Reviews and ratings for sellers';
COMMENT ON TABLE reports IS 'User reports for inappropriate content';
COMMENT ON TABLE activity_logs IS 'Audit trail of system actions';
