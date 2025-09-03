import { create } from "zustand";

import {
  DriverStore,
  LocationStore,
  MarkerData,
  NotificationData,
  NotificationPreferences,
  ConnectionStatus,
  Ride,
  RideStatus,
  LocationData,
  ChatMessage,
  EmergencyAlert,
  EmergencyContact,
} from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log("[LocationStore] 📍 setUserLocation called with:", {
      latitude,
      longitude,
      address,
    });

    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    console.log("[LocationStore] ✅ User location updated in store");

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      console.log(
        "[LocationStore] 🔄 Clearing selected driver due to location change",
      );
      clearSelectedDriver();
    }
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log("[LocationStore] 🎯 setDestinationLocation called with:", {
      latitude,
      longitude,
      address,
    });

    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    console.log("[LocationStore] ✅ Destination location updated in store");

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      console.log(
        "[LocationStore] 🔄 Clearing selected driver due to location change",
      );
      clearSelectedDriver();
    }
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => {
    console.log("[DriverStore] setSelectedDriver called with:", driverId);
    const newState = { selectedDriver: driverId };
    console.log("[DriverStore] Setting new state:", newState);
    set(() => newState);
    console.log("[DriverStore] State updated successfully");
  },
  setDrivers: (drivers: MarkerData[]) => {
    console.log(
      "[DriverStore] setDrivers called with:",
      drivers?.length,
      "drivers",
    );
    set(() => ({ drivers }));
  },
  clearSelectedDriver: () => {
    console.log("[DriverStore] clearSelectedDriver called");
    set(() => ({ selectedDriver: null }));
  },
}));

// Notification Store
interface NotificationStore {
  notifications: NotificationData[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNotification: (notification: NotificationData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: NotificationPreferences) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  removeNotification: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: {
    pushEnabled: true,
    smsEnabled: false,
    rideUpdates: true,
    driverMessages: true,
    promotional: false,
    emergencyAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  isLoading: false,
  error: null,

  addNotification: (notification: NotificationData) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100), // Keep only last 100
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      );

      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.isRead,
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set(() => ({
      notifications: [],
      unreadCount: 0,
    }));
  },

  updatePreferences: (preferences: NotificationPreferences) => {
    set(() => ({ preferences }));
  },

  setLoading: (loading: boolean) => {
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    set(() => ({ error }));
  },

  removeNotification: (notificationId: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== notificationId,
      );
      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.isRead,
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },
}));

// Real-time Store
interface RealtimeStore {
  connectionStatus: ConnectionStatus;
  activeRide: Ride | null;
  driverLocation: LocationData | null;
  rideStatus: RideStatus;
  isTracking: boolean;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateRideStatus: (rideId: number, status: RideStatus) => void;
  updateDriverLocation: (location: LocationData) => void;
  startTracking: (rideId: number) => void;
  stopTracking: () => void;
  setActiveRide: (ride: Ride | null) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  connectionStatus: {
    isConnected: false,
    connectionType: "none",
    websocketConnected: false,
    lastPing: new Date(),
  },
  activeRide: null,
  driverLocation: null,
  rideStatus: "requested",
  isTracking: false,

  setConnectionStatus: (status: ConnectionStatus) => {
    set(() => ({ connectionStatus: status }));
  },

  updateRideStatus: (rideId: number, status: RideStatus) => {
    set((state) => ({
      rideStatus: status,
      // Update active ride if it matches
      activeRide:
        state.activeRide?.ride_id === rideId
          ? { ...state.activeRide, status }
          : state.activeRide,
    }));
  },

  updateDriverLocation: (location: LocationData) => {
    set(() => ({ driverLocation: location }));
  },

  startTracking: (rideId: number) => {
    set(() => ({ isTracking: true }));
  },

  stopTracking: () => {
    set(() => ({
      isTracking: false,
      driverLocation: null,
    }));
  },

  setActiveRide: (ride: Ride | null) => {
    set(() => ({ activeRide: ride }));
  },
}));

// Chat Store
interface ChatStore {
  messages: ChatMessage[];
  activeChat: number | null; // rideId
  unreadMessages: Record<number, number>;
  isTyping: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  setActiveChat: (rideId: number) => void;
  markMessagesRead: (rideId: number) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: (rideId: number) => void;
  loadMessages: (rideId: number, messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  activeChat: null,
  unreadMessages: {},
  isTyping: false,

  addMessage: (message: ChatMessage) => {
    set((state) => {
      const existingMessages = state.messages.filter(
        (m) => m.rideId === message.rideId,
      );
      const newMessages = [...existingMessages, message];

      const newUnreadMessages = { ...state.unreadMessages };
      if (message.rideId !== state.activeChat && !message.isRead) {
        newUnreadMessages[message.rideId] =
          (newUnreadMessages[message.rideId] || 0) + 1;
      }

      return {
        messages: state.messages
          .filter((m) => m.rideId !== message.rideId)
          .concat(newMessages),
        unreadMessages: newUnreadMessages,
      };
    });
  },

  setActiveChat: (rideId: number) => {
    set((state) => ({
      activeChat: rideId,
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0, // Clear unread count for this chat
      },
    }));
  },

  markMessagesRead: (rideId: number) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.rideId === rideId ? { ...message, isRead: true } : message,
      ),
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0,
      },
    }));
  },

  setTyping: (isTyping: boolean) => {
    set(() => ({ isTyping }));
  },

  clearChat: (rideId: number) => {
    set((state) => ({
      messages: state.messages.filter((message) => message.rideId !== rideId),
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0,
      },
    }));
  },

  loadMessages: (rideId: number, messages: ChatMessage[]) => {
    set((state) => ({
      messages: state.messages
        .filter((m) => m.rideId !== rideId)
        .concat(messages),
    }));
  },
}));

// Emergency Store
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
