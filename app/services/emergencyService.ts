import { fetchAPI } from "@/lib/fetch";

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
  type: "sos" | "accident" | "medical" | "other";
  description: string;
  timestamp: string;
  status: "active" | "resolved" | "cancelled";
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  responseTime?: number;
  resolvedAt?: string;
}

interface EmergencyTriggerData {
  type: "sos" | "accident" | "medical" | "other";
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

class EmergencyService {
  // Get emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      
      const response = await fetchAPI("driver/emergency/contacts", {
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Add emergency contact
  async addEmergencyContact(
    contactData: Omit<EmergencyContact, "id">,
  ): Promise<EmergencyContact> {
    try {
      
      const response = await fetchAPI("driver/emergency/contacts", {
        method: "POST",
        body: JSON.stringify(contactData),
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Update emergency contact
  async updateEmergencyContact(
    id: string,
    updates: Partial<EmergencyContact>,
  ): Promise<EmergencyContact> {
    try {
      
      const response = await fetchAPI(`driver/emergency/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Remove emergency contact
  async removeEmergencyContact(id: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/emergency/contacts/${id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      
    } catch (error) {
      
      throw error;
    }
  }

  // Get emergency history
  async getEmergencyHistory(): Promise<EmergencyHistory[]> {
    try {
      
      const response = await fetchAPI("driver/emergency/history", {
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Trigger emergency
  async triggerEmergency(
    emergencyData: EmergencyTriggerData,
  ): Promise<EmergencyHistory> {
    try {
      
      const response = await fetchAPI("driver/emergency/trigger", {
        method: "POST",
        body: JSON.stringify(emergencyData),
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Resolve emergency
  async resolveEmergency(emergencyId: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/emergency/${emergencyId}/resolve`, {
        method: "POST",
        requiresAuth: true,
      });
      
    } catch (error) {
      
      throw error;
    }
  }

  // Report issue (non-emergency)
  async reportIssue(issueData: {
    type: "safety" | "vehicle" | "passenger" | "other";
    description: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    severity: "low" | "medium" | "high";
  }): Promise<any> {
    try {
      
      const response = await fetchAPI("driver/emergency/report-issue", {
        method: "POST",
        body: JSON.stringify(issueData),
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get safety resources
  async getSafetyResources(): Promise<any[]> {
    try {
      
      const response = await fetchAPI("driver/emergency/safety-resources", {
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }

  // Send test emergency alert (for testing purposes)
  async sendTestEmergency(): Promise<any> {
    try {
      
      const response = await fetchAPI("driver/emergency/test", {
        method: "POST",
        requiresAuth: true,
      });
      
      return response.data || response;
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const emergencyService = new EmergencyService();
