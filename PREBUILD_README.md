# Prebuild System - Uber Clone React Native

Este documento explica cómo funciona el sistema de prebuilds en el proyecto Uber Clone.

## ¿Qué son los Prebuilds?

Los prebuilds son scripts que se ejecutan **antes** de cada compilación/build de la aplicación. Permiten:

- Configurar variables de entorno específicas
- Preparar assets y recursos
- Generar archivos de configuración dinámicos
- Optimizar el bundle para producción
- Gestionar versiones automáticamente
- Configurar servicios externos (Firebase, etc.)

## Estructura del Sistema de Prebuilds

```
scripts/
├── prebuild.js          # Script principal de prebuild
├── setup-env.js         # Configuración inicial de entornos
└── reset-project.js     # Script original del template

environments/            # Configuraciones por entorno (creadas por setup-env.js)
├── development/
│   ├── .env
│   └── google-services.json
├── staging/
│   ├── .env
│   └── google-services.json
└── production/
    ├── .env
    └── google-services.json
```

## Comandos Disponibles

### Configuración Inicial
```bash
# Configurar entornos por primera vez
npm run setup:env
```

### Prebuild Manual
```bash
# Prebuild para desarrollo
npm run prebuild:dev

# Prebuild para producción
npm run prebuild:prod

# Prebuild genérico (detecta automáticamente)
npm run prebuild
```

### Builds con EAS
```bash
# Build de desarrollo (incluye prebuild automáticamente)
eas build --platform android --profile development

# Build de preview
eas build --platform android --profile preview

# Build de producción
eas build --platform android --profile production
```

## Qué hace el Prebuild

### 1. Configuración de Entorno
- Copia variables de entorno específicas del entorno
- Crea archivo `.env` para Expo
- Configura URLs de API y servicios

### 2. Preparación de Assets
- Copia y optimiza imágenes y recursos
- Crea directorio `build-assets/` con assets procesados
- Prepara splash screens e iconos

### 3. Generación de Configuración
- Crea `app.config.js` dinámico con variables de entorno
- Configura bundle identifiers y versiones
- Establece configuraciones específicas de plataforma

### 4. Configuración de Firebase
- Copia configuración de Firebase según el entorno
- Actualiza `google-services.json` automáticamente
- Configura credenciales de autenticación

### 5. Optimización para Producción
- Remueve archivos de desarrollo
- Optimiza el bundle
- Minifica recursos

### 6. Gestión de Versiones
- Sincroniza versiones entre plataformas
- Actualiza `versionName` en Android
- Actualiza `CFBundleVersion` en iOS

## Variables de Entorno

### Desarrollo (`.env.development`)
```env
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3001
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_ENABLE_DEBUG=true
```

### Producción (`.env.production`)
```env
EXPO_PUBLIC_SERVER_URL=https://api.uber-app.com
EXPO_PUBLIC_WS_URL=wss://ws.uber-app.com
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ENABLE_DEBUG=false
EXPO_PUBLIC_ENABLE_ANALYTICS=true
```

## Configuración de EAS Build

El archivo `eas.json` está configurado para ejecutar prebuilds automáticamente:

```json
{
  "build": {
    "development": {
      "prebuildCommand": "npm run prebuild:dev"
    },
    "production": {
      "prebuildCommand": "npm run prebuild:prod"
    }
  }
}
```

## Flujo de Trabajo

### Desarrollo Local
```bash
# 1. Configurar entornos (solo primera vez)
npm run setup:env

# 2. Editar configuraciones en environments/development/
# - Actualizar .env con tus API keys
# - Actualizar google-services.json con tu configuración de Firebase

# 3. Ejecutar prebuild manualmente
npm run prebuild:dev

# 4. Iniciar desarrollo
npm start
```

### Build para Producción
```bash
# 1. Asegurarse de que environments/production/ esté configurado
# 2. Ejecutar build (prebuild se ejecuta automáticamente)
eas build --platform android --profile production
```

### CI/CD
Los prebuilds se ejecutan automáticamente en EAS Build. Solo necesitas:

1. Configurar secrets en EAS
2. Asegurarte de que los archivos de entorno estén actualizados
3. Ejecutar `eas build`

## Troubleshooting

### Prebuild falla
```bash
# Ejecutar con debug
DEBUG=* npm run prebuild:dev

# Ver logs detallados
npm run prebuild:dev 2>&1 | tee prebuild.log
```

### Variables de entorno no se aplican
- Verificar que los archivos `.env` existan en `environments/[env]/`
- Asegurarse de que las variables comiencen con `EXPO_PUBLIC_`
- Reiniciar Metro bundler después de cambios

### Firebase no se configura
- Verificar que `google-services.json` exista en el directorio correcto
- Asegurarse de que el package name coincida en Firebase Console
- Limpiar cache de build: `npx expo install --fix`

### Versiones no se sincronizan
- Verificar versión en `package.json`
- Asegurarse de que los archivos nativos sean editables
- Reiniciar build después de cambios de versión

## Mejores Prácticas

### 1. Nunca commits archivos sensibles
```bash
# Agregar al .gitignore
environments/*/google-services.json
environments/*/.env
*.log
build-assets/
```

### 2. Usar secrets en CI/CD
```bash
# Configurar secrets en EAS
eas secret:create --name FIREBASE_API_KEY --value your_api_key
eas secret:create --name STRIPE_PUBLISHABLE_KEY --value your_stripe_key
```

### 3. Mantener configuraciones sincronizadas
- Usar el mismo `google-services.json` en desarrollo y producción
- Mantener versiones consistentes entre plataformas
- Documentar cambios en configuraciones

### 4. Testing de prebuilds
```bash
# Probar prebuild sin build completo
npm run prebuild:dev

# Verificar que archivos se generaron correctamente
ls -la app.config.js
ls -la .env
ls -la google-services.json
```

## Extensión del Sistema

Para agregar nuevas funcionalidades al prebuild:

1. Editar `scripts/prebuild.js`
2. Agregar nueva función
3. Llamar la función en el flujo principal
4. Actualizar este README

Ejemplo:
```javascript
function setupNewFeature() {
  // Lógica de configuración
  console.log('🔧 Setting up new feature...');
}

// Agregar al flujo principal
console.log('🔧 Setting up new feature...');
setupNewFeature();
```

## Soporte

Si encuentras problemas con el sistema de prebuilds:

1. Revisar logs de build en EAS Dashboard
2. Verificar configuraciones locales
3. Comparar con commits anteriores
4. Crear issue con logs detallados
