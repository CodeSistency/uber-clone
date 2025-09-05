# Uber-like App Wireframes: Authentication Flow

## Overview
This document contains ASCII wireframes for the authentication flow of the Uber-like multi-modal application.

## 1. Welcome Screen (Onboarding)

```
┌─────────────────────────────────────┐
│           Welcome Screen            │
│                                     │
│    ┌─────────────────────────┐      │
│    │         Uber-like       │      │
│    │        Super App        │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │      🚗 Book rides      │      │
│    │    and order food       │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │   👨‍💼 Become driver    │      │
│    │   Earn money driving    │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │    🏪 Register business │      │
│    │   Manage your store     │      │
│    └─────────────────────────┘      │
│                                     │
│         [Skip]     ● ○ ○     [Next] │
│                                     │
└─────────────────────────────────────┘
```

## 2. Sign Up Screen

```
┌─────────────────────────────────────┐
│    [Car Image - signUpCar]          │
│    ┌─────────────────────────┐      │
│    │ Create Your Account     │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 👤 Name                 │      │
│    │ Enter name              │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📧 Email                │      │
│    │ Enter email             │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🔒 Password             │      │
│    │ Enter password          │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │       Sign Up           │      │
│    └─────────────────────────┘      │
│                                     │
│    Already have an account?         │
│    <Log In>                         │
│                                     │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Header image (signUpCar) with overlay text
- Uses InputField components with icons
- Three fields: Name, Email, Password (no confirm password)
- CustomButton with rounded design
- Link component for navigation to sign-in
- ScrollView for content

## 3. OTP Verification Screen

```
┌─────────────────────────────────────┐
│       OTP Verification              │
│                                     │
│    ┌─────────────────────────┐      │
│    │   Enter Verification    │      │
│    │        Code             │      │
│    └─────────────────────────┘      │
│                                     │
│    We sent a code to:               │
│    +1 (555) 123-4567                │
│                                     │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│    │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │
│    └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                                     │
│    ┌─────────────────────────┐      │
│    │     Verify Code         │      │
│    └─────────────────────────┘      │
│                                     │
│    Didn't receive code? [Resend]    │
│                                     │
│    [Change Phone Number]            │
│                                     │
└─────────────────────────────────────┘
```

## 4. Sign In Screen

```
┌─────────────────────────────────────┐
│    [Car Image - signUpCar]          │
│    ┌─────────────────────────┐      │
│    │ Welcome 👋              │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 📧 Email                │      │
│    │ Enter email             │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🔒 Password             │      │
│    │ Enter password          │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │      Sign In            │      │
│    └─────────────────────────┘      │
│                                     │
│    Don't have an account?           │
│    <Sign Up>                        │
│                                     │
└─────────────────────────────────────┘
```

**Actual Implementation Notes:**
- Same header image as sign-up
- "Welcome 👋" text overlay on image
- Two fields: Email and Password
- CustomButton for sign in
- Link component for navigation to sign-up
- No Google OAuth or forgot password (not implemented)
- ScrollView container

## Navigation Flow

```
Welcome Screen (Onboarding)
      │
      ├── Skip → Sign Up
      │
      └── Next → Onboarding Slides → Sign Up
                    │
                    └── Sign Up → Home (success)
                    │        │
                    │        └── Mode Selection Modal (first time)
                    │
                    └── Sign In → Home (success)
                             │
                             └── Mode Selection Modal (first time)
```

## Key Features

- **Onboarding**: Interactive slides with skip/next navigation
- **Image Headers**: Car images with overlay text for visual appeal
- **InputField Components**: Custom inputs with icons and validation
- **Form Validation**: Real-time validation with error messages
- **UI Wrapper**: Loading states, success/error notifications
- **Auto-redirect**: Automatic navigation if already authenticated
- **Link Navigation**: Seamless switching between sign-in/sign-up
- **ScrollView**: Responsive layout for different screen sizes

## Implementation Details

### Components Used
- **ScrollView**: Main container for scrollable content
- **Image**: Header images from constants/images
- **InputField**: Custom input component with icons
- **CustomButton**: Rounded button with consistent styling
- **Link**: Expo Router navigation component
- **UIWrapper**: Context for loading/success/error states

### State Management
- **Local State**: Form data with useState
- **Validation**: Client-side validation before submission
- **Authentication**: Integration with auth library
- **Navigation**: Automatic redirects based on auth status

### Styling
- **NativeWind**: Tailwind CSS classes for styling
- **Jakarta Font**: Consistent typography throughout
- **Image Overlays**: Text positioned over images
- **Rounded Corners**: Consistent border radius on components
