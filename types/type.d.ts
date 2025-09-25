import { TextInputProps, TouchableOpacityProps } from "react-native";

declare interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
}

declare interface MarkerData {
  latitude: number;
  longitude: number;
  id: number;
  title: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
  selectedDriver?: number | null;
  onMapReady?: () => void;
}

declare interface Ride {
  ride_id?: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: string;
  driver_id: number;
  user_id: number;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
  };
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
  loading?: boolean;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

declare interface PaymentProps {
  fullName: string;
  email: string;
  amount: string;
  driverId: number;
  rideTime: number;
}

// Notification Types
declare interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "critical";
}

declare interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  rideUpdates: boolean;
  driverMessages: boolean;
  promotional: boolean;
  emergencyAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Real-time Types
declare interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: Date;
  rideId?: number;
}

declare interface RideStatusUpdate {
  rideId: number;
  status: RideStatus;
  timestamp: Date;
  location?: LocationData;
  estimatedArrival?: Date;
}

// Chat Types
declare interface ChatMessage {
  id: number;
  rideId?: number;        // Para mensajes de viaje (opcional)
  orderId?: number;       // Para mensajes de delivery (opcional)
  senderId: string;       // Clerk ID del remitente
  messageText: string;    // Contenido del mensaje (máx. 1000 chars)
  createdAt: string;      // Timestamp ISO string
  isRead?: boolean;       // Para compatibilidad con UI existente
  messageType?: "text" | "location" | "system"; // Para compatibilidad
  timestamp?: Date;       // Para compatibilidad con UI existente
  sender?: {              // Información del remitente
    id: number;
    name: string;
    profileImage?: string;
  };
}

// Emergency Types
declare interface EmergencyAlert {
  id: string;
  rideId: number;
  userId: string;
  type: "sos" | "accident" | "medical" | "other";
  location: LocationData;
  timestamp: Date;
  status: "active" | "resolved" | "cancelled";
  description?: string;
}

declare interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

// Device & Connection Types
declare interface DeviceToken {
  token: string;
  deviceType: "ios" | "android";
  deviceId: string;
  isActive: boolean;
}

declare interface ConnectionStatus {
  isConnected: boolean;
  connectionType: "wifi" | "cellular" | "none";
  websocketConnected: boolean;
  lastPing: Date;
}

// Location Types
declare interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

// Enums
declare type NotificationType =
  | "RIDE_REQUEST"
  | "RIDE_ACCEPTED"
  | "RIDE_CANCELLED"
  | "DRIVER_ARRIVED"
  | "RIDE_STARTED"
  | "RIDE_COMPLETED"
  | "PAYMENT_SUCCESS"
  | "CHAT_MESSAGE"
  | "EMERGENCY_ALERT"
  | "SYSTEM_UPDATE";

declare type WebSocketMessageType =
  | "RIDE_CREATED"
  | "RIDE_STATUS_UPDATED"
  | "DRIVER_LOCATION_UPDATE"
  | "NEW_MESSAGE"
  | "DRIVER_JOINED_RIDE"
  | "PASSENGER_JOINED_RIDE"
  | "EMERGENCY_TRIGGERED"
  | "RIDE_CANCELLED"
  | "TYPING_START"
  | "TYPING_STOP";

declare type RideStatus =
  | "requested"
  | "accepted"
  | "arriving"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "emergency";

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number | null) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
  onDetailPress?: (driver: MarkerData) => void;
}
