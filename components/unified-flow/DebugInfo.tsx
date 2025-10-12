import React from 'react';
import { View, Text } from 'react-native';
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService,
  useRideId,
  useIsMatching,
  useMatchedDriver,
  useVariantState,
  useIsPagerViewActive,
  useCurrentPageIndex,
  useTotalPages
} from '@/store/mapFlow/slices';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

/**
 * Componente de debug que muestra información del estado del MapFlow
 * Solo se renderiza en modo desarrollo
 */
export const DebugInfo: React.FC = () => {
  // Use optimized selectors from store slices
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  const rideId = useRideId();
  const isMatching = useIsMatching();
  const matchedDriver = useMatchedDriver();
  const variantState = useVariantState();
  const usePagerView = useIsPagerViewActive();
  const currentPageIndex = useCurrentPageIndex();
  const totalPages = useTotalPages();
  const bottomSheetVisible = useMapFlowStore(s => s.flow.bottomSheetVisible);

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
        Step: {step}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Service: {service || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Role: {role}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Ride ID: {rideId || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Matching: {isMatching ? 'Yes' : 'No'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Driver: {matchedDriver?.name || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Bottom Sheet: {bottomSheetVisible ? 'Visible' : 'Hidden'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Pager: {usePagerView ? 'Active' : 'Inactive'}
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Page: {currentPageIndex + 1}/{totalPages}
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
  // Debug info is now handled by the main DebugInfo component

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
