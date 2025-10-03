import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface NotificationBadgeProps {
  count?: number;
  showPulse?: boolean;
  onPress?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  showPulse = false,
  onPress,
  className = "",
  size = "md",
  variant = "primary",
}) => {
  const sizeStyles = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const variantStyles = {
    primary: "bg-blue-500",
    secondary: "bg-gray-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      className={`relative ${className}`}
      activeOpacity={0.8}
    >
      <View
        className={`
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          rounded-full
          items-center justify-center
          border-2 border-white
          shadow-sm
          ${showPulse ? "animate-pulse" : ""}
        `}
      >
        {count > 0 && (
          <Text
            className={`
            ${textSizeStyles[size]}
            font-JakartaBold
            text-white
            text-center
          `}
          >
            {count > 99 ? "99+" : count.toString()}
          </Text>
        )}
      </View>

      {/* Pulse effect overlay */}
      {showPulse && (
        <View
          className={`
            absolute inset-0
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            rounded-full
            opacity-30
            animate-ping
          `}
        />
      )}
    </Container>
  );
};

export default NotificationBadge;
