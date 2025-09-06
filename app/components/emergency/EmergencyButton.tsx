import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Animated } from "react-native";

// import * as Haptics from 'expo-haptics'; // Temporarily commented for TypeScript compatibility
// import * as Location from 'expo-location'; // Temporarily commented for TypeScript compatibility
import { useEmergencyStore } from "../../../store";
import { LocationData, EmergencyAlert } from "../../../types/type";
import { emergencyService } from "../../services/emergencyService";

interface EmergencyButtonProps {
  rideId: number;
  userLocation: LocationData;
  onEmergencyTriggered: (alert: EmergencyAlert) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "floating" | "inline";
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  rideId,
  userLocation,
  onEmergencyTriggered,
  disabled = false,
  size = "medium",
  variant = "floating",
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [location, setLocation] = useState<LocationData>(userLocation);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const { isEmergencyActive } = useEmergencyStore();

  useEffect(() => {
    // Get current location when component mounts
    getCurrentLocation();

    // Start pulse animation for floating variant
    if (variant === "floating") {
      startPulseAnimation();
    }

    return () => {
      scaleAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Temporarily commented for TypeScript compatibility
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status === 'granted') {
      //   const locationResult = await Location.getCurrentPositionAsync({
      //     accuracy: Location.Accuracy.High,
      //   });
      //   const newLocation: LocationData = {
      //     latitude: locationResult.coords.latitude,
      //     longitude: locationResult.coords.longitude,
      //     accuracy: locationResult.coords.accuracy || 10,
      //     timestamp: new Date(),
      //   };
      //   setLocation(newLocation);
      // }
    } catch (error) {
      console.warn("[EmergencyButton] Failed to get location:", error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handlePressIn = () => {
    if (disabled || isEmergencyActive) return;

    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 3,
    }).start();

    // Trigger haptic feedback
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Temporarily commented
  };

  const handlePressOut = () => {
    if (disabled || isEmergencyActive) return;

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 3,
    }).start();

    setIsPressed(false);
  };

  const handlePress = () => {
    if (disabled || isEmergencyActive) return;

    const newCount = pressCount + 1;
    setPressCount(newCount);

    // Trigger strong haptic feedback
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Temporarily commented

    if (newCount >= 3) {
      // Triple press detected - trigger emergency
      triggerEmergency();
      setPressCount(0);
    } else {
      // Single/double press - show warning
      showEmergencyWarning(newCount);
    }
  };

  const showEmergencyWarning = (count: number) => {
    const remainingPresses = 3 - count;

    Alert.alert(
      "Emergency Alert",
      `Press ${remainingPresses} more time${remainingPresses > 1 ? "s" : ""} to trigger emergency alert`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setPressCount(0),
        },
        {
          text: "Continue",
          style: "destructive",
        },
      ],
    );

    // Reset press count after 5 seconds
    setTimeout(() => {
      setPressCount(0);
    }, 5000);
  };

  const triggerEmergency = async () => {
    try {
      Alert.alert(
        "🚨 Emergency Alert",
        "Are you sure you want to trigger an emergency alert? This will notify emergency services and your emergency contacts.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes, Trigger Emergency",
            style: "destructive",
            onPress: async () => {
              await handleEmergencyTrigger();
            },
          },
        ],
      );
    } catch (error) {
      console.error("[EmergencyButton] Failed to trigger emergency:", error);
      Alert.alert(
        "Error",
        "Failed to trigger emergency alert. Please try again.",
      );
    }
  };

  const handleEmergencyTrigger = async () => {
    try {
      const emergencyAlert = await emergencyService.triggerEmergency(
        rideId,
        "sos",
        location,
        "Emergency triggered from app",
      );

      onEmergencyTriggered(emergencyAlert);

      // Show success feedback
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Temporarily commented
    } catch (error) {
      console.error("[EmergencyButton] Emergency trigger failed:", error);
      Alert.alert(
        "Error",
        "Emergency alert failed. Please call emergency services directly.",
      );
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small":
        return { width: 60, height: 60, iconSize: 24 };
      case "large":
        return { width: 80, height: 80, iconSize: 32 };
      case "medium":
      default:
        return { width: 70, height: 70, iconSize: 28 };
    }
  };

  const getButtonStyle = () => {
    const { width, height } = getButtonSize();

    const baseStyle = {
      width,
      height,
      borderRadius: width / 2,
      justifyContent: "center" as any,
      alignItems: "center" as any,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };

    if (isEmergencyActive) {
      return {
        ...baseStyle,
        backgroundColor: "#EF4444",
      };
    }

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: "#9CA3AF",
      };
    }

    return {
      ...baseStyle,
      backgroundColor: "#EF4444",
    };
  };

  const { iconSize } = getButtonSize();

  if (variant === "inline") {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || isEmergencyActive}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isEmergencyActive ? "#FEF2F2" : "#FEF2F2",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isEmergencyActive ? "#EF4444" : "#EF4444",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Ionicons
          name="warning"
          size={20}
          color={isEmergencyActive ? "#EF4444" : "#EF4444"}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isEmergencyActive ? "#EF4444" : "#EF4444",
            marginLeft: 8,
          }}
        >
          {isEmergencyActive ? "Emergency Active" : "Emergency"}
        </Text>
      </TouchableOpacity>
    );
  }

  // Floating variant
  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || isEmergencyActive}
          style={getButtonStyle()}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={iconSize} color="#FFFFFF" />

          {/* Press indicator */}
          {pressCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "#FFFFFF",
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#EF4444",
                }}
              >
                {pressCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          textAlign: "center",
          marginTop: 8,
          fontWeight: "500",
        }}
      >
        Emergency
      </Text>
    </View>
  );
};

export default EmergencyButton;