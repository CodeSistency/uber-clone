import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Map, { MapHandle } from '@/components/Map';
import InlineBottomSheet from '@/components/ui/InlineBottomSheet';
import { useMapFlow } from '@/hooks/useMapFlow';
import { useMapController } from '@/hooks/useMapController';
import { MapFlowProvider } from '@/context/MapFlowContext';
import { MapFlowStep } from '@/store/mapFlow/mapFlow';

interface UnifiedFlowWrapperProps {
  role?: 'customer';
  renderStep: (step: MapFlowStep) => React.ReactNode;
}


const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({ role = 'customer', renderStep }) => {
  const flow = useMapFlow();
  const map = useMapController();

  // Auto-start si no está activo
  React.useEffect(() => {
  // No longer auto-starting flow here since it's handled by the parent component
  }, [flow.isActive, flow, role]);

  const sheetVisible = flow.bottomSheetVisible;
  const minH = flow.bottomSheetMinHeight;
  const maxH = flow.bottomSheetMaxHeight;
  const initH = flow.bottomSheetInitialHeight;
  const allowDrag = flow.bottomSheetAllowDrag;
  const className = flow.bottomSheetClassName || 'px-5 pb-5';
  const transitionType = flow.transitionType;
  const transitionDuration = flow.transitionDuration;
  const snapPoints = flow.bottomSheetSnapPoints;
  const handleHeight = flow.bottomSheetHandleHeight;

  const content = useMemo(() => {
    return renderStep(flow.step);
  }, [renderStep, flow.step]);

  return (
    <MapFlowProvider value={{ flow, map }}>
      <View className="flex-1">
        <Map ref={map.setRef as unknown as React.Ref<MapHandle>} serviceType="transport" />

        {/* Debug Info - Remove in production */}
        <View style={{
          position: 'absolute',
          top: 50,
          left: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 8,
          borderRadius: 4,
          zIndex: 1000
        }}>
          <Text style={{ color: 'white', fontSize: 12 }}>
            Step: {flow.step}
          </Text>
          <Text style={{ color: 'white', fontSize: 12 }}>
            Service: {flow.service || 'None'}
          </Text>
          <Text style={{ color: 'white', fontSize: 12 }}>
            Role: {flow.role}
          </Text>
        </View>

        {sheetVisible ? (
          <InlineBottomSheet
            visible={sheetVisible}
            minHeight={minH}
            maxHeight={maxH}
            initialHeight={initH}
            allowDrag={allowDrag}
            snapPoints={snapPoints}
            className={className}
          >
            {content}
          </InlineBottomSheet>
        ) : (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>BottomSheet Hidden - Step: {flow.step}</Text>
            </View>
          </View>
        )}
      </View>
    </MapFlowProvider>
  );
};

export default UnifiedFlowWrapper;
