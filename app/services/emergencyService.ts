import { useEmergencyStore, useNotificationStore } from "../../store";
import {
  LocationData,
  EmergencyAlert,
  EmergencyContact,
} from "../../types/type";

import { notificationService } from "./notificationService";
import { websocketService } from "./websocketService";

export class EmergencyService {
  private static instance: EmergencyService;

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  async triggerEmergency(
    rideId: number,
    type: "sos" | "accident" | "medical" | "other",
    location: LocationData,
    description?: string,
    userId?: string,
  ): Promise<EmergencyAlert> {
    try {
      console.log("[EmergencyService] Triggering emergency:", {
        rideId,
        type,
        location,
        description,
      });

      // Create emergency alert
      const emergencyAlert: EmergencyAlert = {
        id: `emergency_${Date.now()}`,
        rideId,
        userId: userId || "current_user",
        type,
        location,
        timestamp: new Date(),
        status: "active",
        description,
      };

      // Update local store
      useEmergencyStore.getState().triggerEmergency(emergencyAlert);

      // Send via WebSocket
      websocketService.triggerEmergency({
        ...emergencyAlert,
        action: "trigger",
      });

      // Send critical notification
      await notificationService.sendLocalNotification(
        "🚨 Emergency Alert",
        "Emergency services have been notified. Help is on the way.",
        {
          type: "EMERGENCY_ALERT",
          emergencyId: emergencyAlert.id,
          rideId,
        },
      );

      // Notify emergency contacts
      await this.notifyEmergencyContacts(emergencyAlert);

      // TODO: Call emergency services API
      // await this.callEmergencyServices(emergencyAlert);

      return emergencyAlert;
    } catch (error) {
      console.error("[EmergencyService] Failed to trigger emergency:", error);
      throw error;
    }
  }

  async resolveEmergency(emergencyId: string): Promise<void> {
    try {
      console.log("[EmergencyService] Resolving emergency:", emergencyId);

      // Update local store
      useEmergencyStore.getState().resolveEmergency(emergencyId);

      // Send via WebSocket
      websocketService.triggerEmergency({
        id: emergencyId,
        action: "resolve",
        timestamp: new Date(),
      });

      // Send resolution notification
      await notificationService.sendLocalNotification(
        "Emergency Resolved",
        "Your emergency alert has been resolved.",
        {
          type: "SYSTEM_UPDATE",
          emergencyId,
        },
      );
    } catch (error) {
      console.error("[EmergencyService] Failed to resolve emergency:", error);
      throw error;
    }
  }

  async notifyEmergencyContacts(emergencyAlert: EmergencyAlert): Promise<void> {
    try {
      const contacts = useEmergencyStore.getState().emergencyContacts;

      if (contacts.length === 0) {
        console.warn("[EmergencyService] No emergency contacts available");
        return;
      }

      console.log(
        "[EmergencyService] Notifying emergency contacts:",
        contacts.length,
      );

      // TODO: Send SMS to emergency contacts
      // For now, just log the action
      contacts.forEach((contact: EmergencyContact) => {
        console.log("[EmergencyService] Would notify contact:", {
          name: contact.name,
          phone: contact.phone,
          emergency: emergencyAlert.type,
        });
      });

      // Send local notification about contacts being notified
      await notificationService.sendLocalNotification(
        "Emergency Contacts Notified",
        `${contacts.length} emergency contact${contacts.length > 1 ? "s" : ""} have been notified.`,
        {
          type: "SYSTEM_UPDATE",
          emergencyId: emergencyAlert.id,
        },
      );
    } catch (error) {
      console.error(
        "[EmergencyService] Failed to notify emergency contacts:",
        error,
      );
      throw error;
    }
  }

  async addEmergencyContact(
    contact: Omit<EmergencyContact, "id">,
  ): Promise<EmergencyContact> {
    try {
      console.log("[EmergencyService] Adding emergency contact:", contact);

      const newContact: EmergencyContact = {
        ...contact,
        id: `contact_${Date.now()}`,
      };

      useEmergencyStore.getState().addEmergencyContact(newContact);

      // TODO: Save to backend
      // await this.apiService.saveEmergencyContact(newContact);

      return newContact;
    } catch (error) {
      console.error(
        "[EmergencyService] Failed to add emergency contact:",
        error,
      );
      throw error;
    }
  }

  async removeEmergencyContact(contactId: string): Promise<void> {
    try {
      console.log("[EmergencyService] Removing emergency contact:", contactId);

      useEmergencyStore.getState().removeEmergencyContact(contactId);

      // TODO: Remove from backend
      // await this.apiService.removeEmergencyContact(contactId);
    } catch (error) {
      console.error(
        "[EmergencyService] Failed to remove emergency contact:",
        error,
      );
      throw error;
    }
  }

  async loadEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      console.log("[EmergencyService] Loading emergency contacts");

      // TODO: Load from backend
      // const contacts = await this.apiService.getEmergencyContacts();

      // For now, return empty array
      const contacts: EmergencyContact[] = [];

      useEmergencyStore.getState().setEmergencyContacts(contacts);

      return contacts;
    } catch (error) {
      console.error(
        "[EmergencyService] Failed to load emergency contacts:",
        error,
      );
      throw error;
    }
  }

  getEmergencyHistory(): EmergencyAlert[] {
    return useEmergencyStore.getState().emergencyHistory;
  }

  getActiveEmergency(): EmergencyAlert | null {
    return useEmergencyStore.getState().activeEmergency;
  }

  isEmergencyActive(): boolean {
    return useEmergencyStore.getState().isEmergencyActive;
  }

  getEmergencyContacts(): EmergencyContact[] {
    return useEmergencyStore.getState().emergencyContacts;
  }

  // Emergency type utilities
  getEmergencyTypeLabel(type: string): string {
    switch (type) {
      case "sos":
        return "SOS Emergency";
      case "accident":
        return "Vehicle Accident";
      case "medical":
        return "Medical Emergency";
      case "other":
        return "Other Emergency";
      default:
        return "Emergency";
    }
  }

  getEmergencyTypeIcon(type: string): string {
    switch (type) {
      case "sos":
        return "🚨";
      case "accident":
        return "🚗💥";
      case "medical":
        return "🚑";
      case "other":
        return "⚠️";
      default:
        return "🚨";
    }
  }

  // Validation
  validateEmergencyTrigger(
    rideId: number,
    type: string,
    location: LocationData,
  ): { isValid: boolean; error?: string } {
    if (!rideId) {
      return { isValid: false, error: "Ride ID is required" };
    }

    if (!type || !["sos", "accident", "medical", "other"].includes(type)) {
      return { isValid: false, error: "Invalid emergency type" };
    }

    if (!location || !location.latitude || !location.longitude) {
      return { isValid: false, error: "Location is required" };
    }

    // Check if emergency is already active
    if (this.isEmergencyActive()) {
      return { isValid: false, error: "An emergency is already active" };
    }

    return { isValid: true };
  }

  // Emergency services integration (placeholder)
  private async callEmergencyServices(
    emergencyAlert: EmergencyAlert,
  ): Promise<void> {
    // TODO: Integrate with actual emergency services API
    console.log(
      "[EmergencyService] Would call emergency services for:",
      emergencyAlert,
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("[EmergencyService] Emergency services notified");
  }

  // Emergency response time tracking
  private trackResponseTime(emergencyId: string, startTime: Date): void {
    // TODO: Track and report emergency response times
    const responseTime = Date.now() - startTime.getTime();
    console.log(
      `[EmergencyService] Emergency ${emergencyId} response time: ${responseTime}ms`,
    );
  }

  // Auto-resolve emergencies after timeout (safety feature)
  private setupAutoResolve(emergencyId: string): void {
    // TODO: Implement auto-resolve after certain time
    // This is a safety feature to prevent stuck emergency states
    setTimeout(
      () => {
        if (this.getActiveEmergency()?.id === emergencyId) {
          console.log(
            `[EmergencyService] Auto-resolving emergency ${emergencyId} due to timeout`,
          );
          this.resolveEmergency(emergencyId);
        }
      },
      30 * 60 * 1000,
    ); // 30 minutes
  }

  // Cleanup method
  cleanup(): void {
    console.log("[EmergencyService] Cleaning up...");
    // Any cleanup logic here
  }
}

// Export singleton instance
export const emergencyService = EmergencyService.getInstance();

export default emergencyService;
