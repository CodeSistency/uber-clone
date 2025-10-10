/**
 * MapFlowPageContent - Componente que renderiza el contenido de una página
 * dentro del MapFlowPagerView usando el sistema de registry
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { componentMapper } from '@/components/unified-flow/registry';
import { useMapFlowStore } from '@/store';
import { MapFlowStep } from '@/store';
import { log } from '@/lib/logger';

interface MapFlowPageContentProps {
  step: MapFlowStep;
  isActive: boolean;
  isReady: boolean;
  onContentReady?: () => void;
  onAction?: (action: string, data?: any) => void;
}

const MapFlowPageContent: React.FC<MapFlowPageContentProps> = ({
  step,
  isActive,
  isReady,
  onContentReady,
  onAction,
}) => {
  const { role, service } = useMapFlowStore();

  // Obtener el componente del registry
  const Component = useMemo((): React.ReactNode | null => {
    try {
      log.registry.debug('Getting component for step', { data: { step, role, service } });
      
      // Crear mapper con configuración específica
      const renderFn = componentMapper.createMapper({
        role: role || 'customer',
        fallbackToDefault: true,
        showDebugInfo: __DEV__,
      });
      
      // Obtener el componente renderizado
      const renderedComponent = renderFn(step);
      
      if (renderedComponent && typeof renderedComponent === 'object' && 'type' in renderedComponent) {
        log.registry.debug('Component found for step', { data: { step, componentType: renderedComponent.type } });
        return renderedComponent;
      } else {
        log.registry.warn('No component found for step, using fallback', { data: { step, role, service } });
        return null;
      }
    } catch (error: any) {
      log.registry.error('Error getting component for step', { data: { step, error: error?.message || 'Unknown error' } });
      return null;
    }
  }, [step, role, service]);

  // Notificar cuando el contenido esté listo
  React.useEffect(() => {
    if (isReady && onContentReady) {
      onContentReady();
    }
  }, [isReady, onContentReady]);

  // Manejar acciones del componente
  const handleAction = React.useCallback((action: string, data?: any) => {
    log.registry.debug('Page action triggered', { data: { step, action, data } });
    onAction?.(action, data);
  }, [step, onAction]);

  // Renderizar el componente o fallback
  if (!Component) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Component not found for step: {step}
        </Text>
        <Text style={styles.fallbackSubtext}>
          Role: {role}, Service: {service || 'none'}
        </Text>
      </View>
    );
  }

  // Si el componente es un elemento React válido, renderizarlo
  if (React.isValidElement(Component)) {
    return (
      <View style={styles.container}>
        {Component}
      </View>
    );
  }

  // Si es una función, ejecutarla
  if (Component && typeof Component === 'function') {
    try {
      const renderedComponent = (Component as () => React.ReactNode)();
      return (
        <View style={styles.container}>
          {renderedComponent}
        </View>
      );
    } catch (error: any) {
      log.registry.error('Error rendering component function', { data: { step, error: error?.message || 'Unknown error' } });
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            Error rendering component for step: {step}
          </Text>
        </View>
      );
    }
  }

  // Fallback para otros tipos
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>
        Invalid component type for step: {step}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default MapFlowPageContent;