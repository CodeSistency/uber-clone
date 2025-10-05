# Sistema de Perfil de Usuario

Este directorio contiene todas las vistas relacionadas con el perfil del usuario en la aplicación de customer.

## Estructura

```
profile/
├── index.tsx                    # Vista principal de perfil
├── edit-basic-info/
│   └── index.tsx               # Editar datos básicos
├── change-email/
│   ├── index.tsx               # Cambiar email
│   └── verify.tsx              # Verificar email
├── change-phone/
│   ├── index.tsx               # Cambiar teléfono
│   └── verify.tsx              # Verificar teléfono
├── verify-account/
│   ├── index.tsx               # Verificar cuenta con DNI
│   └── status.tsx              # Estado de verificación
├── change-location/
│   └── index.tsx               # Cambiar ubicación
├── addresses/
│   ├── index.tsx               # Gestión de direcciones
│   └── add/
│       └── index.tsx           # Agregar dirección
└── preferences/
    └── index.tsx               # Configuraciones y tema
```

## Funcionalidades

### Vista Principal (`index.tsx`)
- Muestra información del usuario con imagen de perfil
- Badge de estado de verificación (verificado/pendiente/no verificado)
- Navegación a todas las secciones de configuración
- Secciones organizadas: Personal Information, Preferences, Services, Account

### Edición de Datos Básicos (`edit-basic-info/`)
- Formulario para editar nombre, apellido, fecha de nacimiento, género
- Validación de campos requeridos
- Integración con DatePicker para fecha de nacimiento
- Selector de género

### Cambio de Email (`change-email/`)
- Formulario para cambiar email con verificación de contraseña
- Pantalla de verificación con código de 6 dígitos
- Validación de email y confirmación
- Resend de código con cooldown

### Cambio de Teléfono (`change-phone/`)
- Formulario para cambiar número de teléfono
- Selector de código de país
- Verificación por SMS con código de 6 dígitos
- Validación de formato de teléfono

### Verificación de Cuenta (`verify-account/`)
- Subida de documentos de identidad (DNI, pasaporte, etc.)
- Captura de fotos frontal y trasera
- Estados de verificación: pendiente, aprobado, rechazado
- Información adicional opcional

### Cambio de Ubicación (`change-location/`)
- Selectores jerárquicos: país → estado → ciudad
- Código postal
- Dirección opcional
- Preview de ubicación actual

### Gestión de Direcciones (`addresses/`)
- Lista de direcciones guardadas (casa, trabajo, gym, etc.)
- Agregar nuevas direcciones con mapa
- Editar y eliminar direcciones
- Establecer dirección por defecto
- Tipos de dirección con iconos

### Preferencias (`preferences/`)
- Configuración de tema (auto, claro, oscuro)
- Idioma de la aplicación
- Zona horaria
- Moneda de visualización
- Configuraciones de notificaciones
- Configuraciones de privacidad

## Store de Perfil

El sistema utiliza `useProfileStore` para manejar el estado del perfil:

```typescript
// Datos del perfil
const profileData = useProfileData();

// Estado de verificación
const verificationStatus = useVerificationStatus();

// Acciones
const { updateBasicInfo, updateLocation, addAddress } = useProfileActions();
```

## Componentes UI Utilizados

- `AppHeader`: Navegación consistente
- `Card`: Contenedores de secciones
- `TextField`: Inputs de texto
- `Select`: Selectores desplegables
- `Button`: Botones de acción
- `Switch`: Toggles de configuración
- `Badge`: Estados de verificación

## Navegación

Todas las vistas están configuradas en el layout de customer:

```typescript
// En (customer)/_layout.tsx
<Stack.Screen name="profile" options={{ headerShown: false }} />
```

## Persistencia

Los datos del perfil se persisten localmente usando AsyncStorage a través de Zustand persist middleware.

## Datos de Ejemplo

Se incluyen datos de ejemplo en `lib/profileData.ts` para desarrollo y testing.

## Convenciones

- Todas las vistas usan `AppHeader` para navegación
- Formularios incluyen validación completa
- Estados de carga y error manejados consistentemente
- Navegación con `router.push()` y `router.back()`
- Estilos con NativeWind (Tailwind CSS)
