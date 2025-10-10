import { fetchAPI } from '@/lib/fetch';
import { 
  EmailChangeRequest, 
  EmailChangeVerify, 
  EmailChangeResponse,
  ApiResponse 
} from './types';

export class EmailChangeService {
  /**
   * Request email change with verification
   */
  static async requestEmailChange(data: EmailChangeRequest): Promise<ApiResponse<EmailChangeResponse>> {
    try {
      console.log('[EmailChangeService] Requesting email change for:', data.newEmail);

      // Validate email format
      if (!this.isValidEmail(data.newEmail)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
          statusCode: 400
        };
      }

      // Validate password is provided
      if (!data.password || data.password.trim().length === 0) {
        return {
          success: false,
          message: 'Current password is required',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/change-email/request', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[EmailChangeService] Email change request successful:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Verification code sent to new email address'
      };
    } catch (error: any) {
      console.error('[EmailChangeService] Error requesting email change:', error);
      
      // Handle specific error cases
      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid data provided',
          statusCode: 400
        };
      }

      if (error.statusCode === 403) {
        return {
          success: false,
          message: 'Current password is incorrect',
          statusCode: 403
        };
      }

      if (error.statusCode === 409) {
        return {
          success: false,
          message: 'Email already exists',
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

      return {
        success: false,
        message: error.message || 'Failed to request email change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Verify email change with code
   */
  static async verifyEmailChange(data: EmailChangeVerify): Promise<ApiResponse<EmailChangeResponse>> {
    try {
      console.log('[EmailChangeService] Verifying email change with code');

      // Validate email format
      if (!this.isValidEmail(data.newEmail)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
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

      const response = await fetchAPI('user/change-email/verify', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[EmailChangeService] Email change verification successful:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Email updated successfully'
      };
    } catch (error: any) {
      console.error('[EmailChangeService] Error verifying email change:', error);
      
      // Handle specific error cases
      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid verification code or email',
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
        message: error.message || 'Failed to verify email change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Cancel email change request
   */
  static async cancelEmailChange(): Promise<ApiResponse<null>> {
    try {
      console.log('[EmailChangeService] Cancelling email change request');

      await fetchAPI('user/change-email/cancel', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      console.log('[EmailChangeService] Email change cancelled successfully');

      return {
        success: true,
        data: null,
        message: 'Email change request cancelled'
      };
    } catch (error: any) {
      console.error('[EmailChangeService] Error cancelling email change:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to cancel email change',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Resend verification code
   */
  static async resendVerificationCode(newEmail: string): Promise<ApiResponse<EmailChangeResponse>> {
    try {
      console.log('[EmailChangeService] Resending verification code to:', newEmail);

      // Validate email format
      if (!this.isValidEmail(newEmail)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/change-email/resend', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail }),
      });

      console.log('[EmailChangeService] Verification code resent successfully:', response);

      return {
        success: true,
        data: response,
        message: response.message || 'Verification code resent successfully'
      };
    } catch (error: any) {
      console.error('[EmailChangeService] Error resending verification code:', error);
      
      if (error.statusCode === 429) {
        return {
          success: false,
          message: 'Too many requests. Please wait before requesting another code',
          statusCode: 429
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to resend verification code',
        statusCode: error.statusCode || 500
      };
    }
  }

  // Validation helper methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidVerificationCode(code: string): boolean {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }
}

// Export singleton instance
export const emailChangeService = new EmailChangeService();








