// Expo Notifications Types - Sistema Independiente
// Este archivo define tipos específicos para el sistema de notificaciones Expo-only

// ========== TOKENS Y AUTENTICACIÓN ==========

export interface ExpoPushToken {
  type: "expo" | "ios" | "android";
  data: string;
}

export interface ExpoTokenData {
  token: string;
  deviceType: "ios" | "android" | "web";
  deviceId: string;
  isActive: boolean;
  lastUpdated: Date;
  projectId?: string;
}

// ========== PERMISOS Y CONFIGURACIÓN ==========

export interface ExpoNotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "undetermined";
  expires?: "never" | number;
}

export interface ExpoNotificationSettings {
  allowsNotifications: boolean;
  allowsSound: boolean;
  allowsBadge: boolean;
  allowsAlert: boolean;
  allowsDisplayInNotificationCenter?: boolean;
  allowsDisplayOnLockScreen?: boolean;
}

// ========== CANALES DE NOTIFICACIÓN ==========

export interface ExpoNotificationChannel {
  id: string;
  name: string;
  importance: "default" | "high" | "low" | "min";
  vibrationPattern?: number[];
  lightColor?: string;
  lockscreenVisibility?: "public" | "private" | "secret";
  bypassDnd?: boolean;
  showBadge?: boolean;
  sound?: "default" | "none" | string;
  audioAttributes?: {
    usage: "notification" | "alarm" | "voice";
    contentType: "speech" | "music" | "movie";
    flags?: {
      enforceAudibility?: boolean;
      requestHardwareAudioVideoSynchronization?: boolean;
    };
  };
}

export interface ExpoNotificationChannelGroup {
  id: string;
  name: string;
  channels: ExpoNotificationChannel[];
}

// ========== NOTIFICACIONES ==========

export interface ExpoNotificationData {
  id: string;
  type: ExpoNotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "critical";
  categoryId?: string;
  threadId?: string;
}

export interface ExpoNotificationRequest {
  identifier: string;
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    data?: any;
    categoryIdentifier?: string;
    threadIdentifier?: string;
    summaryArgument?: string;
    summaryArgumentCount?: number;
    sound?:
      | "default"
      | "none"
      | { name: string; critical?: boolean; volume?: number };
    badge?: number;
    attachments?: {
      identifier?: string;
      url: string;
      typeHint?: string;
      hideThumbnail?: boolean;
      thumbnailClipArea?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      thumbnailTime?: number;
    }[];
    launchImageName?: string;
    badgeCount?: number;
    interruptionLevel?: "passive" | "active" | "timeSensitive" | "critical";
    relevanceScore?: number;
    filterCriteria?: string;
    userInfo?: any;
  };
  trigger: {
    type: "push" | "calendar" | "timeInterval" | "location";
    repeats?: boolean;
    channelId?: string;
    [key: string]: any;
  };
}

export interface ExpoNotificationResponse {
  notification: ExpoNotificationRequest;
  actionIdentifier: string;
  userText?: string;
}

// ========== TIPOS DE NOTIFICACIÓN ==========

export type ExpoNotificationType =
  | "RIDE_REQUEST"
  | "RIDE_ACCEPTED"
  | "RIDE_CANCELLED"
  | "DRIVER_ARRIVED"
  | "RIDE_STARTED"
  | "RIDE_COMPLETED"
  | "PAYMENT_SUCCESS"
  | "CHAT_MESSAGE"
  | "EMERGENCY_ALERT"
  | "SYSTEM_UPDATE"
  | "PROMOTIONAL"
  | "MAINTENANCE";

// ========== PREFERENCIAS DE USUARIO ==========

export interface ExpoNotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  rideUpdates: boolean;
  driverMessages: boolean;
  promotional: boolean;
  emergencyAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

// ========== STORE Y ESTADO ==========

export interface ExpoNotificationStore {
  notifications: ExpoNotificationData[];
  unreadCount: number;
  preferences: ExpoNotificationPreferences;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  token: ExpoPushToken | null;
  permissions: ExpoNotificationPermissions | null;

  // Actions
  addNotification: (notification: ExpoNotificationData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
  updatePreferences: (preferences: ExpoNotificationPreferences) => void;
  setToken: (token: ExpoPushToken | null) => void;
  setPermissions: (permissions: ExpoNotificationPermissions | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncWithServer: () => Promise<void>;
}

// ========== CONFIGURACIÓN ==========

export interface ExpoNotificationConfig {
  // App configuration
  projectId?: string;
  appName: string;
  appVersion: string;

  // Platform specific
  ios?: {
    iconBadgeNumber?: number;
    criticalSoundEnabled?: boolean;
  };

  android?: {
    channelGroups: ExpoNotificationChannelGroup[];
    defaultChannelId: string;
    iconResource?: string;
    smallIconResource?: string;
    largeIconResource?: string;
  };

  // Behavior settings
  autoDismiss: boolean;
  showInForeground: boolean;
  playSound: boolean;
  vibrate: boolean;
  showBadge: boolean;

  // Retry and timeout settings
  retryAttempts: number;
  retryDelay: number;
  requestTimeout: number;
}

// ========== EVENTOS Y CALLBACKS ==========

export interface ExpoNotificationEventMap {
  notificationReceived: (notification: ExpoNotificationRequest) => void;
  notificationResponse: (response: ExpoNotificationResponse) => void;
  tokenReceived: (token: ExpoPushToken) => void;
  permissionChanged: (permissions: ExpoNotificationPermissions) => void;
  error: (error: Error) => void;
}

export type ExpoNotificationEventType = keyof ExpoNotificationEventMap;

// ========== SERVICIOS ==========

export interface ExpoNotificationServiceInterface {
  // Lifecycle
  initialize(): Promise<void>;
  destroy(): Promise<void>;

  // Token management
  getPushToken(): Promise<ExpoPushToken | null>;
  refreshToken(): Promise<ExpoPushToken | null>;

  // Permissions
  requestPermissions(): Promise<ExpoNotificationPermissions>;
  checkPermissions(): Promise<ExpoNotificationPermissions>;

  // Notifications
  sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    options?: Partial<ExpoNotificationRequest["content"]>,
  ): Promise<string>;

  scheduleNotification(
    title: string,
    body: string,
    trigger: any,
    data?: any,
    options?: Partial<ExpoNotificationRequest["content"]>,
  ): Promise<string>;

  cancelNotification(identifier: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;

  // Badge management
  setBadgeCount(count: number): Promise<void>;
  getBadgeCount(): Promise<number>;
  clearBadge(): Promise<void>;

  // Event listeners
  addEventListener<T extends ExpoNotificationEventType>(
    event: T,
    callback: ExpoNotificationEventMap[T],
  ): string;

  removeEventListener(identifier: string): boolean;
  removeAllListeners(event?: ExpoNotificationEventType): void;

  // Channels (Android)
  createChannel(channel: ExpoNotificationChannel): Promise<void>;
  deleteChannel(channelId: string): Promise<void>;
  getChannels(): Promise<ExpoNotificationChannel[]>;

  // Utility methods
  getNotificationContent(
    type: ExpoNotificationType,
    data?: any,
  ): { title: string; body: string };

  simulateNotification(data: {
    title: string;
    body: string;
    data?: any;
    type?: "foreground" | "background";
  }): void;
}

// ========== UTILITIES ==========

export interface ExpoNotificationUtils {
  formatTime: (minutes: number) => string;
  formatDate: (date: Date) => string;
  getPriorityFromType: (
    type: ExpoNotificationType,
  ) => "low" | "normal" | "high" | "critical";
  shouldShowNotification: (
    preferences: ExpoNotificationPreferences,
    type: ExpoNotificationType,
    currentTime?: Date,
  ) => boolean;
  isQuietHours: (
    preferences: ExpoNotificationPreferences,
    currentTime?: Date,
  ) => boolean;
}

// ========== ERRORES ==========

export class ExpoNotificationError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "ExpoNotificationError";
  }

  static readonly PERMISSION_DENIED = "PERMISSION_DENIED";
  static readonly TOKEN_NOT_AVAILABLE = "TOKEN_NOT_AVAILABLE";
  static readonly INVALID_CONFIGURATION = "INVALID_CONFIGURATION";
  static readonly NETWORK_ERROR = "NETWORK_ERROR";
  static readonly PLATFORM_NOT_SUPPORTED = "PLATFORM_NOT_SUPPORTED";
}

// ========== HOOKS ==========

export interface UseExpoNotificationsReturn {
  // State
  notifications: ExpoNotificationData[];
  unreadCount: number;
  preferences: ExpoNotificationPreferences;
  isLoading: boolean;
  error: string | null;
  token: ExpoPushToken | null;
  permissions: ExpoNotificationPermissions | null;

  // Actions
  sendLocalNotification: (
    title: string,
    body: string,
    data?: any,
  ) => Promise<string>;

  scheduleNotification: (
    title: string,
    body: string,
    delayInSeconds: number,
    data?: any,
  ) => Promise<string>;

  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  updatePreferences: (preferences: ExpoNotificationPreferences) => void;
  syncWithServer: () => Promise<void>;

  // Utility
  requestPermissions: () => Promise<ExpoNotificationPermissions>;
  getDeviceToken: () => Promise<ExpoPushToken | null>;
}
