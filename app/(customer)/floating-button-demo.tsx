import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMapFlow } from '@/hooks/useMapFlow';
import { useMapController } from '@/hooks/useMapController';
import UnifiedFlowWrapper from '@/components/unified-flow/UnifiedFlowWrapper';
import Map from '@/components/Map';

const FloatingButtonDemo: React.FC = () => {
  const flow = useMapFlow();
  const map = useMapController();

  // Función para renderizar el paso actual
  const renderStep = (step: any) => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Paso: {step}</Text>
        <Text style={styles.stepDescription}>
          Este es un demo del botón flotante. Cierra el BottomSheet y verás aparecer un botón en la esquina inferior derecha.
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Demo button pressed');
          }}
        >
          <Text style={styles.buttonText}>Botón de Demo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            flow.next();
          }}
        >
          <Text style={styles.buttonText}>Siguiente Paso</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UnifiedFlowWrapper
        role="customer"
        renderStep={renderStep}
        usePagerView={false}
      >
        {/* Overlay de información */}
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Demo del Botón Flotante</Text>
          <Text style={styles.overlayText}>
            1. El BottomSheet está visible por defecto{'\n'}
            2. Ciérralo deslizando hacia abajo{'\n'}
            3. Aparecerá un botón flotante en la esquina inferior derecha{'\n'}
            4. Toca el botón para reabrir el BottomSheet
          </Text>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </UnifiedFlowWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0286FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
  },
  overlayTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overlayText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FloatingButtonDemo;

