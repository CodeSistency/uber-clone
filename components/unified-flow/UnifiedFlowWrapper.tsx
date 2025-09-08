import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Map, { MapHandle } from '@/components/Map';
import InlineBottomSheet from '@/components/ui/InlineBottomSheet';
import { useMapFlow } from '@/hooks/useMapFlow';
import { useMapController } from '@/hooks/useMapController';
import { MapFlowProvider } from '@/context/MapFlowContext';

// Importar componentes de pasos
import ServiceSelection from './steps/ServiceSelection';
import TransportDefinition from './steps/TransportDefinition';
import TransportVehicleSelection from './steps/TransportVehicleSelection';
import DeliveryBusinessSearch from './steps/DeliveryBusinessSearch';
import MandadoDetails from './steps/MandadoDetails';

interface UnifiedFlowWrapperProps {
  role?: 'customer';
}

const renderStep = (step: ReturnType<typeof useMapFlow>['step']) => {
  console.log('[UnifiedFlowWrapper] Rendering step:', step);

  switch (step) {
    case 'SELECCION_SERVICIO':
      return <ServiceSelection />;

    // Customer Transport
    case 'CUSTOMER_TRANSPORT_DEFINICION_VIAJE':
      return <TransportDefinition />;
    case 'CUSTOMER_TRANSPORT_SELECCION_VEHICULO':
      return <TransportVehicleSelection />;

    // Customer Delivery
    case 'CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO':
      return <DeliveryBusinessSearch />;

    // Customer Mandado
    case 'CUSTOMER_MANDADO_DETALLES_MANDADO':
      return <MandadoDetails />;

    // Placeholder para otros pasos
    default:
      return (
        <View className="flex-1 justify-center items-center">
          <View className="text-center">
            <View className="text-4xl mb-4">🚧</View>
            <View className="font-JakartaBold text-lg text-gray-800 mb-2">
              Paso en Desarrollo
            </View>
            <View className="font-Jakarta text-sm text-gray-600">
              {step.replace(/_/g, ' ').toLowerCase()}
            </View>
          </View>
        </View>
      );
  }
};

const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({ role = 'customer' }) => {
  console.log('[UnifiedFlowWrapper] ===== RENDERING UnifiedFlowWrapper =====');

  const flow = useMapFlow();
  const map = useMapController();

  console.log('[UnifiedFlowWrapper] Flow state after hooks:', {
    isActive: flow.isActive,
    step: flow.step,
    service: flow.service,
    bottomSheetVisible: flow.bottomSheetVisible
  });

  // Auto-start si no está activo
  React.useEffect(() => {
    console.log('[UnifiedFlowWrapper] ===== useEffect triggered =====');
    console.log('[UnifiedFlowWrapper] isActive:', flow.isActive);
    if (!flow.isActive) {
      console.log('[UnifiedFlowWrapper] Flow not active, keeping at initial state');
      // El flujo ya está configurado para empezar en CLIENTE_INICIO_SELECCION
    }
  }, [flow.isActive]);

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

  console.log('[UnifiedFlowWrapper] Props being passed to InlineBottomSheet:', {
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
    console.log('[UnifiedFlowWrapper] Rendering step content for step:', flow.step);
    const renderedContent = renderStep(flow.step);
    console.log('[UnifiedFlowWrapper] Rendered content:', renderedContent ? 'CONTENT RENDERED' : 'NO CONTENT');
    return renderedContent;
  }, [flow.step]);

  console.log('[UnifiedFlowWrapper] ===== FINAL RENDER =====');
  console.log('[UnifiedFlowWrapper] sheetVisible:', sheetVisible);
  console.log('[UnifiedFlowWrapper] BottomSheet props:', { minH, maxH, initH, allowDrag, className });

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
            <View style={{ backgroundColor: 'white', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>BottomSheet Hidden - Step: {flow.step}</View>
          </View>
        )}
      </View>
    </MapFlowProvider>
  );
};

export default UnifiedFlowWrapper;
