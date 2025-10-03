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
      console.log("[EmergencyService] Fetching emergency contacts");
      const response = await fetchAPI("driver/emergency/contacts", {
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency contacts fetched:", response);
      return response.data || response;
    } catch (error) {
      console.error(
        "[EmergencyService] Error fetching emergency contacts:",
        error,
      );
      throw error;
    }
  }

  // Add emergency contact
  async addEmergencyContact(
    contactData: Omit<EmergencyContact, "id">,
  ): Promise<EmergencyContact> {
    try {
      console.log("[EmergencyService] Adding emergency contact:", contactData);
      const response = await fetchAPI("driver/emergency/contacts", {
        method: "POST",
        body: JSON.stringify(contactData),
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency contact added:", response);
      return response.data || response;
    } catch (error) {
      console.error(
        "[EmergencyService] Error adding emergency contact:",
        error,
      );
      throw error;
    }
  }

  // Update emergency contact
  async updateEmergencyContact(
    id: string,
    updates: Partial<EmergencyContact>,
  ): Promise<EmergencyContact> {
    try {
      console.log("[EmergencyService] Updating emergency contact:", {
        id,
        updates,
      });
      const response = await fetchAPI(`driver/emergency/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency contact updated:", response);
      return response.data || response;
    } catch (error) {
      console.error(
        "[EmergencyService] Error updating emergency contact:",
        error,
      );
      throw error;
    }
  }

  // Remove emergency contact
  async removeEmergencyContact(id: string): Promise<void> {
    try {
      console.log("[EmergencyService] Removing emergency contact:", id);
      await fetchAPI(`driver/emergency/contacts/${id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency contact removed");
    } catch (error) {
      console.error(
        "[EmergencyService] Error removing emergency contact:",
        error,
      );
      throw error;
    }
  }

  // Get emergency history
  async getEmergencyHistory(): Promise<EmergencyHistory[]> {
    try {
      console.log("[EmergencyService] Fetching emergency history");
      const response = await fetchAPI("driver/emergency/history", {
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency history fetched:", response);
      return response.data || response;
    } catch (error) {
      console.error(
        "[EmergencyService] Error fetching emergency history:",
        error,
      );
      throw error;
    }
  }

  // Trigger emergency
  async triggerEmergency(
    emergencyData: EmergencyTriggerData,
  ): Promise<EmergencyHistory> {
    try {
      console.log("[EmergencyService] Triggering emergency:", emergencyData);
      const response = await fetchAPI("driver/emergency/trigger", {
        method: "POST",
        body: JSON.stringify(emergencyData),
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency triggered:", response);
      return response.data || response;
    } catch (error) {
      console.error("[EmergencyService] Error triggering emergency:", error);
      throw error;
    }
  }

  // Resolve emergency
  async resolveEmergency(emergencyId: string): Promise<void> {
    try {
      console.log("[EmergencyService] Resolving emergency:", emergencyId);
      await fetchAPI(`driver/emergency/${emergencyId}/resolve`, {
        method: "POST",
        requiresAuth: true,
      });
      console.log("[EmergencyService] Emergency resolved");
    } catch (error) {
      console.error("[EmergencyService] Error resolving emergency:", error);
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
      console.log("[EmergencyService] Reporting issue:", issueData);
      const response = await fetchAPI("driver/emergency/report-issue", {
        method: "POST",
        body: JSON.stringify(issueData),
        requiresAuth: true,
      });
      console.log("[EmergencyService] Issue reported:", response);
      return response.data || response;
    } catch (error) {
      console.error("[EmergencyService] Error reporting issue:", error);
      throw error;
    }
  }

  // Get safety resources
  async getSafetyResources(): Promise<any[]> {
    try {
      console.log("[EmergencyService] Fetching safety resources");
      const response = await fetchAPI("driver/emergency/safety-resources", {
        requiresAuth: true,
      });
      console.log("[EmergencyService] Safety resources fetched:", response);
      return response.data || response;
    } catch (error) {
      console.error(
        "[EmergencyService] Error fetching safety resources:",
        error,
      );
      throw error;
    }
  }

  // Send test emergency alert (for testing purposes)
  async sendTestEmergency(): Promise<any> {
    try {
      console.log("[EmergencyService] Sending test emergency alert");
      const response = await fetchAPI("driver/emergency/test", {
        method: "POST",
        requiresAuth: true,
      });
      console.log("[EmergencyService] Test emergency sent:", response);
      return response.data || response;
    } catch (error) {
      console.error("[EmergencyService] Error sending test emergency:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const emergencyService = new EmergencyService();
