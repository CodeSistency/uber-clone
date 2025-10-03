# 🔄 Delivery Mode Transition - Paso a Paso

## Basado en la Implementación Actual

Voy a mostrar exactamente qué cambia cuando el usuario selecciona Delivery, usando la estructura actual de `home.tsx`.

---

## 📱 Estado Inicial (Transport Mode)

### Código Actual en home.tsx (líneas 230-270):

```typescript
{/* Selector de tipo de servicio (Transport/Delivery) */}
<View className="flex-row bg-neutral-100 rounded-full p-1 mb-2">
  <TouchableOpacity onPress={() => setServiceType("transport")}>
    🚗 Transport  {/* ACTIVO */}
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setServiceType("delivery")}>
    🛵 Delivery  {/* INACTIVO */}
  </TouchableOpacity>
</View>

{/* Input de destino */}
<GoogleTextInput
  icon={icons.search}
  containerStyle="bg-neutral-100 border-0"
  handlePress={handleDestinationPress}
/>

{/* Accesos rápidos */}
🏠 Home    💼 Work    🛒 Mall
```

### Vista Actual:

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │
│   📍 Your Location                  │
│   🚗🚗🚗 Driver Markers             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵 Delivery     │   │ ← Transport activo
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔍 Where to go?             │   │ ← Input genérico
│   │ [📍 Current Location]       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🏠 Home        💼 Work       │   │ ← Lugares de destino
│   │ 🛒 Mall                      │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Transición: Usuario selecciona Delivery

### Paso 1: Cambio de estado (inmediato)

```typescript
// En home.tsx, cuando se hace tap en Delivery:
setServiceType("delivery"); // Cambia de "transport" a "delivery"
```

### Vista durante transición:

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │
│   📍 Your Location                  │
│   🚗🚗🚗 Driver Markers             │ ← Aún muestra drivers
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵[Delivery]    │   │ ← Delivery seleccionado
│   │     [██████████████]         │   │    Barra de progreso
│   └─────────────────────────────┘   │
│                                     │
│   🔄 Switching to Delivery Mode... │ ← Loading temporal
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Estado Final: Delivery Mode Activo

### Cambios Específicos en el Código:

```typescript
// 1. Selector actualizado
<View className="flex-row bg-neutral-100 rounded-full p-1 mb-2">
  <TouchableOpacity onPress={() => setServiceType("transport")}>
    🚗 Transport  {/* INACTIVO */}
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setServiceType("delivery")}>
    🛵 Delivery  {/* ACTIVO - bg-primary, text-white */}
  </TouchableOpacity>
</View>

// 2. Input adaptado para delivery
<GoogleTextInput
  icon={icons.search} // Podría cambiar a icons.restaurant
  containerStyle="bg-neutral-100 border-0"
  handlePress={handleDestinationPress}
/>

// 3. Accesos rápidos para comida
// Cambian de lugares de destino a categorías de comida
🍕 Pizza    🍔 Burgers    🥗 Healthy
```

### Vista Final con Delivery:

```
┌─────────────────────────────────────┐
│        🗺️ MAP VIEW (100%)           │
│   📍 Your Location                  │
│   🍕🍔🥗 Restaurant Markers        │ ← Marcadores cambian
│   🟢 Delivery Zones                │ ← Nuevos overlays
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🚗 Transport  🛵[Delivery]    │   │ ← Delivery activo
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔍 Search restaurants       │   │ ← Placeholder cambia
│   │ [📍 Current Location]       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │ ← Accesos cambian
│   │ 🍕 Pizza       🍔 Burgers    │   │
│   │ 🥗 Healthy                   │   │
│   └─────────────────────────────┘   │
│                                     │
│   🤖 "Craving pizza? Mario's      │ ← Sugerencias inteligentes
│       is 2 min away"              │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Cambios Específicos por Componente

### 1. **Map Markers** - Cambian completamente

#### Transport:

```typescript
// Marcadores actuales (drivers)
<MapView.Marker
  coordinate={driver.location}
  title={driver.name}
  description={`${driver.vehicle} • ${driver.rating}★`}
/>
```

#### Delivery - NUEVO:

```typescript
// Marcadores de restaurantes
<MapView.Marker
  coordinate={restaurant.location}
  title={restaurant.name}
  description={`${restaurant.category} • ${restaurant.rating}★ • ${restaurant.deliveryTime}`}
/>
```

### 2. **Search Input** - Adaptado al contexto

#### Transport:

```typescript
<GoogleTextInput
  placeholder="Where to go?"
  handlePress={(location) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  }}
/>
```

#### Delivery - MODIFICADO:

```typescript
<GoogleTextInput
  placeholder="Search restaurants, cuisines..."
  handlePress={(location) => {
    setDestinationLocation(location);
    router.push("/(marketplace)"); // Navega a marketplace
  }}
/>
```

### 3. **Quick Access Buttons** - Cambian completamente

#### Transport (lugares):

```typescript
const quickAccessTransport = [
  { icon: "🏠", label: "Home", action: () => navigateToHome() },
  { icon: "💼", label: "Work", action: () => navigateToWork() },
  { icon: "🛒", label: "Mall", action: () => navigateToMall() },
];
```

#### Delivery (categorías de comida) - NUEVO:

```typescript
const quickAccessDelivery = [
  { icon: "🍕", label: "Pizza", action: () => filterByCategory("pizza") },
  { icon: "🍔", label: "Burgers", action: () => filterByCategory("burgers") },
  { icon: "🥗", label: "Healthy", action: () => filterByCategory("healthy") },
];
```

### 4. **AI Suggestions** - Completamente nuevas

#### Transport:

```typescript
const transportSuggestions = [
  "Need a ride home?",
  "Headed to work?",
  "Going to the mall?",
];
```

#### Delivery - NUEVO:

```typescript
const deliverySuggestions = [
  "Craving pizza? Mario's is 2 min away",
  "Healthy lunch: Green Cafe - 15 min",
  "Quick bite: Burger Express - 10 min",
];
```

---

## 🔧 Implementación Técnica

### Estado Management - Actualización

```typescript
// En useState del home.tsx
const [serviceType, setServiceType] = useState<"transport" | "delivery">(
  "transport",
);

// Nuevo estado para delivery
const [deliveryData, setDeliveryData] = useState({
  nearbyRestaurants: [],
  categories: ["pizza", "burgers", "healthy"],
  suggestions: [],
});

// useEffect para cargar datos cuando cambia el modo
useEffect(() => {
  if (serviceType === "delivery") {
    loadNearbyRestaurants();
    updateMapMarkers("restaurants");
  } else {
    loadNearbyDrivers();
    updateMapMarkers("drivers");
  }
}, [serviceType]);
```

### Funciones Nuevas Necesarias

```typescript
// Nueva función para cargar restaurantes cercanos
const loadNearbyRestaurants = async () => {
  try {
    const restaurants = await fetchAPI("restaurants/nearby", {
      method: "GET",
      params: { lat: userLatitude, lng: userLongitude, radius: 5 },
    });
    setDeliveryData((prev) => ({ ...prev, nearbyRestaurants: restaurants }));
  } catch (error) {
    console.error("Error loading restaurants:", error);
  }
};

// Nueva función para filtrar por categoría
const filterByCategory = (category: string) => {
  const filteredRestaurants = deliveryData.nearbyRestaurants.filter(
    (restaurant) =>
      restaurant.category.toLowerCase() === category.toLowerCase(),
  );
  // Actualizar mapa con restaurantes filtrados
  updateMapMarkers(filteredRestaurants);
};
```

---

## 🎨 Cambios Visuales Específicos

### 1. **Colores y Tema**

#### Transport (actual):

- Tema: Azul (#0286FF)
- Marcadores: Iconos de carros
- Énfasis: Movilidad

#### Delivery (nuevo):

- Tema: Naranja/Amarillo (#FF6B35)
- Marcadores: Iconos de comida
- Énfasis: Gastronomía

### 2. **Iconos y Assets**

#### Nuevos iconos necesarios:

```typescript
// En constants/icons.ts - agregar
restaurant: require('@/assets/icons/restaurant.png'),
pizza: require('@/assets/icons/pizza.png'),
burger: require('@/assets/icons/burger.png'),
healthy: require('@/assets/icons/healthy.png'),
```

### 3. **Animaciones de Transición**

```typescript
// Animación de cambio de marcadores
const markerTransition = {
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.8 },
  config: { duration: 300 },
};

// Nueva animación para delivery
const deliveryModeAnimation = {
  markerEnter: { opacity: 0, scale: 0.5 },
  markerVisible: { opacity: 1, scale: 1 },
  config: { duration: 500, easing: Easing.elastic(1) },
};
```

---

## 📊 Comparación Antes vs Después

| Elemento        | Transport (Actual) | Delivery (Nuevo)       |
| --------------- | ------------------ | ---------------------- |
| **Marcadores**  | 🚗 Conductores     | 🍕 Restaurantes        |
| **Input**       | "Where to go?"     | "Search restaurants"   |
| **Accesos**     | 🏠💼🛒 Lugares     | 🍕🍔🥗 Categorías      |
| **Sugerencias** | Rutas de viaje     | Recomendaciones comida |
| **Tema**        | Azul (movilidad)   | Naranja (gastronomía)  |
| **Destino**     | find-ride          | marketplace            |

---

## 🚀 Plan de Implementación

### Semana 1: Cambios Core

1. ✅ Actualizar selector de servicio (ya funciona)
2. ✅ Modificar `handleDestinationPress` para delivery (ya implementado)
3. 🔄 Crear sistema de marcadores dinámicos
4. 🔄 Implementar carga de restaurantes cercanos
5. 🔄 Actualizar accesos rápidos

### Semana 2: Mejoras UX

1. 🔄 Agregar animaciones de transición
2. 🔄 Implementar AI suggestions
3. 🔄 Crear categorías de comida
4. 🔄 Optimizar performance
5. 🔄 Testing completo

---

## 🎯 Resultado Final

Después de seleccionar Delivery, la pantalla se transforma completamente:

### ✅ Lo que cambia:

- **Marcadores del mapa** → De conductores a restaurantes
- **Placeholder del input** → De "Where to go?" a "Search restaurants"
- **Accesos rápidos** → De lugares a categorías de comida
- **Sugerencias** → De rutas a recomendaciones de comida
- **Navegación** → De find-ride a marketplace
- **Tema visual** → De azul a naranja/gastronomía

### ✅ Lo que se mantiene:

- **Estructura general** de la pantalla
- **Componentes base** (GoogleTextInput, etc.)
- **Navegación bottom** tabs
- **Ubicación del usuario**
- **Overlay de tráfico** (opcional)

Esta transición proporciona una experiencia completamente diferente pero familiar, adaptada específicamente para delivery de comida.

---

_Los wireframes muestran exactamente cómo se vería la transición usando los componentes actuales de home.tsx con modificaciones mínimas pero efectivas._
