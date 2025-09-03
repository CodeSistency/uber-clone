# Database Migration Guide

This document provides complete SQL scripts to migrate your Uber clone database with all the new features. It includes table creation, constraints, and sample dummy data for testing.

## 📋 Table of Contents

1. [Original Tables](#original-tables)
2. [New Feature Tables](#new-feature-tables)
3. [Migration Order](#migration-order)
4. [Complete Migration Script](#complete-migration-script)
5. [Dummy Data](#dummy-data)
6. [Testing the Migration](#testing-the-migration)

---

## Original Tables

These are the tables from your existing schema:

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clerk_id VARCHAR(50) UNIQUE NOT NULL
);
```

### Rides Table (Base Structure)

```sql
CREATE TABLE rides (
    ride_id SERIAL PRIMARY KEY,
    origin_address VARCHAR(255) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    origin_latitude DECIMAL(9, 6) NOT NULL,
    origin_longitude DECIMAL(9, 6) NOT NULL,
    destination_latitude DECIMAL(9, 6) NOT NULL,
    destination_longitude DECIMAL(9, 6) NOT NULL,
    ride_time INTEGER NOT NULL,
    fare_price DECIMAL(10, 2) NOT NULL CHECK (fare_price >= 0),
    payment_status VARCHAR(20) NOT NULL,
    driver_id INTEGER, -- Will be updated with foreign key later
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Drivers Table (Base Structure)

```sql
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    profile_image_url TEXT,
    car_image_url TEXT,
    car_seats INTEGER NOT NULL CHECK (car_seats > 0),
    rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5)
);
```

---

## New Feature Tables

### Driver Management

```sql
-- Add new columns to existing drivers table
ALTER TABLE drivers
ADD COLUMN car_model VARCHAR(100),
ADD COLUMN license_plate VARCHAR(20) UNIQUE,
ADD COLUMN status VARCHAR(20) DEFAULT 'offline',
ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';

-- Create driver_documents table
CREATE TABLE driver_documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'pending'
);
```

### Real-time Features

```sql
-- Create chat_messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) ON DELETE CASCADE,
    sender_clerk_id VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enhanced Booking & Payments

```sql
-- Create ride_tiers table
CREATE TABLE ride_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    base_fare DECIMAL(10, 2) NOT NULL,
    per_minute_rate DECIMAL(10, 2) NOT NULL,
    per_mile_rate DECIMAL(10, 2) NOT NULL,
    image_url TEXT
);

-- Add new columns to rides table
ALTER TABLE rides
ADD COLUMN tier_id INTEGER REFERENCES ride_tiers(id),
ADD COLUMN scheduled_for TIMESTAMP;

-- Create promotions table
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    CHECK (
        (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR
        (discount_percentage IS NULL AND discount_amount IS NOT NULL)
    )
);

-- Create wallets table
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Safety & Ratings

```sql
-- Create ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) ON DELETE CASCADE,
    rated_by_clerk_id VARCHAR(50) NOT NULL,
    rated_clerk_id VARCHAR(50) NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rated_by_clerk_id, rated_clerk_id)
);

-- Create emergency_contacts table
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update rides table to add foreign key constraint for driver_id
ALTER TABLE rides
ADD CONSTRAINT fk_rides_driver_id
FOREIGN KEY (driver_id) REFERENCES drivers(id);
```

---

## Migration Order

Execute the scripts in this exact order to avoid foreign key constraint errors:

1. **Original Tables** (if not already created):
   - `users`
   - `drivers` (base structure)
   - `rides` (base structure)

2. **Driver Management**:
   - Alter `drivers` table (add new columns)
   - Create `driver_documents`

3. **Real-time Features**:
   - Create `chat_messages`

4. **Enhanced Booking & Payments**:
   - Create `ride_tiers`
   - Alter `rides` table (add `tier_id` and `scheduled_for`)
   - Create `promotions`
   - Create `wallets`
   - Create `wallet_transactions`

5. **Safety & Ratings**:
   - Create `ratings`
   - Create `emergency_contacts`
   - Add foreign key constraint to `rides.driver_id`

---

## Complete Migration Script

Here's the complete migration script you can copy and paste into your SQL editor:

```sql
-- =========================================
-- UBER CLONE DATABASE MIGRATION SCRIPT
-- =========================================

-- Original Tables (uncomment if not already created)
-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     clerk_id VARCHAR(50) UNIQUE NOT NULL
-- );

-- CREATE TABLE drivers (
--     id SERIAL PRIMARY KEY,
--     first_name VARCHAR(50) NOT NULL,
--     last_name VARCHAR(50) NOT NULL,
--     profile_image_url TEXT,
--     car_image_url TEXT,
--     car_seats INTEGER NOT NULL CHECK (car_seats > 0),
--     rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5)
-- );

-- CREATE TABLE rides (
--     ride_id SERIAL PRIMARY KEY,
--     origin_address VARCHAR(255) NOT NULL,
--     destination_address VARCHAR(255) NOT NULL,
--     origin_latitude DECIMAL(9, 6) NOT NULL,
--     origin_longitude DECIMAL(9, 6) NOT NULL,
--     destination_latitude DECIMAL(9, 6) NOT NULL,
--     destination_longitude DECIMAL(9, 6) NOT NULL,
--     ride_time INTEGER NOT NULL,
--     fare_price DECIMAL(10, 2) NOT NULL CHECK (fare_price >= 0),
--     payment_status VARCHAR(20) NOT NULL,
--     driver_id INTEGER,
--     user_id VARCHAR(100) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =========================================
-- 1. DRIVER MANAGEMENT TABLES
-- =========================================

-- Add new columns to drivers table
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS car_model VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_plate VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';

-- Create driver_documents table
CREATE TABLE IF NOT EXISTS driver_documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'pending'
);

-- =========================================
-- 2. REAL-TIME FEATURES TABLES
-- =========================================

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) ON DELETE CASCADE,
    sender_clerk_id VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 3. ENHANCED BOOKING & PAYMENTS TABLES
-- =========================================

-- Create ride_tiers table
CREATE TABLE IF NOT EXISTS ride_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    base_fare DECIMAL(10, 2) NOT NULL,
    per_minute_rate DECIMAL(10, 2) NOT NULL,
    per_mile_rate DECIMAL(10, 2) NOT NULL,
    image_url TEXT
);

-- Add new columns to rides table
ALTER TABLE rides
ADD COLUMN IF NOT EXISTS tier_id INTEGER REFERENCES ride_tiers(id),
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    CHECK (
        (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR
        (discount_percentage IS NULL AND discount_amount IS NULL) OR
        (discount_percentage IS NULL AND discount_amount IS NOT NULL)
    )
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 4. SAFETY & RATINGS TABLES
-- =========================================

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) ON DELETE CASCADE,
    rated_by_clerk_id VARCHAR(50) NOT NULL,
    rated_clerk_id VARCHAR(50) NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rated_by_clerk_id, rated_clerk_id)
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to rides table
ALTER TABLE rides
ADD CONSTRAINT IF NOT EXISTS fk_rides_driver_id
FOREIGN KEY (driver_id) REFERENCES drivers(id);

-- =========================================
-- MIGRATION COMPLETE
-- =========================================
```

---

## Dummy Data

Here's a comprehensive set of dummy data to populate your database for testing:

```sql
-- =========================================
-- DUMMY DATA INSERTION SCRIPT
-- =========================================

-- Insert ride tiers
INSERT INTO ride_tiers (name, base_fare, per_minute_rate, per_mile_rate, image_url) VALUES
('Economy', 2.50, 0.25, 1.25, 'https://example.com/economy-car.png'),
('Premium', 5.00, 0.40, 2.50, 'https://example.com/premium-car.png'),
('SUV', 7.50, 0.60, 3.75, 'https://example.com/suv-car.png'),
('Luxury', 12.00, 1.00, 6.00, 'https://example.com/luxury-car.png');

-- Insert sample users
INSERT INTO users (name, email, clerk_id) VALUES
('John Doe', 'john.doe@example.com', 'user_2abc123def456'),
('Jane Smith', 'jane.smith@example.com', 'user_2def456ghi789'),
('Mike Johnson', 'mike.johnson@example.com', 'user_2ghi789jkl012'),
('Sarah Wilson', 'sarah.wilson@example.com', 'user_2jkl012mno345');

-- Insert sample drivers
INSERT INTO drivers (first_name, last_name, car_model, license_plate, car_seats, status, verification_status, profile_image_url, car_image_url) VALUES
('Alex', 'Rodriguez', 'Toyota Camry', 'ABC-1234', 4, 'online', 'approved', 'https://example.com/driver1.jpg', 'https://example.com/car1.jpg'),
('Maria', 'Garcia', 'Honda Civic', 'XYZ-5678', 4, 'online', 'approved', 'https://example.com/driver2.jpg', 'https://example.com/car2.jpg'),
('Carlos', 'Martinez', 'Ford Explorer', 'DEF-9012', 6, 'offline', 'approved', 'https://example.com/driver3.jpg', 'https://example.com/car3.jpg'),
('Elena', 'Lopez', 'BMW 3 Series', 'GHI-3456', 4, 'online', 'pending', 'https://example.com/driver4.jpg', 'https://example.com/car4.jpg');

-- Insert driver documents
INSERT INTO driver_documents (driver_id, document_type, document_url, verification_status) VALUES
(1, 'license', 'https://example.com/license1.pdf', 'approved'),
(1, 'vehicle_registration', 'https://example.com/registration1.pdf', 'approved'),
(2, 'license', 'https://example.com/license2.pdf', 'approved'),
(2, 'vehicle_registration', 'https://example.com/registration2.pdf', 'approved'),
(3, 'license', 'https://example.com/license3.pdf', 'approved'),
(3, 'vehicle_registration', 'https://example.com/registration3.pdf', 'approved'),
(4, 'license', 'https://example.com/license4.pdf', 'pending'),
(4, 'vehicle_registration', 'https://example.com/registration4.pdf', 'pending');

-- Insert sample rides
INSERT INTO rides (origin_address, destination_address, origin_latitude, origin_longitude, destination_latitude, destination_longitude, ride_time, fare_price, payment_status, driver_id, user_id, tier_id, scheduled_for) VALUES
('123 Main St, New York, NY', '456 Broadway, New York, NY', 40.7128, -74.0060, 40.7589, -73.9851, 25, 15.75, 'completed', 1, 'user_2abc123def456', 1, NULL),
('789 Park Ave, New York, NY', '321 Elm St, New York, NY', 40.7614, -73.9776, 40.7505, -73.9934, 18, 12.25, 'completed', 2, 'user_2def456ghi789', 1, NULL),
('555 5th Ave, New York, NY', '888 Madison Ave, New York, NY', 40.7549, -73.9840, 40.7744, -73.9653, 30, 22.50, 'pending', NULL, 'user_2ghi789jkl012', 2, '2024-12-25 14:00:00'),
('999 Wall St, New York, NY', '777 Water St, New York, NY', 40.7074, -74.0113, 40.7033, -74.0170, 12, 8.50, 'completed', 3, 'user_2jkl012mno345', 1, NULL);

-- Insert promotions
INSERT INTO promotions (promo_code, discount_percentage, discount_amount, expiry_date, is_active) VALUES
('WELCOME10', 10.00, NULL, '2024-12-31', true),
('SAVE5', NULL, 5.00, '2024-12-31', true),
('HOLIDAY20', 20.00, NULL, '2024-12-25', true),
('FIRST5', NULL, 5.00, '2024-12-31', false);

-- Insert wallets
INSERT INTO wallets (user_clerk_id, balance) VALUES
('user_2abc123def456', 25.50),
('user_2def456ghi789', 15.75),
('user_2ghi789jkl012', 50.00),
('user_2jkl012mno345', 8.25);

-- Insert wallet transactions
INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description) VALUES
(1, 50.00, 'credit', 'Initial wallet funding'),
(1, -15.75, 'debit', 'Ride payment - 123 Main St to 456 Broadway'),
(1, 25.00, 'credit', 'Bonus reward'),
(2, 30.00, 'credit', 'Wallet top-up'),
(2, -12.25, 'debit', 'Ride payment - 789 Park Ave to 321 Elm St'),
(3, 75.00, 'credit', 'Referral bonus'),
(4, 20.00, 'credit', 'Welcome bonus'),
(4, -8.50, 'debit', 'Ride payment - 999 Wall St to 777 Water St');

-- Insert ratings
INSERT INTO ratings (ride_id, rated_by_clerk_id, rated_clerk_id, rating_value, comment) VALUES
(1, 'user_2abc123def456', 'driver_1', 5, 'Great driver! Very professional and safe driving.'),
(1, 'driver_1', 'user_2abc123def456', 4, 'Pleasant passenger, clear directions.'),
(2, 'user_2def456ghi789', 'driver_2', 4, 'Good service, car was clean.'),
(2, 'driver_2', 'user_2def456ghi789', 5, 'Nice passenger, good conversation.'),
(4, 'user_2jkl012mno345', 'driver_3', 5, 'Excellent driver, very courteous.'),
(4, 'driver_3', 'user_2jkl012mno345', 4, 'Good passenger, timely pickup.');

-- Insert emergency contacts
INSERT INTO emergency_contacts (user_clerk_id, contact_name, contact_phone) VALUES
('user_2abc123def456', 'Emergency Contact 1', '+1-555-0101'),
('user_2abc123def456', 'Emergency Contact 2', '+1-555-0102'),
('user_2def456ghi789', 'John Smith', '+1-555-0201'),
('user_2ghi789jkl012', 'Mary Johnson', '+1-555-0301'),
('user_2ghi789jkl012', 'Bob Wilson', '+1-555-0302'),
('user_2jkl012mno345', 'Alice Brown', '+1-555-0401');

-- Insert chat messages
INSERT INTO chat_messages (ride_id, sender_clerk_id, message_text) VALUES
(1, 'user_2abc123def456', 'Hi, I\'m waiting at the front entrance.'),
(1, 'driver_1', 'Great, I\'ll be there in 2 minutes.'),
(1, 'user_2abc123def456', 'Thank you!'),
(2, 'driver_2', 'Hello! I\'ve arrived at your location.'),
(2, 'user_2def456ghi789', 'Perfect, I\'m coming out now.'),
(4, 'user_2jkl012mno345', 'Could you please turn up the AC?'),
(4, 'driver_3', 'Of course, adjusting the temperature now.');

-- =========================================
-- DUMMY DATA INSERTION COMPLETE
-- =========================================
```

---

## Testing the Migration

After running the migration and dummy data scripts, you can test that everything is working correctly:

### Basic Verification Queries

```sql
-- Check table counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'rides', COUNT(*) FROM rides
UNION ALL
SELECT 'ride_tiers', COUNT(*) FROM ride_tiers
UNION ALL
SELECT 'promotions', COUNT(*) FROM promotions
UNION ALL
SELECT 'wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings;

-- Test relationships
SELECT
    r.ride_id,
    u.name as user_name,
    d.first_name || ' ' || d.last_name as driver_name,
    rt.name as tier_name,
    r.fare_price,
    r.payment_status
FROM rides r
LEFT JOIN users u ON r.user_id = u.clerk_id
LEFT JOIN drivers d ON r.driver_id = d.id
LEFT JOIN ride_tiers rt ON r.tier_id = rt.id
ORDER BY r.created_at DESC;

-- Test wallet functionality
SELECT
    w.user_clerk_id,
    w.balance,
    COUNT(wt.id) as transaction_count,
    SUM(CASE WHEN wt.transaction_type = 'credit' THEN wt.amount ELSE 0 END) as total_credited,
    SUM(CASE WHEN wt.transaction_type = 'debit' THEN wt.amount ELSE 0 END) as total_debited
FROM wallets w
LEFT JOIN wallet_transactions wt ON w.id = wt.wallet_id
GROUP BY w.id, w.user_clerk_id, w.balance;

-- Test ratings system
SELECT
    AVG(rating_value) as avg_rating,
    COUNT(*) as total_ratings,
    rated_clerk_id
FROM ratings
GROUP BY rated_clerk_id
ORDER BY avg_rating DESC;
```

### API Testing Checklist

- [ ] User registration and authentication
- [ ] Driver registration and document upload
- [ ] Ride booking and scheduling
- [ ] Real-time chat functionality
- [ ] Payment processing and wallet management
- [ ] Rating system
- [ ] Emergency contact management
- [ ] Promotion code application

---

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**: Make sure to create tables in the correct order as specified in the migration order section.

2. **Duplicate Key Errors**: The scripts use `IF NOT EXISTS` clauses, but if you're running them multiple times, you might need to clean up existing data first.

3. **Permission Errors**: Ensure your database user has the necessary permissions to create tables and insert data.

### Rollback Scripts

If you need to rollback the migration:

```sql
-- Drop all new tables (be careful with this!)
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS ride_tiers;
DROP TABLE IF EXISTS driver_documents;

-- Remove added columns from existing tables
ALTER TABLE drivers DROP COLUMN IF EXISTS car_model;
ALTER TABLE drivers DROP COLUMN IF EXISTS license_plate;
ALTER TABLE drivers DROP COLUMN IF EXISTS status;
ALTER TABLE drivers DROP COLUMN IF EXISTS verification_status;

ALTER TABLE rides DROP COLUMN IF EXISTS tier_id;
ALTER TABLE rides DROP COLUMN IF EXISTS scheduled_for;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS fk_rides_driver_id;
```

---

## 📞 Support

If you encounter any issues during migration:

1. Check the database logs for detailed error messages
2. Verify that all prerequisites are met (database permissions, etc.)
3. Test the migration on a development database first
4. Ensure all foreign key relationships are properly defined

For questions or issues, please refer to the API documentation or contact the development team.
