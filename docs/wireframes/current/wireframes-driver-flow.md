# Uber-like App Wireframes: Driver Flow

## Overview
This document contains ASCII wireframes for the driver journey in the Uber-like multi-modal application.

## 1. Driver Dashboard

```
┌─────────────────────────────────────┐
│ ☰  Driver Dashboard        [Online] │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Today's Summary               │
│    │                                │
│    │ 💰 $45.75      🚗 3      ⭐ 4.8 │
│    │ Earnings    Trips    Rating    │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Active Ride                │
│    │ From: 123 Main St             │
│    │ To: 456 Broadway Ave          │
│    │ John Doe • $18.50 • 3.2 mi    │
│    │                                │
│    │ [View Ride Details]           │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Quick Actions                  │
│    │ 🚕 View Ride Requests          │
│    │ 💰 Earnings & History          │
│    │ 👤 Profile & Settings          │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Service Type                   │
│    │ [Rides Only]  [All Services]   │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Header with hamburger menu and online/offline toggle
- Today's summary with earnings, trips, rating
- Active ride card (when applicable)
- Quick actions for navigation
- Service type toggle (Rides Only / All Services)
- ScrollView with multiple sections

## 2. Ride Requests Screen

```
┌─────────────────────────────────────┐
│          Ride Requests              │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 New Request                 │
│    │                                │
│    │ 📍 Downtown Mall              │
│    │ Distance: 0.8 miles           │
│    │ Fare: $12.50                  │
│    │                                │
│    │ ⏱️ Accept in 15s              │
│    │                                │
│    │ [Decline]       [Accept]       │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚙 Comfort Request             │
│    │                                │
│    │ 📍 Airport Terminal           │
│    │ Distance: 2.1 miles           │
│    │ Fare: $28.75                  │
│    │                                │
│    │ ⏱️ Accept in 12s              │
│    │                                │
│    │ [Decline]       [Accept]       │
│    └─────────────────────────┘      │
│                                     │
│    Auto-accept similar rides: ON    │
│                                     │
└─────────────────────────────────────┘
```

## 3. Active Ride Screen

```
┌─────────────────────────────────────┐
│           Active Ride               │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Heading to Pickup           │
│    │                                │
│    │ 👤 John Smith                  │
│    │ 📞 (555) 123-4567              │
│    │                                │
│    │ 📍 Pickup: 123 Main St        │
│    │ Distance: 0.5 miles           │
│    │ ETA: 3 min                     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │         🗺️ MAP          │      │
│    │                         │      │
│    │ 📍 Your location        │      │
│    │ 🏁 Pickup location      │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💬 Message Passenger           │
│    └─────────────────────────┘      │
│                                     │
│    Trip Details                     │
│    Fare: $12.50                    │
│    Distance: 5.2 miles             │
│    Estimated Time: 18 min          │
│                                     │
│    ┌─────────────────────────┐      │
│    │   I'm Here / Arrived    │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 4. Earnings Dashboard

```
┌─────────────────────────────────────┐
│           Earnings                  │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💰 Today's Earnings            │
│    │ $127.50                        │
│    │                                │
│    │ Trips: 8    Hours: 6.5h       │
│    │ Avg. per trip: $15.94         │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📈 Weekly Summary             │
│    │                                │
│    │ This Week: $892.50            │
│    │ Last Week: $756.25            │
│    │ +18%                           │
│    │                                │
│    │ Mon: $145  Tue: $167          │
│    │ Wed: $134  Thu: $189          │
│    │ Fri: $156  Sat: $201          │
│    │ Sun: $98                      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💳 Payout Options             │
│    │                                │
│    │ Next payout: Tomorrow         │
│    │ Amount: $127.50               │
│    │ Method: Bank Transfer         │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📊 Detailed Report            │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 5. Driver Profile Screen

```
┌─────────────────────────────────────┐
│           Driver Profile            │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👤 John Driver                 │
│    │ ⭐ 4.8 (2,145 ratings)         │
│    │                                │
│    │ 🚗 Toyota Camry 2020          │
│    │ License: ABC123456            │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📊 Performance                 │
│    │                                │
│    │ Acceptance Rate: 94%          │
│    │ Cancellation Rate: 2%         │
│    │ 5-Star Rate: 87%              │
│    │                                │
│    │ Total Trips: 2,145            │
│    │ Member Since: Jan 2023        │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⚙️ Settings                    │
│    │                                │
│    │ Notification Preferences      │
│    │ Payment Methods               │
    │ Vehicle Information            │
│    │ Documents                     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚪 Sign Out                   │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## Navigation Flow

```
Driver Dashboard
       │
       ├── Go Online → Online Status
       │      │
       │      └── Ride Requests → Accept/Decline
       │             │
       │             └── Accepted → Active Ride
       │                    │
       │                    ├── Navigate to Pickup
       │                    │
       │                    └── Arrive at Pickup → Start Trip
       │                           │
       │                           └── Complete Trip → Earnings Update
       │
       └── View Earnings → Earnings Dashboard
              │
              └── View Profile → Driver Profile
```

## Key Features

- **Online/Offline Status**: Toggle availability for ride requests
- **Real-time Ride Requests**: Time-sensitive accept/decline system
- **GPS Navigation**: Turn-by-turn directions to pickup and destination
- **Earnings Tracking**: Real-time earnings and payout information
- **Performance Metrics**: Acceptance rate, ratings, and trip statistics
- **Communication**: In-app messaging with passengers
- **Vehicle Management**: Vehicle information and maintenance tracking

## Ride Request States

### New Request
- Push notification received
- 15-second acceptance window
- Distance, fare, and destination displayed
- Auto-decline if not accepted in time

### Accepted
- Driver assigned to ride
- Navigation to pickup location begins
- Passenger contact information available
- Chat feature activated

### Arrived at Pickup
- "I'm Here" button becomes available
- Passenger notified of arrival
- Wait time tracking begins

### Trip in Progress
- Navigation to destination
- Real-time tracking active
- Fare calculation ongoing
- Emergency features available

### Trip Completed
- Automatic fare calculation
- Rating request sent to passenger
- Earnings added to balance
- Trip summary generated
