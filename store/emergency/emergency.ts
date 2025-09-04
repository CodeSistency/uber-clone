import { create } from "zustand";
import { EmergencyAlert, EmergencyContact } from "@/types/type";

// Emergency Store Interface
interface EmergencyStore {
  activeEmergency: EmergencyAlert | null;
  emergencyHistory: EmergencyAlert[];
  isEmergencyActive: boolean;
  emergencyContacts: EmergencyContact[];

  // Actions
  triggerEmergency: (alert: EmergencyAlert) => void;
  resolveEmergency: (emergencyId: string) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (contactId: string) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
}

export const useEmergencyStore = create<EmergencyStore>((set, get) => ({
  activeEmergency: null,
  emergencyHistory: [],
  isEmergencyActive: false,
  emergencyContacts: [],

  triggerEmergency: (alert: EmergencyAlert) => {
    set((state) => ({
      activeEmergency: alert,
      isEmergencyActive: true,
      emergencyHistory: [alert, ...state.emergencyHistory].slice(0, 50), // Keep last 50
    }));
  },

  resolveEmergency: (emergencyId: string) => {
    set((state) => {
      const updatedHistory = state.emergencyHistory.map((emergency) =>
        emergency.id === emergencyId
          ? { ...emergency, status: "resolved" as const }
          : emergency,
      );

      return {
        activeEmergency:
          state.activeEmergency?.id === emergencyId
            ? { ...state.activeEmergency, status: "resolved" }
            : state.activeEmergency,
        emergencyHistory: updatedHistory,
        isEmergencyActive: state.activeEmergency?.id !== emergencyId,
      };
    });
  },

  addEmergencyContact: (contact: EmergencyContact) => {
    set((state) => ({
      emergencyContacts: [...state.emergencyContacts, contact],
    }));
  },

  removeEmergencyContact: (contactId: string) => {
    set((state) => ({
      emergencyContacts: state.emergencyContacts.filter(
        (contact) => contact.id !== contactId,
      ),
    }));
  },

  setEmergencyContacts: (contacts: EmergencyContact[]) => {
    set(() => ({ emergencyContacts: contacts }));
  },
}));
