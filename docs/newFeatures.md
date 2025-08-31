# Proposed New Features: Database Schema & API Endpoints

Based on the existing schema, here is a detailed breakdown of the new tables and API endpoints required to implement the suggested features and create a more comprehensive Uber clone.

---

## 1. Driver Mode & Management

These features are essential for the driver-side of the application, covering everything from onboarding to managing rides and earnings.

### Schema Changes

#### Modified `drivers` Table
We need to add fields to track a driver's availability and verification status.

```sql
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    profile_image_url TEXT,
    car_image_url TEXT,
    car_model VARCHAR(100), -- Added
    license_plate VARCHAR(20) UNIQUE, -- Added
    car_seats INTEGER NOT NULL CHECK (car_seats > 0),
    -- The rating will be calculated from the new `ratings` table
    status VARCHAR(20) DEFAULT 'offline', -- offline, online, in_ride
    verification_status VARCHAR(20) DEFAULT 'pending' -- pending, approved, rejected
);
```

#### New Table: `driver_documents`
To handle the driver onboarding and verification process.

```sql
CREATE TABLE driver_documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g., 'license', 'vehicle_registration'
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'pending' -- pending, approved, rejected
);
```

### New API Endpoints

| Method | Endpoint                       | Description                                            |
| :----- | :----------------------------- | :----------------------------------------------------- |
| `POST` | `/api/driver/register`         | Allows a new driver to sign up.                        |
| `POST` | `/api/driver/documents`        | Uploads verification documents for a driver.           |
| `PUT`  | `/api/driver/{driverId}/status`| Updates a driver's status (e.g., 'online', 'offline'). |
| `GET`  | `/api/driver/ride-requests`    | Fetches available ride requests for an online driver.  |
| `POST` | `/api/ride/{rideId}/accept`    | Allows a driver to accept a ride request.              |

---

## 2. Real-time Features (Chat & Tracking)

To enable live communication and tracking between the rider and driver.

### Schema Changes

#### New Table: `chat_messages`
To store messages related to a specific ride.

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) NOT NULL,
    sender_clerk_id VARCHAR(50) NOT NULL, -- Can be a user or a driver
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### New API & WebSocket Endpoints

| Type      | Endpoint / Event Name          | Description                                                    |
| :-------- | :----------------------------- | :------------------------------------------------------------- |
| `API GET` | `/api/chat/{rideId}/messages`  | Retrieves the chat history for a specific ride.                |
| `API POST`| `/api/chat/{rideId}/messages`  | Sends a new message in the chat.                               |
| `WebSocket`| `driver-location-update`     | Pushes the driver's live location to the rider during a trip.  |
| `WebSocket`| `new-chat-message`           | Pushes new chat messages in real-time to both parties.         |

---

## 3. Enhanced Booking & Payments

To provide more flexibility with ride options, scheduling, and payments.

### Schema Changes

#### Modified `rides` Table
We need to add support for different ride tiers.

```sql
CREATE TABLE rides (
    ride_id SERIAL PRIMARY KEY,
    -- ... existing fields
    tier_id INTEGER REFERENCES ride_tiers(id), -- Added
    scheduled_for TIMESTAMP, -- Added for scheduled rides
    -- ... existing fields
);
```

#### New Table: `ride_tiers`
To define different vehicle categories and their pricing.

```sql
CREATE TABLE ride_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., 'Economy', 'Premium', 'SUV'
    base_fare DECIMAL(10, 2) NOT NULL,
    per_minute_rate DECIMAL(10, 2) NOT NULL,
    per_mile_rate DECIMAL(10, 2) NOT NULL,
    image_url TEXT
);
```

#### New Table: `promotions`
To manage promotional codes and discounts.

```sql
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true
);
```

#### New Table: `wallets`
To manage user wallet balances and transaction history.

```sql
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### New API Endpoints

| Method | Endpoint                      | Description                                                  |
| :----- | :---------------------------- | :----------------------------------------------------------- |
| `POST` | `/api/ride/schedule`          | Schedules a ride for a future date and time.                 |
| `GET`  | `/api/ride/estimate`          | Provides a fare estimate based on route and ride tier.       |
| `POST` | `/api/promo/apply`            | Applies a promo code to a user's next ride.                  |
| `GET`  | `/api/wallet`                 | Retrieves the user's wallet balance.                         |
| `POST` | `/api/wallet/add-funds`       | Adds funds to the user's wallet via a payment provider.      |

---

## 4. Safety & Ratings

To build a trustworthy platform with feedback mechanisms and safety features.

### Schema Changes

#### New Table: `ratings`
A two-way rating system for both riders and drivers. This replaces the single `rating` column in the `drivers` table.

```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(ride_id) NOT NULL,
    rated_by_clerk_id VARCHAR(50) NOT NULL, -- The user giving the rating
    rated_clerk_id VARCHAR(50) NOT NULL, -- The user being rated
    rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rated_by_clerk_id) -- Ensures a user can only rate once per ride
);
```

#### New Table: `emergency_contacts`
Allows users to store contacts to notify in case of an emergency.

```sql
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL
);
```

### New API Endpoints

| Method | Endpoint                         | Description                                                    |
| :----- | :------------------------------- | :------------------------------------------------------------- |
| `POST` | `/api/ride/{rideId}/rate`        | Submits a rating and comment for a completed ride.             |
| `POST` | `/api/safety/sos`                | Triggers an emergency action (e.g., share trip, notify contacts). |
| `GET`  | `/api/user/emergency-contacts`   | Retrieves a user's emergency contacts.                         |
| `POST` | `/api/user/emergency-contacts`   | Adds a new emergency contact for the user.                     |
