import { fetchAPI } from '@/lib/fetch';
import { endpoints } from '@/lib/endpoints';

// Types for Profile API
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

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  preferredLanguage?: string;
  timezone?: string;
  currency?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    try {
      console.log('[ProfileService] Getting user profile...');
      
      const response = await fetchAPI('user/profile', {
        method: 'GET',
        requiresAuth: true,
      });

      console.log('[ProfileService] Profile retrieved successfully:', response);

      return {
        success: true,
        data: response,
        message: 'Profile retrieved successfully'
      };
    } catch (error: any) {
      console.error('[ProfileService] Error getting profile:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get profile',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Update user profile using PATCH
   */
  static async updateProfile(updates: ProfileUpdateRequest): Promise<ApiResponse<ProfileResponse>> {
    try {
      console.log('[ProfileService] Updating profile with:', updates);

      // Validate required fields if provided
      if (updates.email && !this.isValidEmail(updates.email)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
          statusCode: 400
        };
      }

      if (updates.phone && !this.isValidPhone(updates.phone)) {
        return {
          success: false,
          message: 'Phone number must be in international format (e.g., +584141234567)',
          statusCode: 400
        };
      }

      if (updates.dateOfBirth && !this.isValidDate(updates.dateOfBirth)) {
        return {
          success: false,
          message: 'Date of birth must be in YYYY-MM-DD format',
          statusCode: 400
        };
      }

      const response = await fetchAPI('user/profile', {
        method: 'PATCH',
        requiresAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      console.log('[ProfileService] Profile updated successfully:', response);

      return {
        success: true,
        data: response,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      console.error('[ProfileService] Error updating profile:', error);
      
      // Handle specific error cases
      if (error.statusCode === 409) {
        return {
          success: false,
          message: 'Email already exists',
          statusCode: 409
        };
      }

      if (error.statusCode === 400) {
        return {
          success: false,
          message: error.message || 'Invalid data provided',
          statusCode: 400
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to update profile',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Upload profile image and get URL
   */
  static async uploadProfileImage(imageUri: string): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      console.log('[ProfileService] Uploading profile image...');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetchAPI('user/profile/image', {
        method: 'POST',
        requiresAuth: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('[ProfileService] Image uploaded successfully:', response);

      return {
        success: true,
        data: { imageUrl: response.imageUrl || response.url },
        message: 'Image uploaded successfully'
      };
    } catch (error: any) {
      console.error('[ProfileService] Error uploading image:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to upload image',
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Delete profile image
   */
  static async deleteProfileImage(): Promise<ApiResponse<null>> {
    try {
      console.log('[ProfileService] Deleting profile image...');

      await fetchAPI('user/profile/image', {
        method: 'DELETE',
        requiresAuth: true,
      });

      console.log('[ProfileService] Image deleted successfully');

      return {
        success: true,
        data: null,
        message: 'Image deleted successfully'
      };
    } catch (error: any) {
      console.error('[ProfileService] Error deleting image:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to delete image',
        statusCode: error.statusCode || 500
      };
    }
  }

  // Validation helper methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  private static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

// Export singleton instance
export const profileService = new ProfileService();



