import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { MapFlowStep } from '@/store';

const { width: screenWidth } = Dimensions.get('window');

export interface MapFlowProgressHandleProps {
  // Estado del progreso
  currentStep: MapFlowStep;
  currentPageIndex: number;
  totalPages: number;
  steps: MapFlowStep[];
  
  // Configuración visual
  type?: 'dots' | 'bar' | 'steps';
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  margin?: number;
  padding?: number;
  
  // Configuración de animaciones
  animationDuration?: number;
  
  // Accesibilidad
  accessibilityLabel?: string;
  testID?: string;
  
  // Configuración de labels
  showLabels?: boolean;
  labelColor?: string;
  labelFontSize?: number;
  labelFontWeight?: 'normal' | 'bold' | '600' | '700';
  labelPosition?: 'top' | 'bottom' | 'center';
  labelOffset?: number;
  
  // Eventos
  onStepPress?: (step: MapFlowStep, index: number) => void;
  onProgressPress?: () => void;
}

const MapFlowProgressHandle: React.FC<MapFlowProgressHandleProps> = ({
  currentStep,
  currentPageIndex,
  totalPages,
  steps,
  type = 'dots',
  color = '#0286FF',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  height = 8,
  borderRadius = 4,
  margin = 4,
  padding = 8,
  animationDuration = 300,
  accessibilityLabel = 'Progress indicator',
  testID = 'mapflow-progress-handle',
  showLabels = false,
  labelColor = '#666666',
  labelFontSize = 12,
  labelFontWeight = 'normal',
  labelPosition = 'bottom',
  labelOffset = 8,
  onStepPress,
  onProgressPress,
}) => {
  // Valores animados
  const progressValue = useSharedValue(currentPageIndex);
  const progressPercentage = useMemo(() => {
    return totalPages > 0 ? (currentPageIndex / (totalPages - 1)) * 100 : 0;
  }, [currentPageIndex, totalPages]);

  // Actualizar valor animado cuando cambie el índice
  React.useEffect(() => {
    progressValue.value = withTiming(currentPageIndex, {
      duration: animationDuration,
    });
  }, [currentPageIndex, animationDuration, progressValue]);

  // Estilos animados para la barra de progreso
  const animatedBarStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      progressValue.value,
      [0, totalPages - 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${progress}%`,
    };
  });

  // Estilos animados para los dots
  const animatedDotStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progressValue.value,
      [currentPageIndex - 1, currentPageIndex, currentPageIndex + 1],
      [0.8, 1.2, 0.8],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      progressValue.value,
      [currentPageIndex - 1, currentPageIndex, currentPageIndex + 1],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Renderizar dots
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {steps.map((step, index) => {
          const isActive = index === currentPageIndex;
          const isCompleted = index < currentPageIndex;
          
          return (
            <TouchableOpacity
              key={step}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive || isCompleted ? color : backgroundColor,
                  width: height,
                  height: height,
                  borderRadius: height / 2,
                  marginHorizontal: margin,
                },
                isActive && styles.activeDot,
                isCompleted && styles.completedDot,
              ]}
              onPress={() => onStepPress?.(step, index)}
              accessibilityLabel={`Step ${index + 1} of ${totalPages}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              {isActive && (
                <Animated.View
                  style={[
                    styles.dotInner,
                    animatedDotStyle,
                    {
                      backgroundColor: 'white',
                      width: height * 0.4,
                      height: height * 0.4,
                      borderRadius: (height * 0.4) / 2,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Renderizar barra de progreso
  const renderBar = () => {
    return (
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barBackground,
            {
              backgroundColor,
              height,
              borderRadius,
              padding,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.barProgress,
              animatedBarStyle,
              {
                backgroundColor: color,
                height: height - padding * 2,
                borderRadius: borderRadius - padding / 2,
              },
            ]}
          />
        </View>
        
        {showLabels && (
          <View style={[styles.labelsContainer, { [labelPosition]: labelOffset }]}>
            <Text
              style={[
                styles.label,
                {
                  color: labelColor,
                  fontSize: labelFontSize,
                  fontWeight: labelFontWeight,
                },
              ]}
            >
              {currentPageIndex + 1} of {totalPages}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Renderizar steps
  const renderSteps = () => {
    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = index === currentPageIndex;
          const isCompleted = index < currentPageIndex;
          const isAccessible = index <= currentPageIndex + 1;
          
          return (
            <TouchableOpacity
              key={step}
              style={[
                styles.step,
                {
                  marginHorizontal: margin,
                },
              ]}
              onPress={() => isAccessible && onStepPress?.(step, index)}
              disabled={!isAccessible}
              accessibilityLabel={`Step ${index + 1}: ${step.replace(/_/g, ' ').toLowerCase()}`}
              accessibilityRole="button"
              accessibilityState={{ 
                selected: isActive,
                disabled: !isAccessible 
              }}
            >
              <View
                style={[
                  styles.stepIndicator,
                  {
                    backgroundColor: isActive || isCompleted ? color : backgroundColor,
                    width: height * 1.5,
                    height: height * 1.5,
                    borderRadius: (height * 1.5) / 2,
                  },
                  isActive && styles.activeStep,
                  isCompleted && styles.completedStep,
                ]}
              >
                {isCompleted ? (
                  <Text style={[styles.stepIcon, { color: 'white', fontSize: height * 0.6 }]}>
                    ✓
                  </Text>
                ) : (
                  <Text style={[styles.stepNumber, { color: isActive ? 'white' : labelColor }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              {showLabels && (
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive ? color : labelColor,
                      fontSize: labelFontSize,
                      fontWeight: isActive ? 'bold' : labelFontWeight,
                    },
                  ]}
                >
                  {step.replace(/_/g, ' ').toLowerCase()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Renderizar contenido según el tipo
  const renderContent = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'bar':
        return renderBar();
      case 'steps':
        return renderSteps();
      default:
        return renderDots();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          padding,
        },
      ]}
      onPress={onProgressPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Altura mínima para el handle
  },
  
  // Estilos para dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedDot: {
    opacity: 0.8,
  },
  dotInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Estilos para barra
  barContainer: {
    width: '100%',
    alignItems: 'center',
  },
  barBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: 2,
  },
  labelsContainer: {
    marginTop: 4,
  },
  label: {
    textAlign: 'center',
  },
  
  // Estilos para steps
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  stepIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedStep: {
    opacity: 0.9,
  },
  stepIcon: {
    fontWeight: 'bold',
  },
  stepNumber: {
    fontWeight: 'bold',
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 10,
  },
});

export default MapFlowProgressHandle;
