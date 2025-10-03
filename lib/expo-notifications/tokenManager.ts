import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { log } from "@/lib/logger";
import {
  ExpoPushToken,
  ExpoTokenData,
  ExpoNotificationError,
} from "../../types/expo-notifications";

/**
 * Gestor de tokens push para Expo Notifications
 * Maneja obtención, almacenamiento y renovación de tokens
 */
class ExpoTokenManager {
  private static instance: ExpoTokenManager;
  private currentToken: ExpoPushToken | null = null;
  private isRefreshing = false;
  private retryCount = 0;
  private maxRetries = 3;

  // Claves para SecureStore
  private readonly TOKEN_KEY = "expo_push_token";
  private readonly TOKEN_DATA_KEY = "expo_token_data";
  private readonly TOKEN_TIMESTAMP_KEY = "expo_token_timestamp";

  static getInstance(): ExpoTokenManager {
    if (!ExpoTokenManager.instance) {
      ExpoTokenManager.instance = new ExpoTokenManager();
    }
    return ExpoTokenManager.instance;
  }

  /**
   * Obtener token push actual o solicitar uno nuevo
   */
  async getPushToken(forceRefresh = false): Promise<ExpoPushToken | null> {
    const operationId = `token_get_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    log.info("ExpoTokenManager", "Getting push token", {
      operationId,
      forceRefresh,
      hasCachedToken: !!this.currentToken,
      platform: Platform.OS,
    });

    try {
      // Si ya tenemos un token válido y no se fuerza refresh, retornarlo
      if (!forceRefresh && this.currentToken) {
        const isValid = await this.validateToken(this.currentToken);
        if (isValid) {
          log.info("ExpoTokenManager", "Using cached valid token", {
            operationId,
          });
          return this.currentToken;
        }
      }

      // Intentar cargar desde SecureStore
      const cachedToken = await this.loadTokenFromStorage();
      if (!forceRefresh && cachedToken) {
        const isValid = await this.validateToken(cachedToken);
        if (isValid) {
          this.currentToken = cachedToken;
          log.info("ExpoTokenManager", "Using stored valid token", {
            operationId,
            tokenPrefix: cachedToken.data.substring(0, 20) + "...",
          });
          return cachedToken;
        } else {
          log.warn(
            "ExpoTokenManager",
            "Stored token is invalid, requesting new one",
            {
              operationId,
            },
          );
        }
      }

      // Solicitar nuevo token
      const newToken = await this.requestNewToken(operationId);
      if (newToken) {
        await this.saveTokenToStorage(newToken);
        this.currentToken = newToken;
        this.retryCount = 0; // Reset retry count on success

        log.info("ExpoTokenManager", "New token obtained and stored", {
          operationId,
          tokenType: newToken.type,
          tokenPrefix: newToken.data.substring(0, 20) + "...",
        });

        return newToken;
      }

      log.error("ExpoTokenManager", "Failed to obtain push token", {
        operationId,
      });
      return null;
    } catch (error) {
      log.error(
        "ExpoTokenManager",
        "Error getting push token",
        {
          operationId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );

      // Intentar retry si no hemos alcanzado el límite
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        log.info("ExpoTokenManager", "Retrying token request", {
          operationId,
          attempt: this.retryCount,
          maxRetries: this.maxRetries,
        });

        // Esperar un poco antes del retry
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * this.retryCount),
        );
        return this.getPushToken(forceRefresh);
      }

      throw new ExpoNotificationError(
        `Failed to get push token after ${this.maxRetries} retries`,
        ExpoNotificationError.TOKEN_NOT_AVAILABLE,
        { originalError: error },
      );
    }
  }

  /**
   * Solicitar nuevo token desde Expo
   */
  private async requestNewToken(
    operationId: string,
  ): Promise<ExpoPushToken | null> {
    try {
      // Verificar que tenemos projectId válido para bare workflow
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const isUuid = (v: any) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          v,
        );

      if (!isUuid(projectId)) {
        log.warn("ExpoTokenManager", "Missing or invalid EAS projectId", {
          operationId,
          projectId,
          note: "Push tokens may not work in production builds without valid projectId",
        });
      }

      log.info("ExpoTokenManager", "Requesting new Expo push token", {
        operationId,
        projectId: projectId ? "valid" : "missing",
        platform: Platform.OS,
      });

      // Solicitar token usando Expo's built-in FCM support
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: isUuid(projectId) ? projectId : undefined,
      });

      const token: ExpoPushToken = {
        type: tokenResponse.type,
        data: tokenResponse.data,
      };

      log.info("ExpoTokenManager", "Expo push token obtained", {
        operationId,
        tokenType: token.type,
        tokenLength: token.data.length,
        tokenPrefix: token.data.substring(0, 20) + "...",
        projectId: isUuid(projectId) ? "used" : "not_used",
      });

      return token;
    } catch (error) {
      log.error(
        "ExpoTokenManager",
        "Failed to request new token",
        {
          operationId,
          error: (error as Error)?.message,
          platform: Platform.OS,
        },
        error instanceof Error ? error : undefined,
      );

      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes("Project ID")) {
          throw new ExpoNotificationError(
            "Invalid or missing EAS projectId. Configure in app.json or app.config.js",
            ExpoNotificationError.INVALID_CONFIGURATION,
            { projectId: Constants.expoConfig?.extra?.eas?.projectId },
          );
        }
      }

      return null;
    }
  }

  /**
   * Validar que un token sea usable
   */
  async validateToken(token: ExpoPushToken): Promise<boolean> {
    try {
      // Validaciones básicas
      if (!token || !token.data || typeof token.data !== "string") {
        return false;
      }

      // Verificar formato básico de token Expo
      if (
        !token.data.startsWith("ExponentPushToken[") &&
        !token.data.startsWith("ExponentPushToken")
      ) {
        log.warn("ExpoTokenManager", "Token format may be invalid", {
          tokenPrefix: token.data.substring(0, 30) + "...",
          startsWithExponent: token.data.startsWith("Exponent"),
        });
        // No fallar por formato, podría ser token nativo
      }

      // Verificar que no esté expirado (si tenemos timestamp)
      const timestamp = await SecureStore.getItemAsync(
        this.TOKEN_TIMESTAMP_KEY,
      );
      if (timestamp) {
        const tokenAge = Date.now() - parseInt(timestamp, 10);
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días

        if (tokenAge > maxAge) {
          log.info("ExpoTokenManager", "Token is too old, should refresh", {
            tokenAge: Math.round(tokenAge / (24 * 60 * 60 * 1000)),
            maxAgeDays: 30,
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      log.error("ExpoTokenManager", "Error validating token", {
        error: (error as Error)?.message,
      });
      return false;
    }
  }

  /**
   * Guardar token en SecureStore
   */
  private async saveTokenToStorage(token: ExpoPushToken): Promise<void> {
    try {
      const tokenData: ExpoTokenData = {
        token: token.data,
        deviceType: Platform.OS as "ios" | "android" | "web",
        deviceId: await this.getDeviceId(),
        isActive: true,
        lastUpdated: new Date(),
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      };

      await Promise.all([
        SecureStore.setItemAsync(this.TOKEN_KEY, JSON.stringify(token)),
        SecureStore.setItemAsync(
          this.TOKEN_DATA_KEY,
          JSON.stringify(tokenData),
        ),
        SecureStore.setItemAsync(
          this.TOKEN_TIMESTAMP_KEY,
          Date.now().toString(),
        ),
      ]);

      log.debug("ExpoTokenManager", "Token saved to secure storage", {
        deviceType: tokenData.deviceType,
        hasProjectId: !!tokenData.projectId,
      });
    } catch (error) {
      log.error(
        "ExpoTokenManager",
        "Failed to save token to storage",
        {
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  /**
   * Cargar token desde SecureStore
   */
  private async loadTokenFromStorage(): Promise<ExpoPushToken | null> {
    try {
      const tokenString = await SecureStore.getItemAsync(this.TOKEN_KEY);
      if (!tokenString) {
        return null;
      }

      const token: ExpoPushToken = JSON.parse(tokenString);

      // Validar estructura básica
      if (!token.type || !token.data) {
        log.warn("ExpoTokenManager", "Invalid token structure in storage");
        return null;
      }

      return token;
    } catch (error) {
      log.error("ExpoTokenManager", "Failed to load token from storage", {
        error: (error as Error)?.message,
      });
      return null;
    }
  }

  /**
   * Obtener datos completos del token
   */
  async getTokenData(): Promise<ExpoTokenData | null> {
    try {
      const tokenString = await SecureStore.getItemAsync(this.TOKEN_DATA_KEY);
      if (!tokenString) {
        return null;
      }

      const tokenData: ExpoTokenData = JSON.parse(tokenString);
      return tokenData;
    } catch (error) {
      log.error("ExpoTokenManager", "Failed to load token data", {
        error: (error as Error)?.message,
      });
      return null;
    }
  }

  /**
   * Limpiar tokens almacenados (útil para logout)
   */
  async clearTokens(): Promise<void> {
    try {
      log.info("ExpoTokenManager", "Clearing stored tokens");

      await Promise.all([
        SecureStore.deleteItemAsync(this.TOKEN_KEY),
        SecureStore.deleteItemAsync(this.TOKEN_DATA_KEY),
        SecureStore.deleteItemAsync(this.TOKEN_TIMESTAMP_KEY),
      ]);

      this.currentToken = null;
      this.retryCount = 0;

      log.info("ExpoTokenManager", "Tokens cleared successfully");
    } catch (error) {
      log.error("ExpoTokenManager", "Failed to clear tokens", {
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  /**
   * Forzar renovación de token
   */
  async refreshToken(): Promise<ExpoPushToken | null> {
    if (this.isRefreshing) {
      log.warn("ExpoTokenManager", "Token refresh already in progress");
      return this.currentToken;
    }

    try {
      this.isRefreshing = true;
      log.info("ExpoTokenManager", "Starting token refresh");

      const newToken = await this.getPushToken(true);

      log.info("ExpoTokenManager", "Token refresh completed", {
        success: !!newToken,
      });

      return newToken;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Obtener ID único del dispositivo
   */
  private async getDeviceId(): Promise<string> {
    try {
      // Intentar obtener deviceId almacenado
      let deviceId = await SecureStore.getItemAsync("expo_device_id");

      if (!deviceId) {
        // Generar nuevo deviceId
        deviceId = `expo_device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await SecureStore.setItemAsync("expo_device_id", deviceId);

        log.info("ExpoTokenManager", "New device ID generated", {
          deviceId: deviceId.substring(0, 20) + "...",
        });
      }

      return deviceId;
    } catch (error) {
      log.error("ExpoTokenManager", "Failed to get device ID", {
        error: (error as Error)?.message,
      });

      // Fallback: generar ID temporal
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Verificar si tenemos un token válido disponible
   */
  hasValidToken(): boolean {
    return !!this.currentToken;
  }

  /**
   * Obtener información de debug del estado actual
   */
  getDebugInfo() {
    return {
      hasCurrentToken: !!this.currentToken,
      currentTokenType: this.currentToken?.type,
      currentTokenPrefix: this.currentToken?.data?.substring(0, 20) + "...",
      isRefreshing: this.isRefreshing,
      retryCount: this.retryCount,
      platform: Platform.OS,
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    };
  }
}

// Exportar instancia singleton
export const expoTokenManager = ExpoTokenManager.getInstance();

// Exportar funciones de utilidad
export const getExpoPushToken = (forceRefresh?: boolean) =>
  expoTokenManager.getPushToken(forceRefresh);
export const refreshExpoToken = () => expoTokenManager.refreshToken();
export const clearExpoTokens = () => expoTokenManager.clearTokens();
export const validateExpoToken = (token: ExpoPushToken) =>
  expoTokenManager.validateToken(token);
export const getExpoTokenData = () => expoTokenManager.getTokenData();
export const hasValidExpoToken = () => expoTokenManager.hasValidToken();
