import React from 'react';
import { Stack } from 'expo-router';
import UnifiedFlowWrapper from '@/components/unified-flow/UnifiedFlowWrapper';

const UnifiedFlowDemo = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Flujo Unificado Demo' }} />

      {/* Integración del Flujo Unificado */}
      <UnifiedFlowWrapper role="customer" />
    </>
  );
};

export default UnifiedFlowDemo;
