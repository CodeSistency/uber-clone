import { create } from 'zustand';
import { emergencyService } from '@/app/services/emergencyService';

// Types
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

interface EmergencyHistory {
  id: string;
  type: 'sos' | 'accident' | 'medical' | 'other';
  description: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'cancelled';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  responseTime?: number;
  resolvedAt?: Date;
}

interface ActiveEmergency {
  id: string;
  type: 'sos' | 'accident' | 'medical' | 'other';
  description: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'active' | 'resolved';
}

interface EmergencyState {
  // State
  emergencyContacts: EmergencyContact[];
  emergencyHistory: EmergencyHistory[];
  isEmergencyActive: boolean;
  activeEmergency: ActiveEmergency | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEmergencyContacts: () => Promise<void>;
  fetchEmergencyHistory: () => Promise<void>;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => Promise<void>;
  removeEmergencyContact: (id: string) => Promise<void>;
  triggerEmergency: (emergencyData: {
    type: 'sos' | 'accident' | 'medical' | 'other';
    description: string;
    location: { latitude: number; longitude: number; address: string };
  }) => Promise<void>;
  resolveEmergency: (emergencyId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  // Initial state
  emergencyContacts: [],
  emergencyHistory: [],
  isEmergencyActive: false,
  activeEmergency: null,
  isLoading: false,
  error: null,

  // Actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  fetchEmergencyContacts: async () => {
    const state = get();
    console.log("[EmergencyStore] fetchEmergencyContacts called");

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      const contacts = await emergencyService.getEmergencyContacts();

      // Validate response
      if (!Array.isArray(contacts)) {
        throw new Error('Invalid response format from emergency contacts API');
      }

      // Update state with API response
      set({ emergencyContacts: contacts });
      console.log("[EmergencyStore] Emergency contacts fetched successfully:", contacts.length);
    } catch (error: any) {
      console.error("[EmergencyStore] Error fetching emergency contacts:", error);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to fetch emergency contacts";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);

      // Fallback to dummy data for development
      console.log("[EmergencyStore] Using fallback dummy data for emergency contacts");
      set({
        emergencyContacts: [
          {
            id: "1",
            name: "John Doe",
            phone: "+1234567890",
            relationship: "Family",
            isPrimary: true,
          },
          {
            id: "2",
            name: "Jane Smith",
            phone: "+0987654321",
            relationship: "Friend",
            isPrimary: false,
          },
        ]
      });
    } finally {
      state.setLoading(false);
    }
  },

  fetchEmergencyHistory: async () => {
    const state = get();
    console.log("[EmergencyStore] fetchEmergencyHistory called");

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      const history = await emergencyService.getEmergencyHistory();

      // Validate response
      if (!Array.isArray(history)) {
        throw new Error('Invalid response format from emergency history API');
      }

      // Update state with API response
      set({ emergencyHistory: history as any });
      console.log("[EmergencyStore] Emergency history fetched successfully:", history.length);
    } catch (error: any) {
      console.error("[EmergencyStore] Error fetching emergency history:", error);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to fetch emergency history";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);

      // Fallback to dummy data for development
      console.log("[EmergencyStore] Using fallback dummy data for emergency history");
      set({
        emergencyHistory: [
          {
            id: "1",
            type: "accident",
            description: "Minor vehicle accident",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            status: "resolved",
            location: {
              latitude: 40.7128,
              longitude: -74.0060,
              address: "123 Main St, New York, NY"
            },
            responseTime: 8,
            resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
          },
          {
            id: "2",
            type: "medical",
            description: "Medical assistance requested",
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
            status: "resolved",
            location: {
              latitude: 40.7589,
              longitude: -73.9851,
              address: "456 Broadway, New York, NY"
            },
            responseTime: 12,
            resolvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
          },
        ]
      });
    } finally {
      state.setLoading(false);
    }
  },

  addEmergencyContact: async (contactData) => {
    const state = get();
    console.log("[EmergencyStore] addEmergencyContact called:", contactData);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      const newContact = await emergencyService.addEmergencyContact(contactData);

      // Update state with new contact
      set((prevState) => ({
        emergencyContacts: [...prevState.emergencyContacts, newContact]
      }));

      console.log("[EmergencyStore] Emergency contact added successfully:", newContact);
    } catch (error: any) {
      console.error("[EmergencyStore] Error adding emergency contact:", error);

      // Enhanced error handling
      let errorMessage = "Failed to add emergency contact";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateEmergencyContact: async (id, updates) => {
    const state = get();
    console.log("[EmergencyStore] updateEmergencyContact called:", { id, updates });

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      const updatedContact = await emergencyService.updateEmergencyContact(id, updates);

      // Update state with updated contact
      set((prevState) => ({
        emergencyContacts: prevState.emergencyContacts.map(contact =>
          contact.id === id ? updatedContact : contact
        )
      }));

      console.log("[EmergencyStore] Emergency contact updated successfully:", updatedContact);
    } catch (error: any) {
      console.error("[EmergencyStore] Error updating emergency contact:", error);

      // Enhanced error handling
      let errorMessage = "Failed to update emergency contact";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  removeEmergencyContact: async (id) => {
    const state = get();
    console.log("[EmergencyStore] removeEmergencyContact called:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      await emergencyService.removeEmergencyContact(id);

      // Update state by removing contact
      set((prevState) => ({
        emergencyContacts: prevState.emergencyContacts.filter(contact => contact.id !== id)
      }));

      console.log("[EmergencyStore] Emergency contact removed successfully");
    } catch (error: any) {
      console.error("[EmergencyStore] Error removing emergency contact:", error);

      // Enhanced error handling
      let errorMessage = "Failed to remove emergency contact";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  triggerEmergency: async (emergencyData) => {
    const state = get();
    console.log("[EmergencyStore] triggerEmergency called:", emergencyData);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      const emergency = await emergencyService.triggerEmergency(emergencyData);

      // Update state with active emergency
      set({
        isEmergencyActive: true,
        activeEmergency: {
          id: emergency.id,
          type: emergency.type,
          description: emergency.description,
          timestamp: new Date(emergency.timestamp),
          location: emergency.location || {
            latitude: 0,
            longitude: 0,
            address: "Unknown location"
          },
          status: 'active'
        }
      });

      console.log("[EmergencyStore] Emergency triggered successfully:", emergency);
    } catch (error: any) {
      console.error("[EmergencyStore] Error triggering emergency:", error);

      // Enhanced error handling
      let errorMessage = "Failed to trigger emergency alert";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  resolveEmergency: async (emergencyId) => {
    const state = get();
    console.log("[EmergencyStore] resolveEmergency called:", emergencyId);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using emergencyService
      await emergencyService.resolveEmergency(emergencyId);

      // Update state to clear active emergency
      set({
        isEmergencyActive: false,
        activeEmergency: null
      });

      // Refresh emergency history
      await state.fetchEmergencyHistory();

      console.log("[EmergencyStore] Emergency resolved successfully");
    } catch (error: any) {
      console.error("[EmergencyStore] Error resolving emergency:", error);

      // Enhanced error handling
      let errorMessage = "Failed to resolve emergency";
      if (error.message) {
        errorMessage = error.message;
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },
}));