// Base API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Profile API Types
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  preferredLanguage?: 'es' | 'en' | 'pt' | 'fr';
  timezone?: string;
  currency?: 'USD' | 'EUR' | 'VES' | 'COP' | 'BRL';
  updatedAt: string;
  wallet?: {
    balance: number;
  };
  emergencyContacts?: Array<{
    id: number;
    contactName: string;
    contactPhone: string;
  }>;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  preferredLanguage?: 'es' | 'en' | 'pt' | 'fr';
  timezone?: string;
  currency?: 'USD' | 'EUR' | 'VES' | 'COP' | 'BRL';
}

// Email Change API Types
export interface EmailChangeRequest {
  newEmail: string;
  password: string;
}

export interface EmailChangeVerify {
  newEmail: string;
  code: string;
}

export interface EmailChangeResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  user?: {
    id: number;
    email: string;
    emailVerified: boolean;
    updatedAt: string;
  };
}

// Phone Change API Types
export interface PhoneChangeRequest {
  newPhone: string;
}

export interface PhoneChangeVerify {
  newPhone: string;
  code: string;
}

export interface PhoneChangeResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  user?: {
    id: number;
    phone: string;
    phoneVerified: boolean;
    updatedAt: string;
  };
}

// Password Change API Types
export interface PasswordChangeRequest {
  currentPassword: string;
}

export interface PasswordChangeVerify {
  newPassword: string;
  code: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  user?: {
    id: number;
    email: string;
    updatedAt: string;
  };
}

// Identity Verification API Types
export interface IdentityVerificationSubmit {
  dniNumber: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
}

export interface IdentityVerificationStatus {
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
  dniNumber?: string;
  createdAt: string;
}

export interface IdentityVerificationResponse {
  success: boolean;
  message: string;
  verification?: {
    id: number;
    dniNumber: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
  };
}

// Verification Code Types
export interface VerificationCodeRequest {
  type: 'email' | 'phone' | 'password';
  identifier: string; // email or phone
  password?: string; // for email/password changes
}

export interface VerificationCodeVerify {
  type: 'email' | 'phone' | 'password';
  identifier: string;
  code: string;
  newValue?: string; // new email, phone, or password
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  attemptsRemaining?: number;
}

// Error Types
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  details?: any;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// Upload Types
export interface ImageUploadResponse {
  success: boolean;
  imageUrl?: string;
  message?: string;
  error?: string;
}

// Address Types (for future use)
export interface AddressData {
  id: string;
  type: 'home' | 'work' | 'gym' | 'other';
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt: string;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: 'RIDE_REQUEST' | 'RIDE_ACCEPTED' | 'RIDE_CANCELLED' | 'DRIVER_ARRIVED' | 
        'RIDE_STARTED' | 'RIDE_COMPLETED' | 'PAYMENT_SUCCESS' | 'CHAT_MESSAGE' | 
        'EMERGENCY_ALERT' | 'SYSTEM_UPDATE' | 'VERIFICATION_UPDATE';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Generic API Error Handler
export class ApiError extends Error {
  public statusCode: number;
  public response?: any;

  constructor(message: string, statusCode: number = 500, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Validation Error
export class ValidationError extends ApiError {
  public validationErrors: string[];

  constructor(message: string | string[], statusCode: number = 400) {
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    super(errorMessage, statusCode);
    this.name = 'ValidationError';
    this.validationErrors = Array.isArray(message) ? message : [message];
  }
}

// Network Error
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

// Authentication Error
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization Error
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

// Not Found Error
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// Conflict Error
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Rate Limit Error
export class RateLimitError extends ApiError {
  public retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}





