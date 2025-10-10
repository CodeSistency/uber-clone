import React from 'react';
import { View, Text } from 'react-native';
import { useDebugSelectors } from '@/hooks/useMapFlowSelectors';

/**
 * Componente de debug que muestra información del estado del MapFlow
 * Solo se renderiza en modo desarrollo
 */
export const DebugInfo: React.FC = () => {
  const debugInfo = useDebugSelectors();

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 50,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 4,
        zIndex: 1000,
      }}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>
        Step: {debugInfo.step}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Service: {debugInfo.service || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Role: {debugInfo.role}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Ride ID: {debugInfo.rideId || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Matching: {debugInfo.isMatching ? 'Yes' : 'No'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Driver: {debugInfo.matchedDriver?.name || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Bottom Sheet: {debugInfo.bottomSheetVisible ? 'Visible' : 'Hidden'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Pager: {debugInfo.usePagerView ? 'Active' : 'Inactive'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Page: {debugInfo.currentPageIndex + 1}/{debugInfo.totalPages}
      </Text>
    </View>
  );
};

/**
 * Componente de debug para información del mapa
 */
export const MapDebugInfo: React.FC<{ mapConfig: any }> = ({ mapConfig }) => {
  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 100,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 8,
        zIndex: 1000,
      }}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>
        🎨 Map Style: {mapConfig.theme}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        🌙 Custom Style: {mapConfig.customStyle?.name || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        📱 UI Style: {mapConfig.userInterfaceStyle}
      </Text>
    </View>
  );
};

/**
 * Componente de debug para información de rendimiento
 */
export const PerformanceDebugInfo: React.FC = () => {
  const debugInfo = useDebugSelectors();

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 100,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 4,
        zIndex: 1000,
      }}
    >
      <Text style={{ color: 'white', fontSize: 10 }}>
        🚀 Performance Debug
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Re-renders: {Date.now()}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        State Updates: Active
      </Text>
    </View>
  );
};
