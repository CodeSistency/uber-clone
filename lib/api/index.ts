// Export all API services
export { ProfileService, profileService } from './ProfileService';
export { EmailChangeService, emailChangeService } from './EmailChangeService';
export { PhoneChangeService, phoneChangeService } from './PhoneChangeService';
export { IdentityVerificationService, identityVerificationService } from './IdentityVerificationService';

// Export all types
export * from './types';

// Re-export fetchAPI for convenience
export { fetchAPI } from '../fetch';
