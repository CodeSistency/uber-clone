import React, { memo, useCallback } from "react";
import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

// Memoize style functions to avoid recreating them on every render
const getBgVariantStyle = (variant: ButtonProps["bgVariant"]): string => {
  switch (variant) {
    case "secondary":
      return "bg-black dark:bg-brand-primaryDark";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-2 border-brand-secondary";
    default:
      // Primary button matches brand yellow on both modes
      return "bg-brand-secondary";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]): string => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      // Default text is black on yellow, otherwise white
      return "text-black dark:text-white";
  }
};

interface CustomButtonProps extends ButtonProps {
  disabled?: boolean;
}

const CustomButtonComponent = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  loading,
  disabled,
  ...props
}: CustomButtonProps) => {
  // Memoize the press handler to prevent unnecessary re-renders
  const handlePress = useCallback(
    (event?: any) => {
      if (onPress && !loading && !disabled) {
        onPress(event);
      }
    },
    [onPress, loading, disabled],
  );

  // Memoize computed styles
  const bgStyle = getBgVariantStyle(bgVariant);
  const textStyle = getTextVariantStyle(textVariant);
  const isDisabled = loading || disabled;
  const containerClassName = `w-full rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${bgStyle} ${isDisabled ? "opacity-60" : ""} ${className || ""}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={containerClassName}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-bold ${textStyle}`}>
        {loading ? "Please wait…" : title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const CustomButton = memo(CustomButtonComponent);

// For backward compatibility
export default CustomButton;
