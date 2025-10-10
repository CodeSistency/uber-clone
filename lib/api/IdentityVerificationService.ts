import { fetchAPI } from '@/lib/fetch';
import { 
  IdentityVerificationSubmit, 
  IdentityVerificationStatus, 
  IdentityVerificationResponse,
  ApiResponse 
} from './types';

export class IdentityVerificationService {
  /**
   * Submit identity verification documents
   */
  static async submitIdentityVerification(data: IdentityVerificationSubmit): Promise<ApiResponse<IdentityVerificationResponse>> {
    try {
      console.log('[IdentityVerificationService] Submitting identity verification for DNI:', data.dniNumber);

      // Validate DNI format
      if (!this.isValidDNI(data.dniNumber)) {
        return {
          success: false,
          message: 'DNI must contain between 7-9 digits',
          statusCode: 400
        };
      }

      // Validate photo URLs
      if (!this.isValidPhotoUrl(data.frontPhotoUrl) || !this.isValidPhotoUrl(data.backPhotoUrl)) {
        return {
          success: false,
          message: 'Valid photo URLs are required',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/identity-verification/submit', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[IdentityVerificationService] Identity verification submitted successfully:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Verification documents submitted successfully'
      };
    } catch (error: any) {
      console.error('[IdentityVerificationService] Error submitting identity verification:', error);
      
      // Handle specific error cases
      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid verification data provided',
          statusCode: 400
        };
      }

      if (error.statusCode === 409) {
        return {
          success: false,
          message: 'DNI number already exists in our system',
          statusCode: 409
        };
      }

      if (error.statusCode === 413) {
        return {
          success: false,
          message: 'Photo files are too large. Please use smaller images',
          statusCode: 413
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to submit identity verification',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(): Promise<ApiResponse<IdentityVerificationStatus>> {
    try {
      console.log('[IdentityVerificationService] Getting verification status...');

      const response = await fetchAPI('user/identity-verification/status', {
        method: 'GET',
        requiresAuth: true,
      });

      console.log('[IdentityVerificationService] Verification status retrieved:', response);

      return {
        success: true,
        data: response,
        message: 'Verification status retrieved successfully'
      };
    } catch (error: any) {
      console.error('[IdentityVerificationService] Error getting verification status:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get verification status',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Upload DNI photos and get URLs
   */
  static async uploadDNIPhotos(frontPhotoUri: string, backPhotoUri: string): Promise<ApiResponse<{ frontPhotoUrl: string; backPhotoUrl: string }>> {
    try {
      console.log('[IdentityVerificationService] Uploading DNI photos...');

      // Upload front photo
      const frontFormData = new FormData();
      frontFormData.append('image', {
        uri: frontPhotoUri,
        type: 'image/jpeg',
        name: 'dni_front.jpg',
      } as any);
      frontFormData.append('type', 'dni_front');

      const frontResponse = await fetchAPI('user/identity-verification/upload', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: frontFormData,
      });

      // Upload back photo
      const backFormData = new FormData();
      backFormData.append('image', {
        uri: backPhotoUri,
        type: 'image/jpeg',
        name: 'dni_back.jpg',
      } as any);
      backFormData.append('type', 'dni_back');

      const backResponse = await fetchAPI('user/identity-verification/upload', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: backFormData,
      });

      console.log('[IdentityVerificationService] DNI photos uploaded successfully');

      return {
        success: true,
        data: {
          frontPhotoUrl: frontResponse.imageUrl || frontResponse.url,
          backPhotoUrl: backResponse.imageUrl || backResponse.url,
        },
        message: 'DNI photos uploaded successfully'
      };
    } catch (error: any) {
      console.error('[IdentityVerificationService] Error uploading DNI photos:', error);
      
      if (error.statusCode === 413) {
        return {
          success: false,
          message: 'Photo files are too large. Please use smaller images',
          statusCode: 413
        };
      }

      if (error.statusCode === 415) {
        return {
          success: false,
          message: 'Unsupported file format. Please use JPEG or PNG images',
          statusCode: 415
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to upload DNI photos',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Cancel pending verification
   */
  static async cancelVerification(): Promise<ApiResponse<null>> {
    try {
      console.log('[IdentityVerificationService] Cancelling verification request...');

      await fetchAPI('user/identity-verification/cancel', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      console.log('[IdentityVerificationService] Verification cancelled successfully');

      return {
        success: true,
        data: null,
        message: 'Verification request cancelled'
      };
    } catch (error: any) {
      console.error('[IdentityVerificationService] Error cancelling verification:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to cancel verification',
        statusCode: error.statusCode || 500
      };
    }
  }

  // Validation helper methods
  private static isValidDNI(dni: string): boolean {
    const dniRegex = /^\d{7,9}$/;
    return dniRegex.test(dni);
  }

  private static isValidPhotoUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const identityVerificationService = new IdentityVerificationService();







