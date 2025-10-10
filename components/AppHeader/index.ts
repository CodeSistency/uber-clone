import React from "react";

export { default as AppHeader } from "./AppHeader";
export type { AppHeaderProps } from "./AppHeader";

// Define ActionButton interface locally since it's not exported from AppHeader
export interface ActionButton {
  icon: React.ComponentType<any>;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
}





