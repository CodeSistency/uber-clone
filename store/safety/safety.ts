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
  type: 'verbal_abuse' | 'physical_threat' | 'harassment' | 'accident' | 'other';
  description: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rideId?: string;
  passengerId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  evidence?: {
    photos: string[];
    audio?: string;
    witnessContacts?: string[];
  };
}

export interface EmergencyAlert {
  id: string;
  type: 'sos' | 'accident' | 'medical' | 'threat' | 'other';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rideId?: string;
  passengerId?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
  responseTime?: number; // in seconds
  emergencyServicesContacted: boolean;
  contactsNotified: string[];
}

export interface RideCheck {
  id: string;
  rideId: string;
  timestamp: Date;
  type: 'unusual_stop' | 'route_deviation' | 'extended_wait' | 'scheduled';
  message: string;
  response?: 'ok' | 'help_needed' | 'no_response';
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

export type EmergencyType = 'sos' | 'accident' | 'medical' | 'threat' | 'other';

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
  triggerEmergency: (type: EmergencyType, location?: { latitude: number; longitude: number }) => Promise<void>;
  cancelEmergency: (alertId: string) => Promise<void>;
  
  // Share Trip Functions
  shareTrip: (contacts: string[]) => Promise<void>;
  stopSharingTrip: () => Promise<void>;
  updateShareTripLocation: (location: { latitude: number; longitude: number }) => void;
  
  // Incident Reporting
  reportIncident: (incident: Omit<SafetyIncident, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: SafetyIncident['status']) => Promise<void>;
  
  // Safety Contacts Management
  addSafetyContact: (contact: Omit<SafetyContact, 'id'>) => Promise<void>;
  updateSafetyContact: (contactId: string, updates: Partial<SafetyContact>) => Promise<void>;
  deleteSafetyContact: (contactId: string) => Promise<void>;
  fetchSafetyContacts: () => Promise<void>;
  
  // Ride Check Functions
  respondToRideCheck: (checkId: string, response: RideCheck['response']) => Promise<void>;
  fetchRideChecks: (rideId: string) => Promise<void>;
  
  // Settings Management
  updateSafetySettings: (settings: Partial<{
    emergencyServicesNumber: string;
    autoShareTrip: boolean;
    shareTripContacts: string[];
    incidentReportingEnabled: boolean;
    verbalAbuseDetection: boolean;
    autoEmergencyContact: boolean;
  }>) => Promise<void>;
  
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
  emergencyServicesNumber: '911',
  autoShareTrip: false,
  shareTripContacts: [],
  incidentReportingEnabled: true,
  
  // Loading and Error States
  isLoading: false,
  error: null,

  // Actions
  setInRide: (inRide: boolean, ride?: any) => {
    console.log('[SafetyStore] Setting in ride:', inRide, ride ? 'with ride data' : 'without ride data');
    set(() => ({ 
      isInRide: inRide,
      currentRide: ride || null,
    }));
  },

  triggerEmergency: async (type: EmergencyType, location?: { latitude: number; longitude: number }) => {
    console.log('[SafetyStore] Triggering emergency:', type, location);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      const alertId = `emergency_${Date.now()}`;
      const currentLocation = location ? {
        ...location,
        address: 'Current Location',
      } : {
        latitude: 0, // TODO: Get from location store
        longitude: 0,
        address: 'Current Location',
      };

      const emergencyAlert: EmergencyAlert = {
        id: alertId,
        type,
        timestamp: new Date(),
        location: currentLocation,
        rideId: state.currentRide?.id,
        passengerId: state.currentRide?.passengerId,
        status: 'active',
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

      console.log('[SafetyStore] Emergency alert created:', alertId);
    } catch (error) {
      console.error('[SafetyStore] Error triggering emergency:', error);
      state.setError((error as Error).message || 'Failed to trigger emergency alert');
    } finally {
      state.setLoading(false);
    }
  },

  cancelEmergency: async (alertId: string) => {
    console.log('[SafetyStore] Canceling emergency:', alertId);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      // Update alert status
      set((state) => ({
        emergencyAlerts: state.emergencyAlerts.map(alert =>
          alert.id === alertId
            ? { ...alert, status: 'false_alarm' as const }
            : alert
        ),
        emergencyButtonActive: false,
      }));

      console.log('[SafetyStore] Emergency alert canceled:', alertId);
    } catch (error) {
      console.error('[SafetyStore] Error canceling emergency:', error);
      state.setError((error as Error).message || 'Failed to cancel emergency alert');
    } finally {
      state.setLoading(false);
    }
  },

  shareTrip: async (contacts: string[]) => {
    console.log('[SafetyStore] Sharing trip with contacts:', contacts);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      if (!state.currentRide) {
        throw new Error('No active ride to share');
      }

      const shareData: ShareTripData = {
        rideId: state.currentRide.id || 'unknown',
        passengerName: state.currentRide.passengerName || 'Passenger',
        pickupLocation: state.currentRide.pickupLocation || 'Pickup Location',
        dropoffLocation: state.currentRide.dropoffLocation || 'Dropoff Location',
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        currentLocation: {
          latitude: 0, // TODO: Get from location store
          longitude: 0,
        },
        shareUrl: `https://uber-clone.com/trip/${state.currentRide.id || 'unknown'}`,
        isActive: true,
        contactsShared: contacts,
      };

      set(() => ({
        shareTripData: shareData,
        shareTripActive: true,
      }));

      // TODO: Send share notifications to contacts
      console.log('[SafetyStore] Trip shared successfully');
    } catch (error) {
      console.error('[SafetyStore] Error sharing trip:', error);
      state.setError((error as Error).message || 'Failed to share trip');
    } finally {
      state.setLoading(false);
    }
  },

  stopSharingTrip: async () => {
    console.log('[SafetyStore] Stopping trip sharing');
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set(() => ({
        shareTripData: null,
        shareTripActive: false,
      }));

      console.log('[SafetyStore] Trip sharing stopped');
    } catch (error) {
      console.error('[SafetyStore] Error stopping trip sharing:', error);
      state.setError((error as Error).message || 'Failed to stop sharing trip');
    } finally {
      state.setLoading(false);
    }
  },

  updateShareTripLocation: (location: { latitude: number; longitude: number }) => {
    console.log('[SafetyStore] Updating share trip location:', location);
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

  reportIncident: async (incident: Omit<SafetyIncident, 'id' | 'timestamp' | 'status'>) => {
    console.log('[SafetyStore] Reporting incident:', incident);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      const incidentId = `incident_${Date.now()}`;
      const newIncident: SafetyIncident = {
        ...incident,
        id: incidentId,
        timestamp: new Date(),
        status: 'reported',
      };

      set((state) => ({
        activeIncidents: [newIncident, ...state.activeIncidents],
      }));

      // TODO: Send incident report to backend
      console.log('[SafetyStore] Incident reported:', incidentId);
    } catch (error) {
      console.error('[SafetyStore] Error reporting incident:', error);
      state.setError((error as Error).message || 'Failed to report incident');
    } finally {
      state.setLoading(false);
    }
  },

  updateIncidentStatus: async (incidentId: string, status: SafetyIncident['status']) => {
    console.log('[SafetyStore] Updating incident status:', incidentId, status);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        activeIncidents: state.activeIncidents.map(incident =>
          incident.id === incidentId
            ? { ...incident, status }
            : incident
        ),
      }));

      console.log('[SafetyStore] Incident status updated:', incidentId, status);
    } catch (error) {
      console.error('[SafetyStore] Error updating incident status:', error);
      state.setError((error as Error).message || 'Failed to update incident status');
    } finally {
      state.setLoading(false);
    }
  },

  addSafetyContact: async (contact: Omit<SafetyContact, 'id'>) => {
    console.log('[SafetyStore] Adding safety contact:', contact);
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
      console.log('[SafetyStore] Safety contact added:', contactId);
    } catch (error) {
      console.error('[SafetyStore] Error adding safety contact:', error);
      state.setError((error as Error).message || 'Failed to add safety contact');
    } finally {
      state.setLoading(false);
    }
  },

  updateSafetyContact: async (contactId: string, updates: Partial<SafetyContact>) => {
    console.log('[SafetyStore] Updating safety contact:', contactId, updates);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        safetyContacts: state.safetyContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, ...updates }
            : contact
        ),
      }));

      // TODO: Save to backend
      console.log('[SafetyStore] Safety contact updated:', contactId);
    } catch (error) {
      console.error('[SafetyStore] Error updating safety contact:', error);
      state.setError((error as Error).message || 'Failed to update safety contact');
    } finally {
      state.setLoading(false);
    }
  },

  deleteSafetyContact: async (contactId: string) => {
    console.log('[SafetyStore] Deleting safety contact:', contactId);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        safetyContacts: state.safetyContacts.filter(contact => contact.id !== contactId),
      }));

      // TODO: Delete from backend
      console.log('[SafetyStore] Safety contact deleted:', contactId);
    } catch (error) {
      console.error('[SafetyStore] Error deleting safety contact:', error);
      state.setError((error as Error).message || 'Failed to delete safety contact');
    } finally {
      state.setLoading(false);
    }
  },

  fetchSafetyContacts: async () => {
    console.log('[SafetyStore] Fetching safety contacts');
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockContacts: SafetyContact[] = [
        {
          id: 'contact_001',
          name: 'Emergency Contact 1',
          phone: '+1234567890',
          email: 'emergency1@example.com',
          relationship: 'Family',
          isEmergency: true,
          isActive: true,
        },
        {
          id: 'contact_002',
          name: 'Emergency Contact 2',
          phone: '+0987654321',
          relationship: 'Friend',
          isEmergency: true,
          isActive: true,
        },
      ];

      set(() => ({ safetyContacts: mockContacts }));
    } catch (error) {
      console.error('[SafetyStore] Error fetching safety contacts:', error);
      state.setError((error as Error).message || 'Failed to fetch safety contacts');
    } finally {
      state.setLoading(false);
    }
  },

  respondToRideCheck: async (checkId: string, response: RideCheck['response']) => {
    console.log('[SafetyStore] Responding to ride check:', checkId, response);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        rideChecks: state.rideChecks.map(check =>
          check.id === checkId
            ? { ...check, response, responseTime: new Date() }
            : check
        ),
      }));

      // TODO: Send response to backend
      console.log('[SafetyStore] Ride check response sent:', checkId, response);
    } catch (error) {
      console.error('[SafetyStore] Error responding to ride check:', error);
      state.setError((error as Error).message || 'Failed to respond to ride check');
    } finally {
      state.setLoading(false);
    }
  },

  fetchRideChecks: async (rideId: string) => {
    console.log('[SafetyStore] Fetching ride checks for ride:', rideId);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockRideChecks: RideCheck[] = [
        {
          id: 'check_001',
          rideId,
          timestamp: new Date(),
          type: 'scheduled',
          message: 'How is your ride going?',
          response: undefined,
        },
      ];

      set(() => ({ rideChecks: mockRideChecks }));
    } catch (error) {
      console.error('[SafetyStore] Error fetching ride checks:', error);
      state.setError((error as Error).message || 'Failed to fetch ride checks');
    } finally {
      state.setLoading(false);
    }
  },

  updateSafetySettings: async (settings) => {
    console.log('[SafetyStore] Updating safety settings:', settings);
    const state = get();
    
    try {
      state.setLoading(true);
      state.clearError();

      set(() => ({
        ...settings,
      }));

      // TODO: Save to backend
      console.log('[SafetyStore] Safety settings updated');
    } catch (error) {
      console.error('[SafetyStore] Error updating safety settings:', error);
      state.setError((error as Error).message || 'Failed to update safety settings');
    } finally {
      state.setLoading(false);
    }
  },

  // Utility Functions
  setLoading: (loading: boolean) => {
    console.log('[SafetyStore] Setting loading:', loading);
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    console.log('[SafetyStore] Setting error:', error);
    set(() => ({ error }));
  },

  clearError: () => {
    console.log('[SafetyStore] Clearing error');
    set(() => ({ error: null }));
  },
}));
