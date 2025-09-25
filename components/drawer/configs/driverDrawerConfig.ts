import { DrawerConfig } from "../types";

// Configuración del drawer para el módulo Driver
export const driverDrawerConfig: DrawerConfig = {
  module: "driver",
  header: {
    title: "Driver Mode",
    subtitle: "Drive and earn money",
  },
  routes: [
    // Estado y actividad
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "steering-wheel",
      href: "/(driver)/dashboard",
    },
    {
      id: "availability",
      title: "Go Online",
      icon: "power",
      href: "/(driver)/availability",
    },
    {
      id: "active-ride",
      title: "Active Ride",
      icon: "navigation",
      href: "/(driver)/active-ride",
      badge: "active", // Indicador visual
    },

    // Ganancias y finanzas
    {
      id: "earnings",
      title: "Earnings",
      icon: "dollar-sign",
      href: "/(driver)/earnings",
      badge: "$127.50", // Monto diario
    },
    {
      id: "weekly-summary",
      title: "Weekly Summary",
      icon: "calendar",
      href: "/(driver)/weekly-summary",
    },

    // Historial y estadísticas
    {
      id: "ride-history",
      title: "Ride History",
      icon: "clock",
      href: "/(driver)/history",
    },
    {
      id: "performance",
      title: "Performance",
      icon: "star",
      href: "/(driver)/performance",
    },

    // Servicios adicionales
    {
      id: "wallet",
      title: "Driver Wallet",
      icon: "wallet",
      href: "/(driver)/wallet",
    },
    {
      id: "emergency",
      title: "Emergency",
      icon: "alert-triangle",
      href: "/(driver)/emergency",
    },

    // Separador
    {
      id: "divider-1",
      title: "",
      divider: true,
    },

    // Cambio a otros módulos
    {
      id: "switch-to-customer",
      title: "Switch to Customer",
      icon: "user",
      switchToModule: "customer",
    },
    {
      id: "switch-to-business",
      title: "Start a Business",
      icon: "building",
      switchToModule: "business",
      requiresConfirmation: true,
    },

    // Separador
    {
      id: "divider-2",
      title: "",
      divider: true,
    },

    // Configuración del conductor
    {
      id: "vehicle",
      title: "Vehicle",
      icon: "car",
      href: "/(driver)/vehicle",
    },
    {
      id: "documents",
      title: "Documents",
      icon: "file-text",
      href: "/(driver)/documents",
    },
    {
      id: "driver-settings",
      title: "Settings",
      icon: "settings",
      href: "/(driver)/settings",
    },
    {
      id: "support",
      title: "Driver Support",
      icon: "help-circle",
      href: "/(driver)/support",
    },
  ],
  footer: {
    copyright: "© 2024 Uber Clone",
    version: "v1.0.0",
  },
  theme: "auto",
  position: "left",
};
