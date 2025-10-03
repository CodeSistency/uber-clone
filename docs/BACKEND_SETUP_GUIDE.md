# 🚀 Backend Setup Guide - Chat Integration

Esta guía explica cómo configurar el backend para las funcionalidades de chat implementadas en la aplicación Uber Clone.

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para WebSocket scaling)
- Git

## 🛠️ Configuración del Backend

### 1. Clonar y Configurar el Repositorio

```bash
# Clona el repositorio del backend
git clone https://github.com/your-org/uber-backend.git
cd uber-backend

# Instalar dependencias
npm install
```

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uber_db"

# Redis (para WebSocket en producción)
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# CORS
FRONTEND_URL="http://localhost:8081"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload (opcional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Configuración de Base de Datos

Ejecuta las migraciones:

```bash
# Crear base de datos
createdb uber_db

# Ejecutar migraciones
npm run migrate

# (Opcional) Seed con datos de prueba
npm run seed
```

### 4. Iniciar el Servidor

```bash
# Desarrollo con hot reload
npm run dev

# Producción
npm run build
npm start
```

El servidor debería estar corriendo en `http://localhost:3000`

## 🔌 WebSocket Configuration

### Namespace Configuration

El backend debe configurar el namespace `/uber-realtime`:

```typescript
// server.js o app.js
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8081", // Tu app React Native
    methods: ["GET", "POST"],
  },
});

// Configurar namespace
const realtimeIo = io.of("/uber-realtime");

// Middleware de autenticación
realtimeIo.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    // Verificar JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

realtimeIo.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Unirse a salas de chat
  socket.on("joinRideRoom", ({ rideId }) => {
    socket.join(`ride_${rideId}`);
  });

  socket.on("leaveRideRoom", ({ rideId }) => {
    socket.leave(`ride_${rideId}`);
  });

  // Manejar mensajes de chat
  socket.on("chat:message", async (data) => {
    // Procesar mensaje...
  });

  // Manejar indicadores de escritura
  socket.on("typingStart", (data) => {
    socket.to(`ride_${data.rideId}`).emit("typingStart", data);
  });

  socket.on("typingStop", (data) => {
    socket.to(`ride_${data.rideId}`).emit("typingStop", data);
  });
});

server.listen(3000);
```

## 📨 API Endpoints Requeridos

### Chat Endpoints

#### GET /api/chat/:rideId/messages

Obtener historial de mensajes de un viaje.

**Respuesta:**

```json
[
  {
    "id": 1,
    "rideId": 123,
    "senderId": "user_2abc123def456",
    "messageText": "Hola, voy en camino",
    "createdAt": "2024-01-15T10:30:00Z",
    "sender": {
      "id": 1,
      "name": "Juan Pérez",
      "profileImage": "https://example.com/image.jpg"
    }
  }
]
```

#### POST /api/chat/:rideId/messages

Enviar mensaje a un viaje.

**Request Body:**

```json
{
  "senderId": "user_2abc123def456",
  "messageText": "Estoy llegando al punto de recogida"
}
```

#### GET /api/chat/order/:orderId/messages

Obtener historial de mensajes de una orden de delivery.

#### POST /api/chat/order/:orderId/messages

Enviar mensaje a una orden de delivery.

### Esquema de Base de Datos

```sql
-- Tabla de mensajes
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  ride_id INTEGER REFERENCES rides(id),
  order_id INTEGER REFERENCES orders(id),
  sender_id VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Solo uno de ride_id o order_id puede ser null
  CONSTRAINT message_target_check CHECK (
    (ride_id IS NOT NULL AND order_id IS NULL) OR
    (ride_id IS NULL AND order_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX idx_messages_ride_id ON messages(ride_id);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## 🧪 Testing del Backend

### 1. Health Check

```bash
curl http://localhost:3000/api/health
# Debería retornar: {"status": "ok"}
```

### 2. Probar Endpoints de Chat

```bash
# Obtener mensajes de un viaje
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/chat/123/messages

# Enviar mensaje
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"senderId": "user_test", "messageText": "Test message"}' \
     http://localhost:3000/api/chat/123/messages
```

### 3. Probar WebSocket

```javascript
// En browser console o con un cliente WebSocket
const socket = io("http://localhost:3000/uber-realtime", {
  auth: { token: "YOUR_JWT_TOKEN" },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket");
});

socket.on("chat:new-message", (data) => {
  console.log("New message:", data);
});
```

## 🔧 Troubleshooting

### Error: "WebSocket connection failed"

- Verifica que el servidor esté corriendo en el puerto 3000
- Verifica CORS configuration
- Verifica JWT token validity

### Error: "Authentication failed"

- Verifica que el JWT token sea válido
- Verifica que el `JWT_SECRET` sea correcto
- Verifica expiración del token

### Error: "Database connection failed"

- Verifica PostgreSQL esté corriendo
- Verifica `DATABASE_URL` en `.env`
- Verifica credenciales de base de datos

### Performance Issues

- Agrega índices a las tablas de mensajes
- Considera Redis para cache de mensajes recientes
- Implementa pagination para historial largo

## 🚀 Deployment

### Para Desarrollo

```bash
npm run dev
```

### Para Producción

```bash
npm run build
npm start
```

### Con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring

Considera implementar:

- Logs estructurados con Winston
- Métricas con Prometheus
- Health checks automáticos
- Alertas para conexiones WebSocket caídas

## 🎯 Próximos Pasos

1. **Implementar rate limiting** para prevenir spam
2. **Agregar encriptación** para mensajes sensibles
3. **Implementar notificaciones push** via Firebase
4. **Agregar soporte para archivos/media**
5. **Implementar mensajes programados**

---

¡Con esta configuración, tu backend debería estar listo para integrar completamente las funcionalidades de chat de la aplicación Uber Clone! 🎉
