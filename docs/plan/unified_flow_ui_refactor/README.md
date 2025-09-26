# Plan de Refactorización UI - Flujo Unificado

## 🎯 **Objetivo del Proyecto**
Refactorizar el sistema de flujo unificado (`unified-flow/`) para utilizar los componentes reutilizables del sistema UI (`components/ui/`), mejorando la consistencia, mantenibilidad y experiencia de desarrollo.

## 📋 **Contexto**
El flujo unificado actualmente utiliza componentes nativos de React Native (TouchableOpacity, View, Text, etc.) de manera directa. Esta refactorización busca:

- **Consistencia Visual**: Unificar el aspecto y comportamiento de todos los componentes
- **Mantenibilidad**: Centralizar la lógica de UI en componentes reutilizables
- **Desarrollo Acelerado**: Reutilizar componentes probados en lugar de recrearlos
- **Accesibilidad**: Mejorar el soporte de accesibilidad con componentes especializados

## 🏗️ **Estructura del Plan**

### **Etapa 1: Componentes Base y Utilitarios** 🔧
**Prioridad: Alta** - Refactorizar componentes fundamentales que afectan múltiples partes del sistema.

- **BaseComponents.tsx**: Reemplazar TouchableOpacity → Button, View → Card, indicadores → Badge
- **SimulationControls**: Panel de control de simulación con componentes UI modernos

### **Etapa 2: Componentes de Flujo Principal** 🎯
**Prioridad: Alta** - Actualizar los componentes principales de navegación del flujo.

- **unified-flow-demo.tsx**: Modal de selección de modo, header del drawer
- **driver-unified-flow-demo.tsx**: Header del drawer conductor, indicadores de estado

### **Etapa 3: Pasos del Flujo** 📝
**Prioridad: Media** - Refactorizar cada paso individual del flujo de usuario.

- **Pasos del Cliente**: Viaje, Delivery, Mandado, Envío
- **Pasos del Conductor**: Disponibilidad, Viajes, Deliveries

### **Etapa 4: Optimización y Testing** ✅
**Prioridad: Media/Baja** - Asegurar calidad y performance del código refactorizado.

- **Testing**: Actualizar tests para nueva API de componentes
- **Performance**: Memoización y lazy loading donde sea necesario

## 🔄 **Próximos Pasos Recomendados**

1. **Comenzar con Etapa 1**: Los cambios en BaseComponents.tsx tendrán el mayor impacto positivo inicial, ya que afectan múltiples componentes del sistema.

2. **Implementar paralelamente**: Se pueden trabajar simultáneamente BaseComponents.tsx y SimulationControls, ya que son módulos independientes.

3. **Crear rama de desarrollo**: `git checkout -b feature/ui-refactor-unified-flow` para aislar los cambios de refactorización.

4. **Configurar alias de importación**: Asegurar que `@/components/ui/` esté correctamente configurado en `tsconfig.json` para imports limpios.

5. **Documentar cambios breaking**: Crear una guía de migración para desarrolladores que usen los componentes refactorizados.

## 📊 **Métricas de Éxito**

- ✅ **Consistencia**: Todos los botones usan el componente `Button`
- ✅ **Reutilización**: Reducción del 70% en código duplicado de UI
- ✅ **Mantenibilidad**: Cambios de UI centralizados en componentes base
- ✅ **Performance**: Sin degradación en métricas de renderizado
- ✅ **Testing**: Cobertura del 85%+ en componentes refactorizados

## 🛠️ **Dependencias Técnicas**

### **Componentes UI Disponibles**
```typescript
import {
  Button,      // Reemplaza TouchableOpacity
  Card,        // Reemplaza View con estilos de tarjeta
  Badge,       // Indicadores de estado
  TextField,   // Inputs de texto
  Modal,       // Modales consistentes
  Glass        // Efectos visuales
} from '@/components/ui';
```

### **Patrones de Migración**
```typescript
// ❌ Antes
<TouchableOpacity onPress={handlePress} className="bg-blue-500 px-4 py-2 rounded">
  <Text className="text-white">Click me</Text>
</TouchableOpacity>

// ✅ Después
<Button onPress={handlePress} variant="primary">
  Click me
</Button>
```

## 🚀 **Implementación**

Para comenzar con la implementación:

1. Revisar el `plan.json` para detalles específicos de cada tarea
2. Comenzar con el módulo de mayor prioridad (M1.1)
3. Ejecutar tests después de cada cambio significativo
4. Hacer commits frecuentes con mensajes descriptivos

## 📞 **Soporte**

Si encuentras problemas durante la refactorización:
- Revisar la documentación de componentes UI en `components/ui/`
- Verificar ejemplos de uso en componentes existentes
- Consultar tests para entender la API esperada

