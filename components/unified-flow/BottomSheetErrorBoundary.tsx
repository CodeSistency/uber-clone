/**
 * Error Boundary específico para el BottomSheet
 * Captura errores en el BottomSheet y muestra un componente de fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheetErrorFallback from './BottomSheetErrorFallback';
import { log } from '@/lib/logger';

interface BottomSheetErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onClose?: () => void;
  onReport?: () => void;
  fallback?: ReactNode;
}

interface BottomSheetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class BottomSheetErrorBoundary extends Component<
  BottomSheetErrorBoundaryProps,
  BottomSheetErrorBoundaryState
> {
  constructor(props: BottomSheetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<BottomSheetErrorBoundaryState> {
    // Actualizar el estado para mostrar el UI de error
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error
    log.error('BottomSheet Error Boundary caught error', {
      data: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    });

    // Actualizar el estado con la información del error
    this.setState({
      error,
      errorInfo,
    });

    // Llamar al callback de error si está definido
    this.props.onError?.(error, errorInfo);

    // En producción, podrías enviar el error a un servicio de monitoreo
    if (!__DEV__) {
      // Aquí podrías enviar el error a Sentry, Crashlytics, etc.
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Implementar reporte de errores para producción
    log.error('Reporting error to monitoring service', {
      data: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }
    });
  };

  private handleRetry = () => {
    log.info('BottomSheet Error Boundary retry requested');
    
    // Resetear el estado de error
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Llamar al callback de retry si está definido
    this.props.onRetry?.();
  };

  private handleClose = () => {
    log.info('BottomSheet Error Boundary close requested');
    
    // Llamar al callback de close si está definido
    this.props.onClose?.();
  };

  private handleReport = () => {
    log.info('BottomSheet Error Boundary report requested');
    
    // Llamar al callback de report si está definido
    this.props.onReport?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Mostrar el componente de fallback por defecto
      return (
        <View style={styles.container}>
          <BottomSheetErrorFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onClose={this.handleClose}
            onReport={this.handleReport}
          />
        </View>
      );
    }

    // Si no hay error, renderizar los children normalmente
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default BottomSheetErrorBoundary;
