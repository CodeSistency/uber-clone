# UI Events System Implementation

## 🎯 **Objetivo**
Implementar un sistema completo de gestión de eventos de UI que proporcione feedback visual consistente durante operaciones asíncronas, manejo de errores y notificaciones de éxito en toda la aplicación.

## 📋 **Arquitectura del Sistema**

### **1. UIStore (`store/index.ts`)**
```typescript
interface UIStore {
  events: UIEvent[];
  globalLoading: boolean;
  globalLoadingMessage: string;

  // Acciones principales
  showLoading: (message?: string) => string;
  hideLoading: (id?: string) => void;
  showError: (title: string, message: string, action?: UIEvent['action']) => string;
  showSuccess: (title: string, message: string, action?: UIEvent['action']) => string;
  showInfo: (title: string, message: string, action?: UIEvent['action']) => string;
  dismissEvent: (id: string) => void;
  clearAllEvents: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}
```

### **2. UIWrapper Component (`components/UIWrapper.tsx`)**
Componente principal que maneja:
- **Global Loading Overlay**: Modal de carga para operaciones críticas
- **Toast Notifications**: Notificaciones animadas en la parte superior
- **Event Management**: Gestión automática de eventos con auto-hide

### **3. Hook useUI (`components/UIWrapper.tsx`)**
Hook principal para usar el sistema de UI:
```typescript
const { showLoading, hideLoading, showError, showSuccess, withUI } = useUI();
```

## 🚀 **Uso Básico**

### **Mostrar Loading**
```typescript
const loadingId = showLoading("Loading data...");
// ... hacer algo
hideLoading(loadingId);
```

### **Mostrar Error**
```typescript
showError("Error Title", "Error message", {
  label: "Retry",
  onPress: () => retryAction()
});
```

### **Mostrar Éxito**
```typescript
showSuccess("Success!", "Operation completed successfully");
```

### **Mostrar Info**
```typescript
showInfo("Information", "This is an info message");
```

## 🎨 **Uso Avanzado - withUI**

### **Wrapper Automático para API Calls**
```typescript
const result = await withUI(
  async () => {
    // Tu lógica asíncrona aquí
    return await apiCall();
  },
  {
    loadingMessage: "Processing...",
    successMessage: "Completed successfully!",
    errorTitle: "Operation Failed",
    onSuccess: (result) => {
      console.log("Success:", result);
      // Opcional: callback de éxito
    },
    onError: (error) => {
      console.error("Error:", error);
      // Opcional: callback de error
    }
  }
);
```

### **Ejemplo Completo en Componente**
```typescript
const LoginComponent = () => {
  const { withUI } = useUI();

  const handleLogin = async (credentials) => {
    const result = await withUI(
      async () => {
        const response = await loginAPI(credentials);
        if (!response.success) {
          throw new Error(response.message);
        }
        return response;
      },
      {
        loadingMessage: "Signing you in...",
        successMessage: "Welcome back!",
        errorTitle: "Login Failed",
        onSuccess: () => {
          router.replace("/home");
        }
      }
    );
  };

  return (
    <CustomButton
      title="Login"
      onPress={() => handleLogin({ email, password })}
    />
  );
};
```

## 🔧 **Componentes del Sistema**

### **UIWrapper (Componente Principal)**
```typescript
<UIWrapper showGlobalLoading={true}>
  <YourAppContent />
</UIWrapper>
```

### **UIEventToast (Notificación Individual)**
- **Animaciones**: Fade in/out + slide desde arriba
- **Auto-hide**: Para mensajes de éxito e info
- **Acciones**: Botones opcionales para acciones del usuario
- **Dismiss**: Botón X para cerrar manualmente

### **GlobalLoadingOverlay**
- **Modal**: Cubre toda la pantalla
- **ActivityIndicator**: Spinner animado
- **Mensaje personalizado**: Muestra el progreso actual

## 📱 **Integración en Pantallas de Auth**

### **Sign-In Screen Mejorada**
```typescript
const onSignInPress = async () => {
  if (!form.email || !form.password) {
    showError("Validation Error", "Please fill in all fields");
    return;
  }

  const result = await withUI(
    async () => {
      const loginResult = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (!loginResult.success) {
        throw new Error(loginResult.message || "Login failed");
      }

      return loginResult;
    },
    {
      loadingMessage: "Signing you in...",
      successMessage: "Welcome back to UberClone!",
      errorTitle: "Login Failed",
      onSuccess: () => {
        setTimeout(() => router.replace("/home"), 1000);
      }
    }
  );
};
```

### **Sign-Up Screen Mejorada**
```typescript
const onSignUpPress = async () => {
  if (!form.name || !form.email || !form.password) {
    showError("Validation Error", "Please fill in all fields");
    return;
  }

  const result = await withUI(
    async () => {
      const registerResult = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (!registerResult.success) {
        throw new Error(registerResult.message || "Registration failed");
      }

      return registerResult;
    },
    {
      loadingMessage: "Creating your account...",
      successMessage: "Account created successfully! Welcome to UberClone!",
      errorTitle: "Registration Failed",
      onSuccess: () => {
        setTimeout(() => router.replace("/home"), 1000);
      }
    }
  );
};
```

## 🎭 **Tipos de Eventos UI**

### **Loading Events**
- **Indicador visual**: Spinner + mensaje
- **ID único**: Para controlar múltiples loadings
- **Auto-dismiss**: Se oculta cuando se completa la operación

### **Error Events**
- **Color**: Rojo (#ef4444)
- **Icono**: ❌
- **Auto-hide**: No (requiere acción del usuario)
- **Acciones**: Opcional (Retry, etc.)

### **Success Events**
- **Color**: Verde (#22c55e)
- **Icono**: ✅
- **Auto-hide**: Sí (3 segundos)
- **Acciones**: Opcional

### **Info Events**
- **Color**: Azul (#3b82f6)
- **Icono**: ℹ️
- **Auto-hide**: Sí (2 segundos)
- **Acciones**: Opcional

## 🛠️ **Funciones Helper**

### **uiHelpers (lib/auth.ts)**
```typescript
// Login con UI automática
await uiHelpers.loginWithUI({ email, password });

// Register con UI automática
await uiHelpers.registerWithUI({ name, email, password });

// Logout con UI automática
await uiHelpers.logoutWithUI();
```

## 🎨 **Personalización**

### **Colores y Estilos**
```typescript
// Los colores se pueden personalizar modificando getBackgroundColor()
const getBackgroundColor = () => {
  switch (event.type) {
    case 'error': return 'bg-red-500';
    case 'success': return 'bg-green-500';
    case 'info': return 'bg-blue-500';
    case 'loading': return 'bg-gray-500';
  }
};
```

### **Duración de Auto-hide**
```typescript
// Se puede modificar en el store
showSuccess(title, message, {
  autoHide: true,
  duration: 5000 // 5 segundos en lugar de 3
});
```

## 📊 **Beneficios del Sistema**

### ✅ **UX Mejorada**
- **Feedback inmediato**: Usuario sabe que algo está pasando
- **Estados claros**: Loading, éxito, error claramente diferenciados
- **Acciones contextuales**: Botones de retry cuando falla
- **Animaciones suaves**: Transiciones fluidas

### ✅ **Desarrollo Simplificado**
- **Código reusable**: Una sola función para manejar UI compleja
- **Menos boilerplate**: No necesitas manejar loading states manualmente
- **Centralizado**: Toda la lógica de UI en un solo lugar
- **Type-safe**: Interfaces TypeScript completas

### ✅ **Mantenibilidad**
- **Separación de responsabilidades**: UI separada de lógica de negocio
- **Fácil testing**: Cada parte se puede testear independientemente
- **Escalable**: Fácil agregar nuevos tipos de eventos
- **Consistente**: Misma experiencia en toda la app

## 🔄 **Flujo de Trabajo**

### **Operación Normal**
```
Usuario hace acción
  ↓
withUI() muestra loading
  ↓
Ejecuta operación asíncrona
  ↓
Oculta loading, muestra éxito/error
  ↓
Usuario ve resultado inmediato
```

### **Operación con Error**
```
Usuario hace acción
  ↓
withUI() muestra loading
  ↓
Operación falla
  ↓
Oculta loading, muestra error con opción de retry
  ↓
Usuario puede reintentar o cancelar
```

## 🚀 **Implementación Actual**

### ✅ **Completado:**
- **UIStore completo** con todos los tipos de eventos
- **UIWrapper component** con animaciones
- **Hook useUI** para fácil acceso
- **withUI wrapper** para operaciones asíncronas
- **Sign-in/Sign-up mejorados** con el nuevo sistema
- **Integración global** en _layout.tsx

### ✅ **Funciones Helper:**
- **uiHelpers.loginWithUI()** - Login con UI automática
- **uiHelpers.registerWithUI()** - Register con UI automática
- **uiHelpers.logoutWithUI()** - Logout con UI automática

## 🎉 **Resultado Final:**

**¡Sistema de UI Events completamente implementado!** 🎨

- ✅ **Feedback visual inmediato** durante todas las operaciones
- ✅ **Estados de carga elegantes** con spinners y mensajes
- ✅ **Notificaciones animadas** que se auto-ocultan
- ✅ **Manejo de errores inteligente** con opciones de retry
- ✅ **Código extremadamente simple** para usar en cualquier componente
- ✅ **Experiencia de usuario premium** con animaciones suaves

**El sistema está listo para usar en cualquier parte de la aplicación con solo una línea de código.** 🚀

¿Quieres que implemente algún tipo específico de notificación o funcionalidad adicional? 🤔
