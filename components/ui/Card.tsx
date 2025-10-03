import React from "react";
import { View, ViewProps } from "react-native";

import { cn } from "@/lib/utils";

export type CardVariant = "elevated" | "outline" | "ghost";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const variantMap: Record<CardVariant, string> = {
  elevated:
    "bg-white dark:bg-brand-primary shadow-lg shadow-black/5 dark:shadow-black/40",
  outline:
    "bg-white dark:bg-brand-primary border border-neutral-200 dark:border-white/10",
  ghost: "bg-transparent",
};

const paddingMap: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "elevated",
  padding = "md",
  header,
  footer,
  ...props
}) => {
  return (
    <View
      className={cn(
        "rounded-3xl overflow-hidden",
        variantMap[variant],
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {header ? <View className="mb-4">{header}</View> : null}
      <View>{children}</View>
      {footer ? <View className="mt-4">{footer}</View> : null}
    </View>
  );
};

export default Card;
