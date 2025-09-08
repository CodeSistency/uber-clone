import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Map, { MapHandle } from '@/components/Map';
import InlineBottomSheet from '@/components/ui/InlineBottomSheet';
import { useMapFlow } from '@/hooks/useMapFlow';
import { useMapController } from '@/hooks/useMapController';
import { MapFlowProvider } from '@/context/MapFlowContext';

interface MapFlowWrapperProps {
  role?: 'customer' | 'driver';
  // Step contents
  renderStep: (step: ReturnType<typeof useMapFlow>['step']) => React.ReactNode;
}

const MapFlowWrapper: React.FC<MapFlowWrapperProps> = ({ role = 'customer', renderStep }) => {
  console.log('[MapFlowWrapper] ===== RENDERING MapFlowWrapper =====');
  console.log('[MapFlowWrapper] Props received:', { role, renderStep: typeof renderStep });

  const flow = useMapFlow();
  const map = useMapController();

  console.log('[MapFlowWrapper] Flow state after hooks:', {
    isActive: flow.isActive,
    step: flow.step,
    role: flow.role,
    bottomSheetVisible: flow.bottomSheetVisible
  });

  // Ensure flow started
  React.useEffect(() => {
    console.log('[MapFlowWrapper] ===== useEffect triggered =====');
    console.log('[MapFlowWrapper] isActive:', flow.isActive);
    if (!flow.isActive) {
      console.log('[MapFlowWrapper] Starting flow with role:', role);
      flow.start(role);
    } else {
      console.log('[MapFlowWrapper] Flow already active');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

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

  console.log('[MapFlowWrapper] Props being passed to InlineBottomSheet:', {
    visible: sheetVisible,
    minHeight: minH,
    maxHeight: maxH,
    initialHeight: initH,
    allowDrag: allowDrag,
    snapPoints: snapPoints,
    className: className,
    step: flow.step
  });

  const content = useMemo(() => {
    console.log('[MapFlowWrapper] Rendering step content for step:', flow.step);
    const renderedContent = renderStep(flow.step);
    console.log('[MapFlowWrapper] Rendered content:', renderedContent ? 'CONTENT RENDERED' : 'NO CONTENT');
    return renderedContent;
  }, [renderStep, flow.step]);

  console.log('[MapFlowWrapper] ===== FINAL RENDER =====');
  console.log('[MapFlowWrapper] sheetVisible:', sheetVisible);
  console.log('[MapFlowWrapper] BottomSheet props:', { minH, maxH, initH, allowDrag, className });

  return (
    <MapFlowProvider value={{ flow, map }}>
      <View className="flex-1">
        <Map ref={map.setRef as unknown as React.Ref<MapHandle>} serviceType="transport" />

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
            <Text style={{ color: 'white' }}>BottomSheet Hidden - Step: {flow.step}</Text>
          </View>
        )}
      </View>
    </MapFlowProvider>
  );
};

export default MapFlowWrapper;


