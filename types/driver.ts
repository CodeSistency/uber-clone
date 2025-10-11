export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  carImageUrl: string;
  carSeats: number;
  rating: number;
}

export interface EarningsSummary {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  completedTrips: number;
  averageEarningsPerTrip: number;
  bonuses: number;
  tips: number;
}

export interface TripEarning {
  id: string;
  tripId: string;
  driverId: string;
  amount: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  tip: number;
  bonus: number;
  commission: number;
  netEarning: number;
  completedAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'guarantee' | 'bonus' | 'multiplier';
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  requirements?: {
    minTrips?: number;
    minHours?: number;
    specificTimes?: string[];
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'trip_count' | 'earnings' | 'hours';
  target: number;
  current: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
}

export interface DriverWithLocation extends Driver {
  latitude: number;
  longitude: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  dateOfBirth: Date;
  licenseNumber: string;
  licenseExpiry: Date;
  insuranceProvider: string;
  insuranceExpiry: Date;
  vehicleRegistration: string;
  registrationExpiry: Date;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  joinedDate: Date;
  onboardingCompletedAt?: Date;
  totalRides: number;
  totalEarnings: number;
  averageRating: number;
  status: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: Date;
    address?: string;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
  };
}

export interface Document {
  id: string;
  driverId: string;
  type: DocumentType;
  status: DocumentStatus;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  isRequired: boolean;
  verificationNotes?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export type DocumentType = 
  | 'license'
  | 'driver_license'
  | 'insurance'
  | 'registration'
  | 'background_check'
  | 'vehicle_inspection'
  | 'profile_photo'
  | 'other';

export type DocumentStatus = 
  | 'pending'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface UploadDocumentRequest {
  driverId: string;
  type: DocumentType;
  file: File | Blob | string;
  fileName: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DocumentVerificationResult {
  documentId: string;
  status: DocumentStatus;
  verifiedAt: Date;
  verifiedBy: string;
  notes?: string;
  rejectionReason?: string;
}

export interface DriverVerificationStatus {
  driverId: string;
  overallStatus: 'pending' | 'verified' | 'rejected';
  requiredDocuments: DocumentType[];
  completedDocuments: DocumentType[];
  missingDocuments: DocumentType[];
  lastUpdated: Date;
}

export interface DocumentStatistics {
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  expiredDocuments: number;
  averageProcessingTime: number; // in hours
}

export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  licensePlate: string; // Alias para compatibilidad
  vin: string;
  seats: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: Date;
  registrationNumber: string;
  registrationExpiry: Date;
  vehiclePhotos: string[];
  isVerified: boolean;
  verificationStatus: VehicleVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  photos: string[];
  documents: string[];
}

export interface CreateVehicleRequest {
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  licensePlate: string; // Alias para compatibilidad
  vin: string;
  seats: number;
  status?: 'active' | 'inactive' | 'pending' | 'rejected';
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: Date;
  registrationNumber: string;
  registrationExpiry: Date;
  vehiclePhotos?: string[];
  photos?: string[];
  documents?: string[];
}

export interface UpdateVehicleRequest {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  plateNumber?: string;
  licensePlate?: string;
  vin?: string;
  seats?: number;
  status?: 'active' | 'inactive' | 'pending' | 'rejected';
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: Date;
  registrationNumber?: string;
  registrationExpiry?: Date;
  vehiclePhotos?: string[];
  photos?: string[];
  documents?: string[];
}

export interface VehicleVerificationStatus {
  vehicleId: string;
  overallStatus: 'pending' | 'verified' | 'rejected';
  requiredDocuments: string[];
  completedDocuments: string[];
  missingDocuments: string[];
  lastUpdated: Date;
  verificationNotes?: string;
}

export interface DriverStatusData {
  driverId: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastSeen: Date;
  lastOnlineTime?: Date;
  totalOnlineTime: number;
  connectionHistory: ConnectionEvent[];
  status: 'online' | 'offline' | 'busy' | 'unavailable';
}

export interface ConnectionEvent {
  type: 'connect' | 'disconnect' | 'reconnect';
  driverId: string;
  timestamp: Date;
  reason?: string;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  address?: string;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  requestedAt: Date;
  estimatedFare: number;
  distance: number;
  estimatedDuration: number;
  vehicleType: string;
  specialRequests?: string[];
}

export interface ActiveRide {
  id: string;
  driverId: string;
  passengerId: string;
  status: 'accepted' | 'arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  startedAt: Date;
  completedAt?: Date;
  fare: number;
  distance: number;
  duration: number;
}