# 🎨 UI/UX Wireframes - Uber Driver App

## 📱 **Flujos Principales y Diseño**

---

## 🗺️ **1. Pantalla Principal - Dashboard del Conductor**

### **Estado: Offline (Colapsado)**

```
┌─────────────────────────────────────┐
│ ☰  12 RIDES | $144.50 Today   👤  │ ← Header con estadísticas
├─────────────────────────────────────┤
│                                     │
│           🗺️ MAPA                   │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚨 💰 ⭐ ⚙️ 📍 🎯        │ ← Iconos flotantes
│    │                         │      │
│    │      🚗 Driver          │      │ ← Ubicación del conductor
│    │      Location           │      │
│    │                         │      │
│    │                         │      │
│    │    ┌─────────────┐      │      │
│    │    │ GO ONLINE   │      │      │ ← Botón principal
│    │    │   🟡        │      │      │
│    │    └─────────────┘      │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
├─────────────────────────────────────┤
│ ● Fuera de linea                    │ ← Estado del conductor
│ 🔔 Notificacion                     │ ← Notificación
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │ ← Navegación inferior
└─────────────────────────────────────┘
```

### **Estado: Online (Parcialmente Expandido)**

```
┌─────────────────────────────────────┐
│ ☰  12 RIDES | $144.50 Today   👤  │
├─────────────────────────────────────┤
│           🗺️ MAPA                   │
│                                     │
│    ┌─────────────────────────┐      │
│    │ 🚨 💰 ⭐ ⚙️ 📍 🎯        │ ← Iconos flotantes
│    │                         │      │
│    │      🚗 Driver          │      │
│    │      Location           │      │
│    │                         │      │
│    │                         │      │
│    │    🔴 E                 │      │ ← Botón para ir offline
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
├─────────────────────────────────────┤
│ ● En linea                          │ ← Estado online
│ 🔔 Notificacion                     │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

### **Estado: Expandido (Drawer Completo)**

```
┌─────────────────────────────────────┐
│ ☰  12 RIDES | $144.50 Today   👤  │
├─────────────────────────────────────┤
│           🗺️ MAPA                   │ ← Solo una pequeña parte visible
│                                     │
├─────────────────────────────────────┤
│ ● En linea                          │
│                                     │
│ ┌─────┬─────┬─────┐                 │
│ │Video│Photos│Audio│                 │ ← Tabs de navegación
│ └─────┴─────┴─────┘                 │
│                                     │
│ 🔔 Notificacion                     │
│ 🚕 Carrera                          │
│ 📦 Delivery                         │
│ 📦 Delivery                         │
│ 📦 Delivery                         │
│ 📦 Delivery                         │
│ 🚕 Carrera                          │ ← Lista de elementos
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Conductor              Ir a Home│ │ ← Bottom bar
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

---

## 🎯 **1.1 Iconos Flotantes - Acceso Rápido**

### **Iconos en la Vista Principal**

Los iconos flotantes aparecen en la esquina superior del mapa y abren bottom sheets con opciones específicas:

```
🚨 Seguridad    💰 Ganancias    ⭐ Calificaciones
⚙️ Configuración 📍 Destino     🎯 Promociones
```

### **🚨 Bottom Sheet de Seguridad**

```
┌─────────────────────────────────────┐
│ ← Seguridad                    ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🆘 Emergencia                   │ │ ← Navega a emergencia
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📍 Compartir Viaje              │ │ ← Abre modal compartir
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📞 Contactos Emergencia         │ │ ← Navega a contactos
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Reportar Incidente           │ │ ← Navega a reportes
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚙️ Configuración Seguridad      │ │ ← Navega a config
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **💰 Bottom Sheet de Ganancias**

```
┌─────────────────────────────────────┐
│ ← Ganancias                   ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Ver Detalles                 │ │ ← Navega a dashboard
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💳 Pago Instantáneo             │ │ ← Abre modal pago
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Gráficos por Hora            │ │ ← Navega a análisis
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Promociones Activas          │ │ ← Navega a promociones
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Historial Transacciones      │ │ ← Navega a historial
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **⭐ Bottom Sheet de Calificaciones**

```
┌─────────────────────────────────────┐
│ ← Calificaciones              ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⭐ 4.8 (1,247 calificaciones)   │ │ ← Resumen rápido
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Ver Métricas Completas       │ │ ← Navega a dashboard
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💬 Comentarios Recientes        │ │ ← Navega a comentarios
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Rendimiento por Semana       │ │ ← Navega a análisis
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🆘 Soporte y Ayuda              │ │ ← Navega a soporte
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **⚙️ Bottom Sheet de Configuración**

```
┌─────────────────────────────────────┐
│ ← Configuración               ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Perfil del Conductor         │ │ ← Navega a perfil
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🚗 Mis Vehículos                │ │ ← Navega a vehículos
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Tipos de Servicio            │ │ ← Navega a servicios
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔧 Configuración de App         │ │ ← Navega a config app
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Documentos                   │ │ ← Navega a documentos
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **📍 Bottom Sheet de Destino**

```
┌─────────────────────────────────────┐
│ ← Modo Destino                 ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 Casa                         │ │ ← Destino predefinido
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏢 Trabajo                      │ │ ← Destino predefinido
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📍 Establecer Nuevo Destino     │ │ ← Abre selector
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⏰ Usos restantes: 2/3          │ │ ← Contador de usos
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ℹ️ Solo recibirás viajes que    │ │ ← Información
│ │   te acerquen a tu destino      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **🎯 Bottom Sheet de Promociones**

```
┌─────────────────────────────────────┐
│ ← Promociones                 ✕   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Weekend Warrior              │ │ ← Promoción activa
│ │ 12/20 viajes completados        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💰 Bonificación por Zona        │ │ ← Promoción activa
│ │ 2.5x en Downtown hasta 6PM      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Ver Todas las Promociones    │ │ ← Navega a promociones
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Historial de Bonificaciones  │ │ ← Navega a historial
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔔 Configurar Notificaciones    │ │ ← Navega a config
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 💰 **2. Dashboard de Ganancias**

```
┌─────────────────────────────────────┐
│ ← Ganancias                    ⚙️  │ ← Header con configuración
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Hoy: $144.50                    │ │ ← Resumen del día
│ │ 12 viajes • 8h 15m              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Esta Semana: $1,012.75          │ │ ← Resumen semanal
│ │ 84 viajes • 56h                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Gráfico de Ganancias por Hora   │ │ ← Gráfico interactivo
│ │ ████████████████████████████    │ │
│ │ 6AM  9AM  12PM 3PM  6PM  9PM    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Promociones Activas          │ │ ← Promociones
│ │ Weekend Warrior: 12/20 viajes   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💳 Pago Instantáneo             │ │ ← Pago rápido
│ │ Disponible: $89.50              │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

---

## 🛡️ **3. Kit de Seguridad**

```
┌─────────────────────────────────────┐
│ ← Seguridad                    ⚙️  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🚨 BOTÓN DE EMERGENCIA          │ │ ← Botón principal
│ │                                 │ │
│ │    ┌─────────────┐              │ │
│ │    │    🆘       │              │ │
│ │    │ EMERGENCIA  │              │ │
│ │    └─────────────┘              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📍 Compartir Mi Viaje           │ │ ← Compartir ubicación
│ │ Enviar enlace a contactos       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📞 Contactos de Emergencia      │ │ ← Contactos
│ │ • Emergency Contact 1           │ │
│ │ • Emergency Contact 2           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Reportar Incidente           │ │ ← Reportes
│ │ Último: Hace 2 días             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚙️ Configuración de Seguridad   │ │ ← Configuración
│ │ • Detección de agresividad      │ │
│ │ • Auto-contacto emergencia      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

---

## ⭐ **4. Dashboard de Calificaciones**

```
┌─────────────────────────────────────┐
│ ← Calificaciones              ⚙️  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⭐ 4.8                          │ │ ← Calificación promedio
│ │ 1,247 calificaciones            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Desglose por Estrellas          │ │ ← Gráfico de barras
│ │ ⭐⭐⭐⭐⭐ ████████████████████ 892│ │
│ │ ⭐⭐⭐⭐  ████████ 234            │ │
│ │ ⭐⭐⭐   ███ 89                 │ │
│ │ ⭐⭐    █ 23                   │ │
│ │ ⭐     █ 9                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Métricas de Rendimiento      │ │ ← Métricas
│ │ • Aceptación: 95.2%             │ │
│ │ • Cancelación: 2.1%             │ │
│ │ • Completado: 98.7%             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💬 Comentarios Recientes        │ │ ← Comentarios
│ │ "Excelente conductor!" - John D.│ │
│ │ "Muy profesional" - Sarah M.    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

---

## ⚙️ **5. Configuración del Conductor**

```
┌─────────────────────────────────────┐
│ ← Configuración               ⚙️  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Perfil del Conductor         │ │ ← Perfil
│ │ John Doe • Verificado ✓         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Documentos                   │ │ ← Documentos
│ │ • Licencia ✓                    │ │
│ │ • Seguro ✓                      │ │
│ │ • Registro ✓                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🚗 Vehículos                    │ │ ← Vehículos
│ │ Toyota Camry 2020 (Activo)      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Tipos de Servicio            │ │ ← Servicios
│ │ • UberX ✓                       │ │
│ │ • Uber Comfort ✓                │ │
│ │ • Uber Pet ✗                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚙️ Configuración de App         │ │ ← Configuración
│ │ • Navegación: Uber              │ │
│ │ • Sonidos: Activados            │ │
│ │ • Tema: Automático              │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ⭐ Label  📱 Label  ⚙️ Label        │
└─────────────────────────────────────┘
```

---

## 🔄 **6. Flujos de Navegación con Iconos Flotantes**

### **Flujo de Acceso Rápido**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Vista       │───▶│ Click Icono │───▶│ Bottom      │
│ Principal   │    │ Flotante    │    │ Sheet       │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Seleccionar │───▶│ Navegar a   │
                   │ Opción      │    │ Pantalla    │
                   └─────────────┘    └─────────────┘
```

### **Ejemplos de Flujos Específicos**

#### **Flujo de Seguridad**

```
🚨 Icono Seguridad → Bottom Sheet → 🆘 Emergencia → Pantalla Emergencia
                   → 📍 Compartir → Modal Compartir
                   → 📞 Contactos → Pantalla Contactos
                   → 📋 Reportar → Pantalla Reportes
```

#### **Flujo de Ganancias**

```
💰 Icono Ganancias → Bottom Sheet → 📊 Ver Detalles → Dashboard Ganancias
                   → 💳 Pago → Modal Pago Instantáneo
                   → 📈 Gráficos → Pantalla Análisis
                   → 🎯 Promociones → Pantalla Promociones
```

#### **Flujo de Destino**

```
📍 Icono Destino → Bottom Sheet → 🏠 Casa → Activar Filtro Casa
                 → 🏢 Trabajo → Activar Filtro Trabajo
                 → 📍 Nuevo → Selector de Ubicación
```

---

## 🔄 **7. Flujos de Navegación Principales**

### **Flujo Principal del Conductor**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  Dashboard  │───▶│   Online    │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Solicitud   │
                   │ de Viaje    │
                   └─────────────┘
                           │
                           ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Viaje       │───▶│ Viaje       │
                   │ Activo      │    │ Completado  │
                   └─────────────┘    └─────────────┘
```

### **Flujo de Emergencia**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Viaje       │───▶│ Botón       │───▶│ Servicios   │
│ Activo      │    │ Emergencia  │    │ Emergencia  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Contactos   │───▶│ Ubicación   │
                   │ Notificados │    │ Compartida  │
                   └─────────────┘    └─────────────┘
```

---

## 🎨 **7. Sistema de Colores y Estados**

### **Paleta de Colores**

```
🟡 Amarillo (#FFD700) - Estados activos, botones principales
🔴 Rojo (#FF4444)     - Emergencias, errores, offline
🟢 Verde (#44FF44)    - Online, éxito, completado
🔵 Azul (#4444FF)     - Información, enlaces
⚫ Negro (#000000)    - Texto principal
⚪ Blanco (#FFFFFF)   - Fondo, texto secundario
```

### **Estados Visuales**

```
🟢 Online    - Punto verde + "En linea"
🔴 Offline   - Punto rojo + "Fuera de linea"
🟡 Activo    - Fondo amarillo + texto negro
⚫ Inactivo  - Fondo gris + texto blanco
```

---

## 📱 **8. Responsive Design**

### **Breakpoints**

```
📱 Mobile (320px - 768px)
   - Navegación inferior
   - Bottom sheets
   - Gestos táctiles

💻 Tablet (768px - 1024px)
   - Navegación lateral
   - Paneles expandidos
   - Más información visible

🖥️ Desktop (1024px+)
   - Navegación completa
   - Múltiples paneles
   - Teclado y mouse
```

---

## 🎯 **9. Principios de UX**

### **Usabilidad**

- **Acceso rápido** a funciones críticas mediante iconos flotantes
- **Bottom sheets** para opciones sin salir del contexto
- **Feedback visual** inmediato en todas las interacciones
- **Gestos intuitivos** para navegación
- **Estados claros** en todo momento
- **Navegación contextual** desde la vista principal

### **Accesibilidad**

- **Contraste alto** para legibilidad
- **Tamaños de toque** apropiados (44px mínimo)
- **Navegación por teclado** en desktop
- **Lector de pantalla** compatible

### **Performance**

- **Carga rápida** de pantallas principales
- **Animaciones suaves** (60fps)
- **Caché inteligente** de datos
- **Optimización** de imágenes y mapas

---

## 🚀 **10. Próximos Pasos de Implementación**

### **Fase 1: Iconos Flotantes**

1. **Crear componente `FloatingIcons`** con los 6 iconos principales
2. **Implementar bottom sheets** para cada categoría
3. **Configurar navegación** desde bottom sheets a pantallas completas
4. **Añadir animaciones** de entrada/salida de bottom sheets

### **Fase 2: Componentes Base**

1. **Crear componentes base** siguiendo los wireframes
2. **Implementar navegación** entre pantallas
3. **Integrar stores** con componentes UI
4. **Añadir animaciones** y transiciones

### **Fase 3: Testing y Optimización**

1. **Testing de usabilidad** con usuarios reales
2. **Optimización de performance** de bottom sheets
3. **Refinamiento de UX** basado en feedback
4. **Documentación de componentes**

### **Componentes a Crear**

```typescript
// Componentes principales
<FloatingIcons />           // Iconos flotantes en el mapa
<SafetyBottomSheet />       // Bottom sheet de seguridad
<EarningsBottomSheet />     // Bottom sheet de ganancias
<RatingsBottomSheet />      // Bottom sheet de calificaciones
<ConfigBottomSheet />       // Bottom sheet de configuración
<DestinationBottomSheet />  // Bottom sheet de destino
<PromotionsBottomSheet />   // Bottom sheet de promociones
```

---

**Este documento sirve como guía visual para el desarrollo de la UI/UX de la aplicación Uber Driver, asegurando consistencia y usabilidad en toda la experiencia del conductor.**
