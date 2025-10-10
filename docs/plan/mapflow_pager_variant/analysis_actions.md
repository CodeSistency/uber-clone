# Análisis de Acciones del MapFlowStore

## **📋 Acciones Existentes Documentadas**

### **🎯 Acciones Principales de Navegación**
```typescript
// Navegación básica
setCurrentStep: (step: MapFlowStep) => void;
goTo: (step: MapFlowStep) => void;
goToStep: (stepName: string) => void;
next: () => void;
back: () => void;

// Control de flujo
start: (role: MapFlowRole) => void;
startService: (service: ServiceType, role?: FlowRole) => void;
stop: () => void;
reset: () => void;
```

### **🔧 Acciones de Configuración**
```typescript
// Configuración de pasos
updateStepBottomSheet: (step: MapFlowStep, cfg: Partial<StepConfig["bottomSheet"]>) => void;
setMapInteraction: (step: MapFlowStep, interaction: MapInteraction) => void;
updateStepTransition: (step: MapFlowStep, cfg: TransitionConfig) => void;

// Configuración inicial
getInitialStepConfig: (step: MapFlowStep) => ReturnType<typeof getInitialStepConfig>;
startWithConfig: (step: MapFlowStep, role: MapFlowRole) => void;
```

### **🆔 Acciones de Identificadores de Flujo**
```typescript
// IDs de flujos específicos
setRideId: (id: number | null) => void;
setOrderId: (id: number | null) => void;
setErrandId: (id: number | null) => void;
setParcelId: (id: number | null) => void;
```

### **🚗 Acciones de Configuración de Viaje**
```typescript
// Tipo de viaje y confirmaciones
setRideType: (type: RideType) => void;
setConfirmedOrigin: (location: any) => void;
setConfirmedDestination: (location: any) => void;
setPhoneNumber: (phone: string) => void;

// Configuración de vehículo
setSelectedTierId: (tierId: number) => void;
setSelectedVehicleTypeId: (vehicleTypeId: number) => void;
```

### **🔍 Acciones de Matching de Conductores**
```typescript
// Matching básico
startMatching: (timeoutSeconds?: number) => void;
stopMatching: () => void;
setMatchedDriver: (driver: any) => void;
clearMatchedDriver: () => void;

// Timer de aceptación
startAcceptanceTimer: (timeoutSeconds?: number) => void;
stopAcceptanceTimer: () => void;
```

### **💰 Acciones de Precios y Rutas**
```typescript
// Cálculo de precios
setEstimatedPrice: (price: number) => void;
setRouteInfo: (routeInfo: { distanceMiles: number; durationMinutes: number; }) => void;
setPriceBreakdown: (breakdown: any) => void;
```

### **⚡ Acciones de Búsqueda Asíncrona**
```typescript
// Búsqueda asíncrona
startAsyncSearch: (searchId: string, timeRemaining: number) => void;
updateAsyncSearchStatus: (status: string, data?: any) => void;
cancelAsyncSearch: () => void;
confirmAsyncDriver: (driverId: number) => void;

// Timer de búsqueda
startAsyncSearchTimer: () => void;
calculateTimeRemaining: () => number;
```

### **🎯 Acciones Específicas por Servicio**
```typescript
// Inicio con pasos específicos
startWithCustomerStep: (step: MapFlowStep) => void;
startWithDriverStep: (step: MapFlowStep) => void;
startWithTransportStep: (step: MapFlowStep, role: MapFlowRole) => void;
startWithDeliveryStep: (step: MapFlowStep, role: MapFlowRole) => void;
startWithMandadoStep: (step: MapFlowStep, role: MapFlowRole) => void;
startWithEnvioStep: (step: MapFlowStep, role: MapFlowRole) => void;
```

## **🔍 Análisis de Patrones de Acciones**

### **1. Patrón de Setter Simple**
```typescript
// Ejemplo: setRideId
setRideId: (id) => set(() => ({ rideId: id }))
```
- **Uso**: Para propiedades simples
- **Ventaja**: Directo y eficiente
- **Aplicación para PagerView**: `setCurrentPageIndex`, `setTotalPages`

### **2. Patrón de Setter con Lógica**
```typescript
// Ejemplo: setCurrentStep
setCurrentStep: (step) => {
  // Lógica compleja de configuración
  const stepConfig = DEFAULT_CONFIG[step];
  if (stepConfig) {
    // Actualizar flow con configuración del paso
    const newFlow = { /* ... */ };
    set({ step, flow: newFlow });
  }
}
```
- **Uso**: Para acciones que requieren lógica adicional
- **Ventaja**: Encapsula lógica compleja
- **Aplicación para PagerView**: Modificar `setCurrentStep` para detectar variante

### **3. Patrón de Navegación**
```typescript
// Ejemplo: next()
next: () => {
  const state = get();
  // Lógica de navegación basada en el paso actual
  // Manejo de casos especiales
  // Actualización de estado
}
```
- **Uso**: Para navegación secuencial
- **Ventaja**: Maneja casos especiales
- **Aplicación para PagerView**: `goToNextPage`, `goToPreviousPage`

### **4. Patrón de Configuración**
```typescript
// Ejemplo: updateStepBottomSheet
updateStepBottomSheet: (step, cfg) => {
  set((state) => {
    const prev = state.stepConfig[step];
    const nextCfg = { ...prev, bottomSheet: { ...prev.bottomSheet, ...cfg } };
    return { stepConfig: { ...state.stepConfig, [step]: nextCfg } };
  });
}
```
- **Uso**: Para actualizar configuración de pasos
- **Ventaja**: Preserva configuración existente
- **Aplicación para PagerView**: `updateStepPagerConfig`

## **🎯 Acciones Necesarias para PagerView**

### **Acciones de Estado de Variante**
```typescript
// Activar/desactivar variante
setUsePagerView: (use: boolean) => void;

// Configuración de páginas
setCurrentPageIndex: (index: number) => void;
setTotalPages: (total: number) => void;
setPagerSteps: (steps: MapFlowStep[]) => void;
```

### **Acciones de Navegación de Páginas**
```typescript
// Navegación de páginas
goToNextPage: () => void;
goToPreviousPage: () => void;
goToPage: (index: number) => void;
```

### **Acciones de Configuración de Pager**
```typescript
// Configuración por paso
updateStepPagerConfig: (step: MapFlowStep, pagerConfig: PagerConfig) => void;
setStepPagerEnabled: (step: MapFlowStep, enabled: boolean) => void;
```

## **🔧 Modificaciones Necesarias**

### **1. Modificar `setCurrentStep`**
```typescript
setCurrentStep: (step: MapFlowStep) => {
  const state = get();
  
  // Lógica existente...
  
  // Nueva lógica para PagerView
  if (state.variant.usePagerView) {
    const pageIndex = state.variant.pagerSteps.indexOf(step);
    if (pageIndex !== -1) {
      set({ currentPageIndex: pageIndex });
    }
  }
}
```

### **2. Agregar Validaciones**
```typescript
goToNextPage: () => {
  const state = get();
  if (state.variant.currentPageIndex < state.variant.totalPages - 1) {
    const nextIndex = state.variant.currentPageIndex + 1;
    const nextStep = state.variant.pagerSteps[nextIndex];
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }
}
```

## **⚠️ Consideraciones de Compatibilidad**

### **1. Mantener Funcionalidad Existente**
- Todas las acciones actuales deben seguir funcionando
- No modificar comportamiento de acciones existentes
- Agregar nuevas acciones sin afectar las existentes

### **2. Validaciones de Estado**
- Verificar que la variante esté activada antes de usar acciones de PagerView
- Validar índices de página antes de navegar
- Manejar casos edge (páginas vacías, índices inválidos)

### **3. Testing de Regresión**
- Verificar que todas las acciones existentes siguen funcionando
- Testear que la variante no afecta el comportamiento normal
- Validar que la migración entre modos funciona correctamente

