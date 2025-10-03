export const colors = {
  brand: {
    primary: "bg-brand-primary text-black",
    primaryDark: "bg-brand-primaryDark text-white",
    secondary: "bg-brand-secondary text-black",
    tertiary: "bg-black text-white",
    accent: "bg-brand-accent text-white",
  },
} as const;

export const textColors = {
  default: "text-black dark:text-white",
  muted: "text-gray-600 dark:text-gray-300",
} as const;

export const shadows = {
  sm: "shadow-sm shadow-black/10",
  md: "shadow-md shadow-black/20",
  lg: "shadow-lg shadow-black/30",
} as const;

export const gradients = {
  glowButton: {
    background: ["#05080F", "#040612", "#01010A"],
    glow: ["rgba(10, 108, 255, 0.8)", "rgba(10, 108, 255, 0.0)"],
    text: "#F4F7FF",
  },
} as const;
