# New UI/UX Flows for the Super App

This document describes the user interface (UI) and user experience (UX) flows for the new features, including driver mode, marketplace, and deliveries.

---

## 1. Driver/Courier Onboarding & Management Flow

This flow outlines the journey of a person registering to work on the platform.

### 1.1. Standard Customer Registration
- **User Story:** Users should first register as standard customers to get familiar with the app.
- **UI:** A normal registration form (name, email, password) that creates a customer account.

### 1.2. Welcome Modal (Post-Registration)
- **User Story:** After successful registration, new users should be presented with options to expand their usage of the platform.
- **UI:** A modal that appears after the first login, with three options:
  - **"Continue as Customer"**: Closes the modal and continues to the main app.
  - **"Register a Business"**: Leads to the store/restaurant registration flow.
  - **"Become a Driver/Courier"**: Leads to the driver onboarding process.
- **Technical Implementation:** This choice should be saved to localStorage to prevent the modal from showing again on subsequent logins.
- **Design:** Friendly and welcoming design with clear icons for each option, emphasizing that these are optional expansions of their account.

### 1.3. Driver Onboarding Process
A step-by-step process to guide the applicant.

- **Step 1: Personal Information**
  - **UI:** A simple form for basic details (name, phone number, etc.).
- **Step 2: Vehicle Details**
  - **UI:** A form to input vehicle model, license plate, etc. It will include checkboxes asking what the vehicle will be used for:
    - [ ] Rides (for cars with enough seats)
    - [ ] Deliveries
    - [ ] Both
- **Step 3: Document Upload**
  - **UI:** A clear interface to upload photos of required documents (driver's license, vehicle registration, profile photo). Each document will have a visual status indicator: `Pending`, `In Review`, `Approved`, `Rejected`.
- **Step 4: "In Review" Screen**
  - **UI:** A friendly screen informing the user that their application is being processed and they will be notified of the outcome.

### 1.4. The Driver's Dashboard (Driver Mode)
The main interface for a verified and logged-in driver.

- **Main Interface:**
  - **UI:** A map-centric view, similar to the customer's, with a prominent button to "Go Online" / "Go Offline".
- **Service Selector:**
  - **UI:** A toggle or dropdown at the top of the screen to filter incoming requests:
    - `Rides Only`
    - `Deliveries Only`
    - `All`
- **Earnings Dashboard:**
  - **UI:** A dedicated section to view earnings for the day, week, and month, with a detailed history of each completed trip or delivery.
- **New Request Notification:**
  - **UI:** When a new request comes in, a large card will slide up from the bottom, displaying key information (origin, destination, estimated earnings, distance). It will feature clear "Accept" and "Decline" buttons with a countdown timer.

---

## 1.5. Business Registration Flow

This flow outlines how a user can register their store or restaurant on the platform.

### 1.5.1. Business Type Selection
- **User Story:** Business owners should be able to choose what type of establishment they want to register.
- **UI:** A screen with options for:
  - Restaurant/Food Service
  - Grocery Store
  - Pharmacy/Health
  - General Store
  - Other

### 1.5.2. Business Information Form
- **UI:** A comprehensive form including:
  - Business name and description
  - Address and location
  - Contact information
  - Operating hours
  - Delivery radius (if applicable)

### 1.5.3. Document Upload
- **UI:** Similar to driver documents, but for business verification:
  - Business license
  - Tax documents
  - Health/safety certificates (for restaurants)
  - Store photos

### 1.5.4. Product/Menu Setup
- **UI:** After business approval, a dedicated interface to:
  - Add products/items with photos, descriptions, and prices
  - Organize items by categories
  - Set availability and special pricing

### 1.5.5. Business Dashboard
- **UI:** A store management portal showing:
  - Current orders and their status
  - Daily/weekly earnings
  - Customer ratings and reviews
  - Inventory management

---

## 1.6. Mode Switching System

This system allows users to switch between different roles/modes after they have registered multiple account types.

### 1.6.1. Mode Switcher in Navigation Drawer
- **User Story:** As a multi-role user, I want to easily switch between my different account types (customer, driver, business owner).
- **UI:** A navigation drawer (hamburger menu) with a prominent "Account Modes" section at the top:
  ```
  ┌─────────────────────────────┐
  │ 🚗 Customer Mode (Active)    │ ← Current mode highlighted
  │─────────────────────────────│
  │ 👨‍💼 Driver Mode              │
  │ 🏪 Business Mode             │
  │─────────────────────────────│
  │ Profile                      │
  │ Settings                     │
  │ Help                         │
  │ Logout                       │
  └─────────────────────────────┘
  ```
- **Behavior:** Tapping on any mode will switch the entire app interface to that mode's dashboard and navigation.

### 1.6.2. Visual Mode Indicators
- **Header Bar:** A colored indicator showing current mode:
  - Customer: Blue header
  - Driver: Orange header
  - Business: Green header
- **Bottom Navigation:** Icons change based on mode:
  - Customer: Home, Search, Orders, Profile
  - Driver: Map, Earnings, History, Profile
  - Business: Dashboard, Orders, Menu, Analytics

### 1.6.3. Quick Mode Switcher
- **UI:** A floating action button (FAB) that appears on main screens, showing current mode and allowing quick switching:
  ```
  ┌─────┐
  │🚗 📍│ ← Current mode + location indicator
  └─────┘
  ```
- **Behavior:** Tapping opens a bottom sheet with mode options.

### 1.6.4. Mode-Specific Onboarding
- **User Story:** When switching to a new mode for the first time, users should get a brief introduction to that mode's features.
- **UI:** A short walkthrough or tooltip tour when first entering a new mode.

### 1.6.5. Conditional Mode Access
- **Behavior:** If a user tries to access a mode they haven't registered for:
  - **Driver Mode**: Shows a modal: "Become a Driver" with benefits and "Register Now" button
  - **Business Mode**: Shows a modal: "Register Your Business" with benefits and "Get Started" button
- **UI:** Attractive modal with:
  - Clear benefits (earnings, flexibility, etc.)
  - "Register Now" / "Get Started" button
  - "Maybe Later" option to dismiss
- **Technical:** Tracks dismissal in localStorage to avoid showing too frequently

### 1.6.6. Implementation Details
The mode switching system has been implemented with reusable components:

#### `ModeSwitcher` Component
```tsx
// Drawer version (for navigation menu)
<ModeSwitcher currentMode="customer" variant="drawer" />

// Floating Action Button version
<ModeSwitcher currentMode="customer" variant="fab" />

// Modal version (for quick switching)
<ModeSwitcher currentMode="customer" variant="modal" />
```

#### `DrawerContent` Component
```tsx
// Complete drawer with mode switcher integrated
<DrawerContent currentMode="customer" />
```

#### Features:
- **Conditional Access**: Automatically detects if user has access to each mode
- **Registration Flow**: Redirects to appropriate registration if mode is not available
- **Visual Feedback**: Clear indication of current mode with colors and icons
- **Seamless Navigation**: Smooth transitions between different app modes

---

## 1.7. Complete Driver Module Navigation & Interfaces

### 1.7.1. Driver Home Dashboard
**Route:** `/driver/dashboard`
- **Main Map View:** Shows current location and nearby pickup points
- **Status Toggle:** Large "Go Online" / "Go Offline" button at the top
- **Service Type Selector:** Toggle for Rides/Deliveries/All
- **Current Activity Card:** Shows active ride/delivery if any
- **Quick Stats:** Today's earnings, trips completed, rating

### 1.7.2. Ride Request Flow
**Route:** `/driver/ride-requests`
- **Available Requests List:** Scrollable list of pending rides
- **Request Details Card:** Origin, destination, fare, distance, estimated time
- **Accept/Decline Buttons:** With countdown timer (30 seconds)
- **Auto-refresh:** Updates every 10 seconds when online

### 1.7.3. Active Ride Screen
**Route:** `/driver/active-ride/[rideId]`
- **Map with Route:** Shows pickup and destination with real-time location
- **Ride Details:** Passenger info, pickup address, destination
- **Action Buttons:** "Arrived at Pickup", "Picked Up Passenger", "Drop Off Complete"
- **Chat Button:** Quick access to passenger chat
- **Emergency Button:** For safety situations

### 1.7.4. Earnings Dashboard
**Route:** `/driver/earnings`
- **Daily/Weekly/Monthly Tabs:** Different time periods
- **Earnings Breakdown:** Base fare, tips, bonuses
- **Trip History:** Detailed list with dates, amounts, ratings
- **Payout Information:** When and how earnings are paid out

### 1.7.5. Profile & Documents
**Route:** `/driver/profile`
- **Personal Information:** Editable name, phone, vehicle details
- **Document Status:** Visual status of uploaded documents
- **Vehicle Information:** Model, license plate, insurance status
- **Rating & Reviews:** Overall rating and recent passenger reviews

### 1.7.6. Settings & Support
**Route:** `/driver/settings`
- **Notification Preferences:** Ride requests, messages, updates
- **Payment Methods:** Bank account for payouts
- **Support Center:** FAQ, contact support, report issues

### 1.7.7. Navigation Flow Map
```
Driver Dashboard → Ride Requests → Accept Ride → Active Ride
    ↓                    ↓             ↓           ↓
Earnings Dashboard   Profile       Cancel    Completed
    ↓                    ↓
Settings           Document Upload
```

---

## 1.8. Complete Business Module Navigation & Interfaces

### 1.8.1. Business Registration Flow
**Route:** `/business/register`
1. **Business Type Selection** → Choose restaurant, store, pharmacy, etc.
2. **Business Information Form** → Name, address, hours, description
3. **Document Upload** → Business license, health certificates, photos
4. **Menu/Product Setup** → Add items with photos, prices, categories

### 1.8.2. Business Dashboard
**Route:** `/business/dashboard`
- **Today's Orders:** List of current and recent orders
- **Quick Stats:** Today's revenue, orders completed, average rating
- **Store Status Toggle:** Open/Closed switch
- **Pending Actions:** New orders, low stock alerts, reviews to respond

### 1.8.3. Order Management
**Route:** `/business/orders`
- **Order Status Tabs:** New, Preparing, Ready, Completed
- **Order Details:** Customer info, items ordered, special instructions
- **Status Updates:** Change order status with timestamps
- **Customer Communication:** Chat with customers about orders

### 1.8.4. Menu Management
**Route:** `/business/menu`
- **Category Management:** Add/edit/delete menu categories
- **Product Management:** Add/edit/delete menu items
- **Price Updates:** Change prices, add special offers
- **Availability Toggle:** Mark items as available/unavailable

### 1.8.5. Analytics & Insights
**Route:** `/business/analytics`
- **Revenue Charts:** Daily, weekly, monthly trends
- **Popular Items:** Best-selling products
- **Customer Insights:** Peak hours, average order value
- **Performance Metrics:** Rating trends, delivery times

### 1.8.6. Store Settings
**Route:** `/business/settings`
- **Store Information:** Hours, delivery radius, minimum order
- **Payment Settings:** Accepted payment methods
- **Staff Management:** Add/remove staff accounts
- **Notifications:** Order alerts, review responses

### 1.8.7. Reviews & Ratings
**Route:** `/business/reviews`
- **Customer Reviews:** All reviews with ratings and comments
- **Response System:** Reply to customer reviews
- **Rating Trends:** Overall rating over time
- **Review Categories:** Food quality, service, delivery

### 1.8.8. Navigation Flow Map
```
Business Dashboard → Orders → Order Details → Customer Chat
    ↓                    ↓         ↓               ↓
Menu Management     Analytics   Update Status   Mark Complete
    ↓                    ↓
Store Settings     Reviews & Ratings
    ↓
Staff Management
```

---

## 2. Marketplace & Delivery Flow (for Customers)

This flow describes how a customer orders food or products from a store.

### 2.1. Service Selector on Main Screen
- **User Story:** As a customer, I want to easily switch between booking a ride and ordering a delivery.
- **UI:** A prominent toggle switch or segmented control at the top of the home screen with two options: `Rides` and `Deliveries`. The UI below will change dynamically based on the selection.

### 2.2. "Deliveries" Home Screen
- **UI Elements:**
  - **Search Bar:** To search for stores or specific products.
  - **Categories:** A horizontal scroll view of icons or cards to filter by store type (`Restaurants`, `Groceries`, `Pharmacy`, etc.).
  - **Store Listings:** A vertical list of nearby stores, displayed as cards with their logo, cuisine type, rating, and estimated delivery time.

### 2.3. Store/Restaurant Screen
- **UI Elements:**
  - **Header:** A hero image, store logo, name, rating, and delivery time.
  - **Product/Menu Catalog:** Products will be organized by categories in a list. Each item will show a photo, name, description, and price. Tapping an item opens a modal to customize it (if applicable) and add it to the cart.
  - **Floating Cart Button:** A button will be persistently visible at the bottom, showing the number of items and the subtotal in the cart.

### 2.4. Checkout Flow
A multi-step, clear process to finalize an order.

- **Step 1: Order Summary**
  - **UI:** A screen showing all items, subtotal, delivery fee, and the final total.
- **Step 2: Delivery Address**
  - **UI:** Displays the user's default address with an option to change it or select a different saved address.
- **Step 3: Payment & Tip**
  - **UI:** Allows the user to select a payment method (credit card, wallet) and add a tip for the courier.
- **Step 4: Confirmation Button**
  - **UI:** A final "Place Order" button.

### 2.5. Order Tracking Screen
- **UI Elements:**
  - **Progress Tracker:** A visual progress bar at the top showing the order status: `Confirmed` -> `Preparing` -> `On the Way` -> `Delivered`.
  - **Live Map:** Once the status is "On the Way," a map will show the courier's real-time location.
  - **Courier Information:** A section with the courier's photo, name, and a button to initiate a chat.

---

## 3. Complete Navigation Flow Summary

### 3.1. Customer Mode Navigation
```
Home Screen → Service Toggle → Rides/Deliveries
    ↓                    ↓           ↓
Profile/Settings     Ride Booking  Store Selection
    ↓                    ↓           ↓
Wallet & Payments   Ride Tracking  Product Menu
    ↓                    ↓           ↓
Emergency Contacts  Ride Complete  Checkout
```

### 3.2. Driver Mode Navigation
```
Driver Dashboard → Ride Requests → Accept Ride → Active Ride
    ↓                    ↓             ↓           ↓
Earnings Dashboard   Profile       Cancel    Completed
    ↓                    ↓
Settings           Document Upload
```

### 3.3. Business Mode Navigation
```
Business Dashboard → Orders → Order Details → Customer Chat
    ↓                    ↓         ↓               ↓
Menu Management     Analytics   Update Status   Mark Complete
    ↓                    ↓
Store Settings     Reviews & Ratings
    ↓
Staff Management
```

### 3.4. Cross-Mode Navigation
```
Any Mode → Drawer Menu → Mode Switcher → Target Mode Dashboard
    ↓                    ↓             ↓
Settings          Profile         Logout
```

---

## 4. Additional Flows (Wallet & Safety)

### 4.1. Wallet Management
- **Main Screen:**
  - **UI:** A screen that prominently displays the current wallet balance.
- **Add Funds:**
  - **UI:** A button "Add Funds" leads to a screen where the user can select a top-up amount and a payment method.
- **Transaction History:**
  - **UI:** A clear, itemized list of all transactions (top-ups, ride payments, order payments) with dates and descriptions.

### 4.2. Emergency Contacts & SOS
- **Contact Management:**
  - **UI:** A simple screen within the "Safety" section of the user's profile to add, view, and delete emergency contacts.
- **SOS Flow:**
  - **UI:** During a ride or delivery, pressing the SOS button will trigger a confirmation modal. Upon confirmation, an alert with live trip details is sent to the user's emergency contacts.

---

## 5. Design System & Styling Guidelines

Based on the analysis of the existing codebase, this application follows a modern, minimalist design philosophy inspired by Uber's design system.

### 5.1. Color Palette

The application uses a carefully crafted color system:

#### Primary Colors (Blue)
- **Primary-500**: `#0286FF` - Main brand color, used for CTAs and active states
- **Primary-600**: `#6A85E6` - Hover states and secondary actions
- **Primary-400/300/200/100**: Various tints for backgrounds and subtle elements

#### Semantic Colors
- **Success**: Green tones (`#38A169`) for positive actions and confirmations
- **Danger**: Red tones (`#F56565`) for errors and destructive actions
- **Warning**: Yellow tones (`#EAB308`) for caution states
- **Secondary**: Gray scale for neutral elements and text

#### Background Colors
- **General-500**: `#F6F8FA` - Main background color
- **General-600**: `#E6F3FF` - Light blue tint for special sections
- **General-700**: `#EBEBEB` - Light gray for dividers and borders

### 5.2. Typography

#### Font Family: Plus Jakarta Sans
- **Jakarta-Regular**: Regular text (15px)
- **Jakarta-Medium**: Subheadings and labels
- **Jakarta-SemiBold**: Button text and important labels
- **Jakarta-Bold**: Headings and strong emphasis
- **Jakarta-ExtraBold**: Large titles and hero text

#### Text Hierarchy
- **Large Titles**: 24px+ (Jakarta-ExtraBold)
- **Headings**: 18-20px (Jakarta-Bold)
- **Subheadings**: 16px (Jakarta-SemiBold)
- **Body Text**: 15px (Jakarta-Medium)
- **Labels**: 14px (Jakarta-Medium)
- **Captions**: 12-13px (Jakarta-Regular)

### 5.3. Component Patterns

#### Buttons
```tsx
// Primary CTA Button
<CustomButton
  title="Continue"
  bgVariant="primary" // Blue background
  className="w-full rounded-full p-3 shadow-md shadow-neutral-400/70"
/>

// Secondary Button
<CustomButton
  title="Cancel"
  bgVariant="outline" // Transparent with border
  textVariant="primary" // Black text
/>
```

#### Input Fields
```tsx
// Consistent input styling
<View className="bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500">
  <TextInput className="rounded-full p-4 font-JakartaSemiBold text-[15px]" />
</View>
```

#### Cards
```tsx
// Standard card pattern
<View className="bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
  <View className="p-3">
    {/* Card content */}
  </View>
</View>
```

### 5.4. Layout Patterns

#### Screen Structure
```tsx
<SafeAreaView className="bg-general-500">
  {/* Header Section */}
  <View className="p-5">
    <Text className="text-2xl font-JakartaExtraBold">Title</Text>
  </View>

  {/* Main Content */}
  <View className="flex-1 px-5">
    {/* Content goes here */}
  </View>

  {/* Bottom Actions */}
  <View className="p-5">
    <CustomButton title="Action" />
  </View>
</SafeAreaView>
```

#### Spacing Scale
- **xs**: 4px (p-1)
- **sm**: 8px (p-2)
- **md**: 12px (p-3)
- **lg**: 16px (p-4)
- **xl**: 20px (p-5)
- **2xl**: 24px (p-6)

### 5.5. Icon Usage

#### Icon Sizes
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)
- **Extra Large**: `w-8 h-8` (32px)

#### Icon Colors
- **Primary**: `text-primary-500`
- **Secondary**: `text-secondary-600`
- **Success**: `text-success-500`
- **Danger**: `text-danger-500`

### 5.6. Interactive States

#### Button States
- **Normal**: Full opacity
- **Pressed**: 0.8 opacity with scale animation
- **Disabled**: 0.5 opacity, non-interactive

#### Input States
- **Default**: Light gray background, neutral border
- **Focused**: Blue border (`border-primary-500`)
- **Error**: Red border (`border-danger-500`)
- **Disabled**: Gray background, non-interactive

### 5.7. Shadow System

#### Elevation Levels
- **Level 1**: `shadow-sm shadow-neutral-300` (Subtle cards)
- **Level 2**: `shadow-md shadow-neutral-400/70` (Buttons, important cards)
- **Level 3**: `shadow-lg shadow-neutral-500` (Modals, important elements)

### 5.8. Animation Guidelines

#### Micro-interactions
- **Button Press**: Scale to 0.95 with 100ms duration
- **Screen Transitions**: Slide from right with 300ms duration
- **Loading States**: Opacity fade with 200ms duration

#### Skeleton Loading
```tsx
// Use skeleton screens instead of spinners
<View className="animate-pulse">
  <View className="h-4 bg-gray-300 rounded w-3/4 mb-2"></View>
  <View className="h-4 bg-gray-300 rounded w-1/2"></View>
</View>
```

### 5.9. Responsive Design

#### Breakpoints (Mobile-First)
- **Small**: 320px - 640px (iPhone SE to iPhone 13)
- **Medium**: 640px - 768px (iPad mini, larger phones)
- **Large**: 768px+ (iPad, tablets)

#### Touch Targets
- **Minimum Size**: 44px x 44px
- **Recommended**: 48px x 48px
- **Touch Area**: At least 8px spacing between interactive elements

### 5.10. Dark Mode Considerations

#### Color Adaptations
- **Background**: `bg-general-500` → `bg-secondary-900`
- **Text**: `text-secondary-900` → `text-secondary-100`
- **Cards**: `bg-white` → `bg-secondary-800`
- **Borders**: `border-neutral-200` → `border-secondary-700`

### 5.11. Accessibility Guidelines

#### Text Contrast
- **Primary Text**: Minimum 4.5:1 contrast ratio
- **Secondary Text**: Minimum 4.5:1 contrast ratio
- **Disabled Text**: Minimum 3:1 contrast ratio

#### Touch Accessibility
- All interactive elements meet 44px minimum touch target
- Sufficient spacing between touch targets
- Clear visual feedback for all interactions

#### Screen Reader Support
- All images have descriptive alt text
- Form fields have proper labels
- Custom components announce their state and purpose

This design system ensures a consistent, modern, and accessible user experience across all platforms and screen sizes.
