# Uber-like App Wireframes: Business Flow

## Overview

This document contains ASCII wireframes for the business management journey in the Uber-like multi-modal application.

## 1. Business Dashboard

```
┌─────────────────────────────────────┐
│  ☰    My Restaurant          ↗      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🟢 Store Status: Open          │
│    │ Operating Hours: 9AM - 10PM    │
│    └─────────────────────────┘      │
│                                     │
│    Today's Orders: 47               │
│    Revenue: $1,247.50    Rating: ⭐ 4.6 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📦 Active Orders               │
│    │                                │
│    │ 🟡 3 orders being prepared     │
│    │ 🟠 2 orders ready for pickup   │
│    │ 🟢 1 order out for delivery    │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📊 Quick Stats                │
│    │                                │
│    │ Avg. Order Value: $26.50      │
│    │ Delivery Time: 28 min         │
│    │ Customer Satisfaction: 94%    │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📋 View All Orders            │
│    └─────────────────────────┘      │
│                                     │
│  🏠        📦        📊            │
└─────────────────────────────────────┘
```

## 2. Orders Management Screen

```
┌─────────────────────────────────────┐
│           Orders                    │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🔄 Active Orders              │
│    │ 8 orders                      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ #1023 - John Smith             │
│    │ 🟡 Preparing                  │
│    │ 2x Burger, 1x Fries           │
│    │ $24.50                        │
│    │                                │
│    │ [Mark Ready]                  │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ #1024 - Sarah Johnson          │
│    │ 🟠 Ready for Pickup           │
│    │ 1x Pizza, 1x Salad            │
│    │ $18.75                        │
│    │                                │
│    │ [Assign Driver]               │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ #1025 - Mike Wilson            │
│    │ 🟢 Out for Delivery           │
│    │ 3x Tacos                      │
│    │ $12.00                        │
│    │                                │
│    │ Driver: John D.               │
│    └─────────────────────────┘      │
│                                     │
│    [New Order]    [Filter]    [Search] │
│                                     │
└─────────────────────────────────────┘
```

## 3. Menu Management Screen

```
┌─────────────────────────────────────┐
│           Menu                      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🍕 Categories                  │
│    │                                │
│    │ 🍔 Burgers     🍕 Pizza        │
│    │ 🥗 Salads     🥤 Drinks        │
│    │ 🍟 Sides      🍨 Desserts      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🍔 Classic Burger              │
│    │ $12.99                         │
│    │                                │
│    │ Juicy beef patty with lettuce │
│    │ tomatoes, onions, and special │
│    │ sauce                         │
│    │                                │
│    │ [Edit]    [Toggle]    [Delete] │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🆕 Add New Item                │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📊 Menu Performance            │
│    │                                │
│    │ Best Seller: Classic Burger    │
│    │ Orders Today: 23              │
│    │ Revenue: $298.77              │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 4. Analytics Dashboard

```
┌─────────────────────────────────────┐
│           Analytics                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📈 Revenue Overview            │
│    │                                │
│    │ Today: $1,247.50              │
│    │ This Week: $7,892.25          │
│    │ This Month: $31,456.80        │
│    │                                │
    │ ▲ 12% vs last week            │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📊 Popular Items              │
│    │                                │
│    │ 1. 🍔 Classic Burger   23      │
│    │ 2. 🍕 Margherita Pizza 18      │
│    │ 3. 🥗 Caesar Salad     15      │
│    │ 4. 🍟 French Fries     12      │
│    │ 5. 🥤 Cola            28      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⏰ Peak Hours                  │
│    │                                │
│    │ 🕐 12:00 PM - 2:00 PM   45     │
│    │ 🕐 6:00 PM - 8:00 PM    38     │
│    │ 🕐 11:00 AM - 12:00 PM  32     │
│    │ 🕐 7:00 PM - 9:00 PM    29     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⭐ Customer Ratings            │
│    │                                │
│    │ Overall: ⭐ 4.6 (1,247)        │
│    │ Food Quality: ⭐ 4.7           │
│    │ Delivery: ⭐ 4.5               │
│    │ Service: ⭐ 4.6                │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 5. Business Profile Screen

```
┌─────────────────────────────────────┐
│        Business Profile             │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🏪 My Awesome Restaurant       │
│    │ ⭐ 4.6 (1,247 reviews)         │
│    │                                │
│    │ 📍 123 Main St, City, ST      │
│    │ 📞 (555) 123-4567              │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🕐 Operating Hours             │
│    │                                │
│    │ Mon-Fri: 9:00 AM - 10:00 PM   │
│    │ Sat: 10:00 AM - 11:00 PM      │
│    │ Sun: 11:00 AM - 9:00 PM       │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📋 Business Info              │
│    │                                │
│    │ Cuisine: American             │
│    │ Price Range: $$               │
│    │ Delivery Fee: $2.99           │
│    │ Minimum Order: $15.00         │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⚙️ Settings                    │
│    │                                │
│    │ Payment Methods               │
│    │ Delivery Zones                │
│    │ Promotions                    │
│    │ Staff Management              │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## Navigation Flow

```
Business Dashboard
        │
        ├── View Orders → Orders Management
        │      │
        │      ├── Order Details → Update Status
        │      │
        │      └── Assign Driver → Driver Selection
        │
        ├── Manage Menu → Menu Management
        │      │
        │      ├── Add Item → Item Creation Form
        │      │
        │      └── Edit Item → Item Edit Form
        │
        └── View Analytics → Analytics Dashboard
               │
               └── Business Profile → Profile Settings
```

## Key Features

- **Order Management**: Real-time order tracking and status updates
- **Menu Management**: Dynamic menu editing with categories
- **Analytics Dashboard**: Comprehensive business metrics
- **Driver Assignment**: Manual driver assignment for deliveries
- **Business Profile**: Complete business information management
- **Operating Hours**: Flexible scheduling and store status
- **Performance Tracking**: Revenue, ratings, and customer satisfaction

## Order States

### Received

- New order notification
- Customer and order details displayed
- Preparation time begins tracking

### Preparing

- Kitchen staff notified
- Estimated preparation time displayed
- Customer receives status updates

### Ready for Pickup/Delivery

- Order marked as ready
- Driver assignment available
- Customer notified

### Out for Delivery

- Driver assigned and en route
- Real-time delivery tracking
- Customer receives updates

### Delivered

- Order completed successfully
- Automatic payment processing
- Customer rating collection
- Analytics updated
