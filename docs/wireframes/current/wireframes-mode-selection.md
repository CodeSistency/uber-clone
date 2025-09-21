# Uber-like App Wireframes: Mode Selection

## Overview
This document contains ASCII wireframes for the mode selection flow of the Uber-like multi-modal application.

## 1. Welcome Modal (First-time Users)

```
┌─────────────────────────────────────┐
│                                     │
│        Welcome! 🎉                  │
│                                     │
│    Choose how you want to use      │
│    our Super App                   │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Continue as Customer │      │
│    │ Book rides and order food     │
│    │                           │      │
│    │ ✓ Easy ride booking      │      │
│    │ ✓ Food delivery          │      │
│    │ ✓ Safe & reliable        │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👨‍💼 Become a Driver    │      │
│    │ Earn money by accepting rides │
│    │                           │      │
│    │ ✓ Flexible schedule      │      │
│    │ ✓ Competitive earnings   │      │
│    │ ✓ Driver support         │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🏪 Register a Business   │      │
│    │ Manage your restaurant       │
│    │                           │      │
│    │ ✓ Reach more customers   │      │
│    │ ✓ Easy order management  │      │
│    │ ✓ Analytics & insights   │      │
│    └─────────────────────────┘      │
│                                     │
│    You can change your mode later   │
│    from the menu                   │
│                                     │
└─────────────────────────────────────┘
```

## 2. Drawer Mode Switcher

```
┌─────────────────────────────────────┐
│         Account Modes               │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Customer Mode        │      │
│    │ Book rides and order food     │
│    │                           │      │
│    │ Tap to register          │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👨‍💼 Driver Mode        │      │
│    │ Accept rides and deliveries   │
│    │                           │      │
│    │ ✓ Active                 │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🏪 Business Mode        │      │
│    │ Manage your business          │
│    │                           │      │
│    │ Tap to register          │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 3. Floating Action Button Mode Switcher

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
│                     ┌─────────┐      │
│                     │   🔄   │      │
│                     └─────────┘      │
│                                     │
└─────────────────────────────────────┘
```

## 4. Mode Switch Modal

```
┌─────────────────────────────────────┐
│          Switch Mode                │
│                                     │
│    Choose how you want to use      │
│    the app                         │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚗 Continue as Customer │      │
│    │ Book rides and order food     │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👨‍💼 Switch to Driver   │      │
│    │ Accept rides and deliveries   │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🏪 Switch to Business   │      │
│    │ Manage your business          │
│    └─────────────────────────┘      │
│                                     │
│              [Close]                │
│                                     │
└─────────────────────────────────────┘
```

## 5. Registration Required Alert

```
┌─────────────────────────────────────┐
│                                     │
│    Driver Mode Not Available        │
│                                     │
│    You haven't registered for       │
│    Driver Mode. Would you like      │
│    to register now?                 │
│                                     │
│            [Cancel]  [Register]     │
│                                     │
└─────────────────────────────────────┘
```

## Navigation Flow

```
Authentication Success
           │
           ├── First Time User → Welcome Modal
           │          │
           │          └── Select Mode → Save Mode → Redirect to Mode
           │
           └── Returning User → Check Saved Mode
                      │
                      ├── Mode Selected → Redirect to Mode Dashboard
                      │
                      └── No Mode → Welcome Modal
```

## Key Features

- **Multi-mode Support**: Customer, Driver, and Business modes
- **Flexible Switching**: Change modes anytime via drawer or FAB
- **Registration Validation**: Check if user is registered for premium modes
- **Persistent Storage**: Save mode preference using AsyncStorage
- **Smooth Transitions**: Animated mode switching with loading states
- **Context Awareness**: Different UI based on current mode and registration status

## Mode Descriptions

### Customer Mode
- Primary mode for ride booking and food delivery
- Available to all authenticated users
- Full access to ride booking, tracking, and payments

### Driver Mode
- Requires driver registration and verification
- Access to ride requests, earnings, and driver tools
- Location tracking and real-time updates

### Business Mode
- Requires business registration
- Access to order management, menu editing, and analytics
- Restaurant/store management tools
