import React, { useMemo } from "react";
import { View, Text } from "react-native";

import Map, { MapHandle } from "@/components/Map";
import InlineBottomSheet from "@/components/ui/InlineBottomSheet";
import { MapFlowProvider } from "@/context/MapFlowContext";
import { useMapController } from "@/hooks/useMapController";
import { useMapFlow } from "@/hooks/useMapFlow";
import { DARK_MODERN_STYLE, type MapConfiguration } from "@/constants/mapStyles";

interface MapFlowWrapperProps {
  role?: "customer" | "driver";
  // Step contents
  renderStep: (step: ReturnType<typeof useMapFlow>["step"]) => React.ReactNode;
}

const MapFlowWrapper: React.FC<MapFlowWrapperProps> = ({
  role = "customer",
  renderStep,
}) => {
  
  

  const flow = useMapFlow();
  const map = useMapController();

  

  // Ensure flow started
  React.useEffect(() => {
    
    
    if (!flow.isActive) {
      
      flow.start(role);
    } else {
      
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const sheetVisible = flow.bottomSheetVisible;
  const minH = flow.bottomSheetMinHeight;
  const maxH = flow.bottomSheetMaxHeight;
  const initH = flow.bottomSheetInitialHeight;
  const allowDrag = flow.bottomSheetAllowDrag;
  const className = flow.bottomSheetClassName || "px-5 pb-5";
  const transitionType = flow.transitionType;
  const transitionDuration = flow.transitionDuration;
  const snapPoints = flow.bottomSheetSnapPoints;
  const handleHeight = flow.bottomSheetHandleHeight;

  

  // 🎨 Configuración del mapa con tema dark moderno
  const mapConfig: Partial<MapConfiguration> = useMemo(
    () => ({
      theme: "dark",
      customStyle: DARK_MODERN_STYLE,
      userInterfaceStyle: "dark",
      mapType: "standard",
      showsUserLocation: true,
      showsPointsOfInterest: false,
      showsBuildings: true,
      showsTraffic: false,
      showsCompass: true,
      showsScale: false,
      showsMyLocationButton: false,
      zoomEnabled: true,
      scrollEnabled: true,
      rotateEnabled: true,
      pitchEnabled: true,
      tintColor: "#00FF88",
      routeColor: "#4285F4",
      trailColor: "#FFE014",
      predictionColor: "#00FF88",
    }),
    [],
  );

  const content = useMemo(() => {
    
    const renderedContent = renderStep(flow.step);
    
    return renderedContent;
  }, [renderStep, flow.step]);

  
  
  

  return (
    <MapFlowProvider value={{ flow, map }}>
      <View className="flex-1">
        <Map
          ref={map.setRef as unknown as React.Ref<MapHandle>}
          serviceType="transport"
          mapConfig={mapConfig}
        />

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
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>
              BottomSheet Hidden - Step: {flow.step}
            </Text>
          </View>
        )}
      </View>
    </MapFlowProvider>
  );
};

export default MapFlowWrapper;
