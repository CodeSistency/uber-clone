import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MapFlowContentProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

const MapFlowContent: React.FC<MapFlowContentProps> = ({
  children,
  style,
  className,
}) => {
  return (
    <View style={[styles.content, style]} className={className}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default MapFlowContent;



