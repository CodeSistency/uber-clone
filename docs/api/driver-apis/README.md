# Driver APIs Documentation

Esta documentación describe todas las APIs relacionadas con conductores (drivers) en la aplicación Uber Clone.

## Arquitectura General

### Servicios Principales

Los servicios de drivers están organizados en módulos especializados:

- **driverService**: Gestión del perfil del conductor
- **vehicleService**: Gestión de vehículos
- **documentService**: Gestión de documentos y verificación
- **earningsService**: Gestión de ganancias y estadísticas financieras

### Patrón de Respuesta API

Todas las APIs siguen un patrón consistente de respuesta:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  statusCode: number;
  timestamp: Date;
}
```

### Manejo de Errores

Los errores siguen el formato estándar:

```typescript
interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: ValidationError[];
  timestamp: Date;
}
```

## Driver Profile API

### Endpoints Principales

#### GET /drivers/profile
Obtiene el perfil completo del conductor autenticado.

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "id": "driver_123",
    "userId": "user_456",
    "firstName": "Carlos",
    "lastName": "Rodriguez",
    "email": "carlos@example.com",
    "phone": "+1234567890",
    "rating": 4.8,
    "totalRides": 1247,
    "joinDate": "2023-01-15",
    "status": "active",
    "isOnline": true,
    "currentLocation": {
      "latitude": 25.7617,
      "longitude": -80.1918,
      "address": "Miami, FL"
    },
    "preferences": {
      "notifications": true,
      "autoAccept": false,
      "maxDistance": 50
    }
  }
}
```

#### PUT /drivers/profile
Actualiza el perfil del conductor.

**Request Body:**
```typescript
{
  "firstName": "Carlos",
  "lastName": "Rodriguez",
  "phone": "+1234567890",
  "preferences": {
    "notifications": true,
    "autoAccept": false,
    "maxDistance": 50
  }
}
```

#### POST /drivers/profile/photo
Sube una foto de perfil.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photo`: File (image/jpeg, image/png, max 5MB)

#### GET /drivers/profile/verification-status
Obtiene el estado de verificación del conductor.

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "isVerified": true,
    "verificationLevel": "full",
    "verifiedAt": "2024-01-15T10:30:00Z",
    "documentsVerified": 4,
    "documentsPending": 0,
    "documentsRejected": 0
  }
}
```

## Vehicle API

### Endpoints Principales

#### GET /drivers/vehicles
Obtiene todos los vehículos del conductor.

**Parámetros de Query:**
- `status`: `active | inactive | pending | rejected` (opcional)
- `limit`: número (opcional, default: 10)
- `offset`: número (opcional, default: 0)

**Respuesta:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "vehicle_123",
      "driverId": "driver_456",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "licensePlate": "ABC123",
      "color": "White",
      "seats": 4,
      "status": "active",
      "insurancePolicyNumber": "INS123456",
      "insuranceProvider": "State Farm",
      "insuranceExpiry": "2024-12-31",
      "registrationNumber": "REG789012",
      "registrationExpiry": "2024-12-31",
      "createdAt": "2023-06-15T08:30:00Z",
      "updatedAt": "2024-01-10T14:20:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

#### POST /drivers/vehicles
Registra un nuevo vehículo.

**Request Body:**
```typescript
{
  "make": "Honda",
  "model": "Civic",
  "year": 2021,
  "licensePlate": "XYZ789",
  "color": "Blue",
  "seats": 4,
  "insurancePolicyNumber": "INS789012",
  "insuranceProvider": "Geico",
  "insuranceExpiry": "2025-06-30",
  "registrationNumber": "REG345678",
  "registrationExpiry": "2025-06-30"
}
```

#### PUT /drivers/vehicles/{vehicleId}
Actualiza un vehículo existente.

**Request Body:**
```typescript
{
  "status": "inactive",
  "insuranceExpiry": "2025-12-31"
}
```

#### DELETE /drivers/vehicles/{vehicleId}
Elimina un vehículo (solo si no está en uso).

#### POST /drivers/vehicles/{vehicleId}/photos
Sube fotos del vehículo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `front`: File (image)
- `back`: File (image)
- `interior`: File (image)
- `damage`: File (image, opcional)

#### PUT /drivers/vehicles/{vehicleId}/status
Cambia el estado del vehículo.

**Request Body:**
```typescript
{
  "status": "active"
}
```

**Estados válidos:**
- `active`: Vehículo disponible para viajes
- `inactive`: Vehículo temporalmente inactivo
- `maintenance`: En mantenimiento
- `pending`: Pendiente de verificación
- `rejected`: Rechazado en verificación

#### GET /drivers/vehicles/{vehicleId}/verification
Obtiene el estado de verificación del vehículo.

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "vehicleId": "vehicle_123",
    "isVerified": true,
    "verificationStatus": "approved",
    "verifiedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2025-01-15T10:30:00Z",
    "rejectionReason": null,
    "requiredActions": []
  }
}
```

## Document API

### Endpoints Principales

#### GET /drivers/documents
Obtiene todos los documentos del conductor.

**Parámetros de Query:**
- `status`: `pending | approved | rejected | expired` (opcional)
- `type`: tipo de documento (opcional)

**Respuesta:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "driverId": "driver_456",
      "type": "driver_license",
      "name": "Driver License",
      "status": "approved",
      "uploadedAt": "2024-01-10T09:15:00Z",
      "verifiedAt": "2024-01-12T14:30:00Z",
      "expiresAt": "2026-01-10T00:00:00Z",
      "rejectionReason": null,
      "isRequired": true,
      "downloadUrl": "https://api.uber-clone.com/documents/doc_123.pdf"
    }
  ]
}
```

#### POST /drivers/documents
Sube un nuevo documento.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (PDF, JPG, PNG, max 10MB)
- `type`: `driver_license | insurance | registration | background_check`
- `name`: string (opcional, nombre descriptivo)

#### PUT /drivers/documents/{documentId}
Actualiza un documento existente.

**Request Body:**
```typescript
{
  "name": "Updated Driver License"
}
```

#### DELETE /drivers/documents/{documentId}
Elimina un documento.

#### POST /drivers/documents/{documentId}/reupload
Re-subir un documento rechazado.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (nuevo archivo)

#### GET /drivers/documents/types
Obtiene los tipos de documentos requeridos.

**Respuesta:**
```typescript
{
  "success": true,
  "data": [
    {
      "type": "driver_license",
      "name": "Driver License",
      "description": "Valid driver's license",
      "isRequired": true,
      "maxFileSize": 5242880,
      "allowedFormats": ["pdf", "jpg", "png"],
      "expires": true
    }
  ]
}
```

#### GET /drivers/documents/verification-status
Obtiene el estado general de verificación de documentos.

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "overallStatus": "pending",
    "totalDocuments": 4,
    "approvedDocuments": 2,
    "pendingDocuments": 1,
    "rejectedDocuments": 1,
    "expiredDocuments": 0,
    "nextVerificationCheck": "2024-01-20T10:00:00Z"
  }
}
```

## Earnings API

### Endpoints Principales

#### GET /drivers/earnings/summary
Obtiene el resumen de ganancias del conductor.

**Parámetros de Query:**
- `period`: `today | week | month | total` (opcional, default: today)

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "today": {
      "rides": 12,
      "earnings": 144.5,
      "hours": 8.5,
      "averagePerRide": 12.04,
      "tips": 25.5,
      "bonuses": 15.0
    },
    "week": {
      "rides": 67,
      "earnings": 892.3,
      "hours": 45.2,
      "averagePerRide": 13.32,
      "tips": 125.8,
      "bonuses": 75.0
    },
    "month": {
      "rides": 234,
      "earnings": 3245.8,
      "hours": 156.7,
      "averagePerRide": 13.87,
      "tips": 450.2,
      "bonuses": 200.0
    },
    "total": {
      "rides": 1234,
      "earnings": 18765.4,
      "hours": 987.3,
      "averagePerRide": 15.21,
      "tips": 2345.6,
      "bonuses": 1200.0
    }
  }
}
```

#### GET /drivers/earnings/history
Obtiene el historial de viajes con ganancias.

**Parámetros de Query:**
- `startDate`: fecha ISO (opcional)
- `endDate`: fecha ISO (opcional)
- `limit`: número (opcional, default: 50)
- `offset`: número (opcional, default: 0)

**Respuesta:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "trip_123",
      "date": "2024-01-15T14:30:00Z",
      "passengerName": "John Doe",
      "pickupLocation": "Downtown Miami",
      "dropoffLocation": "Miami International Airport",
      "fare": 42.5,
      "tip": 8.5,
      "bonus": 5.0,
      "total": 56.0,
      "duration": 45,
      "distance": 25.5,
      "serviceType": "UberX",
      "rating": 5.0,
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /drivers/earnings/promotions
Obtiene las promociones activas y desafíos.

**Respuesta:**
```typescript
{
  "success": true,
  "data": {
    "promotions": [
      {
        "id": "promo_123",
        "name": "Weekend Bonus",
        "description": "Earn extra 20% on weekend rides",
        "type": "bonus",
        "value": 0.2,
        "target": 100,
        "progress": 65,
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2024-01-21T23:59:59Z",
        "isActive": true
      }
    ],
    "challenges": [
      {
        "id": "challenge_123",
        "name": "50 Rides This Week",
        "description": "Complete 50 rides to earn bonus",
        "progress": 32,
        "target": 50,
        "reward": 25,
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2024-01-21T23:59:59Z",
        "isActive": true,
        "category": "rides"
      }
    ]
  }
}
```

## WebSocket Events

### Eventos de Estado del Conductor

#### driver:status-update
```typescript
{
  "event": "driver:status-update",
  "data": {
    "driverId": "driver_123",
    "status": "online",
    "location": {
      "latitude": 25.7617,
      "longitude": -80.1918
    },
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

#### driver:vehicle-status-update
```typescript
{
  "event": "driver:vehicle-status-update",
  "data": {
    "driverId": "driver_123",
    "vehicleId": "vehicle_456",
    "status": "active",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Eventos de Viajes

#### driver:trip-request
```typescript
{
  "event": "driver:trip-request",
  "data": {
    "tripId": "trip_123",
    "passengerId": "passenger_456",
    "pickup": {
      "latitude": 25.7617,
      "longitude": -80.1918,
      "address": "Downtown Miami"
    },
    "dropoff": {
      "latitude": 25.7932,
      "longitude": -80.2906,
      "address": "Miami International Airport"
    },
    "estimatedFare": 42.5,
    "estimatedDistance": 25.5,
    "estimatedDuration": 45,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

#### driver:trip-accepted
```typescript
{
  "event": "driver:trip-accepted",
  "data": {
    "tripId": "trip_123",
    "driverId": "driver_456",
    "passengerId": "passenger_789",
    "estimatedArrivalTime": 5,
    "timestamp": "2024-01-15T14:31:00Z"
  }
}
```

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos |
| 401 | No autorizado |
| 403 | Acceso prohibido |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: vehículo ya existe) |
| 422 | Validación fallida |
| 429 | Demasiadas peticiones |
| 500 | Error interno del servidor |

## Rate Limiting

- **Profile APIs**: 100 requests/minute
- **Vehicle APIs**: 50 requests/minute
- **Document APIs**: 20 requests/minute (uploads), 100 requests/minute (reads)
- **Earnings APIs**: 200 requests/minute

## Autenticación

Todas las APIs requieren autenticación mediante Bearer token:

```
Authorization: Bearer <jwt_token>
```

Los tokens deben incluirse en el header de todas las peticiones.
