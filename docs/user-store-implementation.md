# User Store Implementation

## 🎯 **Objetivo**

Implementar un sistema de gestión de usuario global que evite llamadas innecesarias a la API y mejore el rendimiento de la aplicación.

## 📋 **Arquitectura**

### **1. UserStore (store/index.ts)**

```typescript
interface UserStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}
```

### **2. Funciones de Autenticación Optimizadas (lib/auth.ts)**

#### **Registro/Login Automático**

- ✅ `registerUser()` guarda automáticamente en store
- ✅ `loginUser()` guarda automáticamente en store
- ✅ `logoutUser()` limpia automáticamente el store

#### **Verificación Optimizada**

```typescript
export const isAuthenticated = async (): Promise<boolean> => {
  // 1. Verificación rápida del store
  if (userStore.user && userStore.isAuthenticated) {
    return true;
  }

  // 2. Fallback a verificación de token
  const token = await tokenManager.getAccessToken();

  // 3. Actualización automática del store
  if (token && !userStore.user) {
    const result = await getUserProfile();
    if (result.success) {
      userStore.setUser(result.data);
      return true;
    }
  }

  return !!token;
};
```

## 🚀 **Uso en Componentes**

### **Uso Básico**

```typescript
import { useUserStore } from "@/store";

const MyComponent = () => {
  const { user, isLoading, error } = useUserStore();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotAuthenticated />;

  return (
    <View>
      <Text>Welcome {user.name}!</Text>
      <Text>Email: {user.email}</Text>
    </View>
  );
};
```

### **Uso Avanzado (con inicialización garantizada)**

```typescript
import { useEnsureUserData } from "@/lib/auth";

const MyComponent = () => {
  const { user, isLoading, ensureUserData } = useEnsureUserData();

  useEffect(() => {
    const loadUser = async () => {
      await ensureUserData();
    };
    loadUser();
  }, []);

  // Resto del componente...
};
```

## 🔧 **Componentes Actualizados**

### ✅ **Completamente Migrados:**

- **Home** (`app/(root)/(tabs)/home.tsx`)
- **Rides** (`app/(root)/(tabs)/rides.tsx`)
- **Profile** (`app/(root)/(tabs)/profile.tsx`)
- **ConfirmRide** (`app/(root)/confirm-ride.tsx`)
- **BookRide** (`app/(root)/book-ride.tsx`)
- **Payment** (`components/Payment.tsx`)

### ✅ **Funciones de Autenticación:**

- **SignUp** - Guarda en store automáticamente
- **SignIn** - Guarda en store automáticamente
- **Logout** - Limpia store automáticamente
- **isAuthenticated** - Verifica store primero

## 📊 **Beneficios del Nuevo Sistema**

### ✅ **Performance Mejorada**

- **Sin llamadas innecesarias** a `/api/auth/profile`
- **Verificación rápida** desde memoria
- **Estado consistente** entre componentes
- **Carga inicial optimizada**

### ✅ **UX Mejorada**

- **Información inmediata** del usuario disponible
- **Estados de carga** apropiados
- **Manejo de errores** centralizado
- **Navegación fluida**

### ✅ **Mantenibilidad**

- **Código centralizado** en store
- **Funciones reutilizables**
- **Tipos consistentes**
- **Logging detallado** para debugging

## 🔄 **Flujo de Trabajo**

### **1. Inicio de Sesión**

```
Usuario hace login/register
  ↓
Función auth guarda tokens + user en store
  ↓
Componentes tienen acceso inmediato al user
  ↓
Sin llamadas adicionales a API
```

### **2. Navegación entre Pantallas**

```
Usuario navega a nueva pantalla
  ↓
Componente usa user del store
  ↓
Información disponible inmediatamente
  ↓
Solo llamadas API cuando es necesario
```

### **3. Logout**

```
Usuario hace logout
  ↓
Función auth limpia tokens + store
  ↓
Estado consistente en toda la app
  ↓
Redirección automática
```

## 🛠️ **Funciones Helper**

### **initializeUserStore()**

- Inicializa el store al inicio de la app
- Verifica tokens existentes
- Carga perfil de usuario si es necesario

### **useEnsureUserData()**

- Hook opcional para componentes que necesitan garantías
- Inicializa datos de usuario cuando sea necesario
- Útil para componentes críticos

## 📝 **Mejores Prácticas**

### ✅ **Usar Store Directamente**

```typescript
// ✅ Recomendado
const { user } = useUserStore();

// ❌ Evitar
const [user, setUser] = useState(null);
useEffect(() => {
  getUserProfile().then(setUser);
}, []);
```

### ✅ **Verificar Estado de Carga**

```typescript
// ✅ Recomendado
const { user, isLoading } = useUserStore();
if (isLoading) return <Spinner />;

// ❌ Evitar
if (!user) return <Spinner />;
```

### ✅ **Manejar Errores**

```typescript
// ✅ Recomendado
const { user, error } = useUserStore();
if (error) return <ErrorMessage error={error} />;

// ❌ Evitar
try {
  const user = await getUserProfile();
} catch (error) {
  // handle error
}
```

## 🚨 **Consideraciones Importantes**

1. **El store se inicializa automáticamente** después de login/register
2. **No hacer llamadas directas a `getUserProfile()`** en componentes
3. **Usar `isAuthenticated()` optimizada** que verifica store primero
4. **El logout limpia automáticamente** tanto tokens como store
5. **Los tipos están centralizados** en `types/type.d.ts`

## 🎉 **Resultado Final**

- ✅ **0 llamadas innecesarias** a API para datos de usuario
- ✅ **Información inmediata** disponible en todos los componentes
- ✅ **Estado consistente** y sincronizado
- ✅ **Performance optimizada** y UX mejorada
- ✅ **Código mantenible** y escalable

**¡El sistema de usuario está completamente optimizado!** 🚀
