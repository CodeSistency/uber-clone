import * as React from 'react';
import { View, Text } from 'react-native';
import { useMapFlowStore } from '../../store/mapFlow/mapFlow';
import GorhomMapFlowBottomSheet from '../ui/GorhomMapFlowBottomSheet';
import { MapFlowStep } from '@/store';

interface UnifiedFlowWrapperGorhomProps {
  children: React.ReactNode;
  currentStep: MapFlowStep;
}

const UnifiedFlowWrapperGorhom: React.FC<UnifiedFlowWrapperGorhomProps> = ({
  children,
  currentStep,
}) => {
  const flow = useMapFlowStore(state => state.flow);
  
  // Log para debug
  console.log('[UnifiedFlowWrapperGorhom] Rendering with:', {
    currentStep,
    flow: flow
  });
  
  return (
    <>
      {/* Contenido principal */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
      
      {/* Bottom Sheet con @gorhom/bottom-sheet */}
      <GorhomMapFlowBottomSheet
        visible={flow.bottomSheetVisible}
        minHeight={flow.bottomSheetMinHeight}
        maxHeight={flow.bottomSheetMaxHeight}
        initialHeight={flow.bottomSheetInitialHeight}
        showHandle={flow.bottomSheetShowHandle}
        allowDrag={flow.bottomSheetAllowDrag}
        onClose={() => {
          // Lógica de cierre
          console.log('Unified flow bottom sheet closed');
        }}
        step={currentStep}
        useGradient={flow.bottomSheetUseGradient}
        useBlur={flow.bottomSheetUseBlur}
        bottomBar={flow.bottomSheetBottomBar}
      >
        {/* Contenido del bottom sheet */}
        <View style={{ 
          padding: 20,
          backgroundColor: 'transparent'
        }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 16
          }}>
            {currentStep.replace(/_/g, ' ').toUpperCase()}
          </Text>
          
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 16, 
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center'
            }}>
              Unified Flow Content
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginTop: 8
            }}>
              Step: {currentStep}
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
              flex: 1,
              marginHorizontal: 4
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center'
              }}>
                Min: {flow.bottomSheetMinHeight}px
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
              flex: 1,
              marginHorizontal: 4
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center'
              }}>
                Max: {flow.bottomSheetMaxHeight}px
              </Text>
            </View>
          </View>
        </View>
      </GorhomMapFlowBottomSheet>
    </>
  );
};

export default UnifiedFlowWrapperGorhom;
