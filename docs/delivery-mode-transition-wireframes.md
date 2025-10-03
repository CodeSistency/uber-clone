# 🛵 Delivery Mode Selection - Wireframes & Transitions

## Overview

Esta documentación muestra específicamente cómo cambia la interfaz cuando el usuario selecciona el modo **Delivery** en la pantalla principal, basado en la implementación actual.

---

## 🎯 Current Implementation Analysis

### Estado Actual - Transport Mode (Default)

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │ ← Mapa completo
│   📍 Your Location (Pulsing)       │
│   🚗🚗🚗 Available Drivers         │ ← Marcadores de conductores
│   🚗 Transport markers             │
│   🔴 Live traffic overlay          │
│                                     │
│                                     │
│                                     │
│ ──────────────────────────────────── │ ← Centro dinámico
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵 Delivery     │   │ ← Selector de servicio
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔍 Where to go?             │   │ ← Input de destino
│   │ [📍 Current Location]       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🏠 Home        💼 Work       │   │ ← Accesos rápidos (lugares)
│   │ 🛒 Mall                      │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Transition Animation - Service Selection

### Paso 1: Usuario hace tap en "🛵 Delivery"

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │
│   📍 Your Location (Pulsing)       │
│   🚗🚗🚗 Available Drivers         │ ← Marcadores actuales
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵[Delivery]    │   │ ← Animación de selección
│   │     [██████████████]         │   │    Barra de progreso
│   └─────────────────────────────┘   │
│                                     │
│   🔄 Switching to Delivery Mode... │ ← Loading state
│                                     │
└─────────────────────────────────────┘
```

### Paso 2: Mapa se actualiza con marcadores de restaurantes

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │
│   📍 Your Location (Pulsing)       │
│   🍕🍔🥗 Restaurant Markers        │ ← Nuevos marcadores
│   🏪 Business Locations            │
│   🟢 Delivery Zones (Green)        │ ← Zonas de delivery
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵 Delivery     │   │ ← Delivery seleccionado
│   │    [█████████░]              │   │    Barra de progreso
│   └─────────────────────────────┘   │
│                                     │
│   🔄 Loading restaurants...        │ ← Estado de carga
│   📍 Finding 12 nearby places      │
└─────────────────────────────────────┘
```

---

## ✅ Final State - Delivery Mode Active

### Vista Completa - Delivery Mode

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (70%)            │ ← Mapa reducido para contenido
│   📍 Your Location (Pulsing)       │
│   🍕🍔🥗🍱 Restaurant Markers      │ ← 12 restaurantes cercanos
│   🏪 5 Businesses with delivery    │
│   🟢 Delivery Zone Overlay         │
│   ⭐ Top Rated: Mario's Pizza      │ ← Sugerencias inteligentes
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵[Delivery]    │   │ ← Delivery activo
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │ ← Input adaptado
│   │ 🔍 Search restaurants       │   │
│   │ [📍 Current Location]       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │ ← Categorías rápidas
│   │ 🍕 Pizza • 🍔 Burgers       │   │
│   │ 🥗 Healthy • 🥤 Drinks      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │ ← Accesos rápidos actualizados
│   │ 🏠 Home        🍕 Favorites   │   │
│   │ 🏢 Work        🛒 Groceries   │   │
│   └─────────────────────────────┘   │
│                                     │
│ ──────────────────────────────────── │
│ 🏠 💬 🛒                           │ ← Bottom nav con carrito
└─────────────────────────────────────┘
```

---

## 🔍 Detailed Component Changes

### 1. Map Markers Transformation

#### Before (Transport):

```
🚗 Driver markers
📍 User location
🏠 Home/Work markers
🛒 Mall markers
```

#### After (Delivery):

```
🍕 Restaurant markers
🥗 Food category markers
🏪 Business markers
🟢 Delivery zone overlays
⭐ Top-rated highlights
📍 User location (enhanced)
```

### 2. Search Input Adaptation

#### Transport Mode:

```
🔍 Where to go?
[📍 Current Location]
```

#### Delivery Mode:

```
🔍 Search restaurants, cuisines...
[📍 Current Location]
```

### 3. Quick Access Changes

#### Transport Quick Access:

```
🏠 Home
💼 Work
🛒 Mall
```

#### Delivery Quick Access:

```
🍕 Pizza Places
🍔 Burger Joints
🥗 Healthy Options
🛒 Grocery Stores
```

### 4. Smart Suggestions

#### Transport Suggestions:

```
"Need a ride home?"
"Headed to work?"
```

#### Delivery Suggestions:

```
"Craving pizza? Mario's is 2 min away"
"Healthy lunch: Green Cafe - 15 min"
"Quick bite: Burger Express - 10 min"
```

---

## 🎨 Enhanced Delivery Features

### Categoría Filters Integration

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (60%)            │
│   🍕🍔🥗 Filtered Markers          │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Categorías horizontales
│   │ 🍽️ All • 🍕 Italian         │   │
│   │ 🍔 American • 🥗 Healthy     │   │
│   │ 🥤 Drinks • 🛒 Groceries     │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🍕 Pizza Places (8)         │   │
│   │   Mario's Pizza • 4.7★      │   │
│   │   Luigi's • 4.5★            │   │
│   │   ────────────────────────── │   │
│   │ 🍔 Burgers (5)              │   │
│   │   Burger King • 4.3★        │   │
│   │   Five Guys • 4.6★          │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Real-time Availability

```
┌─────────────────────────────────────┐
│   ┌─────────────────────────────┐   │
│   │ 🟢 OPEN NOW (8)             │   │
│   │ 🟡 CLOSING SOON (3)         │   │
│   │ 🔴 CLOSED (2)               │   │
│   └─────────────────────────────┘   │
│                                     │
│   🍕 Mario's Pizza                 │
│     🟢 Open • 25-35 min • $2.99    │
│                                     │
│   🍔 Burger Palace                 │
│     🟢 Open • 20-30 min • $1.99    │
│                                     │
│   🥗 Green Cafe                    │
│     🟡 Closes in 30 min           │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Implementation Changes Required

### 1. State Management Updates

```typescript
// Enhanced state for delivery mode
const [deliveryState, setDeliveryState] = useState({
  mode: "transport", // 'transport' | 'delivery'
  nearbyRestaurants: [],
  categories: ["pizza", "burgers", "healthy", "drinks"],
  selectedCategory: "all",
  searchQuery: "",
  quickAccess: [],
});

// Update when service type changes
useEffect(() => {
  if (serviceType === "delivery") {
    loadNearbyRestaurants();
    updateMapMarkers("restaurants");
    updateQuickAccess("delivery");
  } else {
    loadNearbyDrivers();
    updateMapMarkers("drivers");
    updateQuickAccess("transport");
  }
}, [serviceType]);
```

### 2. Map Component Updates

```typescript
// Dynamic marker rendering
const renderMapMarkers = () => {
  if (serviceType === 'delivery') {
    return restaurants.map(restaurant => (
      <Marker
        key={restaurant.id}
        coordinate={restaurant.location}
        title={restaurant.name}
        description={`${restaurant.category} • ${restaurant.rating}★`}
      >
        <RestaurantMarker restaurant={restaurant} />
      </Marker>
    ));
  }

  return drivers.map(driver => (
    <Marker
      key={driver.id}
      coordinate={driver.location}
      title={driver.name}
      description={`${driver.vehicle} • ${driver.rating}★`}
    >
      <DriverMarker driver={driver} />
    </Marker>
  ));
};
```

### 3. Search Component Adaptation

```typescript
// Context-aware search
const SearchInput = ({ serviceType }) => {
  const placeholders = {
    transport: 'Where to go?',
    delivery: 'Search restaurants, cuisines...'
  };

  const icons = {
    transport: icons.search,
    delivery: icons.restaurant
  };

  return (
    <GoogleTextInput
      icon={icons[serviceType]}
      placeholder={placeholders[serviceType]}
      containerStyle="bg-neutral-100 border-0"
      handlePress={handleDestinationPress}
    />
  );
};
```

### 4. Quick Access Dynamic Update

```typescript
// Service-specific quick access
const QuickAccess = ({ serviceType }) => {
  const quickAccessData = {
    transport: [
      { icon: '🏠', label: 'Home', action: () => navigateToHome() },
      { icon: '💼', label: 'Work', action: () => navigateToWork() },
      { icon: '🛒', label: 'Mall', action: () => navigateToMall() }
    ],
    delivery: [
      { icon: '🍕', label: 'Pizza', action: () => filterByCategory('pizza') },
      { icon: '🍔', label: 'Burgers', action: () => filterByCategory('burgers') },
      { icon: '🥗', label: 'Healthy', action: () => filterByCategory('healthy') }
    ]
  };

  return (
    <View className="flex-row justify-between">
      {quickAccessData[serviceType].map((item, index) => (
        <TouchableOpacity
          key={index}
          className="items-center"
          onPress={item.action}
        >
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-1">
            <Text className="text-lg">{item.icon}</Text>
          </View>
          <Text className="text-xs text-gray-600">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

---

## 🎯 User Experience Flow

### Complete Delivery Selection Journey

```
1. User sees Transport mode (default)
   ↓
2. User taps "🛵 Delivery" button
   ↓
3. Button animates to selected state
   ↓
4. Loading state appears
   ↓
5. Map markers change to restaurants
   ↓
6. Search placeholder updates
   ↓
7. Quick access changes to food categories
   ↓
8. AI suggestions appear for restaurants
   ↓
9. Categories filter becomes available
   ↓
10. Delivery mode fully active
```

### Performance Considerations

- **Lazy Loading:** Load restaurant data only when delivery is selected
- **Marker Clustering:** Group nearby restaurants when zoomed out
- **Image Caching:** Cache restaurant images for faster loading
- **Search Debouncing:** Debounce search queries to reduce API calls

---

## 🔧 Technical Implementation Plan

### Phase 1: Core Delivery Mode (3-4 days)

1. **State Management Enhancement**
   - Add delivery-specific state
   - Implement mode switching logic
   - Add restaurant data loading

2. **Map Marker System**
   - Create restaurant markers
   - Implement marker clustering
   - Add delivery zone overlays

3. **UI Component Updates**
   - Update search input
   - Modify quick access buttons
   - Add category filters

### Phase 2: Enhanced Features (3-4 days)

1. **AI-Powered Suggestions**
   - Implement smart suggestions
   - Add context-aware recommendations
   - Create personalized experiences

2. **Search & Filter System**
   - Advanced search functionality
   - Category-based filtering
   - Real-time availability updates

3. **Performance Optimization**
   - Implement caching strategies
   - Add lazy loading
   - Optimize map rendering

---

## 🎨 Visual Design Changes

### Color Scheme Adaptation

#### Transport Mode:

- Primary: Blue (#0286FF)
- Markers: Car icons
- Accent: Transportation focused

#### Delivery Mode:

- Primary: Orange (#FF6B35)
- Markers: Food icons
- Accent: Restaurant focused

### Typography Updates

#### Transport:

```
"Where to go?"
"Find a ride"
"Choose your vehicle"
```

#### Delivery:

```
"Search restaurants"
"Find food nearby"
"Choose your meal"
```

### Animation Transitions

#### Mode Switch Animation:

```
1. Button press feedback
2. Loading spinner (0.5s)
3. Map marker transition (1.0s)
4. Content slide-in (0.8s)
5. Final state stabilization
```

---

## 📱 Mobile-Specific Adaptations

### Small Screens (< 375px)

```
┌───────────────────┐
│   🗺️ MAP (65%)    │
│   🍕🍔🥗          │
│                   │
│ ────────────────── │
│                   │
│   ┌─────────────┐ │ ← Compact categories
│   │ 🍕🍔🥗🥤    │ │
│   └─────────────┘ │
│                   │
│   🔍 Search...    │
│                   │
└───────────────────┘
```

### Large Screens (> 414px)

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (75%)            │
│   🍕🍔🥗🍱 Detailed Markers        │
│                                     │
│ ──────────────────────────────────── │
│                                     │
│   ┌─────────────────────────────┐   │ ← Full categories
│   │ 🍕 Pizza • 🍔 Burgers       │   │
│   │ 🥗 Healthy • 🥤 Drinks      │   │
│   │ 🛒 Groceries • 🍦 Desserts  │   │
│   └─────────────────────────────┘   │
│                                     │
│   🔍 Search restaurants...          │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Success Metrics

### User Engagement

- **Mode Switch Rate:** % of users who try delivery mode
- **Search Conversion:** % of searches that lead to restaurant selection
- **Category Usage:** Which categories are most popular

### Performance Metrics

- **Load Time:** Time to switch modes and load data
- **Map Responsiveness:** Smooth marker transitions
- **Search Speed:** Query response time

### Business Metrics

- **Restaurant Discovery:** Number of restaurants viewed
- **Order Initiation:** % of sessions that lead to cart creation
- **Cross-service Usage:** Users who use both transport and delivery

---

## 🔄 Fallback & Error States

### Network Issues

```
┌─────────────────────────────────────┐
│   ⚠️ Unable to load restaurants   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔄 Retry Loading            │   │
│   └─────────────────────────────┘   │
│                                     │
│   📍 Using cached data            │
│   🍕 5 nearby places available    │
└─────────────────────────────────────┘
```

### No Restaurants Available

```
┌─────────────────────────────────────┐
│   📍 No restaurants nearby         │
│                                     │
│   Try expanding your search area   │
│   or check different categories    │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔍 Search Wider Area        │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Implement Core Delivery Mode** (Priority: High)
   - Add restaurant data loading
   - Create restaurant markers
   - Update search and quick access

2. **Add Category Filtering** (Priority: Medium)
   - Implement horizontal category scroll
   - Add category-based filtering
   - Update map markers by category

3. **AI Suggestions Integration** (Priority: Medium)
   - Implement smart suggestions
   - Add personalized recommendations
   - Context-aware suggestions

4. **Performance Optimization** (Priority: High)
   - Implement marker clustering
   - Add image caching
   - Optimize search debouncing

---

## 📋 Implementation Checklist

### ✅ Completed

- [x] Wireframe design for delivery mode
- [x] Component change specifications
- [x] State management updates
- [x] Performance considerations

### 🔄 In Progress

- [ ] Core delivery mode implementation
- [ ] Restaurant data integration
- [ ] Map marker system
- [ ] Search adaptation

### 📋 Pending

- [ ] Category filtering system
- [ ] AI suggestions engine
- [ ] Performance optimization
- [ ] Testing and validation

---

_Esta documentación proporciona la base completa para implementar el modo Delivery con cambios visuales y funcionales significativos basados en la implementación actual._
