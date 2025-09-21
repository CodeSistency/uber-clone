# 🎨 Enhanced Wireframes - Interactive UI Designs

## Overview

Esta colección de wireframes muestra la nueva experiencia de usuario con mapa integrado, bottom sheets dinámicos y navegación inteligente.

---

## 🏠 1. Smart Home Screen

### 1.1 First Launch - Location Permission

```
┌─────────────────────────────────────┐
│                                     │
│        📍 LOCATION ACCESS          │
│                                     │
│   Allow "Uber Clone" to access      │
│   your location while using the     │
│   app?                              │
│                                     │
│   This helps us find nearby         │
│   drivers and restaurants.          │
│                                     │
│   ┌─────────────────────────────┐   │
│   │      🚫 Don't Allow         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │       ✅ Allow Access       │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 1.2 Location Detected - Map Loads

```
┌─────────────────────────────────────┐
│        🗺️ DETECTING LOCATION      │
│                                     │
│   📍 Finding your location...       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          ⭕⭕⭕             │   │
│   │    📍                    │   │
│   └─────────────────────────────┘   │
│                                     │
│   🔄 Calculating nearby services... │
│                                     │
│   🚗 3 drivers available            │
│   🛵 12 restaurants nearby          │
│   🏪 8 businesses open              │
│                                     │
└─────────────────────────────────────┘
```

### 1.3 Full Interactive Map - Service Discovery

```
┌─────────────────────────────────────┐
│        🗺️ INTERACTIVE MAP          │ ← 70% Screen
│   📍 Your Location (Pulsing)       │
│   🚗🚗🚗 Available Drivers         │
│   🍕🍔🥗 Restaurant Markers        │
│   🏪🏪 Business Locations          │
│   🔴 Live Traffic (Light)          │
│                                     │
│   ┌─────────────────────────────┐   │ ← AI Suggestions
│   │ 🤖 "Need lunch? Check out    │   │
│   │    Mario's Pizza - 2 min"    │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │ ← Dynamic Center
│                                     │
│   ┌─────────────────────────────┐   │ ← Smart Search (20%)
│   │ 🔍 Where to?               │   │
│   │ [📍 Current Location]       │   │
│   └─────────────────────────────┘   │
│                                     │
│ 🚗 🛵 🏪                           │ ← Service Mode Switcher
│                                     │
│ ──────────────────────────────────── │
│ 🏠 💬 👤                           │ ← Bottom Navigation
└─────────────────────────────────────┘
```

---

## 🔍 2. Intelligent Search Experience

### 2.1 Search Activation - Bottom Sheet Expands

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (50%)           │
│   📍 Origin Marker                 │
│   🔍 Search Radius Circle          │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Expanded Search (40%)
│   │ 🔍 Where to go?             │   │
│   │ ├─────────────────────────┤   │
│   │ 📍 Home                     │   │
│   │ 📍 Work                     │   │
│   │ 📍 Recent: Shopping Mall    │   │
│   │ ⭐ Favorite: Airport        │   │
│   │ 🌟 Popular: Central Park    │   │
│   │ ──────────────────────────── │   │
│   │ 🗺️ Set destination on map   │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🚗 Transport Mode Selected         │
└─────────────────────────────────────┘
```

### 2.2 Real-time Search Results

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (40%)           │
│   📍 Origin → 📍 Destination       │
│   🛣️ Route Preview (Dashed)       │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Search Results (50%)
│   │ 🔍 "Central Park"           │   │
│   │ ├─────────────────────────┤   │
│   │ 🏞️ Central Park             │   │
│   │   📍 2.3 miles • 12 min     │   │
│   │ ├─────────────────────────┤   │
│   │ 🏪 Central Park Mall        │   │
│   │   📍 1.8 miles • 8 min      │   │
│   │ ├─────────────────────────┤   │
│   │ 🍽️ Central Perk Cafe       │   │
│   │   📍 0.5 miles • 3 min      │   │
│   │ ──────────────────────────── │   │
│   │ 💰 Estimated: $8-12         │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🚗 Continue to Ride Options        │
└─────────────────────────────────────┘
```

---

## 🚗 3. Transport Service Flow

### 3.1 Vehicle Selection - Medium Bottom Sheet

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (60%)           │
│   📍 Origin → 📍 Destination       │
│   🚗🚗🚗 Available Drivers         │
│   💰 Route: $12.50 • 8 min        │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Service Options (35%)
│   │ 🚗 Economy • 2 min         │   │
│   │   Toyota Camry • 4.8★       │   │
│   │   $8.50                     │   │
│   │ ├─────────────────────────┤   │
│   │ 🚙 Comfort • 4 min         │   │
│   │   Honda Accord • 4.9★       │   │
│   │   $12.50                    │   │
│   │ ├─────────────────────────┤   │
│   │ 🏎️ Premium • 6 min         │   │
│   │   Tesla Model 3 • 5.0★      │   │
│   │   $18.75                    │   │
│   │ ──────────────────────────── │   │
│   │ 💳 **** 4532 • Change       │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ ✅ Confirm $12.50 Ride             │
└─────────────────────────────────────┘
```

### 3.2 Ride Confirmation - Full Screen Modal

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │     ✅ RIDE CONFIRMED       │   │
│   │                             │   │
│   │ 🚗 Toyota Camry (ABC-123)   │   │
│   │ 👨‍💼 John D. (4.9★)         │   │
│   │ 📍 1.2 miles away           │   │
│   │ ⏱️ Arriving in 3 minutes     │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 💬 Message Driver       │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 🚫 Cancel Ride          │ │   │
│   │ └─────────────────────────┘ │   │
│   └─────────────────────────────┘   │
│                                     │
│   🗺️ LIVE TRACKING MAP             │
│   📍 Driver Location (Moving)      │
│   🛣️ Route to Pickup               │
│                                     │
└─────────────────────────────────────┘
```

---

## 🛵 4. Delivery Service Flow

### 4.1 Delivery Discovery - Smart Suggestions

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (60%)           │
│   📍 Your Location                 │
│   🛵 Delivery Zone (Green)         │
│   🍕🍔🥗 Restaurant Clusters       │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Quick Access (35%)
│   │ 🍕 Pizza • 15 min           │   │
│   │   Mario's • 4.7★ • $2.99    │   │
│   │ ├─────────────────────────┤   │
│   │ 🍔 Burgers • 12 min         │   │
│   │   Burger Palace • 4.5★ • $1.99│   │
│   │ ├─────────────────────────┤   │
│   │ 🥗 Healthy • 20 min         │   │
│   │   Green Cafe • 4.8★ • $0.99 │   │
│   │ ──────────────────────────── │   │
│   │ 🏪 Browse All Stores        │   │
│   │ 📦 Send Package             │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🔍 Search Restaurants              │
└─────────────────────────────────────┘
```

### 4.2 Restaurant Selection - Enhanced View

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (40%)           │
│   📍 Your Location                 │
│   🍕 Selected Restaurant           │
│   🛣️ Delivery Route Preview       │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Restaurant Details (50%)
│   │ 🍕 Mario's Pizza             │   │
│   │   📍 1.2 miles • 4.7★       │   │
│   │   ⏱️ 25-35 min • $2.99 fee   │   │
│   │ ├─────────────────────────┤   │   │
│   │ 🔥 Popular Items            │   │
│   │   🍕 Margherita $16.99       │   │
│   │   🍕 Pepperoni $18.99        │   │
│   │   🥗 Caesar Salad $8.99      │   │
│   │ ├─────────────────────────┤   │   │
│   │ 🛒 Your Cart (2 items)      │   │
│   │   $35.98                     │   │
│   │ ──────────────────────────── │   │
│   │ 🛒 View Full Menu           │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ ✅ Continue to Checkout            │
└─────────────────────────────────────┘
```

---

## 💳 5. Unified Payment Experience

### 5.1 Payment Method Selection

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │     💳 PAYMENT METHOD       │   │
│   │ ├─────────────────────────┤   │
│   │ 💳 **** 4532 Visa          │   │
│   │   Default Card             │   │
│   │ ├─────────────────────────┤   │
│   │ 📱 Wallet Balance          │   │
│   │   $24.50 available         │   │
│   │ ├─────────────────────────┤   │
│   │ 🏦 Bank Transfer           │   │
│   │   Instant transfer         │   │
│   │ ├─────────────────────────┤   │
│   │ ➕ Add New Card            │   │
│   │ └─────────────────────────┘   │
│   │                             │   │
│   │ 💰 Total: $12.50           │   │
│   │ ──────────────────────────── │   │
│   │ ✅ Pay Now                  │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 5.2 Payment Processing

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │    💳 PROCESSING PAYMENT    │   │
│   │                             │   │
│   │ 🔄 Processing $12.50        │   │
│   │   with Visa **** 4532       │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ ⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕ │ │   │
│   │ │    Processing...         │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ 🚫 Don't close this screen  │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 5.3 Payment Success

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │     ✅ PAYMENT SUCCESS      │   │
│   │                             │   │
│   │ 💳 $12.50 charged to        │   │
│   │   Visa **** 4532            │   │
│   │                             │   │
│   │ 🧾 Receipt sent to email    │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 📄 View Receipt          │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ ⭐ Rate Your Ride        │ │   │
│   │ └─────────────────────────┘ │   │
│   └─────────────────────────────┘   │
│                                     │
│   🗺️ Ready for next ride?          │
└─────────────────────────────────────┘
```

---

## 🚀 6. Real-time Active States

### 6.1 Driver Arriving - Live Tracking

```
┌─────────────────────────────────────┐
│        🗺️ LIVE TRACKING           │ ← 70% Map Always Visible
│   📍 Your Location (Static)       │
│   🚗 Driver Location (Moving)     │
│   🛣️ Route to Pickup             │
│   📏 0.8 miles • 2 min away      │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Status Updates (25%)
│   │ 🚗 Driver Arriving          │   │
│   │ ├─────────────────────────┤   │
│   │ 👨‍💼 John D. (4.9★)         │   │
│   │ 🚗 Toyota Camry (ABC-123)   │   │
│   │ 📍 0.8 miles away           │   │
│   │ ⏱️ Arriving in 2 minutes     │   │
│   │ ├─────────────────────────┤   │
│   │ 💬 Message Driver           │   │
│   │ 📞 Call Driver              │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🚫 Emergency • 🚫 Cancel           │
└─────────────────────────────────────┘
```

### 6.2 Ride in Progress - Full Experience

```
┌─────────────────────────────────────┐
│        🗺️ RIDE IN PROGRESS        │ ← 60% Map
│   📍 Origin → 📍 Destination      │
│   🚗 Driver Route (Animated)      │
│   📏 3.2 miles remaining          │
│   ⏱️ 12 minutes to arrival       │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Ride Controls (35%)
│   │ 🚗 Ride Active              │   │
│   │ ├─────────────────────────┤   │
│   │ 👨‍💼 John D. (4.9★)         │   │
│   │ 📞 +1 (555) 123-4567        │   │
│   │ ├─────────────────────────┤   │
│   │ 💬 Chat with Driver         │   │
│   │ 🔊 Mute Navigation          │   │
│   │ ├─────────────────────────┤   │
│   │ 🛑 Emergency Stop           │   │
│   │ 🚫 Cancel Ride              │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🎵 Music Player • 🌡️ Climate       │
└─────────────────────────────────────┘
```

---

## 🏪 7. Enhanced Marketplace Experience

### 7.1 Smart Store Discovery

```
┌─────────────────────────────────────┐
│        🗺️ MARKETPLACE MAP         │ ← 50% Map
│   📍 Your Location                 │
│   🍕🍔🥗 Restaurant Markers        │
│   🛵 Delivery Zones                │
│   ⭐ Top Rated Highlighted         │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Smart Discovery (40%)
│   │ 🔍 Search Restaurants       │   │
│   │ ──────────────────────────── │   │
│   │ 🍕 Italian • 12 places      │   │
│   │ 🍔 American • 8 places      │   │
│   │ 🥗 Healthy • 5 places       │   │
│   │ ──────────────────────────── │   │
│   │ ⭐ Top Rated (4.8+)         │   │
│   │ ⚡ Fast Delivery (<20min)    │   │
│   │ 💰 Under $3 delivery        │   │
│   │ ──────────────────────────── │   │
│   │ 🛒 Your Cart (3 items)      │   │
│   │   $24.97 from 2 stores      │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🛵 Delivery Mode Active            │
└─────────────────────────────────────┘
```

### 7.2 AI-Powered Suggestions

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │ 🤖 SMART SUGGESTIONS        │   │
│   │ ├─────────────────────────┤   │
│   │ 🍕 "Craving pizza? Try     │   │
│   │    Mario's - 4.7★, 2 min"  │   │
│   │ ├─────────────────────────┤   │
│   │ 🥗 "Healthy lunch option:  │   │
│   │    Green Cafe - 15 min"    │   │
│   │ ├─────────────────────────┤   │
│   │ ⚡ "Quick bite: Burger      │   │
│   │    Express - 10 min"       │   │
│   │ ├─────────────────────────┤   │
│   │ ⭐ "Top rated: Sushi        │   │
│   │    Master - 4.9★"          │   │
│   │ ──────────────────────────── │   │
│   │ 🔄 Refresh Suggestions     │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎯 8. Error States & Recovery

### 8.1 Connection Issues

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │    ⚠️ CONNECTION ISSUE      │   │
│   │                             │   │
│   │ 📶 Poor internet connection │   │
│   │                             │   │
│   │ Some features may not work  │   │
│   │ properly.                   │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 🔄 Retry Connection     │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 📱 Use Offline Mode     │ │   │
│   │ └─────────────────────────┘ │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 8.2 Service Unavailable

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │   🚫 NO DRIVERS AVAILABLE   │   │
│   │                             │   │
│   │ No drivers available in     │   │
│   │ your area right now.        │   │
│   │                             │   │
│   │ Try again in a few minutes  │   │
│   │ or adjust your pickup       │   │
│   │ location.                   │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 🔄 Search Again         │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 📍 Change Location      │ │   │
│   │ └─────────────────────────┘ │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎨 9. Animation & Transition States

### 9.1 Bottom Sheet Size Transitions

#### Small → Medium (25% → 50%)
```
Animation: Smooth upward slide (0.3s)
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │ ← Expanding
│   │ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ │   │
│   │ Content expanding...       │   │
│   │ ──────────────────────────── │   │
│   │ New content appearing      │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Previous content fades out]     │
└─────────────────────────────────────┘
```

#### Medium → Large (50% → 75%)
```
Animation: Full screen expansion (0.4s)
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ │   │
│   │ Maximum content view       │   │
│   │ ├─────────────────────────┤   │
│   │ Full interaction mode      │   │
│   │ Multiple options           │   │
│   │ Scrollable content         │   │
│   │ Action buttons             │   │
│   │ ──────────────────────────── │   │
│   │ ✅ Primary Action          │   │
│   │ 🚫 Secondary Action        │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 9.2 Map Interactions

#### Location Selection
```
┌─────────────────────────────────────┐
│        🗺️ MAP INTERACTION         │
│                                     │
│   📍 Tap on map location           │
│   ┌─────────────────────────────┐   │
│   │ ⭕⭕⭕ Pulsing marker        │   │ ← Animation
│   │     📍                     │   │
│   └─────────────────────────────┘   │
│                                     │
│   📏 Calculating distance...        │
│   💰 Estimating cost...             │
│                                     │
└─────────────────────────────────────┘
```

#### Route Preview
```
┌─────────────────────────────────────┐
│        🗺️ ROUTE ANIMATION         │
│                                     │
│   📍 Origin marker                  │
│   🛣️ Route drawing (Animated)      │ ← Dashed to solid
│   📍 Destination marker             │
│                                     │
│   📏 Distance: 3.2 miles            │
│   ⏱️ Time: 12 minutes               │
│   💰 Cost: $12.50                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 10. Mobile-Specific Adaptations

### 10.1 Compact Mode (Small Screens)

```
┌───────────────────┐
│   🗺️ MAP (60%)    │
│   📍📍🚗          │
│                   │
│ ────────────────── │
│                   │
│   ┌─────────────┐ │ ← Compact (30%)
│   │ 🚗 Economy │ │
│   │ $8 • 3min  │ │
│   │ ──────────── │ │
│   │ ✅ Confirm  │ │
│   └─────────────┘ │
│                   │
└───────────────────┘
```

### 10.2 Expanded Mode (Large Screens)

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (70%)           │
│   📍 Origin → 📍 Destination       │
│   🚗🚗🚗 Available Drivers         │
│   🛣️ Route Preview                │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Detailed (25%)
│   │ 🚗 Economy • 2 min         │   │
│   │   Toyota Camry • 4.8★       │   │
│   │   $8.50                     │   │
│   │ ├─────────────────────────┤   │
│   │ 🚙 Comfort • 4 min         │   │
│   │   Honda Accord • 4.9★       │   │
│   │   $12.50                    │   │
│   │ ──────────────────────────── │   │
│   │ 💳 Pay with Card            │   │
│   │ ✅ Confirm Ride             │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Key Design Principles

### 1. **Progressive Disclosure**
- Start with essential information
- Expand details as needed
- Maintain visual hierarchy

### 2. **Contextual Actions**
- Show relevant options based on state
- Hide unnecessary complexity
- Guide users through the flow

### 3. **Visual Consistency**
- Consistent iconography
- Unified color scheme
- Standard interaction patterns

### 4. **Performance First**
- Lazy load map tiles
- Optimize animations
- Minimize re-renders

---

## 🚀 Implementation Notes

### Technical Considerations
- **Map Performance**: Use map clustering for dense areas
- **Animation Performance**: Use native animations when possible
- **Memory Management**: Implement proper cleanup for map instances
- **Offline Support**: Cache map tiles for offline viewing

### Accessibility Features
- **Voice Over**: Screen reader support for all interactive elements
- **High Contrast**: Support for different visual needs
- **Font Scaling**: Respect system font size preferences
- **Touch Targets**: Minimum 44pt touch targets

### Testing Scenarios
- **Network Conditions**: Test with poor connectivity
- **Device Types**: iOS/Android, different screen sizes
- **Location Services**: GPS accuracy, location permissions
- **Real-time Updates**: WebSocket connection stability
