import { create } from "zustand";

// Types for Safety
export interface SafetyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isEmergency: boolean;
  isActive: boolean;
}

export interface SafetyIncident {
  id: string;
  type:
    | "verbal_abuse"
    | "physical_threat"
    | "harassment"
    | "accident"
    | "other";
  description: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rideId?: string;
  passengerId?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "investigating" | "resolved" | "closed";
  evidence?: {
    photos: string[];
    audio?: string;
    witnessContacts?: string[];
  };
}

export interface EmergencyAlert {
  id: string;
  type: "sos" | "accident" | "medical" | "threat" | "other";
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rideId?: string;
  passengerId?: string;
  status: "active" | "acknowledged" | "resolved" | "false_alarm";
  responseTime?: number; // in seconds
  emergencyServicesContacted: boolean;
  contactsNotified: string[];
}

export interface RideCheck {
  id: string;
  rideId: string;
  timestamp: Date;
  type: "unusual_stop" | "route_deviation" | "extended_wait" | "scheduled";
  message: string;
  response?: "ok" | "help_needed" | "no_response";
  responseTime?: Date;
}

export interface ShareTripData {
  rideId: string;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedArrival: Date;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  shareUrl: string;
  isActive: boolean;
  contactsShared: string[];
}

export type EmergencyType = "sos" | "accident" | "medical" | "threat" | "other";

// Safety Store Interface
interface SafetyStore {
  // State
  isInRide: boolean;
  currentRide: any | null; // Will be typed properly when Ride type is available
  safetyContacts: SafetyContact[];
  activeIncidents: SafetyIncident[];
  emergencyAlerts: EmergencyAlert[];
  rideChecks: RideCheck[];
  shareTripData: ShareTripData | null;

  // Safety Features Status
  emergencyButtonActive: boolean;
  shareTripActive: boolean;
  rideCheckActive: boolean;
  verbalAbuseDetection: boolean;
  autoEmergencyContact: boolean;

  // Settings
  emergencyServicesNumber: string;
  autoShareTrip: boolean;
  shareTripContacts: string[];
  incidentReportingEnabled: boolean;

  // Loading and Error States
  isLoading: boolean;
  error: string | null;

  // Actions
  setInRide: (inRide: boolean, ride?: any) => void;

  // Emergency Functions
  triggerEmergency: (
    type: EmergencyType,
    location?: { latitude: number; longitude: number },
  ) => Promise<void>;
  cancelEmergency: (alertId: string) => Promise<void>;

  // Share Trip Functions
  shareTrip: (contacts: string[]) => Promise<void>;
  stopSharingTrip: () => Promise<void>;
  updateShareTripLocation: (location: {
    latitude: number;
    longitude: number;
  }) => void;

  // Incident Reporting
  reportIncident: (
    incident: Omit<SafetyIncident, "id" | "timestamp" | "status">,
  ) => Promise<void>;
  updateIncidentStatus: (
    incidentId: string,
    status: SafetyIncident["status"],
  ) => Promise<void>;

  // Safety Contacts Management
  addSafetyContact: (contact: Omit<SafetyContact, "id">) => Promise<void>;
  updateSafetyContact: (
    contactId: string,
    updates: Partial<SafetyContact>,
  ) => Promise<void>;
  deleteSafetyContact: (contactId: string) => Promise<void>;
  fetchSafetyContacts: () => Promise<void>;

  // Ride Check Functions
  respondToRideCheck: (
    checkId: string,
    response: RideCheck["response"],
  ) => Promise<void>;
  fetchRideChecks: (rideId: string) => Promise<void>;

  // Settings Management
  updateSafetySettings: (
    settings: Partial<{
      emergencyServicesNumber: string;
      autoShareTrip: boolean;
      shareTripContacts: string[];
      incidentReportingEnabled: boolean;
      verbalAbuseDetection: boolean;
      autoEmergencyContact: boolean;
    }>,
  ) => Promise<void>;

  // Utility Functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSafetyStore = create<SafetyStore>((set, get) => ({
  // Initial State
  isInRide: false,
  currentRide: null,
  safetyContacts: [],
  activeIncidents: [],
  emergencyAlerts: [],
  rideChecks: [],
  shareTripData: null,

  // Safety Features Status
  emergencyButtonActive: false,
  shareTripActive: false,
  rideCheckActive: false,
  verbalAbuseDetection: true,
  autoEmergencyContact: true,

  // Settings
  emergencyServicesNumber: "911",
  autoShareTrip: false,
  shareTripContacts: [],
  incidentReportingEnabled: true,

  // Loading and Error States
  isLoading: false,
  error: null,

  // Actions
  setInRide: (inRide: boolean, ride?: any) => {
    
    set(() => ({
      isInRide: inRide,
      currentRide: ride || null,
    }));
  },

  triggerEmergency: async (
    type: EmergencyType,
    location?: { latitude: number; longitude: number },
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const alertId = `emergency_${Date.now()}`;
      const currentLocation = location
        ? {
            ...location,
            address: "Current Location",
          }
        : {
            latitude: 0, // TODO: Get from location store
            longitude: 0,
            address: "Current Location",
          };

      const emergencyAlert: EmergencyAlert = {
        id: alertId,
        type,
        timestamp: new Date(),
        location: currentLocation,
        rideId: state.currentRide?.id,
        passengerId: state.currentRide?.passengerId,
        status: "active",
        emergencyServicesContacted: false,
        contactsNotified: [],
      };

      // Add to active alerts
      set((state) => ({
        emergencyAlerts: [emergencyAlert, ...state.emergencyAlerts],
        emergencyButtonActive: true,
      }));

      // TODO: Implement actual emergency response
      // 1. Contact emergency services
      // 2. Notify safety contacts
      // 3. Send location data
      // 4. Create incident report

      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to trigger emergency alert",
      );
    } finally {
      state.setLoading(false);
    }
  },

  cancelEmergency: async (alertId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // Update alert status
      set((state) => ({
        emergencyAlerts: state.emergencyAlerts.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "false_alarm" as const }
            : alert,
        ),
        emergencyButtonActive: false,
      }));

      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to cancel emergency alert",
      );
    } finally {
      state.setLoading(false);
    }
  },

  shareTrip: async (contacts: string[]) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      if (!state.currentRide) {
        throw new Error("No active ride to share");
      }

      const shareData: ShareTripData = {
        rideId: state.currentRide.id || "unknown",
        passengerName: state.currentRide.passengerName || "Passenger",
        pickupLocation: state.currentRide.pickupLocation || "Pickup Location",
        dropoffLocation:
          state.currentRide.dropoffLocation || "Dropoff Location",
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        currentLocation: {
          latitude: 0, // TODO: Get from location store
          longitude: 0,
        },
        shareUrl: `https://uber-clone.com/trip/${state.currentRide.id || "unknown"}`,
        isActive: true,
        contactsShared: contacts,
      };

      set(() => ({
        shareTripData: shareData,
        shareTripActive: true,
      }));

      // TODO: Send share notifications to contacts
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to share trip");
    } finally {
      state.setLoading(false);
    }
  },

  stopSharingTrip: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set(() => ({
        shareTripData: null,
        shareTripActive: false,
      }));

      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to stop sharing trip");
    } finally {
      state.setLoading(false);
    }
  },

  updateShareTripLocation: (location: {
    latitude: number;
    longitude: number;
  }) => {
    
    const state = get();

    if (state.shareTripData) {
      set((currentState) => ({
        shareTripData: {
          ...currentState.shareTripData!,
          currentLocation: location,
        },
      }));
    }
  },

  reportIncident: async (
    incident: Omit<SafetyIncident, "id" | "timestamp" | "status">,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const incidentId = `incident_${Date.now()}`;
      const newIncident: SafetyIncident = {
        ...incident,
        id: incidentId,
        timestamp: new Date(),
        status: "reported",
      };

      set((state) => ({
        activeIncidents: [newIncident, ...state.activeIncidents],
      }));

      // TODO: Send incident report to backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to report incident");
    } finally {
      state.setLoading(false);
    }
  },

  updateIncidentStatus: async (
    incidentId: string,
    status: SafetyIncident["status"],
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        activeIncidents: state.activeIncidents.map((incident) =>
          incident.id === incidentId ? { ...incident, status } : incident,
        ),
      }));

      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update incident status",
      );
    } finally {
      state.setLoading(false);
    }
  },

  addSafetyContact: async (contact: Omit<SafetyContact, "id">) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const contactId = `contact_${Date.now()}`;
      const newContact: SafetyContact = {
        ...contact,
        id: contactId,
      };

      set((state) => ({
        safetyContacts: [...state.safetyContacts, newContact],
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to add safety contact",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateSafetyContact: async (
    contactId: string,
    updates: Partial<SafetyContact>,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        safetyContacts: state.safetyContacts.map((contact) =>
          contact.id === contactId ? { ...contact, ...updates } : contact,
        ),
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update safety contact",
      );
    } finally {
      state.setLoading(false);
    }
  },

  deleteSafetyContact: async (contactId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        safetyContacts: state.safetyContacts.filter(
          (contact) => contact.id !== contactId,
        ),
      }));

      // TODO: Delete from backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to delete safety contact",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchSafetyContacts: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockContacts: SafetyContact[] = [
        {
          id: "contact_001",
          name: "Emergency Contact 1",
          phone: "+1234567890",
          email: "emergency1@example.com",
          relationship: "Family",
          isEmergency: true,
          isActive: true,
        },
        {
          id: "contact_002",
          name: "Emergency Contact 2",
          phone: "+0987654321",
          relationship: "Friend",
          isEmergency: true,
          isActive: true,
        },
      ];

      set(() => ({ safetyContacts: mockContacts }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch safety contacts",
      );
    } finally {
      state.setLoading(false);
    }
  },

  respondToRideCheck: async (
    checkId: string,
    response: RideCheck["response"],
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        rideChecks: state.rideChecks.map((check) =>
          check.id === checkId
            ? { ...check, response, responseTime: new Date() }
            : check,
        ),
      }));

      // TODO: Send response to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to respond to ride check",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchRideChecks: async (rideId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockRideChecks: RideCheck[] = [
        {
          id: "check_001",
          rideId,
          timestamp: new Date(),
          type: "scheduled",
          message: "How is your ride going?",
          response: undefined,
        },
      ];

      set(() => ({ rideChecks: mockRideChecks }));
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to fetch ride checks");
    } finally {
      state.setLoading(false);
    }
  },

  updateSafetySettings: async (settings) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set(() => ({
        ...settings,
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update safety settings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  // Utility Functions
  setLoading: (loading: boolean) => {
    
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    
    set(() => ({ error }));
  },

  clearError: () => {
    
    set(() => ({ error: null }));
  },
}));
