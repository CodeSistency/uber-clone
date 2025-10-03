/**
 * 🎨 MAP STYLES CONFIGURATION
 *
 * Sistema completo de estilos personalizados para Google Maps
 * Incluye temas dark moderno, light, y configuraciones avanzadas
 */

export interface MapStyleConfig {
  name: string;
  description: string;
  json: any[];
  metadata: {
    version: string;
    author: string;
    theme: "light" | "dark" | "auto";
    features: string[];
  };
}

// ==========================================
// 🎯 ESTILOS PREDEFINIDOS
// ==========================================

/**
 * 🌙 DARK MODERN THEME
 * Tema oscuro moderno inspirado en aplicaciones premium
 * - Fondos oscuros elegantes
 * - Elementos UI minimalistas
 * - Colores neón para acentos (verde/azul)
 * - Alto contraste para legibilidad
 */
export const DARK_MODERN_STYLE: MapStyleConfig = {
  name: "Dark Modern",
  description: "Tema oscuro moderno con elementos neón y alto contraste",
  metadata: {
    version: "1.0.0",
    author: "Uber Clone Team",
    theme: "dark",
    features: [
      "dark_background",
      "neon_accents",
      "minimal_ui",
      "high_contrast",
    ],
  },
  json: [
    // ==========================================
    // 🏞️ FONDO Y GEOGRAFÍA
    // ==========================================

    // Océanos y agua - fondo muy oscuro
    {
      elementType: "geometry",
      stylers: [
        { color: "#1d2c4d" }, // Azul muy oscuro
      ],
    },

    // Terrestre - gris oscuro elegante
    {
      elementType: "geometry.fill",
      stylers: [
        { color: "#2d3748" }, // Gris oscuro
      ],
    },

    // ==========================================
    // 🛣️ CARRETERAS Y TRANSPORTE
    // ==========================================

    // Carreteras principales - gris claro con borde neón
    {
      elementType: "road",
      stylers: [
        { color: "#4a5568" }, // Gris medio
      ],
    },

    // Carreteras principales (relleno)
    {
      elementType: "road",
      featureType: "road",
      stylers: [{ color: "#4a5568" }],
    },

    // Carreteras principales (borde)
    {
      elementType: "road.arterial",
      stylers: [
        { color: "#00ff88" }, // Verde neón para bordes
        { weight: 1.5 },
      ],
    },

    // Carreteras secundarias
    {
      elementType: "road.highway",
      stylers: [{ color: "#2d3748" }],
    },

    // Carreteras locales
    {
      elementType: "road.local",
      stylers: [{ color: "#4a5568" }],
    },

    // ==========================================
    // 🏢 EDIFICIOS Y ESTRUCTURAS
    // ==========================================

    // Edificios - gris medio con acentos
    {
      elementType: "poi.park",
      stylers: [
        { color: "#1a202c" }, // Casi negro para parques
      ],
    },

    // Puntos de interés (POI) - muy sutiles
    {
      elementType: "poi",
      stylers: [{ visibility: "simplified" }, { color: "#4a5568" }],
    },

    // Texto de POI - blanco tenue
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        { color: "#e2e8f0" }, // Blanco grisáceo
      ],
    },

    // ==========================================
    // 🌳 VEGETACIÓN Y ÁREAS VERDES
    // ==========================================

    // Parques - verde oscuro elegante
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#1a202c" }],
    },

    // ==========================================
    // 📝 TEXTO Y ETIQUETAS
    // ==========================================

    // Texto de carreteras - blanco brillante
    {
      elementType: "labels.text.fill",
      stylers: [
        { color: "#f7fafc" }, // Blanco casi puro
      ],
    },

    // Texto de carreteras (stroke/borde)
    {
      elementType: "labels.text.stroke",
      stylers: [
        { color: "#1a202c" }, // Negro para contraste
        { weight: 2 },
      ],
    },

    // ==========================================
    // 🎨 ELEMENTOS ADMINISTRATIVOS
    // ==========================================

    // Fronteras administrativas - muy sutiles
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#4a5568" }, { visibility: "simplified" }],
    },

    // ==========================================
    // 🌆 ELEMENTOS URBANOS
    // ==========================================

    // Paisaje urbano - gris oscuro
    {
      featureType: "landscape",
      stylers: [{ color: "#2d3748" }],
    },

    // ==========================================
    // 🚫 ELEMENTOS OCULTOS
    // ==========================================

    // Ocultar puntos de interés excesivos
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },

    // Ocultar tránsito público (demasiado ruido visual)
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }],
    },
  ],
};

/**
 * ☀️ LIGHT THEME
 * Tema claro profesional para uso diurno
 */
export const LIGHT_THEME: MapStyleConfig = {
  name: "Light Professional",
  description: "Tema claro profesional con colores suaves",
  metadata: {
    version: "1.0.0",
    author: "Uber Clone Team",
    theme: "light",
    features: ["light_background", "professional_colors", "clean_design"],
  },
  json: [
    // Tema claro básico - usar estilos por defecto con ajustes mínimos
    {
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
  ],
};

/**
 * 🤖 AUTO THEME
 * Tema automático basado en la hora del día
 */
export const AUTO_THEME: MapStyleConfig = {
  name: "Auto Theme",
  description: "Cambia automáticamente entre dark/light según la hora",
  metadata: {
    version: "1.0.0",
    author: "Uber Clone Team",
    theme: "auto",
    features: ["time_based", "adaptive", "smooth_transitions"],
  },
  json: [], // Se determina dinámicamente
};

// ==========================================
// 🎛️ SISTEMA DE CONFIGURACIÓN
// ==========================================

/**
 * Configuración avanzada del mapa
 */
export interface MapConfiguration {
  // 🎨 Tema y estilo
  theme: "dark" | "light" | "auto";
  customStyle?: MapStyleConfig;
  mapId?: string;

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
  routeSimplification: number; // 0-1, cuánto simplificar rutas

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

/**
 * Configuración por defecto
 */
export const DEFAULT_MAP_CONFIG: MapConfiguration = {
  theme: "dark",
  customStyle: DARK_MODERN_STYLE, // Aplicar estilo oscuro por defecto
  mapId: "635af706323c50787e71b42c",
  mapType: "standard", // Valor por defecto, pero no se aplicará cuando hay customStyle
  userInterfaceStyle: "dark",

  showsUserLocation: true,
  showsPointsOfInterest: false,
  showsBuildings: true,
  showsTraffic: false,
  showsCompass: true,
  showsScale: false,
  showsMyLocationButton: false,

  zoomEnabled: true,
  scrollEnabled: true,
  rotateEnabled: true,
  pitchEnabled: true,

  markerClustering: false,
  routeSimplification: 0.8,

  maxZoomLevel: 20,
  minZoomLevel: 5,
  cacheEnabled: true,

  tintColor: "#00FF88",
  accentColor: "#FFE014",
  routeColor: "#4285F4",
  trailColor: "#FFE014",
  predictionColor: "#00FF88",
};

// ==========================================
// 🔧 UTILIDADES DE GESTIÓN DE ESTILOS
// ==========================================

/**
 * Obtiene el estilo apropiado basado en la configuración
 */
export function getMapStyle(config: MapConfiguration): any[] {
  if (config.customStyle) {
    return config.customStyle.json;
  }

  let result: any[];
  switch (config.theme) {
    case "dark":
      result = DARK_MODERN_STYLE.json;
      break;
    case "light":
      result = LIGHT_THEME.json;
      break;
    case "auto":
      const hour = new Date().getHours();
      const isNight = hour >= 20 || hour <= 6; // 8 PM - 6 AM
      result = isNight ? DARK_MODERN_STYLE.json : LIGHT_THEME.json;
      break;
    default:
      result = DARK_MODERN_STYLE.json;
  }

  return result;
}

/**
 * Determina si el tema actual es oscuro
 */
export function isDarkTheme(config: MapConfiguration): boolean {
  switch (config.theme) {
    case "dark":
      return true;
    case "light":
      return false;
    case "auto":
      const hour = new Date().getHours();
      return hour >= 20 || hour <= 6;
    default:
      return true;
  }
}

/**
 * Valida una configuración de mapa
 */
export function validateMapConfig(
  config: Partial<MapConfiguration>,
): MapConfiguration {
  // Forzar tema oscuro si no se especifica explícitamente
  if (!config.theme) {
    config.theme = "dark";
  }
  if (!config.customStyle && config.theme === "dark" && !config.mapId) {
    config.customStyle = DARK_MODERN_STYLE;
  }
  if (!config.userInterfaceStyle) {
    config.userInterfaceStyle = "dark";
  }

  const validated = { ...DEFAULT_MAP_CONFIG, ...config };

  // Validaciones específicas
  if (validated.maxZoomLevel < validated.minZoomLevel) {
    validated.maxZoomLevel = DEFAULT_MAP_CONFIG.maxZoomLevel;
    validated.minZoomLevel = DEFAULT_MAP_CONFIG.minZoomLevel;
  }

  if (validated.routeSimplification < 0 || validated.routeSimplification > 1) {
    validated.routeSimplification = Math.max(
      0,
      Math.min(1, validated.routeSimplification),
    );
  }

  return validated;
}

// ==========================================
// 🎨 PALETA DE COLORES PARA MAPAS
// ==========================================

export const MAP_COLORS = {
  // Tema Dark Modern
  dark: {
    background: "#1d2c4d",
    land: "#2d3748",
    roads: "#4a5568",
    water: "#1d2c4d",
    parks: "#1a202c",
    buildings: "#2d3748",
    text: "#f7fafc",
    textStroke: "#1a202c",
    accent: "#00FF88",
    warning: "#FFE014",
    danger: "#FF4444",
  },

  // Tema Light
  light: {
    background: "#f5f5f5",
    land: "#ffffff",
    roads: "#e0e0e0",
    water: "#b8d4f0",
    parks: "#c8e6c9",
    buildings: "#f0f0f0",
    text: "#616161",
    textStroke: "#ffffff",
    accent: "#4285F4",
    warning: "#FF9800",
    danger: "#F44336",
  },

  // Neones y acentos
  neon: {
    green: "#00FF88",
    yellow: "#FFE014",
    blue: "#00D4FF",
    purple: "#A855F7",
    pink: "#FF0080",
  },

  // Estados
  states: {
    active: "#00FF88",
    inactive: "#4a5568",
    selected: "#FFE014",
    error: "#FF4444",
    success: "#00FF88",
    warning: "#FF9800",
  },
} as const;

// ==========================================
// 📚 DOCUMENTACIÓN DE PROPIEDADES
// ==========================================

/**
 * PROPIEDADES DE GOOGLE MAPS STYLES
 *
 * Estructura: featureType -> elementType -> stylers[]
 *
 * featureType: Tipo de elemento geográfico
 * - administrative: Fronteras administrativas
 * - landscape: Paisaje (montañas, desiertos, etc.)
 * - poi: Puntos de interés
 * - road: Carreteras
 * - transit: Transporte público
 * - water: Agua
 *
 * elementType: Parte específica del elemento
 * - geometry: Forma del elemento
 * - geometry.fill: Relleno de la geometría
 * - geometry.stroke: Borde de la geometría
 * - labels: Texto/etiquetas
 * - labels.text: Texto de las etiquetas
 * - labels.text.fill: Color del texto
 * - labels.text.stroke: Color del borde del texto
 *
 * stylers: Array de modificadores visuales
 * - color: Cambia el color (hex, rgb, hsl)
 * - visibility: 'on', 'off', 'simplified'
 * - weight: Grosor de líneas (número)
 * - lightness: Ajuste de brillo (-100 a 100)
 * - saturation: Ajuste de saturación (-100 a 100)
 * - gamma: Ajuste gamma (0.01 a 10.0)
 */

// Exportar estilos disponibles
export const MAP_STYLES = {
  DARK_MODERN: DARK_MODERN_STYLE,
  LIGHT: LIGHT_THEME,
  AUTO: AUTO_THEME,
} as const;

export type MapStyleName = keyof typeof MAP_STYLES;
