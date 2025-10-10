import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import UnifiedFlowWrapperGorhom from '@/components/unified-flow/UnifiedFlowWrapperGorhom';
import { MapFlowStep } from '@/store';

const UnifiedFlowDemoGorhom: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<MapFlowStep>('idle');
  const { flow, setCurrentStep: setMapFlowStep } = useMapFlowStore();
  
  const handleStepChange = (step: MapFlowStep) => {
    console.log('[UnifiedFlowDemo] Changing step to:', step);
    setCurrentStep(step);
    setMapFlowStep(step);
    
    // Log del estado después del cambio
    setTimeout(() => {
      const currentFlow = useMapFlowStore.getState().flow;
      console.log('[UnifiedFlowDemo] Flow state after change:', currentFlow);
    }, 100);
  };
  
  const steps: { key: MapFlowStep; label: string; description: string }[] = [
    { key: 'idle', label: 'Idle', description: 'No bottom sheet' },
    { key: 'confirm_origin', label: 'Confirm Origin', description: 'No handle, no drag' },
    { key: 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR', label: 'Searching Driver', description: 'No handle, no drag, large height' },
    { key: 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION', label: 'Waiting Acceptance', description: 'No handle, no drag' },
    { key: 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION', label: 'Confirmation', description: 'No handle, no drag, small height' },
    { key: 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO', label: 'Driver Arrived', description: 'No handle, no drag' },
    { key: 'DRIVER_FINALIZACION_RATING', label: 'Rating', description: 'No handle, no drag, rating height' },
  ];
  
  return (
    <UnifiedFlowWrapperGorhom currentStep={currentStep}>
      <View style={styles.container}>
        <Text style={styles.title}>Unified Flow Demo - @gorhom/bottom-sheet</Text>
        <Text style={styles.subtitle}>Testing new bottom sheet implementation</Text>
        
        <View style={styles.stepsContainer}>
          {steps.map((step) => (
            <TouchableOpacity
              key={step.key}
              style={[
                styles.stepButton,
                currentStep === step.key && styles.activeStepButton
              ]}
              onPress={() => handleStepChange(step.key)}
            >
              <Text style={[
                styles.stepButtonText,
                currentStep === step.key && styles.activeStepButtonText
              ]}>
                {step.label}
              </Text>
              <Text style={styles.stepDescription}>
                {step.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Current Step: {currentStep}</Text>
          <Text style={styles.infoText}>
            Bottom Sheet Visible: {flow.bottomSheetVisible ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            Min Height: {flow.bottomSheetMinHeight}px
          </Text>
          <Text style={styles.infoText}>
            Max Height: {flow.bottomSheetMaxHeight}px
          </Text>
          <Text style={styles.infoText}>
            Show Handle: {flow.bottomSheetShowHandle ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            Allow Drag: {flow.bottomSheetAllowDrag ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </UnifiedFlowWrapperGorhom>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepButton: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeStepButton: {
    backgroundColor: '#0286FF',
    borderColor: '#0286FF',
  },
  stepButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeStepButtonText: {
    color: 'white',
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default UnifiedFlowDemoGorhom;


