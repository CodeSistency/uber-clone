/**
 * Extended Ride Types
 * 
 * Define tipos extendidos para el sistema de rides que eviten el uso de 'as any'
 * y proporcionen type safety completo.
 */

// ===== BASE RIDE TYPES =====

export interface BaseRide {
  ride_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  fare_price: number;
  payment_method: "cash" | "card" | "split";
  cash_required?: number;
  card_paid?: number;
  fully_paid: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// ===== EXTENDED RIDE TYPES =====

export interface RideWithPassenger extends BaseRide {
  passenger: {
    id: number;
    name: string;
    phone: string;
    email: string;
    rating?: number;
    profileImage?: string;
  };
}

export interface RideWithDriver extends BaseRide {
  driver: {
    id: number;
    name: string;
    phone: string;
    rating: number;
    vehicleInfo: string;
    profileImage?: string;
  };
}

export interface RideWithBoth extends RideWithPassenger, RideWithDriver {}

// ===== SERVICE-SPECIFIC RIDE TYPES =====

export interface TransportRide extends RideWithBoth {
  serviceType: "transport";
  estimatedDuration?: number;
  estimatedDistance?: number;
  vehicleType?: string;
  specialRequests?: string[];
}

export interface DeliveryRide extends RideWithBoth {
  serviceType: "delivery";
  orderId: number;
  store: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  estimatedPickupTime?: number;
  estimatedDeliveryTime?: number;
}

export interface ErrandRide extends RideWithBoth {
  serviceType: "errand";
  errandId: number;
  description: string;
  shoppingList?: Array<{
    item: string;
    quantity?: number;
    notes?: string;
  }>;
  estimatedShoppingTime?: number;
}

export interface ParcelRide extends RideWithBoth {
  serviceType: "parcel";
  parcelId: number;
  parcelType: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  fragile?: boolean;
  insuranceValue?: number;
}

// ===== UNION TYPES =====

export type ExtendedRide = 
  | TransportRide 
  | DeliveryRide 
  | ErrandRide 
  | ParcelRide;

export type AnyRide = BaseRide | ExtendedRide;

// ===== RIDE STATUS TYPES =====

export type RideStatus = 
  | "requested"
  | "accepted" 
  | "arriving"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "emergency";

export interface RideStatusUpdate {
  rideId: number;
  oldStatus: RideStatus;
  newStatus: RideStatus;
  timestamp: string;
  reason?: string;
}

// ===== RIDE CONTEXT TYPES =====

export interface RideContext {
  activeRide: ExtendedRide | null;
  rideHistory: ExtendedRide[];
  currentStatus: RideStatus | null;
  lastUpdate: string | null;
}

// ===== TYPE GUARDS =====

export function isTransportRide(ride: AnyRide): ride is TransportRide {
  return 'serviceType' in ride && ride.serviceType === 'transport';
}

export function isDeliveryRide(ride: AnyRide): ride is DeliveryRide {
  return 'serviceType' in ride && ride.serviceType === 'delivery';
}

export function isErrandRide(ride: AnyRide): ride is ErrandRide {
  return 'serviceType' in ride && ride.serviceType === 'errand';
}

export function isParcelRide(ride: AnyRide): ride is ParcelRide {
  return 'serviceType' in ride && ride.serviceType === 'parcel';
}

export function hasPassenger(ride: AnyRide): ride is RideWithPassenger | RideWithBoth {
  return 'passenger' in ride;
}

export function hasDriver(ride: AnyRide): ride is RideWithDriver | RideWithBoth {
  return 'driver' in ride;
}

export function isExtendedRide(ride: AnyRide): ride is ExtendedRide {
  return 'serviceType' in ride;
}

// ===== UTILITY TYPES =====

export type RideServiceType = ExtendedRide['serviceType'];

export type RideWithService<T extends RideServiceType> = Extract<ExtendedRide, { serviceType: T }>;

// ===== RIDE CREATION TYPES =====

export interface CreateRideRequest {
  serviceType: RideServiceType;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  paymentMethod: "cash" | "card" | "split";
  specialRequests?: string[];
  // Service-specific fields
  orderId?: number; // For delivery
  description?: string; // For errand
  parcelType?: string; // For parcel
}

export interface CreateRideResponse {
  success: boolean;
  ride?: ExtendedRide;
  error?: string;
}

// ===== RIDE UPDATE TYPES =====

export interface UpdateRideRequest {
  rideId: number;
  updates: Partial<{
    status: RideStatus;
    fare_price: number;
    payment_method: "cash" | "card" | "split";
    cash_required: number;
    card_paid: number;
    fully_paid: boolean;
  }>;
}

export interface UpdateRideResponse {
  success: boolean;
  ride?: ExtendedRide;
  error?: string;
}

// ===== RIDE FILTER TYPES =====

export interface RideFilters {
  serviceType?: RideServiceType[];
  status?: RideStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  passengerId?: number;
  driverId?: number;
  minFare?: number;
  maxFare?: number;
}

export interface RideSearchParams {
  filters?: RideFilters;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'fare_price' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ===== RIDE STATISTICS TYPES =====

export interface RideStatistics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  averageFare: number;
  averageRating: number;
  completionRate: number;
  period: {
    start: string;
    end: string;
  };
}

// ===== RIDE NOTIFICATION TYPES =====

export interface RideNotification {
  id: string;
  type: 'ride_requested' | 'ride_accepted' | 'ride_arrived' | 'ride_started' | 'ride_completed' | 'ride_cancelled';
  rideId: number;
  title: string;
  message: string;
  data: ExtendedRide;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// ===== EXPORT ALL TYPES =====

export * from './ride';
