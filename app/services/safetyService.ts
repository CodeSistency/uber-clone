import { fetchAPI } from "@/lib/fetch";

// Types for Safety Service
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  isVerified: boolean;
}

export interface EmergencyAlert {
  id: string;
  type: 'sos' | 'accident' | 'medical' | 'other';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'active' | 'resolved' | 'cancelled';
  contactsNotified: string[];
  incidentDetails?: string;
  responseTime?: number;
  resolvedAt?: Date;
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
  expiresAt: Date;
}

export interface IncidentReport {
  id: string;
  type: 'accident' | 'harassment' | 'safety_concern' | 'vehicle_issue' | 'other';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  rideId?: string;
  passengerId?: string;
  evidence?: {
    photos: string[];
    videos: string[];
    audio: string[];
  };
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface SafetySettings {
  emergencyContacts: EmergencyContact[];
  autoShareTrip: boolean;
  shareTripContacts: string[];
  emergencyTimeout: number; // seconds
  panicButtonEnabled: boolean;
  locationSharingEnabled: boolean;
  incidentReportingEnabled: boolean;
  safetyNotifications: boolean;
  emergencySmsEnabled: boolean;
  emergencyCallEnabled: boolean;
}

export interface SafetyMetrics {
  totalIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number;
  emergencyAlertsTriggered: number;
  tripsShared: number;
  safetyScore: number;
  lastIncidentDate?: Date;
  safetyStreak: number; // days without incidents
}

export class SafetyService {
  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      console.log('[SafetyService] Fetching emergency contacts');
      const response = await fetchAPI('driver/safety/emergency-contacts', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching emergency contacts:', error);
      throw error;
    }
  }

  async addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'isVerified'>): Promise<EmergencyContact> {
    try {
      console.log('[SafetyService] Adding emergency contact:', contact);
      const response = await fetchAPI('driver/safety/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify(contact),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error adding emergency contact:', error);
      throw error;
    }
  }

  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    try {
      console.log('[SafetyService] Updating emergency contact:', contactId, updates);
      const response = await fetchAPI(`driver/safety/emergency-contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error updating emergency contact:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      console.log('[SafetyService] Deleting emergency contact:', contactId);
      await fetchAPI(`driver/safety/emergency-contacts/${contactId}`, {
        method: 'DELETE',
        requiresAuth: true
      });
    } catch (error) {
      console.error('[SafetyService] Error deleting emergency contact:', error);
      throw error;
    }
  }

  async verifyEmergencyContact(contactId: string, verificationCode: string): Promise<EmergencyContact> {
    try {
      console.log('[SafetyService] Verifying emergency contact:', contactId);
      const response = await fetchAPI(`driver/safety/emergency-contacts/${contactId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ verificationCode }),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error verifying emergency contact:', error);
      throw error;
    }
  }

  // Emergency Alerts
  async triggerEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status' | 'contactsNotified'>): Promise<EmergencyAlert> {
    try {
      console.log('[SafetyService] Triggering emergency alert:', alert);
      const response = await fetchAPI('driver/safety/emergency-alerts', {
        method: 'POST',
        body: JSON.stringify(alert),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error triggering emergency alert:', error);
      throw error;
    }
  }

  async getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    try {
      console.log('[SafetyService] Fetching emergency alerts');
      const response = await fetchAPI('driver/safety/emergency-alerts', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching emergency alerts:', error);
      throw error;
    }
  }

  async resolveEmergencyAlert(alertId: string): Promise<EmergencyAlert> {
    try {
      console.log('[SafetyService] Resolving emergency alert:', alertId);
      const response = await fetchAPI(`driver/safety/emergency-alerts/${alertId}/resolve`, {
        method: 'POST',
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error resolving emergency alert:', error);
      throw error;
    }
  }

  async cancelEmergencyAlert(alertId: string): Promise<EmergencyAlert> {
    try {
      console.log('[SafetyService] Cancelling emergency alert:', alertId);
      const response = await fetchAPI(`driver/safety/emergency-alerts/${alertId}/cancel`, {
        method: 'POST',
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error cancelling emergency alert:', error);
      throw error;
    }
  }

  // Trip Sharing
  async startShareTrip(rideId: string, contacts: string[]): Promise<ShareTripData> {
    try {
      console.log('[SafetyService] Starting trip sharing:', rideId, contacts);
      const response = await fetchAPI('driver/safety/share-trip', {
        method: 'POST',
        body: JSON.stringify({ rideId, contacts }),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error starting trip sharing:', error);
      throw error;
    }
  }

  async updateShareTripLocation(shareId: string, location: { latitude: number; longitude: number }): Promise<void> {
    try {
      console.log('[SafetyService] Updating share trip location:', shareId, location);
      await fetchAPI(`driver/safety/share-trip/${shareId}/location`, {
        method: 'PUT',
        body: JSON.stringify(location),
        requiresAuth: true
      });
    } catch (error) {
      console.error('[SafetyService] Error updating share trip location:', error);
      throw error;
    }
  }

  async stopShareTrip(shareId: string): Promise<void> {
    try {
      console.log('[SafetyService] Stopping trip sharing:', shareId);
      await fetchAPI(`driver/safety/share-trip/${shareId}/stop`, {
        method: 'POST',
        requiresAuth: true
      });
    } catch (error) {
      console.error('[SafetyService] Error stopping trip sharing:', error);
      throw error;
    }
  }

  async getShareTripHistory(): Promise<ShareTripData[]> {
    try {
      console.log('[SafetyService] Fetching share trip history');
      const response = await fetchAPI('driver/safety/share-trip/history', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching share trip history:', error);
      throw error;
    }
  }

  // Incident Reporting
  async reportIncident(incident: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'reportedBy'>): Promise<IncidentReport> {
    try {
      console.log('[SafetyService] Reporting incident:', incident);
      const response = await fetchAPI('driver/safety/incidents', {
        method: 'POST',
        body: JSON.stringify(incident),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error reporting incident:', error);
      throw error;
    }
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    try {
      console.log('[SafetyService] Fetching incident reports');
      const response = await fetchAPI('driver/safety/incidents', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching incident reports:', error);
      throw error;
    }
  }

  async getIncidentDetails(incidentId: string): Promise<IncidentReport> {
    try {
      console.log('[SafetyService] Fetching incident details:', incidentId);
      const response = await fetchAPI(`driver/safety/incidents/${incidentId}`, {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching incident details:', error);
      throw error;
    }
  }

  async updateIncidentReport(incidentId: string, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    try {
      console.log('[SafetyService] Updating incident report:', incidentId, updates);
      const response = await fetchAPI(`driver/safety/incidents/${incidentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error updating incident report:', error);
      throw error;
    }
  }

  // Safety Settings
  async getSafetySettings(): Promise<SafetySettings> {
    try {
      console.log('[SafetyService] Fetching safety settings');
      const response = await fetchAPI('driver/safety/settings', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching safety settings:', error);
      throw error;
    }
  }

  async updateSafetySettings(settings: Partial<SafetySettings>): Promise<SafetySettings> {
    try {
      console.log('[SafetyService] Updating safety settings:', settings);
      const response = await fetchAPI('driver/safety/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error updating safety settings:', error);
      throw error;
    }
  }

  // Safety Metrics
  async getSafetyMetrics(): Promise<SafetyMetrics> {
    try {
      console.log('[SafetyService] Fetching safety metrics');
      const response = await fetchAPI('driver/safety/metrics', {
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error fetching safety metrics:', error);
      throw error;
    }
  }

  // Emergency Services Integration
  async callEmergencyServices(emergencyType: 'police' | 'medical' | 'fire', location: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    callId: string;
    estimatedResponseTime: number;
  }> {
    try {
      console.log('[SafetyService] Calling emergency services:', emergencyType, location);
      const response = await fetchAPI('driver/safety/emergency-services', {
        method: 'POST',
        body: JSON.stringify({ emergencyType, location }),
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error calling emergency services:', error);
      throw error;
    }
  }

  // Safety Check
  async performSafetyCheck(): Promise<{
    isSafe: boolean;
    issues: string[];
    recommendations: string[];
    lastCheck: Date;
  }> {
    try {
      console.log('[SafetyService] Performing safety check');
      const response = await fetchAPI('driver/safety/check', {
        method: 'POST',
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('[SafetyService] Error performing safety check:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const safetyService = new SafetyService();
