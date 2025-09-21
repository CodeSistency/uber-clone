# Uber-like App Wireframes: Customer Flow

## Overview
This document contains ASCII wireframes for the customer journey in the Uber-like multi-modal application, based on the actual implementation.

## 1. Customer Home Screen

```
┌─────────────────────────────────────┐
│  ☰         Welcome John👋      ↗    │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🔍 Where do you want to go? │  │
│    └─────────────────────────┘      │
│                                     │
│    Your current location            │
│    123 Main St, City, ST           │
│                                     │
│    ┌─────────────────────────┐      │
│    │         🗺️ MAP          │      │
│    │                         │      │
│    │        📍 You are here  │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
│    Recent Rides                     │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🟢 Downtown Mall    $12.50     │
│    │   2 days ago                   │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🟢 Airport          $25.80     │
│    │   1 week ago                  │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ No recent rides found          │
│    │   (when empty)                 │
│    └─────────────────────────┘      │
│                                     │
│  🏠        💬        👤            │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Hamburger menu button (circular with shadow)
- Google Places autocomplete search input
- Map component with current location
- FlatList for recent rides
- Empty state with image when no rides
- Bottom tab navigation (circular icons)

## 2. Find Ride Screen

```
┌─────────────────────────────────────┐
│ ←              Ride                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ From                          │
│    │ 📍 123 Main St, City, ST      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ To                            │
│    │ 🏢 Downtown Mall              │
│    │ 456 Commerce Ave, City, ST    │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │       Find Now          │      │
│    └─────────────────────────┘      │
│                                     │
│    💡 Popular destinations          │
│    🏠 Home      🏢 Work      🛒 Mall │
│                                     │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Uses RideLayout with map background
- Header with back arrow and "Ride" title
- Two GoogleTextInput components (From/To)
- CustomButton with rounded design
- BottomSheet layout (not shown in ASCII)

## 3. Confirm Ride Screen

```
┌─────────────────────────────────────┐
│ ←         Choose a Rider            │
│                                     │
│    Choose Ride Type                 │
│                                     │
│    ┌─────────────────────────┐  ┌───┐
│    │ 🚗 Economy              │  │   │
│    │ $2.50                   │  │   │
│    │ Affordable rides        │  │   │
│    └─────────────────────────┘  └───┘
│                                     │
│    ┌─────────────────────────┐  ┌───┐
│    │ 🚙 Comfort              │  │   │
│    │ $4.00                   │  │   │
│    │ More space, premium cars│  │   │
│    └─────────────────────────┘  └───┘
│                                     │
│    ┌─────────────────────────┐  ┌───┐
│    │ 🚐 Premium              │  │   │
│    │ $6.00                   │  │   │
│    │ Luxury experience       │  │   │
│    └─────────────────────────┘  └───┘
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⭐ John Driver                 │
│    │ 🚗 Toyota Corolla             │
│    │ 4.8 • 3 min • $12.75          │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Ride Summary                   │
│    │ Base fare (Comfort): $4.00     │
│    │ Time (3 min): $0.75            │
│    │ ─────────────────────────────  │
│    │ Total: $4.75                   │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Select Ride         │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Uses RideLayout with "Choose a Rider" title
- Horizontal scrolling ride tiers (Economy/Comfort/Premium)
- Driver cards in vertical FlatList
- Real-time fare calculation
- Ride summary with breakdown
- BottomSheet with 65%/85% snap points

## 4. Active Ride States

### 4.1 Driver En Route to Pickup

```
┌─────────────────────────────────────┐
│ ←              Ride                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Driver is arriving         │
│    │                                │
│    │ ⭐ 4.8  🚗 Toyota Corolla      │
│    │ John D.                        │
│    │                                │
│    │ 📞 Call    💬 Message          │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │         🗺️ MAP          │      │
│    │                         │      │
│    │ 📍 Driver: 2 min away   │      │
│    │ 🏁 Pickup location      │      │
│    └─────────────────────────┘      │
│                                     │
│    Trip Details                     │
│    From: 123 Main St               │
│    To: Downtown Mall               │
│    Fare: $4.75                     │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Cancel Ride         │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 Driver Arrived

```
┌─────────────────────────────────────┐
│ ←              Ride                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Driver has arrived         │
│    │                                │
│    │ ⭐ 4.8  🚗 Toyota Corolla      │
│    │ John D.                        │
│    │                                │
│    │ 📞 Call    💬 Message          │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │         🗺️ MAP          │      │
│    │                         │      │
│    │ 📍 Driver is here!      │      │
│    │ 🏁 Destination          │      │
│    └─────────────────────────┘      │
│                                     │
│    Trip Details                     │
│    From: 123 Main St               │
│    To: Downtown Mall               │
│    Fare: $4.75                     │
│                                     │
│    ┌─────────────────────────┐      │
│    │   I'm Ready - Start     │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Trip in Progress

```
┌─────────────────────────────────────┐
│ ←              Ride                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Trip in progress           │
│    │                                │
│    │ ⭐ 4.8  🚗 Toyota Corolla      │
│    │ John D.                        │
│    │                                │
│    │ 📞 Call    💬 Message          │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │         🗺️ MAP          │      │
│    │                         │      │
│    │ 📍 Current location     │      │
│    │ 🏁 1.2 miles to go      │      │
│    └─────────────────────────┘      │
│                                     │
│    Trip Details                     │
│    From: 123 Main St               │
│    To: Downtown Mall               │
│    Fare: $4.75                     │
│    Duration: 8 min                 │
│                                     │
│    Emergency: 🚨 SOS               │
│                                     │
└─────────────────────────────────────┘
```

## 5. Ride Completed Screen

```
┌─────────────────────────────────────┐
│          Ride Completed             │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🎉 Trip Complete!              │
│    │                                │
│    │ ⭐ 4.8  🚗 Toyota Corolla      │
│    │ John D.                        │
│    └─────────────────────────┘      │
│                                     │
│    Trip Summary                     │
│    Distance: 5.2 miles             │
│    Duration: 12 min                │
│    Fare: $8.50                     │
│    Tip: $2.00                      │
│    Total: $10.50                   │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Rate Driver         │      │
│    │ ⭐⭐⭐⭐⭐                  │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │   Add Tip & Pay         │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │    Book Another Ride    │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## Navigation Flow

```
Home Screen
     │
     └── Search Destination → Find Ride Screen
               │
               └── Find Now → Confirm Ride Screen
                     │
                     └── Select Ride → Active Ride States
                           │
                           ├── Driver Arriving → "Driver is arriving"
                           │
                           ├── Driver Arrived → "Driver has arrived"
                           │      │
                           │      └── Start Trip → "Trip in progress"
                           │
                           └── Trip Complete → Completed Screen
                                 │
                                 └── Rate & Tip → Home Screen
```

## Key Features

- **RideLayout Architecture**: Map background with BottomSheet
- **Real-time GPS Tracking**: Live driver location updates
- **Ride Tiers System**: Economy ($2.50), Comfort ($4.00), Premium ($6.00)
- **Dynamic Fare Calculation**: Base fare + time-based pricing
- **Driver Selection**: Rating, vehicle, ETA, and pricing
- **Communication**: Call and chat with driver
- **Emergency Features**: SOS button during active rides
- **Rating System**: 5-star rating after completion
- **Optional Tipping**: Pre-set amounts or custom tip

## Ride States Implementation

### Requested → Accepted
- FlatList of available drivers
- Real-time driver location calculation
- Fare preview with selected tier

### Accepted → Arriving
- Driver assigned and en route
- Live GPS tracking begins
- Communication features activated

### Arriving → Arrived
- "Driver has arrived" notification
- "I'm Ready - Start" button appears
- Location accuracy within pickup radius

### Arrived → In Progress
- Trip officially started
- Route tracking to destination
- Emergency features available
- Real-time fare updates

### In Progress → Completed
- Automatic completion detection
- Payment processing (marked as "paid" in demo)
- Rating collection
- Optional tipping
- Trip summary generation
