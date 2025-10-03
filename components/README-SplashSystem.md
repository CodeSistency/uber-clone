# Sistema de Splash Screens - Guía de Uso

## 🎯 **Resumen**

El sistema de splash screens permite mostrar pantallas de carga atractivas durante las transiciones entre módulos, aprovechando el tiempo para cargar datos críticos de forma optimizada.

## 🏗️ **Arquitectura**

### **Componentes Principales**

- **SplashStore**: Gestión centralizada del estado de splash screens
- **MiniSplash**: Componente visual para mostrar splash screens
- **ModuleDataService**: Servicio para cargar datos por módulo
- **useModuleTransition**: Hook para transiciones con splash

### **Flujo de Trabajo**

1. Usuario inicia transición de módulo
2. Se muestra MiniSplash con datos específicos del módulo
3. Se cargan datos críticos en paralelo
4. Progress bar se actualiza en tiempo real
5. Splash se oculta cuando la transición completa

## 🚗 **Transiciones Específicas por Módulo**

### **Customer → Driver**

```typescript
import { useModuleTransition } from '@/store/module';

const MyComponent = () => {
  const { switchToDriver, isSplashActive, splashProgress } = useModuleTransition();

  const handleSwitchToDriver = async () => {
    await switchToDriver();
    // Splash se muestra automáticamente con:
    // - Título: "Activando Modo Conductor"
    // - Subtítulo: "Preparando tu vehículo y ruta..."
    // - Datos cargados: Perfil conductor, vehículo, GPS, disponibilidad
  };

  return (
    <TouchableOpacity onPress={handleSwitchToDriver}>
      <Text>Modo Conductor</Text>
      {isSplashActive && <Text>Progreso: {splashProgress}%</Text>}
    </TouchableOpacity>
  );
};
```

**Datos cargados durante la transición:**

- ✅ Perfil de conductor
- ✅ Estado del vehículo
- ✅ Ubicación GPS
- ✅ Disponibilidad
- ✅ Historial de viajes

### **Customer → Business**

```typescript
const { switchToBusiness } = useModuleTransition();

await switchToBusiness();
// Muestra splash con:
// - Título: "Activando Modo Negocio"
// - Subtítulo: "Cargando tu panel administrativo..."
// - Datos: Perfil negocio, productos activos, estadísticas
```

**Datos cargados durante la transición:**

- ✅ Perfil del negocio
- ✅ Productos activos
- ✅ Estadísticas de ventas
- ✅ Inventario
- ✅ Pedidos pendientes

### **Driver/Business → Customer**

```typescript
const { switchToCustomer } = useModuleTransition();

await switchToCustomer();
// Limpia datos específicos del módulo y regresa a modo cliente
```

## 🎨 **Personalización de Splash**

### **Splash Personalizado**

```typescript
import { useSplashStore, splashConfigs } from "@/store";

const splashStore = useSplashStore.getState();

// Splash personalizado
splashStore.showSplash({
  id: "custom-splash",
  type: "module_transition",
  title: "Cargando...",
  subtitle: "Preparando tu experiencia",
  backgroundColor: "#FF6B35",
  showProgress: true,
  progress: 0,
  moduleSpecific: {
    dataQueries: ["Datos personalizados"],
  },
});
```

### **Actualizar Progreso**

```typescript
// Actualizar progreso manualmente
splashStore.updateProgress(50, "custom-splash");
splashStore.updateProgress(100, "custom-splash"); // Se oculta automáticamente
```

## 🔧 **Hooks y Utilidades**

### **useModuleTransition Hook**

```typescript
const {
  // Estado
  currentModule,
  isSplashActive,
  splashProgress,
  currentTransition,

  // Acciones
  switchModule,
  switchToDriver,
  switchToBusiness,
  switchToCustomer,
  resetToDefault,
} = useModuleTransition();
```

### **Componente ModuleSwitcherWithSplash**

```typescript
import ModuleSwitcherWithSplash from '@/components/ModuleSwitcherWithSplash';

<ModuleSwitcherWithSplash
  currentModule={currentModule}
  onModuleChange={(module) => console.log('Module changed to:', module)}
/>
```

## 📊 **Sistema de Datos por Módulo**

### **ModuleDataService**

```typescript
import {
  loadDriverData,
  loadBusinessData,
  loadCustomerData,
} from "@/app/services/moduleDataService";

// Cargar datos con callback de progreso
const result = await loadDriverData((completed, total, currentTask) => {
  console.log(`Cargando: ${currentTask} (${completed}/${total})`);
});

if (result.success) {
  console.log("Datos cargados:", result.data);
} else {
  console.error("Errores:", result.errors);
}
```

### **Sistema de Prioridades**

- **CRITICAL**: Datos esenciales (bloquean la transición)
- **HIGH**: Datos importantes (se intentan cargar)
- **MEDIUM**: Datos opcionales
- **LOW**: Datos no prioritarios

## 🎭 **Ejemplos de UI**

### **Splash Driver**

```
🚗 Activando Modo Conductor
Preparando tu vehículo y ruta...

Cargando:
• Perfil de conductor
• Estado del vehículo
• Ubicación GPS

██████████████░░░░ 75%
```

### **Splash Business**

```
🏢 Activando Modo Negocio
Cargando tu panel administrativo...

Cargando:
• Perfil del negocio
• Productos activos
• Estadísticas de ventas

██████████████████ 100%
```

## 🔄 **Integración con Componentes Existentes**

### **Actualizar useDrawer**

```typescript
// Ya actualizado automáticamente para usar transiciones con splash
const { switchModule } = useDrawer();
// Ahora muestra splash durante cambios de módulo
```

### **UIWrapper Integration**

```typescript
// Automáticamente integrado - no se requiere configuración adicional
<UIWrapper>
  <App />
</UIWrapper>
```

## 🚨 **Manejo de Errores**

### **Fallback Automático**

```typescript
// Si falla la carga de datos críticos, se revierte la transición
try {
  await switchToDriver();
} catch (error) {
  // Splash se oculta automáticamente
  // Usuario permanece en módulo anterior
  console.error("Transition failed:", error);
}
```

### **Recuperación de Errores**

```typescript
// El sistema maneja errores automáticamente:
// - Oculta splash en caso de error
// - Revierte cambios de módulo
// - Loggea errores para debugging
```

## 📈 **Métricas y Monitoreo**

### **Estado de Transición**

```typescript
const { currentTransition, splashProgress } = useModuleTransition();

// currentTransition contiene:
// - fromModule: módulo origen
// - toModule: módulo destino
// - isDataLoading: estado de carga
```

### **Logging Automático**

```typescript
// Todos los eventos se loggean automáticamente:
// [ModuleStore] switchToModuleWithSplash called with: driver
// [SplashStore] 🚀 showSplash called with: {...}
// [DataLoadingQueue] ✅ Critical task completed: Perfil de conductor
```

## 🎯 **Próximos Pasos**

1. **Testing**: Probar transiciones en diferentes condiciones de red
2. **Optimización**: Mejorar tiempos de carga y animaciones
3. **Personalización**: Permitir temas personalizados por módulo
4. **Analytics**: Implementar tracking de uso y rendimiento

---

**¿Necesitas ayuda con alguna transición específica o tienes preguntas sobre la implementación?** 🚀
