# Uber-like App Wireframes: Shared Components

## Overview

This document contains ASCII wireframes for shared components used across all modes of the Uber-like multi-modal application.

## 1. Real-time Chat Interface

```
┌─────────────────────────────────────┐
│           💬 Chat                   │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👤 John Driver                │
│    │ 🚗 Toyota Corolla             │
│    │ ⭐ 4.8                        │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Hello! I'm 2 minutes away.   │
│    │                        2:15 PM│
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Great! I'll be waiting.       │
│    │                       2:16 PM│
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ I'm here! Look for the blue  │
│    │ Toyota.                      │
│    │                        2:18 PM│
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Type a message...             │
│    │ [📎] [📍]              [📤]    │
│    └─────────────────────────┘      │
│                                     │
│    Driver is typing...             │
│                                     │
└─────────────────────────────────────┘
```

## 2. Interactive Map Component

```
┌─────────────────────────────────────┐
│              🗺️ Map                 │
│                                     │
│    ┌─────────────────────────┐      │
│    │                         │      │
│    │           📍            │      │
│    │          /|\            │      │
│    │         / | \           │      │
│    │        📍  📍           │      │
│    │       /    \            │      │
│    │      📍     📍          │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
│    📍 Your Location                 │
│    📍 Driver 1: 2 min • ⭐ 4.8      │
│    📍 Driver 2: 5 min • ⭐ 4.6      │
│    📍 Driver 3: 3 min • ⭐ 4.9      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🧭 Recenter Map               │
│    └─────────────────────────┘      │
│                                     │
│    Route: 5.2 miles • 18 min       │
│                                     │
└─────────────────────────────────────┘
```

## 3. Notification Center

```
┌─────────────────────────────────────┐
│         🔔 Notifications            │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Ride Confirmed              │
│    │ Your driver is on the way     │
│    │ 2 min ago                     │
│    │                                │
│    │ [View Details]                 │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💬 New Message                │
│    │ John: I'm here!               │
│    │ 1 min ago                     │
│    │                                │
│    │ [Reply]                       │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💰 Payment Received            │
│    │ $12.50 added to your wallet   │
│    │ 5 min ago                     │
│    │                                │
│    │ [View Receipt]                 │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⭐ Rate Your Experience        │
│    │ How was your recent ride?     │
│    │ 10 min ago                    │
│    │                                │
│    │ ⭐⭐⭐⭐⭐ [Submit]              │
│    └─────────────────────────┘      │
│                                     │
│    [Mark All Read]    [Settings]    │
│                                     │
└─────────────────────────────────────┘
```

## 4. Emergency SOS Interface

```
┌─────────────────────────────────────┐
│                                     │
│            🚨 EMERGENCY             │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🆘 Emergency Assistance        │
│    │                                │
│    │ This will alert emergency      │
│    │ services and your contacts    │
│    │                                │
│    │ 📍 Current Location           │
│    │ 123 Main St, City, ST         │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚔 Police                     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚑 Medical                    │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚒 Fire                       │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📞 Call Emergency Contacts     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │       HOLD TO ACTIVATE         │
│    └─────────────────────────┘      │
│                                     │
│    [Cancel]                        │
│                                     │
└─────────────────────────────────────┘
```

## 5. Payment Interface

```
┌─────────────────────────────────────┐
│           💳 Payment                │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Trip Summary                  │
│    │                                │
│    │ Distance: 5.2 miles           │
│    │ Duration: 18 min              │
│    │ Base Fare: $8.50              │
│    │                                │
│    │ Subtotal: $8.50               │
│    │ Service Fee: $0.85            │
│    │ Tax: $0.68                    │
│    │                                │
│    │ Total: $10.03                 │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 💳 **** 4567                   │
│    │ Visa • Default                │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Add Tip                        │
│    │ $2.00   $5.00   $10.00   Custom│
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🎁 Promo Code                  │
│    │ Enter code...                  │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Pay $12.03          │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 6. Drawer Navigation

```
┌─────────────────────────────────────┐
│    ┌─────────────────────────┐      │
│    │ 👤 John Smith                  │
│    │ john@example.com               │
│    │ ⭐ 4.8 Rating                  │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Customer Mode              │
│    │ Book rides and order food     │
│    │ ✓ Active                      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👨‍💼 Driver Mode              │
│    │ Accept rides and deliveries   │
│    │ Tap to register               │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🏪 Business Mode              │
│    │ Manage your business          │
│    │ Tap to register               │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ⚙️ Settings                   │
│    │ Notifications                 │
│    │ Payment Methods               │
│    │ Privacy                       │
│    │ Help & Support                │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚪 Sign Out                   │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 7. Bottom Tab Navigation

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
    🏠        💬        👤
   Home      Chat    Profile
```

## 8. Loading States

```
┌─────────────────────────────────────┐
│                                     │
│            🔄 Loading              │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Finding available drivers...  │
│    │                                │
│    │ ⏳ Please wait                 │
│    │                                │
│    │ This may take a few seconds   │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 9. Error States

```
┌─────────────────────────────────────┐
│                                     │
│            ⚠️ Error                │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Unable to connect              │
│    │                                │
│    │ We couldn't load your data.   │
│    │ Please check your connection  │
│    │ and try again.                │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Try Again           │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Go Back             │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 10. Success States

```
┌─────────────────────────────────────┐
│                                     │
│            ✅ Success              │
│                                     │
│    ┌─────────────────────────┐      │
│    │ Ride Confirmed!               │
│    │                                │
│    │ Your driver will arrive in    │
│    │ approximately 3 minutes.      │
│    │                                │
│    │ Driver: John D.               │
│    │ Vehicle: Toyota Corolla       │
│    │ License: ABC-123              │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │   View Ride Details     │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## Key Features

- **Real-time Communication**: WebSocket-powered chat
- **Interactive Maps**: Google Maps integration with real-time tracking
- **Push Notifications**: Comprehensive notification system
- **Emergency System**: Multi-level emergency assistance
- **Payment Processing**: Secure Stripe integration
- **Navigation Components**: Drawer and bottom tab navigation
- **State Management**: Loading, error, and success states
- **Responsive Design**: Works across all device sizes

## Component Architecture

### Atomic Design Pattern

- **Atoms**: Buttons, inputs, icons
- **Molecules**: Search bars, notification items, payment cards
- **Organisms**: Chat interface, map component, navigation drawer
- **Templates**: Screen layouts with consistent structure
- **Pages**: Complete screens with specific content

### State Management

- **Local State**: useState for component-specific state
- **Global State**: Zustand stores for app-wide state
- **Server State**: Real-time updates via WebSocket
- **Persistent State**: AsyncStorage for user preferences

### Reusability

- **Custom Hooks**: useChat, useNotifications, useWebSocket
- **Shared Components**: CustomButton, GoogleTextInput, Map
- **Utility Functions**: Date formatting, currency formatting
- **Constants**: Colors, icons, dimensions
