import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store/mapFlow';

interface MapFlowHandleProps {
  step?: MapFlowStep;
  style?: any;
  children?: React.ReactNode;
}

const MapFlowHandle: React.FC<MapFlowHandleProps> = ({
  step,
  style,
  children,
}) => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { showHandle: false } };
  
  if (!bottomSheet.showHandle) {
    return null;
  }
  
  return (
    <View style={[styles.handle, style]}>
      {children || <View style={styles.handleIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  handle: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
  },
});

export default MapFlowHandle;
