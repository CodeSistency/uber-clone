# 🚗 Referencia Visual ASCII - Drivers Frontend Implementation

## 📋 Propósito

Este documento contiene **prototipos visuales de referencia** en arte ASCII para las vistas de gestión del módulo de drivers. **IMPORTANTE**: Estos prototipos sirven únicamente como guía visual de diseño.

**🔴 NO IMPLEMENTAR CON DUMMY DATA**: Todas las vistas deben integrarse con los endpoints reales del backend según el plan de desarrollo principal.

Los prototipos sirven como:
- **Guía visual** para layouts y componentes `@ui/`
- **Referencia de UX/UI** durante el desarrollo
- **Validación visual** contra implementaciones reales
- **Documentación de requisitos** de interfaz

**Nota**: Algunos prototipos han sido removidos porque la funcionalidad ya existe en el sistema de flujo unificado (`driver-unified-flow-demo.tsx`).

---

## 👤 [T1.4.0] Prototipos de Perfil del Conductor

### [ST1.4.0.1] Perfil Principal

```
┌─────────────────────────────────────────┐
│           Driver Profile                │
├─────────────────────────────────────────┤
│                                         │
│           [👤 Avatar]                   │
│                                         │
│        Carlos Rodriguez                  │
│           ⭐ 4.8 (142 rides)            │
│                                         │
├─────────────────────────────────────────┤
│ 📊 Today's Stats                        │
├─────────────────────────────────────────┤
│ 💰 Earnings: $127.50     🏁 Rides: 8    │
│ ⏱️  Online: 6h 42m       📍 Location: ON│
├─────────────────────────────────────────┤
│ 📞 Contact Info                         │
├─────────────────────────────────────────┤
│ Email: carlos@email.com                 │
│ Phone: +1 (555) 123-4567               │
│ City: Miami, FL                         │
├─────────────────────────────────────────┤
│ [ Edit Profile ]    [ View Stats ]       │
│ [ Documents ]       [ Settings ]         │
└─────────────────────────────────────────┘
```

### [ST1.4.0.2] Edición de Perfil

```
┌─────────────────────────────────────────┐
│        Edit Driver Profile              │
├─────────────────────────────────────────┤
│ 👤 Profile Picture                      │
│ ┌─────────────────┐  [Change Photo]     │
│ │     [Photo]     │                     │
│ └─────────────────┘                     │
├─────────────────────────────────────────┤
│ 📝 Personal Information                 │
├─────────────────────────────────────────┤
│ First Name: [Carlos_________]           │
│ Last Name:  [Rodriguez_____]            │
│ Email:      [carlos@email.com] ✓        │
│ Phone:      [+1 (555) 123-4567] ✓       │
│ Address:    [123 Main St, Miami]        │
├─────────────────────────────────────────┤
│ 🚗 Vehicle Preferences                  │
├─────────────────────────────────────────┤
│ Max Passengers: [4]  □ Child Seats      │
│ □ Pets Allowed     □ Music Allowed      │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Save Changes ] │
└─────────────────────────────────────────┘
```

### [ST1.4.0.3] Estadísticas Detalladas

```
┌─────────────────────────────────────────┐
│        Driver Statistics                │
├─────────────────────────────────────────┤
│ 📅 Period: [ This Week ▼ ]              │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════════╗ │
│ ║            Earnings Chart             ║ │
│ ║                                       ║ │
│ ║          ████ ████████ ███            ║ │
│ ║        ██    █        █   ██          ║ │
│ ║      ██      █        █     ██        ║ │
│ ║    ██        █        █       ██      ║ │
│ ║  ██          █        █         ██    ║ │
│ ╚═══════════════════════════════════════╝ │
├─────────────────────────────────────────┤
│ 💰 Weekly Earnings: $1,247.50           │
│ 🏁 Total Rides: 67                      │
│ ⭐ Average Rating: 4.8                  │
│ ⏱️  Online Hours: 42.5                  │
│ 📈 Completion Rate: 94%                 │
├─────────────────────────────────────────┤
│ Top Performing Days:                    │
│ Mon: $245.50  Tue: $189.20  Wed: $267.80│
│ Thu: $198.30  Fri: $346.70              │
└─────────────────────────────────────────┘
```

---

## 🚗 [T1.5.0] Prototipos de Gestión de Vehículos

### [ST1.5.0.1] Lista de Vehículos

```
┌─────────────────────────────────────────┐
│          My Vehicles                     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🚗 Toyota Camry 2020               │ │
│ │ License: ABC-123                   │ │
│ │ ⭐ 4.8 Rating  ✅ Verified          │ │
│ │ 💺 4 seats  🎵 Music ON             │ │
│ │ [ View Details ] [ Set Default ]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚙 Honda Civic 2019                 │ │
│ │ License: XYZ-789                   │ │
│ │ ⭐ 4.6 Rating  ✅ Verified          │ │
│ │ 💺 4 seats  🎵 Music OFF            │ │
│ │ [ View Details ] [ Set Default ]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🛻 Ford F-150 2018                  │ │
│ │ License: DEF-456                   │ │
│ │ ⚠️  Pending Verification            │ │
│ │ 💺 5 seats  🎵 Music ON             │ │
│ │ [ View Details ] [ Edit ]           │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│           ➕ Add New Vehicle            │
└─────────────────────────────────────────┘
```

### [ST1.5.0.2] Detalles del Vehículo

```
┌─────────────────────────────────────────┐
│      Vehicle Details                    │
├─────────────────────────────────────────┤
│ 🚗 Toyota Camry 2020                    │
│ ┌─────────────────┐                     │
│ │   [Vehicle      │                     │
│ │    Photo]       │                     │
│ └─────────────────┘                     │
├─────────────────────────────────────────┤
│ 📋 Basic Information                    │
├─────────────────────────────────────────┤
│ Make: Toyota        Model: Camry        │
│ Year: 2020         Color: Silver        │
│ License Plate: ABC-123                  │
│ VIN: 1HGCM82633A123456                  │
├─────────────────────────────────────────┤
│ ⚙️ Features & Capacity                  │
├─────────────────────────────────────────┤
│ Seating Capacity: 4                     │
│ □ Air Conditioning    ✅ Music System   │
│ □ GPS Navigation     □ Child Seats      │
│ □ Pets Allowed                         │
├─────────────────────────────────────────┤
│ 📄 Documents Status                     │
├─────────────────────────────────────────┤
│ 🟢 Insurance: Verified                  │
│ 🟢 Registration: Verified               │
│ 🟢 Inspection: Verified                 │
│ 🟡 Photos: 2/4 uploaded                 │
├─────────────────────────────────────────┤
│ [ Edit Vehicle ]    [ View Documents ]  │
└─────────────────────────────────────────┘
```

### [ST1.5.0.3] Añadir Vehículo (Multi-step)

```
┌─────────────────────────────────────────┐
│     Add New Vehicle (Step 1/3)          │
├─────────────────────────────────────────┤
│ 📝 Step 1: Basic Information            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
├─────────────────────────────────────────┤
│ Make:          [___________ ▼]          │
│ Model:         [___________ ▼]          │
│ Year:          [2024________]           │
│ Color:         [___________ ▼]          │
│ License Plate: [___________]            │
│ VIN (Optional):[___________]            │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Next Step ]   │
└─────────────────────────────────────────┘
```

---

## 💰 [T1.6.0] Prototipos Financieros

### [ST1.6.0.1] Dashboard de Ganancias

```
┌─────────────────────────────────────────┐
│       Earnings Dashboard                │
├─────────────────────────────────────────┤
│ 📅 This Week Overview                   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 💰 Weekly Earnings                  │ │
│ │                                     │ │
│ │        $1,247.50                     │ │
│ │    ▲ +12.5% vs last week            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏁 Total Rides                       │ │
│ │                                     │ │
│ │           67                         │ │
│ │    ▲ +8 vs last week                 │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 📈 Weekly Trend                        │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════════╗ │
│ ║ Mon Tue Wed Thu Fri Sat Sun          ║ │
│ ║ ███ ███ ████ ███ ████ ██ █           ║ │
│ ╚═══════════════════════════════════════╝ │
├─────────────────────────────────────────┤
│ 💳 Next Payout                          │
├─────────────────────────────────────────┤
│ Amount: $1,247.50                       │
│ Date: Friday, Dec 15                    │
│ Method: Bank Transfer                   │
├─────────────────────────────────────────┤
│ [ View History ]    [ Payment Methods ] │
└─────────────────────────────────────────┘
```

### [ST1.6.0.2] Historial de Pagos

```
┌─────────────────────────────────────────┐
│       Payment History                   │
├─────────────────────────────────────────┤
│ Filter: [ All ▼ ]  Period: [ This Month ▼ ]
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Dec 10, 2024                        │ │
│ │ 💰 $245.50 - 12 rides               │ │
│ │ ✅ Paid via Bank Transfer           │ │
│ │ [ View Receipt ▼ ]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Dec 03, 2024                        │ │
│ │ 💰 $198.75 - 8 rides                │ │
│ │ ✅ Paid via Bank Transfer           │ │
│ │ [ View Receipt ▼ ]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Nov 26, 2024                        │ │
│ │ 💰 $312.25 - 15 rides               │ │
│ │ ✅ Paid via Bank Transfer           │ │
│ │ [ View Receipt ▼ ]                  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 📊 Summary                             │
├─────────────────────────────────────────┤
│ Total Earned: $8,456.75                │
│ Total Paid: $8,456.75                  │
│ Pending: $0.00                         │
├─────────────────────────────────────────┤
│ [ Export Report ]   [ Filter Options ] │
└─────────────────────────────────────────┘
```

---

## 📄 [T1.7.0] Prototipos de Documentos

### [ST1.7.0.1] Centro de Documentos

```
┌─────────────────────────────────────────┐
│      Documents Center                   │
├─────────────────────────────────────────┤
│ 📊 Verification Status: 85% Complete    │
│ ████████░░░░░░░ 8/10 documents          │
├─────────────────────────────────────────┤
│ 🟢 Required Documents                   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🪪 Driver's License                 │ │
│ │ ✅ Verified  Exp: 12/2025           │ │
│ │ [ View ] [ Re-upload ]              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚗 Vehicle Registration              │ │
│ │ ✅ Verified  Exp: 06/2025           │ │
│ │ [ View ] [ Re-upload ]              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🛡️  Insurance Policy                │ │
│ │ 🟡 Pending Review                   │ │
│ │ [ View ] [ Re-upload ]              │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 🔴 Missing Documents                   │
├─────────────────────────────────────────┤
│ ⚠️ Background Check - Required         │
│ ⚠️ Vehicle Photos - Required           │
├─────────────────────────────────────────┤
│ [ Upload Document ] [ Help Center ]    │
└─────────────────────────────────────────┘
```

### [ST1.7.0.2] Subida de Documentos

```
┌─────────────────────────────────────────┐
│      Upload Document                    │
├─────────────────────────────────────────┤
│ 📄 Document Type                        │
├─────────────────────────────────────────┤
│ [ Driver's License ▼ ]                  │
│                                         │
│ 📷 Take Photo or Upload                 │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │          📷 📁                       │ │
│ │                                     │ │
│ │   Tap to add photo or                │ │
│ │   choose from gallery                │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ℹ️ Requirements                         │
├─────────────────────────────────────────┤
│ • Clear, well-lit photo                 │
│ • All text must be readable             │
│ • No glare or shadows                   │
│ • Document must be valid               │
├─────────────────────────────────────────┤
│ 📎 Attached Files                       │
├─────────────────────────────────────────┤
│ 📄 license_front.jpg (2.3MB)           │
│ 📄 license_back.jpg (2.1MB)            │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Upload ]      │
└─────────────────────────────────────────┘
```

---

**Nota**: Los prototipos de Dashboard (T1.8.0) han sido eliminados del plan ya que esta funcionalidad ya está completamente implementada en el sistema de flujo unificado existente (`driver-unified-flow-demo.tsx`).

## 🎨 Guía de Estilos ASCII

### Símbolos Utilizados

```
👤 Avatar/Usuario      🚗 Coche/Vehículo      💰 Dinero/Ganancias
⭐ Rating/Estrellas    🏁 Viajes/Rides        ⏱️ Tiempo/Reloj
📍 Ubicación/Mapa      📞 Teléfono           📧 Email
✅ Verificado/OK       ❌ Error/No           ⚠️ Advertencia
🟢 Verde/Activo        🔴 Rojo/Inactivo      🟡 Amarillo/Pendiente
📊 Estadísticas        📈 Gráficos           📄 Documentos
🔧 Configuración       🔔 Notificaciones     🎯 Acciones
```

### Patrones de Layout

```
Cards con bordes redondeados:
┌─────────────────────────────────────┐
│ Título del Card                     │
├─────────────────────────────────────┤
│ Contenido del card                  │
│ Más contenido...                    │
└─────────────────────────────────────┘

Botones:
[ Acción Principal ]    [ Acción Secundaria ]

Indicadores de estado:
🟢 Online Status: Active
🔴 Offline Status: Inactive

Gráficos simples:
╔═══════════════════════════════════════╗
║            Chart Title               ║
║                                       ║
║          ████ ████████ ███            ║
║        ██    █        █   ██          ║
╚═══════════════════════════════════════╝
```

---

## 📝 Notas de Implementación

- **Escala**: Los prototipos están diseñados para mobile (375px-414px width)
- **Colores**: Usar el sistema de colores definido en `tailwind.config.js`
- **Componentes**: Todos los elementos deben mapearse a componentes de `@ui/`
- **Responsive**: Considerar diferentes tamaños de pantalla
- **Accesibilidad**: Incluir labels y estados para screen readers

---

*Última actualización: $(date)*
*Versión: 1.0*
