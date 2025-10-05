import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileService, EmailChangeService, PhoneChangeService, IdentityVerificationService } from "@/lib/api";

// Types
export interface Address {
  id: string;
  type: "home" | "work" | "gym" | "other";
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt: Date;
}

export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  accountVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  verificationDate?: Date;
  rejectionReason?: string;
}

export interface ProfileData {
  // Datos básicos
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: "male" | "female" | "other";
  
  // Ubicación
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  
  // Preferencias
  preferredLanguage: string;
  timezone: string;
  currency: string;
  theme: "light" | "dark" | "auto";
  
  // Imagen de perfil
  profileImage: string | null;
  
  // Direcciones guardadas
  savedAddresses: Address[];
  
  // Verificaciones
  verification: VerificationStatus;
}

export interface ProfileStore {
  // Estado
  profileData: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones básicas
  setProfileData: (data: ProfileData | null) => void;
  updateProfileData: (updates: Partial<ProfileData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
  
  // Acciones de perfil
  updateBasicInfo: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    gender: "male" | "female" | "other";
  }) => void;
  
  updateLocation: (data: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }) => void;
  
  updatePreferences: (data: {
    preferredLanguage: string;
    timezone: string;
    currency: string;
    theme: "light" | "dark" | "auto";
  }) => void;
  
  // Acciones de verificación
  updateEmailVerification: (verified: boolean) => void;
  updatePhoneVerification: (verified: boolean) => void;
  updateAccountVerification: (status: "pending" | "approved" | "rejected", reason?: string) => void;
  
  // Métodos de API para verificación
  requestEmailChange: (newEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailChange: (newEmail: string, code: string) => Promise<{ success: boolean; message: string }>;
  requestPhoneChange: (newPhone: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneChange: (newPhone: string, code: string) => Promise<{ success: boolean; message: string }>;
  submitIdentityVerification: (dniNumber: string, frontPhotoUrl: string, backPhotoUrl: string) => Promise<{ success: boolean; message: string }>;
  checkVerificationStatus: () => Promise<{ success: boolean; data?: any; message?: string }>;
  
  // Acciones de direcciones
  addAddress: (address: Omit<Address, "id" | "createdAt">) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  
  // Acciones de imagen
  updateProfileImage: (imageUrl: string | null) => void;
  
  // Acciones de sincronización
  refreshProfile: () => Promise<void>;
  syncWithUserStore: () => void;
}

// Estado inicial
const initialProfileData: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: null,
  gender: "other",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  preferredLanguage: "es",
  timezone: "America/Caracas",
  currency: "USD",
  theme: "auto",
  profileImage: null,
  savedAddresses: [],
  verification: {
    emailVerified: false,
    phoneVerified: false,
    accountVerified: false,
    verificationStatus: "pending",
  },
};

// Storage configuration
const storageConfig = {
  name: "profile-storage",
  storage: AsyncStorage,
  partialize: (state: ProfileStore) => ({
    profileData: state.profileData,
  }),
};

// Store implementation
export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      profileData: null,
      isLoading: false,
      error: null,

      // Acciones básicas
      setProfileData: (data: ProfileData | null) => {
        console.log("[ProfileStore] setProfileData called with:", data);
        set(() => ({
          profileData: data,
          error: null,
        }));
      },

      updateProfileData: (updates: Partial<ProfileData>) => {
        console.log("[ProfileStore] updateProfileData called with:", updates);
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, ...updates }
            : null,
          error: null,
        }));
      },

      setLoading: (loading: boolean) => {
        console.log("[ProfileStore] setLoading called with:", loading);
        set(() => ({ isLoading: loading }));
      },

      setError: (error: string | null) => {
        console.log("[ProfileStore] setError called with:", error);
        set(() => ({ error }));
      },

      clearProfile: () => {
        console.log("[ProfileStore] clearProfile called");
        set(() => ({
          profileData: null,
          error: null,
          isLoading: false,
        }));
      },

      // Acciones de perfil
      updateBasicInfo: (data) => {
        console.log("[ProfileStore] updateBasicInfo called with:", data);
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, ...data }
            : null,
          error: null,
        }));
      },

      updateLocation: (data) => {
        console.log("[ProfileStore] updateLocation called with:", data);
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, ...data }
            : null,
          error: null,
        }));
      },

      updatePreferences: (data) => {
        console.log("[ProfileStore] updatePreferences called with:", data);
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, ...data }
            : null,
          error: null,
        }));
      },

      // Acciones de verificación
      updateEmailVerification: (verified: boolean) => {
        console.log("[ProfileStore] updateEmailVerification called with:", verified);
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                verification: {
                  ...state.profileData.verification,
                  emailVerified: verified,
                },
              }
            : null,
          error: null,
        }));
      },

      // Nuevos métodos para integración con servicios de API
      requestEmailChange: async (newEmail: string, password: string) => {
        const state = get();
        console.log("[ProfileStore] requestEmailChange called with:", newEmail);

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await EmailChangeService.requestEmailChange({
            newEmail,
            password,
          });

          if (result.success) {
            console.log("[ProfileStore] Email change request successful");
            return { success: true, message: result.message };
          } else {
            state.setError(result.message || 'Failed to request email change');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error requesting email change:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      verifyEmailChange: async (newEmail: string, code: string) => {
        const state = get();
        console.log("[ProfileStore] verifyEmailChange called");

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await EmailChangeService.verifyEmailChange({
            newEmail,
            code,
          });

          if (result.success) {
            // Actualizar email en el store
            state.updateProfileData({ email: newEmail });
            state.updateEmailVerification(true);
            console.log("[ProfileStore] Email change verified successfully");
            return { success: true, message: result.message };
          } else {
            state.setError(result.message || 'Failed to verify email change');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error verifying email change:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      updatePhoneVerification: (verified: boolean) => {
        console.log("[ProfileStore] updatePhoneVerification called with:", verified);
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                verification: {
                  ...state.profileData.verification,
                  phoneVerified: verified,
                },
              }
            : null,
          error: null,
        }));
      },

      requestPhoneChange: async (newPhone: string) => {
        const state = get();
        console.log("[ProfileStore] requestPhoneChange called with:", newPhone);

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await PhoneChangeService.requestPhoneChange({
            newPhone,
          });

          if (result.success) {
            console.log("[ProfileStore] Phone change request successful");
            return { success: true, message: result.message };
          } else {
            state.setError(result.message || 'Failed to request phone change');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error requesting phone change:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      verifyPhoneChange: async (newPhone: string, code: string) => {
        const state = get();
        console.log("[ProfileStore] verifyPhoneChange called");

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await PhoneChangeService.verifyPhoneChange({
            newPhone,
            code,
          });

          if (result.success) {
            // Actualizar teléfono en el store
            state.updateProfileData({ phone: newPhone });
            state.updatePhoneVerification(true);
            console.log("[ProfileStore] Phone change verified successfully");
            return { success: true, message: result.message };
          } else {
            state.setError(result.message || 'Failed to verify phone change');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error verifying phone change:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      updateAccountVerification: (status, reason) => {
        console.log("[ProfileStore] updateAccountVerification called with:", { status, reason });
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                verification: {
                  ...state.profileData.verification,
                  verificationStatus: status,
                  accountVerified: status === "approved",
                  verificationDate: status === "approved" ? new Date() : undefined,
                  rejectionReason: reason,
                },
              }
            : null,
          error: null,
        }));
      },

      submitIdentityVerification: async (dniNumber: string, frontPhotoUrl: string, backPhotoUrl: string) => {
        const state = get();
        console.log("[ProfileStore] submitIdentityVerification called with DNI:", dniNumber);

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await IdentityVerificationService.submitIdentityVerification({
            dniNumber,
            frontPhotoUrl,
            backPhotoUrl,
          });

          if (result.success) {
            // Actualizar estado de verificación a pendiente
            state.updateAccountVerification('pending');
            console.log("[ProfileStore] Identity verification submitted successfully");
            return { success: true, message: result.message };
          } else {
            state.setError(result.message || 'Failed to submit identity verification');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error submitting identity verification:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      checkVerificationStatus: async () => {
        const state = get();
        console.log("[ProfileStore] checkVerificationStatus called");

        try {
          state.setLoading(true);
          state.setError(null);

          const result = await IdentityVerificationService.getVerificationStatus();

          if (result.success && result.data) {
            // Actualizar estado de verificación basado en la respuesta
            const verificationData = result.data;
            state.updateAccountVerification(
              verificationData.status,
              verificationData.rejectionReason
            );
            console.log("[ProfileStore] Verification status updated:", verificationData.status);
            return { success: true, data: verificationData };
          } else {
            state.setError(result.message || 'Failed to get verification status');
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error("[ProfileStore] Error checking verification status:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
          return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
        } finally {
          state.setLoading(false);
        }
      },

      // Acciones de direcciones
      addAddress: (addressData) => {
        console.log("[ProfileStore] addAddress called with:", addressData);
        const newAddress: Address = {
          ...addressData,
          id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                savedAddresses: [...state.profileData.savedAddresses, newAddress],
              }
            : null,
          error: null,
        }));
      },

      updateAddress: (id, updates) => {
        console.log("[ProfileStore] updateAddress called with:", { id, updates });
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                savedAddresses: state.profileData.savedAddresses.map((addr) =>
                  addr.id === id ? { ...addr, ...updates } : addr
                ),
              }
            : null,
          error: null,
        }));
      },

      deleteAddress: (id) => {
        console.log("[ProfileStore] deleteAddress called with:", id);
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                savedAddresses: state.profileData.savedAddresses.filter(
                  (addr) => addr.id !== id
                ),
              }
            : null,
          error: null,
        }));
      },

      setDefaultAddress: (id) => {
        console.log("[ProfileStore] setDefaultAddress called with:", id);
        set((state) => ({
          profileData: state.profileData
            ? {
                ...state.profileData,
                savedAddresses: state.profileData.savedAddresses.map((addr) => ({
                  ...addr,
                  isDefault: addr.id === id,
                })),
              }
            : null,
          error: null,
        }));
      },

      // Acciones de imagen
      updateProfileImage: (imageUrl) => {
        console.log("[ProfileStore] updateProfileImage called with:", imageUrl);
        set((state) => ({
          profileData: state.profileData
            ? { ...state.profileData, profileImage: imageUrl }
            : null,
          error: null,
        }));
      },

      // Acciones de sincronización
      refreshProfile: async () => {
        const state = get();
        console.log("[ProfileStore] refreshProfile called");

        try {
          state.setLoading(true);
          state.setError(null);

          // Llamada real a la API
          const result = await ProfileService.getProfile();
          if (result.success && result.data) {
            // Mapear datos de API a formato del store
            const profileData: ProfileData = {
              firstName: result.data.name?.split(' ')[0] || '',
              lastName: result.data.name?.split(' ').slice(1).join(' ') || '',
              email: result.data.email || '',
              phone: result.data.phone || '',
              dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
              gender: (result.data.gender as any) || 'other',
              address: result.data.address || '',
              city: result.data.city || '',
              state: result.data.state || '',
              country: result.data.country || '',
              postalCode: result.data.postalCode || '',
              preferredLanguage: result.data.preferredLanguage || 'es',
              timezone: result.data.timezone || 'America/Caracas',
              currency: (result.data.currency as any) || 'USD',
              theme: 'auto',
              profileImage: result.data.profileImage || null,
              savedAddresses: state.profileData?.savedAddresses || [],
              verification: {
                emailVerified: true, // Asumir verificado si viene de API
                phoneVerified: true,
                accountVerified: false,
                verificationStatus: 'pending',
              },
            };
            state.setProfileData(profileData);
          } else {
            state.setError(result.message || 'Failed to load profile');
          }

          console.log("[ProfileStore] Profile refreshed successfully");
        } catch (error) {
          console.error("[ProfileStore] Error refreshing profile:", error);
          state.setError(error instanceof Error ? error.message : "Unknown error");
        } finally {
          state.setLoading(false);
        }
      },

      syncWithUserStore: () => {
        console.log("[ProfileStore] syncWithUserStore called");
        // Esta función se implementará cuando se integre con useUserStore
        // const userStore = useUserStore.getState();
        // if (userStore.user && !get().profileData) {
        //   // Sincronizar datos del usuario con el perfil
        // }
      },
    }),
    storageConfig
  )
);

// ===== SELECTORES OPTIMIZADOS =====

// Selectores básicos
export const useProfileData = () => useProfileStore((state) => state.profileData);
export const useIsProfileLoading = () => useProfileStore((state) => state.isLoading);
export const useProfileError = () => useProfileStore((state) => state.error);

// Selectores de datos específicos
export const useBasicInfo = () =>
  useProfileStore((state) => ({
    firstName: state.profileData?.firstName || "",
    lastName: state.profileData?.lastName || "",
    email: state.profileData?.email || "",
    phone: state.profileData?.phone || "",
    dateOfBirth: state.profileData?.dateOfBirth || null,
    gender: state.profileData?.gender || "other",
  }));

export const useLocationInfo = () =>
  useProfileStore((state) => ({
    address: state.profileData?.address || "",
    city: state.profileData?.city || "",
    state: state.profileData?.state || "",
    country: state.profileData?.country || "",
    postalCode: state.profileData?.postalCode || "",
  }));

export const usePreferences = () =>
  useProfileStore((state) => ({
    preferredLanguage: state.profileData?.preferredLanguage || "es",
    timezone: state.profileData?.timezone || "America/Caracas",
    currency: state.profileData?.currency || "USD",
    theme: state.profileData?.theme || "auto",
  }));

export const useVerificationStatus = () =>
  useProfileStore((state) => state.profileData?.verification || {
    emailVerified: false,
    phoneVerified: false,
    accountVerified: false,
    verificationStatus: "pending" as const,
  });

export const useSavedAddresses = () =>
  useProfileStore((state) => state.profileData?.savedAddresses || []);

export const useProfileImage = () =>
  useProfileStore((state) => state.profileData?.profileImage || null);

// Selectores de estado de verificación
export const useIsFullyVerified = () =>
  useProfileStore((state) => {
    const verification = state.profileData?.verification;
    return !!(
      verification?.emailVerified &&
      verification?.phoneVerified &&
      verification?.accountVerified
    );
  });

export const useVerificationBadge = () =>
  useProfileStore((state) => {
    const verification = state.profileData?.verification;
    if (!verification) return { status: "not-verified", color: "warning" };
    
    if (verification.accountVerified) {
      return { status: "verified", color: "success" };
    } else if (verification.verificationStatus === "pending") {
      return { status: "pending", color: "warning" };
    } else {
      return { status: "not-verified", color: "warning" };
    }
  });

// Selectores de acciones
export const useProfileActions = () =>
  useProfileStore((state) => ({
    setProfileData: state.setProfileData,
    updateProfileData: state.updateProfileData,
    updateBasicInfo: state.updateBasicInfo,
    updateLocation: state.updateLocation,
    updatePreferences: state.updatePreferences,
    updateEmailVerification: state.updateEmailVerification,
    updatePhoneVerification: state.updatePhoneVerification,
    updateAccountVerification: state.updateAccountVerification,
    addAddress: state.addAddress,
    updateAddress: state.updateAddress,
    deleteAddress: state.deleteAddress,
    setDefaultAddress: state.setDefaultAddress,
    updateProfileImage: state.updateProfileImage,
    refreshProfile: state.refreshProfile,
  }));
