import { fetchAPI } from '@/lib/fetch';
import { 
  PhoneChangeRequest, 
  PhoneChangeVerify, 
  PhoneChangeResponse,
  ApiResponse 
} from './types';

export class PhoneChangeService {
  /**
   * Request phone change with SMS verification
   */
  static async requestPhoneChange(data: PhoneChangeRequest): Promise<ApiResponse<PhoneChangeResponse>> {
    try {
      console.log('[PhoneChangeService] Requesting phone change for:', data.newPhone);

      // Validate phone format
      if (!this.isValidPhone(data.newPhone)) {
        return {
          success: false,
          message: 'Phone number must be in international format (e.g., +584141234567)',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/change-phone/request', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[PhoneChangeService] Phone change request successful:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Verification code sent via SMS'
      };
    } catch (error: any) {
      console.error('[PhoneChangeService] Error requesting phone change:', error);
      
      // Handle specific error cases
      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid phone number format',
          statusCode: 400
        };
      }

      if (error.statusCode === 409) {
        return {
          success: false,
          message: 'Phone number already exists',
          statusCode: 409
        };
      }

      if (error.statusCode === 429) {
        return {
          success: false,
          message: 'Too many requests. Please wait before trying again',
          statusCode: 429
        };
      }

      if (error.statusCode === 503) {
        return {
          success: false,
          message: 'SMS service temporarily unavailable. Please try again later',
          statusCode: 503
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to request phone change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Verify phone change with SMS code
   */
  static async verifyPhoneChange(data: PhoneChangeVerify): Promise<ApiResponse<PhoneChangeResponse>> {
    try {
      console.log('[PhoneChangeService] Verifying phone change with code');

      // Validate phone format
      if (!this.isValidPhone(data.newPhone)) {
        return {
          success: false,
          message: 'Phone number must be in international format (e.g., +584141234567)',
          statusCode: 400
        };
      }

      // Validate verification code format
      if (!this.isValidVerificationCode(data.code)) {
        return {
          success: false,
          message: 'Verification code must be 6 digits',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/change-phone/verify', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[PhoneChangeService] Phone change verification successful:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Phone number updated successfully'
      };
    } catch (error: any) {
      console.error('[PhoneChangeService] Error verifying phone change:', error);
      
      // Handle specific error cases
      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid verification code or phone number',
          statusCode: 400
        };
      }

      if (error.statusCode === 404) {
        return {
          success: false,
          message: 'Verification code not found or expired',
          statusCode: 404
        };
      }

      if (error.statusCode === 410) {
        return {
          success: false,
          message: 'Verification code has expired',
          statusCode: 410
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to verify phone change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Cancel phone change request
   */
  static async cancelPhoneChange(): Promise<ApiResponse<null>> {
    try {
      console.log('[PhoneChangeService] Cancelling phone change request');

      await fetchAPI('user/change-phone/cancel', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      console.log('[PhoneChangeService] Phone change cancelled successfully');

      return {
        success: true,
        data: null,
        message: 'Phone change request cancelled'
      };
    } catch (error: any) {
      console.error('[PhoneChangeService] Error cancelling phone change:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to cancel phone change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Resend verification SMS
   */
  static async resendVerificationSMS(newPhone: string): Promise<ApiResponse<PhoneChangeResponse>> {
    try {
      console.log('[PhoneChangeService] Resending verification SMS to:', newPhone);

      // Validate phone format
      if (!this.isValidPhone(newPhone)) {
        return {
          success: false,
          message: 'Phone number must be in international format (e.g., +584141234567)',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/change-phone/resend', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPhone }),
      });

      console.log('[PhoneChangeService] Verification SMS resent successfully:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Verification SMS resent successfully'
      };
    } catch (error: any) {
      console.error('[PhoneChangeService] Error resending verification SMS:', error);
      
      if (error.statusCode === 429) {
        return {
          success: false,
          message: 'Too many requests. Please wait before requesting another SMS',
          statusCode: 429
        };
      }

      if (error.statusCode === 503) {
        return {
          success: false,
          message: 'SMS service temporarily unavailable. Please try again later',
          statusCode: 503
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to resend verification SMS',
        statusCode: error.statusCode || 500
      };
    }
  }

  // Validation helper methods
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  private static isValidVerificationCode(code: string): boolean {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }
}

// Export singleton instance
export const phoneChangeService = new PhoneChangeService();




