# useMapFlowStore - Store de Flujo de Mapas

## 📋 Resumen

El `useMapFlowStore` es el store principal para el flujo de mapas y navegación. Consolida la funcionalidad de los hooks `useMapFlowActions` y `useMapFlowSelectors` en un store unificado con selectores optimizados.

## 🔄 Hooks Consolidados

**Reemplaza:**
- `useMapFlowActions` (hook deprecado)
- `useMapFlowSelectors` (hook deprecado)

## 🏗️ Estructura del Store

### Estado Principal

```typescript
interface MapFlowState {
  // ===== FLUJO PRINCIPAL =====
  currentStep: MapFlowStep;
  currentRole: MapFlowRole;
  currentService: ServiceType;
  isActive: boolean;
  
  // ===== RIDE DATA =====
  rideId: number | null;
  isMatching: boolean;
  matchedDriver: DriverSnapshot | null;
  confirmedOrigin: LocationSnapshot | null;
  confirmedDestination: LocationSnapshot | null;
  
  // ===== BOTTOM SHEET =====
  bottomSheet: {
    isVisible: boolean;
    height: number;
    snapPoints: number[];
    currentIndex: number;
  };
  
  // ===== PAGER =====
  pager: {
    currentIndex: number;
    totalPages: number;
    canGoNext: boolean;
    canGoBack: boolean;
  };
  
  // ===== CONFIGURACIÓN =====
  config: {
    navigation: NavigationConfig;
    visual: VisualConfig;
    animation: AnimationConfig;
    validation: ValidationConfig;
  };
}
```

## 🎯 Selectores Optimizados

### Selectores de Flujo Principal

```typescript
// Estado del flujo
export const useCurrentStep = () => useMapFlowStore(s => s.currentStep);
export const useCurrentRole = () => useMapFlowStore(s => s.currentRole);
export const useCurrentService = () => useMapFlowStore(s => s.currentService);
export const useIsFlowActive = () => useMapFlowStore(s => s.isActive);

// Selector compuesto del flujo
export const useFlowState = () => useMapFlowStore(s => ({
  step: s.currentStep,
  role: s.currentRole,
  service: s.currentService,
  isActive: s.isActive
}));
```

### Selectores de Ride

```typescript
// Datos del viaje
export const useRideId = () => useMapFlowStore(s => s.rideId);
export const useIsMatching = () => useMapFlowStore(s => s.isMatching);
export const useMatchedDriver = () => useMapFlowStore(s => s.matchedDriver);
export const useConfirmedOrigin = () => useMapFlowStore(s => s.confirmedOrigin);
export const useConfirmedDestination = () => useMapFlowStore(s => s.confirmedDestination);

// Selector compuesto del ride
export const useRideData = () => useMapFlowStore(s => ({
  rideId: s.rideId,
  isMatching: s.isMatching,
  matchedDriver: s.matchedDriver,
  origin: s.confirmedOrigin,
  destination: s.confirmedDestination
}));
```

### Selectores de Bottom Sheet

```typescript
// Estado del bottom sheet
export const useBottomSheetVisible = () => useMapFlowStore(s => s.bottomSheet.isVisible);
export const useBottomSheetHeight = () => useMapFlowStore(s => s.bottomSheet.height);
export const useBottomSheetIndex = () => useMapFlowStore(s => s.bottomSheet.currentIndex);
export const useBottomSheetSnapPoints = () => useMapFlowStore(s => s.bottomSheet.snapPoints);

// Selector compuesto del bottom sheet
export const useBottomSheetState = () => useMapFlowStore(s => s.bottomSheet);
```

### Selectores de Pager

```typescript
// Estado del pager
export const usePagerIndex = () => useMapFlowStore(s => s.pager.currentIndex);
export const usePagerTotalPages = () => useMapFlowStore(s => s.pager.totalPages);
export const useCanGoNext = () => useMapFlowStore(s => s.pager.canGoNext);
export const useCanGoBack = () => useMapFlowStore(s => s.pager.canGoBack);

// Selector compuesto del pager
export const usePagerState = () => useMapFlowStore(s => s.pager);
```

### Selectores de Configuración

```typescript
// Configuraciones
export const useNavigationConfig = () => useMapFlowStore(s => s.config.navigation);
export const useVisualConfig = () => useMapFlowStore(s => s.config.visual);
export const useAnimationConfig = () => useMapFlowStore(s => s.config.animation);
export const useValidationConfig = () => useMapFlowStore(s => s.config.validation);

// Selector compuesto de configuración
export const useMapFlowConfig = () => useMapFlowStore(s => s.config);
```

## 🔧 Acciones Principales

### Gestión del Flujo

```typescript
const { 
  start, 
  stop, 
  next, 
  back, 
  goToStep, 
  reset 
} = useMapFlowStore();

// Iniciar flujo
start('customer', 'transport');

// Navegar
next();
back();
goToStep('choose_destination');

// Detener flujo
stop();
```

### Gestión de Ride

```typescript
const { 
  setRideId, 
  setMatching, 
  setMatchedDriver, 
  setOrigin, 
  setDestination 
} = useMapFlowStore();

// Configurar viaje
setRideId(123);
setMatching(true);
setMatchedDriver(driverData);
setOrigin(originLocation);
setDestination(destinationLocation);
```

### Gestión de Bottom Sheet

```typescript
const { 
  showBottomSheet, 
  hideBottomSheet, 
  setBottomSheetHeight, 
  setBottomSheetIndex 
} = useMapFlowStore();

// Controlar bottom sheet
showBottomSheet();
hideBottomSheet();
setBottomSheetHeight(300);
setBottomSheetIndex(1);
```

### Gestión de Pager

```typescript
const { 
  setPagerIndex, 
  nextPage, 
  prevPage, 
  setTotalPages 
} = useMapFlowStore();

// Navegar páginas
nextPage();
prevPage();
setPagerIndex(2);
setTotalPages(5);
```

### Gestión de Configuración

```typescript
const { 
  updateNavigationConfig, 
  updateVisualConfig, 
  updateAnimationConfig, 
  updateValidationConfig 
} = useMapFlowStore();

// Actualizar configuraciones
updateNavigationConfig({
  enableBackButton: true,
  showProgressBar: true
});

updateVisualConfig({
  theme: 'dark',
  primaryColor: '#0286FF'
});
```

## 📝 Ejemplos de Uso

### Componente de Navegación

```typescript
import { 
  useCurrentStep, 
  useCanGoNext, 
  useCanGoBack,
  useMapFlowStore 
} from "@/store";

const FlowNavigation = () => {
  const currentStep = useCurrentStep();
  const canGoNext = useCanGoNext();
  const canGoBack = useCanGoBack();
  const { next, back, goToStep } = useMapFlowStore();

  return (
    <View>
      <Text>Current Step: {currentStep}</Text>
      
      <Button 
        title="Back" 
        onPress={back}
        disabled={!canGoBack}
      />
      
      <Button 
        title="Next" 
        onPress={next}
        disabled={!canGoNext}
      />
      
      <Button 
        title="Go to Destination" 
        onPress={() => goToStep('choose_destination')}
      />
    </View>
  );
};
```

### Componente de Ride Status

```typescript
import { 
  useRideId, 
  useIsMatching, 
  useMatchedDriver,
  useMapFlowStore 
} from "@/store";

const RideStatus = () => {
  const rideId = useRideId();
  const isMatching = useIsMatching();
  const matchedDriver = useMatchedDriver();
  const { setMatching } = useMapFlowStore();

  if (!rideId) {
    return <Text>No active ride</Text>;
  }

  return (
    <View>
      <Text>Ride ID: {rideId}</Text>
      
      {isMatching ? (
        <Text>Looking for driver...</Text>
      ) : matchedDriver ? (
        <View>
          <Text>Driver Found!</Text>
          <Text>{matchedDriver.name}</Text>
          <Text>Rating: {matchedDriver.rating}</Text>
        </View>
      ) : (
        <Text>Ride in progress</Text>
      )}
    </View>
  );
};
```

### Componente de Bottom Sheet

```typescript
import { 
  useBottomSheetVisible, 
  useBottomSheetHeight,
  useMapFlowStore 
} from "@/store";

const CustomBottomSheet = () => {
  const isVisible = useBottomSheetVisible();
  const height = useBottomSheetHeight();
  const { hideBottomSheet, setBottomSheetHeight } = useMapFlowStore();

  if (!isVisible) return null;

  return (
    <View style={{ height }}>
      <Text>Bottom Sheet Content</Text>
      
      <Button 
        title="Close" 
        onPress={hideBottomSheet}
      />
      
      <Button 
        title="Resize" 
        onPress={() => setBottomSheetHeight(400)}
      />
    </View>
  );
};
```

### Componente de Configuración

```typescript
import { 
  useNavigationConfig, 
  useVisualConfig,
  useMapFlowStore 
} from "@/store";

const FlowConfig = () => {
  const navConfig = useNavigationConfig();
  const visualConfig = useVisualConfig();
  const { updateNavigationConfig, updateVisualConfig } = useMapFlowStore();

  const handleToggleBackButton = () => {
    updateNavigationConfig({
      ...navConfig,
      enableBackButton: !navConfig.enableBackButton
    });
  };

  const handleChangeTheme = (theme) => {
    updateVisualConfig({
      ...visualConfig,
      theme
    });
  };

  return (
    <View>
      <Text>Navigation Config</Text>
      <Switch 
        value={navConfig.enableBackButton}
        onValueChange={handleToggleBackButton}
      />
      
      <Text>Visual Config</Text>
      <Button 
        title="Dark Theme" 
        onPress={() => handleChangeTheme('dark')}
      />
      <Button 
        title="Light Theme" 
        onPress={() => handleChangeTheme('light')}
      />
    </View>
  );
};
```

## ⚠️ Migración desde Hooks Antiguos

### Antes (Deprecado)

```typescript
// ❌ DEPRECADO - Hooks separados
import { useMapFlowActions } from "@/hooks/useMapFlowActions";
import { useMapFlowSelectors } from "@/hooks/useMapFlowSelectors";

const actions = useMapFlowActions();
const { step, role, service } = useMapFlowSelectors();

actions.next();
actions.back();
```

### Después (Nuevo)

```typescript
// ✅ NUEVO - Store unificado
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService,
  useMapFlowStore 
} from "@/store";

const step = useCurrentStep();
const role = useCurrentRole();
const service = useCurrentService();
const { next, back } = useMapFlowStore();

next();
back();
```

## 🔍 Persistencia

El store incluye persistencia automática para:

- `currentStep` - Paso actual del flujo
- `currentRole` - Rol actual del usuario
- `currentService` - Servicio actual
- `config` - Configuraciones del flujo

## 🧪 Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useMapFlowStore } from '@/store';

describe('useMapFlowStore', () => {
  it('should navigate to next step correctly', () => {
    const { result } = renderHook(() => useMapFlowStore());
    
    act(() => {
      result.current.next();
    });
    
    expect(result.current.currentStep).toBe('next_step');
  });
});
```

## 📊 Performance

- **Selectores granulares**: Solo re-renderiza cuando cambia la propiedad específica
- **Persistencia selectiva**: Solo persiste estado esencial
- **Memoización automática**: Zustand optimiza automáticamente los selectores
- **Lazy loading**: Carga configuraciones solo cuando se necesitan

## 🎯 Casos de Uso

### Flujo de Usuario
- Navegación entre pasos
- Gestión de estado del viaje
- Control de bottom sheet

### Flujo de Conductor
- Gestión de solicitudes
- Control de disponibilidad
- Navegación del conductor

### Configuración
- Personalización de UI
- Ajustes de navegación
- Configuración de animaciones

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
