# Proposed New Features v2: Rides, Deliveries & Marketplace

This document outlines the database schemas and API endpoints for a comprehensive application that includes ride-sharing, a delivery marketplace, and robust user/driver management features.

---

## 1. Ride-Sharing Features

This section covers all features related to the core ride-sharing functionality, from booking to safety.

### 1.1. Driver Mode & Management

#### Schema Changes

**`drivers` Table (Modified)**
To support deliveries and track driver status.

```sql
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    profile_image_url TEXT,
    car_image_url TEXT,
    car_model VARCHAR(100),
    license_plate VARCHAR(20) UNIQUE,
    car_seats INTEGER NOT NULL CHECK (car_seats > 0),
    status VARCHAR(20) DEFAULT 'offline', -- offline, online, in_ride, on_delivery
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    can_do_deliveries BOOLEAN DEFAULT false -- Added for delivery functionality
);
```

**`driver_documents` Table**
For handling the driver verification process.

```sql
CREATE TABLE driver_documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g., 'license', 'vehicle_registration'
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'pending'
);
```

#### API Endpoints

| Method | Endpoint                        | Description                                            |
| :----- | :------------------------------ | :----------------------------------------------------- |
| `POST` | `/api/driver/register`          | Allows a new driver to sign up.                        |
| `POST` | `/api/driver/documents`         | Uploads verification documents for a driver.           |
| `PUT`  | `/api/driver/{driverId}/status` | Updates a driver's status (e.g., 'online', 'offline'). |
| `GET`  | `/api/driver/ride-requests`     | Fetches available ride requests for an online driver.  |
| `POST` | `/api/ride/{rideId}/accept`     | Allows a driver to accept a ride request.              |

---

### 1.2. Booking & Payments

#### Schema Changes

**`ride_tiers` Table**
To define different vehicle categories.

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

**`rides` Table (Modified)**
To support different ride tiers and scheduling.

```sql
CREATE TABLE rides (
    ride_id SERIAL PRIMARY KEY,
    -- ... existing fields from original schema
    tier_id INTEGER REFERENCES ride_tiers(id),
    scheduled_for TIMESTAMP
);
```

**`promotions`, `wallets`, `wallet_transactions` Tables**
_Identical to the ones in `newFeatures.md`._

#### API Endpoints

| Method | Endpoint                | Description                                            |
| :----- | :---------------------- | :----------------------------------------------------- |
| `POST` | `/api/ride/schedule`    | Schedules a ride for a future date and time.           |
| `GET`  | `/api/ride/estimate`    | Provides a fare estimate based on route and ride tier. |
| `POST` | `/api/promo/apply`      | Applies a promo code to a user's next ride or order.   |
| `GET`  | `/api/wallet`           | Retrieves the user's wallet balance.                   |
| `POST` | `/api/wallet/add-funds` | Adds funds to the user's wallet.                       |

---

### 1.3. Safety, Ratings & Real-time Chat

**`ratings`, `emergency_contacts`, `chat_messages` Tables**
_Identical to the ones in `newFeatures.md`._

#### API Endpoints

| Method | Endpoint                       | Description                                        |
| :----- | :----------------------------- | :------------------------------------------------- |
| `POST` | `/api/ride/{rideId}/rate`      | Submits a rating and comment for a completed ride. |
| `POST` | `/api/safety/sos`              | Triggers an emergency action.                      |
| `GET`  | `/api/user/emergency-contacts` | Retrieves a user's emergency contacts.             |
| `POST` | `/api/user/emergency-contacts` | Adds a new emergency contact.                      |
| `GET`  | `/api/chat/{rideId}/messages`  | Retrieves the chat history for a ride.             |
| `POST` | `/api/chat/{rideId}/messages`  | Sends a new message in the chat.                   |

---

## 2. Deliveries & Marketplace

This section introduces a new vertical for the app: a marketplace for stores (e.g., restaurants, shops) and a delivery system.

### 2.1. Marketplace Schema

**`stores` Table**
To represent the businesses on the platform.

```sql
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    category VARCHAR(50), -- e.g., 'Restaurant', 'Groceries', 'Pharmacy'
    cuisine_type VARCHAR(50), -- e.g., 'Italian', 'Mexican'
    logo_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    is_open BOOLEAN DEFAULT true,
    owner_clerk_id VARCHAR(50) -- Optional: for a store management portal
);
```

**`products` Table**
For items sold by the stores.

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(50), -- e.g., 'Appetizers', 'Main Course', 'Beverages'
    is_available BOOLEAN DEFAULT true
);
```

### 2.2. Delivery Schema

**`delivery_orders` Table**
To track a delivery order from creation to completion.

```sql
CREATE TABLE delivery_orders (
    order_id SERIAL PRIMARY KEY,
    user_clerk_id VARCHAR(50) NOT NULL,
    store_id INTEGER REFERENCES stores(id) NOT NULL,
    courier_id INTEGER REFERENCES drivers(id), -- A driver can be a courier
    delivery_address VARCHAR(255) NOT NULL,
    delivery_latitude DECIMAL(9, 6) NOT NULL,
    delivery_longitude DECIMAL(9, 6) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    tip DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready_for_pickup, picked_up, delivered, cancelled
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**`order_items` Table**
A join table to list all products within a single delivery order.

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES delivery_orders(order_id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL -- Price of the item when the order was placed
);
```

### 2.3. Marketplace & Delivery API Endpoints

#### For Customers

| Method | Endpoint                            | Description                                                    |
| :----- | :---------------------------------- | :------------------------------------------------------------- |
| `GET`  | `/api/marketplace/stores`           | List all stores (can be filtered by category, location, etc.). |
| `GET`  | `/api/marketplace/stores/{storeId}` | Get details for a specific store, including its products.      |
| `GET`  | `/api/marketplace/search`           | Search for stores or products.                                 |
| `POST` | `/api/delivery/orders`              | Creates a new delivery order from a user's cart.               |
| `GET`  | `/api/delivery/orders/{orderId}`    | Get the live status and details of a specific order.           |
| `GET`  | `/api/user/delivery-history`        | Get the user's past delivery orders.                           |

#### For Couriers (Drivers)

| Method | Endpoint                         | Description                                                   |
| :----- | :------------------------------- | :------------------------------------------------------------ |
| `GET`  | `/api/courier/delivery-requests` | Fetches available delivery requests for an online courier.    |
| `POST` | `/api/delivery/{orderId}/accept` | Allows a courier to accept a delivery request.                |
| `PUT`  | `/api/delivery/{orderId}/status` | Updates the delivery status (e.g., 'picked_up', 'delivered'). |

#### For Stores (Future)

A separate set of endpoints could be created for a store management portal.

- `PUT /api/store/{storeId}/status` (e.g., open/close store)
- `POST /api/store/{storeId}/products` (add a new product)
- `GET /api/store/{storeId}/orders` (view incoming orders)
