# 🎨 **Guía Completa: Customización de Mapas Google**

## 📋 **Resumen Ejecutivo**

Esta guía explica cómo personalizar completamente la apariencia de los mapas de Google Maps en React Native. Cubre estilos JSON, propiedades del componente MapView, y técnicas avanzadas de personalización.

---

## 🏗️ **Arquitectura del Sistema de Estilos**

### **Componentes Principales**

```
🎨 MAP CUSTOMIZATION SYSTEM
├── 📄 constants/mapStyles.ts      # Estilos predefinidos
├── 🗺️ components/Map.tsx          # Componente principal
├── 🎛️ MapView (react-native-maps) # SDK base
└── ⚙️ Configuración dinámica       # Runtime customization
```

### **Jerarquía de Estilos**

1. **Google Maps Defaults** - Estilos base de Google
2. **JSON Custom Styles** - Array de reglas de estilo
3. **MapView Props** - Propiedades del componente
4. **Runtime Overrides** - Cambios dinámicos

---

## 🎨 **PROPIEDADES DE ESTILOS JSON DE GOOGLE MAPS**

### **Estructura Básica**

Cada estilo es un array de objetos con esta estructura:

```typescript
{
  "featureType": "road",           // Tipo de elemento
  "elementType": "geometry",       // Parte del elemento
  "stylers": [                     // Array de modificadores
    { "color": "#FF0000" },        // Cambiar color
    { "visibility": "simplified" } // Cambiar visibilidad
  ]
}
```

### **🔍 Feature Types (Tipos de Elementos)**

```typescript
// 🏞️ GEOGRAFÍA Y TERRENO
"administrative"; // Fronteras administrativas (países, estados)
"landscape"; // Paisaje (montañas, desiertos, tierra)
"poi"; // Puntos de interés (edificios, monumentos)
"road"; // Todas las carreteras
"transit"; // Transporte público (estaciones, líneas)
"water"; // Agua (océanos, ríos, lagos)

// 🏗️ ELEMENTOS URBANOS
"administrative.land_parcel"; // Parcelas de tierra
"landscape.man_made"; // Elementos construidos por humanos
"poi.attraction"; // Atracciones turísticas
"poi.business"; // Negocios
"poi.government"; // Edificios gubernamentales
"poi.medical"; // Hospitales, clínicas
"poi.park"; // Parques
"poi.place_of_worship"; // Iglesias, templos
"poi.school"; // Escuelas
"poi.sports_complex"; // Estadios, gimnasios

// 🛣️ SISTEMA VIAL
"road.arterial"; // Carreteras principales
"road.highway"; // Autopistas
"road.local"; // Calles locales
"road.rail"; // Vías de tren

// 🚇 TRANSPORTE
"transit.line"; // Líneas de metro/autobús
"transit.station"; // Estaciones
"transit.station.airport"; // Aeropuertos
"transit.station.bus"; // Paradas de autobús
```

### **🎯 Element Types (Tipos de Elementos)**

```typescript
"geometry"; // Forma completa del elemento
"geometry.fill"; // Solo el relleno
"geometry.stroke"; // Solo el borde/contorno

"labels"; // Todas las etiquetas
"labels.text"; // Texto de las etiquetas
"labels.text.fill"; // Color del texto
"labels.text.stroke"; // Color del borde del texto
"labels.icon"; // Íconos de las etiquetas
```

### **🎨 Stylers (Modificadores Visuales)**

```typescript
// 🎨 COLORES
{ "color": "#FF0000" }           // Color sólido (hex, rgb, hsl)
{ "hue": "#FF0000" }             // Cambiar matiz
{ "saturation": -100 }           // Saturación (-100 a 100)
{ "lightness": -50 }             // Brillo (-100 a 100)
{ "gamma": 0.5 }                 // Gamma (0.01 a 10.0)

// 👁️ VISIBILIDAD
{ "visibility": "on" }           // Mostrar elemento
{ "visibility": "off" }          // Ocultar elemento
{ "visibility": "simplified" }   // Simplificar (menos detalle)

// 📏 DIMENSIONES
{ "weight": 2.5 }                // Grosor de líneas (número)

// 🏷️ ETIQUETAS
{ "invert_lightness": true }     // Invertir brillo
```

---

## 🗺️ **PROPIEDADES DEL COMPONENTE MAPVIEW**

### **🎨 Estilos y Apariencia**

```typescript
<MapView
  // 🎨 Estilos personalizados JSON
  customMapStyle={customStyleArray}  // Array de estilos JSON

  // 🎭 Tipo de mapa
  mapType="standard"           // "standard" | "satellite" | "hybrid" | "terrain" | "mutedStandard"
  userInterfaceStyle="dark"    // "light" | "dark" (iOS only)

  // 🎨 Color del tinte
  tintColor="#00FF88"          // Color para controles y elementos UI
/>
```

### **👁️ Elementos Visibles**

```typescript
<MapView
  // 👤 Usuario y ubicación
  showsUserLocation={true}           // Mostrar ubicación del usuario
  showsMyLocationButton={false}      // Botón "Mi ubicación"

  // 🗺️ Elementos del mapa
  showsPointsOfInterest={false}      // POI (edificios, monumentos)
  showsBuildings={true}              // Edificios 3D
  showsTraffic={false}               // Tráfico en tiempo real
  showsCompass={true}                // Brújula
  showsScale={false}                 // Escala de distancia
  showsIndoorLevelPicker={false}     // Selector de niveles (edificios)
  showsIndoors={false}               // Mapas interiores
/>
```

### **🎮 Controles de Interacción**

```typescript
<MapView
  // ✋ Gestos de pan y zoom
  zoomEnabled={true}            // Permitir zoom con gestos
  scrollEnabled={true}          // Permitir desplazamiento
  rotateEnabled={true}          // Permitir rotación
  pitchEnabled={true}           // Permitir inclinación 3D

  // 📏 Límites de zoom
  minZoomLevel={5}              // Zoom mínimo (0-20)
  maxZoomLevel={20}             // Zoom máximo (0-20)

  // 🎯 Región inicial
  initialRegion={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
/>
```

---

## 🎨 **EJEMPLOS DE ESTILOS AVANZADOS**

### **🌙 Dark Modern Theme (Tema Oscuro Moderno)**

```typescript
const DARK_MODERN_STYLE = [
  // Fondo oscuro elegante
  {
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }], // Azul muy oscuro
  },

  // Carreteras con acentos neón
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#00ff88" }], // Verde neón
  },

  // Texto blanco para alto contraste
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#f7fafc" }], // Blanco casi puro
  },

  // Ocultar elementos distractores
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
];
```

### **☀️ Light Professional Theme (Tema Claro Profesional)**

```typescript
const LIGHT_PROFESSIONAL_STYLE = [
  // Colores suaves y profesionales
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },

  // Texto gris para legibilidad
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
];
```

### **🤖 Auto Theme (Tema Automático)**

```typescript
const getAutoTheme = () => {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour <= 6; // 8 PM - 6 AM
  return isNight ? DARK_MODERN_STYLE : LIGHT_PROFESSIONAL_STYLE;
};
```

---

## ⚙️ **CONFIGURACIÓN AVANZADA**

### **Sistema de Configuración Completo**

```typescript
interface MapConfiguration {
  // 🎨 Tema y estilo
  theme: "dark" | "light" | "auto";
  customStyle?: MapStyleConfig;

  // 🗺️ Comportamiento del mapa
  mapType: "standard" | "satellite" | "hybrid" | "terrain" | "mutedStandard";
  userInterfaceStyle: "light" | "dark";

  // 👁️ Elementos visibles
  showsUserLocation: boolean;
  showsPointsOfInterest: boolean;
  showsBuildings: boolean;
  showsTraffic: boolean;
  showsCompass: boolean;
  showsScale: boolean;
  showsMyLocationButton: boolean;

  // 🎯 Controles de zoom y pan
  zoomEnabled: boolean;
  scrollEnabled: boolean;
  rotateEnabled: boolean;
  pitchEnabled: boolean;

  // 📍 Marcadores y overlays
  markerClustering: boolean;
  routeSimplification: number; // 0-1

  // ⚡ Performance
  maxZoomLevel: number;
  minZoomLevel: number;
  cacheEnabled: boolean;

  // 🎨 Personalización visual
  tintColor: string;
  accentColor: string;
  routeColor: string;
  trailColor: string;
  predictionColor: string;
}
```

### **Configuración Recomendada por Caso de Uso**

#### **🚗 App de Transporte (Uber-like)**

```typescript
const TRANSPORT_CONFIG: MapConfiguration = {
  theme: "dark",
  showsPointsOfInterest: false, // Menos distracciones
  showsTraffic: true, // Importante para navegación
  showsCompass: true, // Navegación orientada
  routeColor: "#4285F4", // Azul Google para rutas
  trailColor: "#FFE014", // Amarillo neón para trails
  predictionColor: "#00FF88", // Verde neón para predicciones
};
```

#### **🏪 App de Delivery/Comida**

```typescript
const DELIVERY_CONFIG: MapConfiguration = {
  theme: "light",
  showsPointsOfInterest: true, // Mostrar restaurantes
  showsTraffic: false, // Menos crítico
  showsBuildings: true, // Ayuda a identificar locales
  markerClustering: true, // Muchos marcadores
};
```

#### **🚶 App de Turismo**

```typescript
const TOURISM_CONFIG: MapConfiguration = {
  theme: "auto",
  showsPointsOfInterest: true, // Atracciones importantes
  showsBuildings: true, // Arquitectura
  showsTraffic: false,
  mapType: "terrain", // Mejor para exteriores
};
```

---

## 🔧 **IMPLEMENTACIÓN EN EL CÓDIGO**

### **Uso Básico**

```tsx
import { DARK_MODERN_STYLE } from "@/constants/mapStyles";

<MapView
  customMapStyle={DARK_MODERN_STYLE.json}
  mapType="standard"
  userInterfaceStyle="dark"
  showsPointsOfInterest={false}
  tintColor="#00FF88"
>
  {/* Markers, Polylines, etc. */}
</MapView>;
```

### **Configuración Dinámica**

```tsx
const [mapConfig, setMapConfig] = useState<MapConfiguration>({
  theme: "dark",
  // ... otras propiedades
});

// Cambiar tema dinámicamente
const switchToLightTheme = () => {
  setMapConfig((prev) => ({
    ...prev,
    theme: "light",
    customStyle: LIGHT_THEME,
  }));
};
```

### **Responsive Design**

```tsx
const getResponsiveConfig = (): MapConfiguration => {
  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 375;

  return {
    theme: "dark",
    showsCompass: !isSmallScreen, // Ocultar en pantallas pequeñas
    showsScale: !isSmallScreen,
    maxZoomLevel: isSmallScreen ? 16 : 20,
  };
};
```

---

## 🎨 **PALETA DE COLORES RECOMENDADA**

### **Tema Dark Modern**

```typescript
const DARK_COLORS = {
  background: "#1d2c4d", // Azul muy oscuro
  land: "#2d3748", // Gris oscuro
  roads: "#4a5568", // Gris medio
  water: "#1d2c4d", // Azul oscuro
  parks: "#1a202c", // Casi negro
  text: "#f7fafc", // Blanco
  textStroke: "#1a202c", // Negro para borde
  accent: "#00FF88", // Verde neón
  warning: "#FFE014", // Amarillo neón
  danger: "#FF4444", // Rojo neón
};
```

### **Neones y Acentos**

```typescript
const NEON_COLORS = {
  green: "#00FF88", // Verde brillante
  yellow: "#FFE014", // Amarillo dorado
  blue: "#00D4FF", // Azul cian
  purple: "#A855F7", // Morado
  pink: "#FF0080", // Rosa neón
};
```

---

## 🚀 **OPTIMIZACIONES DE PERFORMANCE**

### **Cache de Estilos**

```typescript
// Evitar recálculos innecesarios
const mapStyle = useMemo(() => {
  return getMapStyle(validatedConfig);
}, [validatedConfig.theme, validatedConfig.customStyle]);
```

### **Lazy Loading de Estilos Complejos**

```typescript
const [styleLoaded, setStyleLoaded] = useState(false);

useEffect(() => {
  // Cargar estilos pesados de forma asíncrona
  const loadStyle = async () => {
    const style = await loadComplexMapStyle();
    setMapStyle(style);
    setStyleLoaded(true);
  };

  loadStyle();
}, []);
```

### **Conditional Rendering**

```typescript
// Solo renderizar elementos pesados cuando sea necesario
{showTraffic && <TrafficOverlay />}
{showBuildings && mapConfig.showsBuildings && <BuildingsLayer />}
```

---

## 🐛 **TROUBLESHOOTING**

### **Estilos no se aplican**

```typescript
// ✅ Verificar orden correcto
<MapView
  customMapStyle={styleArray}  // Debe ser array
  mapType="standard"           // Después del customMapStyle
/>

// ❌ Orden incorrecto
<MapView
  mapType="satellite"          // Esto sobrescribe customMapStyle
  customMapStyle={styleArray}
/>
```

### **Colores no se ven como esperado**

```typescript
// ✅ Usar colores válidos
{ "color": "#FF0000" }         // ✅ Hex válido
{ "color": "red" }             // ❌ Nombre de color no soportado

// ✅ Rangos válidos para stylers
{ "saturation": 50 }           // ✅ -100 a 100
{ "lightness": -25 }           // ✅ -100 a 100
{ "gamma": 1.5 }               // ✅ 0.01 a 10.0
```

### **Performance Issues**

```typescript
// ✅ Optimizaciones
<MapView
  customMapStyle={useMemo(() => getStyle(), [theme])} // Memoizar
  showsPointsOfInterest={false}    // Menos elementos = mejor perf
  maxZoomLevel={18}               // Limitar zoom máximo
/>
```

---

## 📚 **RECURSOS ADICIONALES**

### **Herramientas de Diseño**

- **Google Maps Styling Wizard**: https://mapstyle.withgoogle.com/
- **Snazzy Maps**: https://snazzymaps.com/
- **Mapbox Studio**: Para inspiración de estilos

### **Documentación Oficial**

- **React Native Maps**: https://github.com/react-native-maps/react-native-maps
- **Google Maps Platform**: https://developers.google.com/maps

### **Ejemplos Avanzados**

- **Uber-like Dark Theme**: Inspirado en apps de transporte
- **Tourism Bright Theme**: Para apps de turismo
- **Minimalist Theme**: Para dashboards administrativos

---

**¡Experimenta con diferentes combinaciones de colores y estilos para crear la experiencia visual perfecta para tu aplicación!** 🎨✨
