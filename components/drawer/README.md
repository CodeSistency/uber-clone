# Drawer Component

Un componente reutilizable y type-safe para drawers de navegación con soporte completo para módulos dinámicos.

## Características

- ✅ **Type-safe**: Completamente tipado con TypeScript
- ✅ **Módulos dinámicos**: Soporte para Customer, Business y Driver
- ✅ **Rutas jerárquicas**: Soporte para rutas anidadas con expansión
- ✅ **Estado persistente**: Guarda configuración y estado del usuario
- ✅ **Transiciones fluidas**: Animaciones suaves entre módulos
- ✅ **Integración Expo Router**: Navegación automática y detección de ruta activa
- ✅ **Gestos**: Swipe para abrir/cerrar
- ✅ **Accesibilidad**: Soporte completo para lectores de pantalla
- ✅ **Layout animado reutilizable**: Efecto de escala estilo super-app listo para múltiples pantallas

## Instalación

El componente ya está integrado en el proyecto. Solo necesitas importarlo:

```typescript
import { useDrawer, Drawer } from "@/components/drawer";
```

## Uso Básico

### 1. Uso con módulo automático (recomendado)

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useDrawer, Drawer } from '@/components/drawer';

const MyScreen: React.FC = () => {
  const drawer = useDrawer(); // Detecta automáticamente el módulo actual

  return (
    <View className="flex-1">
      {/* Contenido principal */}
      <View className="flex-1">
        <TouchableOpacity onPress={drawer.toggle}>
          <Text>Toggle Drawer</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer */}
      <Drawer
        config={drawer.config}
        isOpen={drawer.isOpen}
        activeRoute={drawer.activeRoute}
        expandedRoutes={drawer.expandedRoutes}
        currentModule={drawer.currentModule}
        isTransitioning={drawer.isTransitioning}
        onRoutePress={drawer.handleRoutePress}
        onToggleExpanded={drawer.toggleExpanded}
        onClose={drawer.close}
        onModuleChange={drawer.switchModule}
      />
    </View>
  );
};
```

### 2. Uso con módulo específico

```typescript
const CustomerScreen: React.FC = () => {
  const drawer = useDrawer({ module: "customer" });

  // ... resto del código igual
};
```

### 3. Uso con configuración personalizada

### 4. Layout animado reutilizable (escala + drawer expuesto)

Si necesitas replicar el patrón "super app" donde el contenido principal se escala y desplaza para dejar expuesto el menú, usa el nuevo `AnimatedDrawerLayout`.

```tsx
import { Dimensions } from "react-native";
import { AnimatedDrawerLayout } from "@/components/drawer";

const Screen = () => {
  const screenWidth = Dimensions.get("window").width;
  const drawerWidth = screenWidth * 0.5;

  return (
    <AnimatedDrawerLayout
      width={drawerWidth}
      screenWidth={screenWidth}
      overflowMargin={screenWidth * 0.08}
      scaleFactor={0.58}
      borderRadius={28}
      renderDrawer={({ close }) => <DrawerMenu onNavigate={close} />}
      renderContent={({ open, close, isOpen }) => (
        <MainContent
          openDrawer={open}
          closeDrawer={close}
          isDrawerOpen={isOpen}
        />
      )}
    />
  );
};
```

Props clave:

- `width`: ancho del drawer (puede ser porcentaje del ancho de pantalla).
- `overflowMargin`: espacio extra para que el drawer quede visible tras la escala.
- `scaleFactor`: escala objetivo del contenido (por defecto `0.58`).
- `renderDrawer` / `renderContent`: funciones que reciben `progress`, `open`, `close`, `toggle` e `isOpen` para componer UI personalizada.
- `secondaryScaleFactor` / `secondaryTranslateMultiplier`: controlan la pantalla "fantasma" que refuerza el efecto de profundidad.
- `renderBackdrop`: permite personalizar el fondo semitransparente que aparece bajo el contenido.

```typescript
const CustomScreen: React.FC = () => {
  const drawer = useDrawer({
    config: {
      header: {
        title: "Custom Screen",
      },
      routes: [
        {
          id: "custom-action",
          title: "Custom Action",
          icon: "⭐",
          onPress: () => console.log("Custom action!"),
        },
      ],
    },
  });

  // ... resto del código
};
```

## API Reference

### Hook `useDrawer(options?)`

#### Opciones

```typescript
interface UseDrawerOptions {
  module?: ModuleType; // 'customer' | 'business' | 'driver'
  initialOpen?: boolean;
  persistState?: boolean;
  config?: Partial<DrawerConfig>; // Para overrides
}
```

#### Retorno

```typescript
interface UseDrawerReturn {
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
  switchModule: (module: ModuleType) => void;

  // Config
  config: DrawerConfig;
  routes: DrawerRoute[];

  // Handlers
  handleRoutePress: (route: DrawerRoute) => void;
}
```

### Componente `Drawer`

```typescript
interface DrawerProps {
  config: DrawerConfig;
  isOpen: boolean;
  activeRoute?: string;
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
```

## Estructura de Rutas

### Ruta básica

```typescript
interface DrawerRoute {
  id: string; // Identificador único
  title: string; // Texto a mostrar
  icon?: string | React.ComponentType; // Icono
  href?: string; // Ruta de Expo Router
  subroutes?: DrawerRoute[]; // Rutas hijas
  badge?: string | number; // Notificaciones
  disabled?: boolean; // Deshabilitada
  divider?: boolean; // Separador visual
}
```

### Ruta con cambio de módulo

```typescript
{
  id: 'switch-to-business',
  title: 'Switch to Business',
  icon: 'building',
  switchToModule: 'business',  // Cambia al módulo business
  requiresConfirmation: true,   // Muestra confirmación
}
```

### Ruta con acción personalizada

```typescript
{
  id: 'custom-action',
  title: 'Custom Action',
  icon: 'star',
  onPress: () => { /* acción personalizada */ },
}
```

## Configuraciones por Módulo

### Customer Module

- Home, Rides, Chat, Profile
- Marketplace con subrutas
- Wallet, Emergency
- Opciones para cambiar a Business/Driver

### Business Module

- Dashboard, Orders, Analytics
- Marketplace integrado
- Team management, Settings
- Opción para volver a Customer

### Driver Module

- Dashboard, Earnings, Active Ride
- Performance, Documents
- Vehicle management
- Opciones para cambiar módulos

## Gestión de Estado Global

### Store de Módulos

```typescript
import { useModuleStore } from "@/store/module";

// Obtener estado actual
const currentModule = useModuleStore((state) => state.currentModule);

// Cambiar módulo
useModuleStore.getState().setModule("business");

// Métodos específicos
useModuleStore.getState().switchToCustomer();
useModuleStore.getState().switchToBusiness();
useModuleStore.getState().switchToDriver();
```

## Ejemplos Avanzados

### Integración con UI existente

```typescript
import { useUI } from '@/components/UIWrapper';

const MyComponent = () => {
  const { showDrawer, hideDrawer } = useUI();

  const openDrawer = () => {
    showDrawer({
      module: 'customer',
      config: customConfig, // Configuración personalizada
    });
  };

  return (
    <TouchableOpacity onPress={openDrawer}>
      <Text>Open Custom Drawer</Text>
    </TouchableOpacity>
  );
};
```

### Drawer con animaciones personalizadas

```typescript
<Drawer
  animationType="scale"
  backdropOpacity={0.7}
  width={320}
  position="right"
  // ... otras props
/>
```

## Mejores Prácticas

### 1. Usar módulo automático cuando sea posible

```typescript
// ✅ Recomendado
const drawer = useDrawer(); // Detecta automáticamente

// ❌ Evitar cuando no sea necesario
const drawer = useDrawer({ module: "customer" }); // Forzado
```

### 2. Manejar cambios de módulo correctamente

```typescript
const handleModuleSwitch = async () => {
  try {
    await drawer.switchModule("business");
    // Módulo cambió automáticamente
  } catch (error) {
    // Manejar error
  }
};
```

### 3. Configuraciones personalizadas para pantallas específicas

```typescript
const specialDrawer = useDrawer({
  config: {
    routes: [
      // Solo rutas relevantes para esta pantalla
      { id: "back", title: "Back", href: "/previous" },
      { id: "settings", title: "Settings", href: "/settings" },
    ],
  },
});
```

## Troubleshooting

### El drawer no se abre

- Verificar que `isOpen` sea `true`
- Asegurarse de que el componente esté montado

### Las rutas no navegan

- Verificar que `href` sea una ruta válida de Expo Router
- Comprobar que `onRoutePress` esté conectado correctamente

### Los cambios de módulo no funcionan

- Verificar que `switchToModule` esté configurado en la ruta
- Asegurarse de que el módulo esté disponible

### Estado no se persiste

- Verificar que `persistState` esté habilitado (default: true)
- Comprobar permisos de AsyncStorage

## Testing

### Unit Tests

```typescript
import { renderHook } from "@testing-library/react-native";
import { useDrawer } from "@/components/drawer";

describe("useDrawer", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useDrawer());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentModule).toBe("customer");
  });
});
```

## Migración desde implementación anterior

Si tenías un drawer personalizado, puedes migrar fácilmente:

```typescript
// Antes
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

// Después
const drawer = useDrawer();
const { isOpen, toggle, close } = drawer;
```

Este componente drawer es completamente compatible con versiones anteriores y mejora significativamente la experiencia de desarrollo con type safety, estado persistente y transiciones fluidas.
