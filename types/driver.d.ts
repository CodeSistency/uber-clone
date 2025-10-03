// =============================================
// DRIVER TYPES - Comprehensive Type Definitions
// =============================================

// Base Driver Profile Types
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
  verificationStatus: DriverVerificationStatus;
  joinedDate: Date;
  totalRides: number;
  totalEarnings: number;
  averageRating: number;
  status: DriverStatus;
  isOnline: boolean;
  currentLocation?: LocationData;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
}

export type DriverStatus = "active" | "inactive" | "pending" | "suspended";
export type DriverVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

// Driver Status Types
export interface DriverStatusData {
  isOnline: boolean;
  isAvailable: boolean;
  status: string;
  lastOnlineTime: Date | null;
  totalOnlineTime: number;
  connectionHistory: ConnectionEvent[];
  driverRole?: string;
}

export interface ConnectionEvent {
  id: string;
  timestamp: Date;
  action: "connect" | "disconnect";
  location?: LocationData;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  status: VehicleStatus;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: Date;
  registrationNumber?: string;
  registrationExpiry?: Date;
  vehiclePhotos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleStatus = "active" | "inactive" | "pending" | "suspended";

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: Date;
  registrationNumber?: string;
  registrationExpiry?: Date;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  status?: VehicleStatus;
}

export interface VehicleVerificationStatus {
  vehicleId: string;
  isVerified: boolean;
  verificationStatus: VehicleVerificationStatusType;
  rejectionReason?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
}

export type VehicleVerificationStatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

export interface VehicleMaintenanceRecord {
  id: string;
  vehicleId: string;
  type: "service" | "repair" | "inspection" | "accident";
  description: string;
  date: Date;
  cost?: number;
  provider?: string;
  nextServiceDate?: Date;
  notes?: string;
}

export interface VehicleIssue {
  id: string;
  vehicleId: string;
  type: "mechanical" | "accident" | "cleanliness" | "other";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  photos?: string[];
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  status: "reported" | "investigating" | "resolved" | "escalated";
}

// Document Types
export interface Document {
  id: string;
  driverId: string;
  type: DocumentType;
  name: string;
  status: DocumentStatus;
  uploadedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  expiryDate?: Date; // Alias for expiresAt
  rejectionReason?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  number?: string; // Document number (license, policy, etc.)
  isRequired: boolean;
  verificationNotes?: string;
}

export type DocumentType =
  | "driver_license"
  | "vehicle_registration"
  | "insurance_policy"
  | "background_check"
  | "vehicle_photos"
  | "profile_photo"
  | "proof_of_address"
  | "bank_statement"
  | "other";

export type DocumentStatus =
  | "not_uploaded"
  | "pending_review"
  | "approved"
  | "rejected"
  | "expired"
  | "requires_update";

export interface UploadDocumentRequest {
  type: DocumentType;
  file: File | string; // File object or base64 string
  fileName?: string;
  description?: string;
}

export interface DocumentVerificationResult {
  documentId: string;
  status: DocumentStatus;
  verifiedAt?: Date;
  expiresAt?: Date;
  rejectionReason?: string;
  verificationNotes?: string;
}

export interface DriverVerificationStatus {
  isFullyVerified: boolean;
  overallStatus:
    | "not_started"
    | "in_progress"
    | "pending_review"
    | "approved"
    | "rejected";
  requiredDocuments: {
    type: DocumentType;
    name: string;
    status: DocumentStatus;
    isUploaded: boolean;
    isRequired: boolean;
  }[];
  optionalDocuments: {
    type: DocumentType;
    name: string;
    status: DocumentStatus;
    isUploaded: boolean;
    isRequired: boolean;
  }[];
  completionPercentage: number;
  missingRequiredDocuments: DocumentType[];
}

export interface DocumentStatistics {
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  expiredDocuments: number;
}

// Earnings Types
export interface EarningsSummary {
  today: EarningsPeriod;
  week: EarningsPeriod;
  month: EarningsPeriod;
  total: EarningsPeriod;
  // Additional properties for UI display
  totalEarnings: number;
  totalTrips: number;
  averageRating?: number;
  averagePerTrip: number;
}

export interface EarningsPeriod {
  rides: number;
  earnings: number;
  hours: number;
  averagePerRide: number;
}

export interface TripEarning {
  id: string;
  date: Date;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  tip: number;
  bonus: number;
  total: number;
  earnings: number; // Alias for total
  duration: number; // minutes
  distance: number; // miles
  serviceType: string;
  rating: number;
}

export interface Promotion {
  id: string;
  name: string;
  title: string; // Alias for name
  description: string;
  type: "bonus" | "multiplier";
  value: number;
  target: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  expiresAt: Date; // Alias for endDate
  isActive: boolean;
  requirements: string[];
  reward: string;
}

export interface Challenge {
  id: string;
  name: string;
  title: string; // Alias for name
  description: string;
  target: number;
  progress: number;
  currentProgress: number; // Alias for progress
  reward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  category: string;
}

// Ride Types (extended from existing)
export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerRating: number;
  pickupLocation: LocationData & { address: string };
  dropoffLocation: LocationData & { address: string };
  estimatedFare: number;
  estimatedDuration: number;
  estimatedDistance: number;
  requestedAt: Date;
  expiresAt: Date;
  serviceType: string;
  specialRequests?: string[];
  paymentMethod?: string;
}

export interface ActiveRide extends RideRequest {
  status: RideStatus;
  acceptedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  actualFare: number;
  actualDistance: number;
  actualDuration: number;
  route?: {
    coordinates: { latitude: number; longitude: number }[];
    instructions: string[];
  };
  passengerPhone: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: Date;
}

// Location Types (extended)
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
  heading?: number;
  speed?: number;
}

export interface DriverLocation extends LocationData {
  driverId: string;
  isActive: boolean;
  lastUpdate: Date;
}

// Service Types
export type ServiceType = "transport" | "delivery" | "mandado" | "envio";

// Navigation Types
export interface DriverNavigationContext {
  hasActiveRide: boolean;
  currentServiceType: ServiceType | null;
  isCurrentRouteRestricted: boolean;
  canNavigateToManagement: boolean;
}

// Store Types
export interface DriverProfileState {
  // Estado del perfil
  profile: DriverProfile | null;
  vehicles: Vehicle[];
  documents: Document[];

  // Estados de carga
  isLoading: boolean;
  error: string | null;

  // Acciones del perfil
  setProfile: (profile: DriverProfile | null) => void;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;

  // Acciones de vehículos
  setVehicles: (vehicles: Vehicle[]) => void;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicleData: CreateVehicleRequest) => Promise<void>;
  updateVehicle: (id: string, updates: UpdateVehicleRequest) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Acciones de documentos
  setDocuments: (documents: Document[]) => void;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    type: DocumentType,
    file: File | string,
    description?: string,
  ) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
}

// Export all types
export type {
  DriverProfile as DriverProfileType,
  Vehicle as VehicleType,
  Document as DocumentType,
  RideRequest as RideRequestType,
  ActiveRide as ActiveRideType,
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  ErrorResponse as ErrorResponseType,
};
