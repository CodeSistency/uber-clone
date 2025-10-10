import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { MapFlowStep } from '@/store/mapFlow';
import MapFlowPageContent from './MapFlowPageContent';
import { log } from '@/lib/logger';

interface MapFlowPageProps {
  step: MapFlowStep;
  isActive: boolean;
  isVisible: boolean;
  onContentReady: () => void;
  onAction: (action: string, data?: any) => void;
  children?: React.ReactNode;
}

const MapFlowPage: React.FC<MapFlowPageProps> = ({
  step,
  isActive,
  isVisible,
  onContentReady,
  onAction,
  children
}) => {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Animación de entrada/salida
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isActive, fadeAnim]);

  // Notificar cuando el contenido está listo
  const handleContentReady = useCallback(() => {
    setIsReady(true);
    log.pagerView.debug('Content ready', { data: { step, isActive } });
    onContentReady();
  }, [onContentReady, step, isActive]);

  // Manejar acciones del contenido
  const handleAction = useCallback((action: string, data?: any) => {
    log.pagerView.debug('Action received', { data: { step, action, data } });
    onAction(action, data);
  }, [step, onAction]);

  // Solo renderizar si es visible (optimización)
  if (!isVisible) {
    return <View style={styles.hidden} />;
  }

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    log.pagerView.debug('Layout', { data: { step, width, height, isActive, isVisible } });
  }, [step, isActive, isVisible]);

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
      onLayout={handleLayout}
    >
      {children || (
        <MapFlowPageContent
          step={step}
          isActive={isActive}
          isReady={isReady}
          onContentReady={handleContentReady}
          onAction={handleAction}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hidden: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default MapFlowPage;
