import { ReactNode } from "react";

// Tipos base para módulos
export type ModuleType = "customer" | "business" | "driver";

// Interface para rutas del drawer
export interface DrawerRoute {
  id: string;
  title: string;
  icon?: string | React.ComponentType<any>;
  href?: string; // Para Expo Router
  subroutes?: DrawerRoute[]; // Recursivo para jerarquía
  badge?: string | number; // Notificaciones, conteos
  disabled?: boolean;
  divider?: boolean; // Separador visual
  module?: ModuleType; // Para rutas específicas de módulo

  // Para cambios de módulo
  switchToModule?: ModuleType; // Si esta ruta cambia el módulo
  requiresConfirmation?: boolean; // Si necesita confirmación

  // Para acciones personalizadas
  onPress?: () => void;
  customComponent?: ReactNode;
}

// Interface para configuración del drawer
export interface DrawerConfig {
  header?: {
    title?: string;
    subtitle?: string;
    avatar?: string;
  };
  routes: DrawerRoute[];
  footer?: {
    copyright?: string;
    version?: string;
  };
  theme?: "light" | "dark" | "auto";
  position?: "left" | "right";

  // Configuración específica del módulo
  module: ModuleType;
}

// Props para el componente Drawer
export interface DrawerProps {
  config: DrawerConfig;
  isOpen: boolean;
  activeRoute?: string | null;
  expandedRoutes?: Set<string>;
  currentModule?: ModuleType;
  isTransitioning?: boolean;
  onRoutePress?: (route: DrawerRoute) => void;
  onToggleExpanded?: (routeId: string) => void;
  onClose?: () => void;
  onModuleChange?: (module: ModuleType) => void;

  // Styling
  width?: number;
  position?: "left" | "right";
  className?: string;

  // Animations
  animationType?: "slide" | "fade" | "scale";
  backdropOpacity?: number;
}

// Props para items individuales del drawer
export interface DrawerRouteItemProps {
  route: DrawerRoute;
  isActive?: boolean;
  isExpanded?: boolean;
  level?: number; // Para indentación en rutas anidadas
  onPress?: (route: DrawerRoute) => void;
  onToggleExpanded?: (routeId: string) => void;
  currentModule?: ModuleType;
}

// Props para el header del drawer
export interface DrawerHeaderProps {
  config?: DrawerConfig["header"];
}

// Props para el footer del drawer
export interface DrawerFooterProps {
  config?: DrawerConfig["footer"];
}

// Props para el selector de módulos
export interface ModuleSwitcherProps {
  currentModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  availableModules?: ModuleType[];
  disabled?: boolean;
}

// Tipos para el hook useDrawer
export interface UseDrawerOptions {
  module?: ModuleType; // Opcional - si no se pasa, usa el del store global
  initialOpen?: boolean;
  persistState?: boolean;
  config?: Partial<DrawerConfig>; // Para overrides
}

export interface UseDrawerReturn {
  // Estado
  isOpen: boolean;
  activeRoute: string | null;
  expandedRoutes: Set<string>;
  currentModule: ModuleType;
  isTransitioning: boolean;

  // Acciones
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveRoute: (routeId: string) => void;
  toggleExpanded: (routeId: string) => void;

  // Cambios de módulo
  switchModule: (module: ModuleType) => void;

  // Config
  config: DrawerConfig;
  routes: DrawerRoute[];

  // Handlers
  handleRoutePress: (route: DrawerRoute) => void;
}

// Tipos para el store de módulos
export interface ModuleState {
  currentModule: ModuleType;
  previousModule: ModuleType | null;
  isTransitioning: boolean;

  // Acciones
  setModule: (module: ModuleType) => void;
  switchToCustomer: () => void;
  switchToBusiness: () => void;
  switchToDriver: () => void;
  resetToDefault: () => void;
}

// Tipos para animaciones
export interface DrawerAnimationConfig {
  type: "slide" | "fade" | "scale";
  duration: number;
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
}

// Tipos para gestos
export interface DrawerGestureConfig {
  enabled: boolean;
  swipeThreshold: number;
  velocityThreshold: number;
}
