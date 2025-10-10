/**
 * Componente de fallback para errores en el BottomSheet
 * Muestra una interfaz de error amigable con opciones de recuperación
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { log } from '@/lib/logger';

interface BottomSheetErrorFallbackProps {
  error: Error;
  errorInfo: any;
  onRetry?: () => void;
  onClose?: () => void;
  onReport?: () => void;
}

const BottomSheetErrorFallback: React.FC<BottomSheetErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onClose,
  onReport,
}) => {
  const handleRetry = () => {
    log.error('BottomSheet error retry attempted', { data: { error: error.message } });
    onRetry?.();
  };

  const handleClose = () => {
    log.error('BottomSheet error close requested', { data: { error: error.message } });
    onClose?.();
  };

  const handleReport = () => {
    log.error('BottomSheet error report requested', { data: { error: error.message, errorInfo } });
    onReport?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icono de error */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        {/* Título del error */}
        <Text style={styles.title}>Something went wrong</Text>
        
        {/* Mensaje del error */}
        <Text style={styles.message}>
          We encountered an issue with the bottom sheet. This might be a temporary problem.
        </Text>

        {/* Detalles del error (solo en desarrollo) */}
        {__DEV__ && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            {errorInfo?.componentStack && (
              <Text style={styles.errorText}>{errorInfo.componentStack}</Text>
            )}
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón de reporte (opcional) */}
        {onReport && (
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 320,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorDetails: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0286FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportButton: {
    paddingVertical: 8,
  },
  reportButtonText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default BottomSheetErrorFallback;
