import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '@/hooks/useConnectivity';
import { offlineQueue } from '@/lib/offline/OfflineQueue';

interface NetworkErrorModalProps {
  visible: boolean;
  onClose: () => void;
  error?: {
    title: string;
    message: string;
    action?: string;
  };
  onRetry?: () => Promise<void>;
  onSaveOffline?: () => Promise<void>;
}

export const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
  visible,
  onClose,
  error,
  onRetry,
  onSaveOffline,
}) => {
  const { isOnline, pendingSyncCount, syncNow } = useConnectivity();
  const [retrying, setRetrying] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Auto-retry logic
  useEffect(() => {
    if (visible && isOnline && onRetry && retryCount < 3) {
      const timer = setTimeout(async () => {
        console.log(`[NetworkErrorModal] Auto-retrying (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);

        try {
          setRetrying(true);
          await onRetry();
          onClose();
        } catch (error) {
          console.error('[NetworkErrorModal] Auto-retry failed:', error);
        } finally {
          setRetrying(false);
        }
      }, 2000 + (retryCount * 1000)); // 2s, 3s, 4s delays

      return () => clearTimeout(timer);
    }
  }, [visible, isOnline, onRetry, retryCount, onClose]);

  const handleRetry = async () => {
    if (!onRetry) return;

    setRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      onClose();
    } catch (error) {
      console.error('[NetworkErrorModal] Manual retry failed:', error);
    } finally {
      setRetrying(false);
    }
  };

  const handleSaveOffline = async () => {
    if (!onSaveOffline) return;

    setSavingOffline(true);

    try {
      await onSaveOffline();
      onClose();
    } catch (error) {
      console.error('[NetworkErrorModal] Save offline failed:', error);
    } finally {
      setSavingOffline(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      await syncNow();
      onClose();
    } catch (error) {
      console.error('[NetworkErrorModal] Sync failed:', error);
    }
  };

  const defaultError = {
    title: 'Error de Conexión',
    message: 'No se pudo completar la acción debido a problemas de conectividad.',
    action: '¿Qué te gustaría hacer?',
  };

  const currentError = error || defaultError;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-red-100 rounded-full p-3 mb-4">
              <Ionicons name="wifi-outline" size={32} color="#EF4444" />
            </View>
            <Text className="font-JakartaBold text-xl text-gray-900 text-center">
              {currentError.title}
            </Text>
          </View>

          {/* Message */}
          <Text className="font-Jakarta text-base text-gray-600 text-center mb-6">
            {currentError.message}
          </Text>

          {/* Action buttons */}
          <View className="space-y-3 mb-6">
            {onRetry && (
              <TouchableOpacity
                onPress={handleRetry}
                disabled={retrying}
                className="bg-blue-500 rounded-lg py-3 flex-row justify-center items-center"
              >
                {retrying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                )}
                <Text className="text-white font-JakartaMedium ml-2">
                  {retrying ? 'Reintentando...' : 'Reintentar'}
                </Text>
              </TouchableOpacity>
            )}

            {onSaveOffline && (
              <TouchableOpacity
                onPress={handleSaveOffline}
                disabled={savingOffline}
                className="bg-green-500 rounded-lg py-3 flex-row justify-center items-center"
              >
                {savingOffline ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
                )}
                <Text className="text-white font-JakartaMedium ml-2">
                  {savingOffline ? 'Guardando...' : 'Guardar Offline'}
                </Text>
              </TouchableOpacity>
            )}

            {pendingSyncCount > 0 && (
              <TouchableOpacity
                onPress={handleSyncNow}
                className="bg-purple-500 rounded-lg py-3 flex-row justify-center items-center"
              >
                <Ionicons name="sync" size={20} color="#FFFFFF" />
                <Text className="text-white font-JakartaMedium ml-2">
                  Sincronizar ({pendingSyncCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status info */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
              Estado de Conexión:
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={isOnline ? "wifi" : "wifi-outline"}
                size={16}
                color={isOnline ? "#10B981" : "#EF4444"}
              />
              <Text className={`ml-2 text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Conectado' : 'Sin conexión'}
              </Text>
            </View>

            {pendingSyncCount > 0 && (
              <View className="mt-2 flex-row items-center">
                <Ionicons name="time" size={16} color="#F59E0B" />
                <Text className="ml-2 text-sm text-orange-600">
                  {pendingSyncCount} acciones pendientes
                </Text>
              </View>
            )}
          </View>

          {/* Auto-retry indicator */}
          {retrying && retryCount > 0 && (
            <View className="bg-blue-50 rounded-lg p-3 mb-4">
              <Text className="text-sm text-blue-700 text-center">
                Reintentando automáticamente... (Intento {retryCount}/3)
              </Text>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-100 rounded-lg py-3"
          >
            <Text className="text-gray-700 font-JakartaMedium text-center">
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Hook for managing network error modals
export const useNetworkErrorModal = () => {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    error?: NetworkErrorModalProps['error'];
    onRetry?: () => Promise<void>;
    onSaveOffline?: () => Promise<void>;
  }>({
    visible: false,
  });

  const showNetworkError = (
    error: NetworkErrorModalProps['error'],
    options?: {
      onRetry?: () => Promise<void>;
      onSaveOffline?: () => Promise<void>;
    }
  ) => {
    setModalState({
      visible: true,
      error,
      onRetry: options?.onRetry,
      onSaveOffline: options?.onSaveOffline,
    });
  };

  const hideNetworkError = () => {
    setModalState({ visible: false });
  };

  const NetworkErrorModalComponent = () => (
    <NetworkErrorModal
      visible={modalState.visible}
      onClose={hideNetworkError}
      error={modalState.error}
      onRetry={modalState.onRetry}
      onSaveOffline={modalState.onSaveOffline}
    />
  );

  return {
    showNetworkError,
    hideNetworkError,
    NetworkErrorModalComponent,
  };
};
