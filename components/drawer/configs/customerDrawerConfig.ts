import { DrawerConfig } from "../types";

// Configuración del drawer para el módulo Customer
export const customerDrawerConfig: DrawerConfig = {
  module: "customer",
  header: {
    title: "Customer Mode",
    subtitle: "Find rides, order food, and more",
  },
  routes: [
    // Navegación principal
    {
      id: "home",
      title: "Home",
      icon: "home",
      href: "/(root)/(tabs)/home",
    },
    {
      id: "rides",
      title: "My Rides",
      icon: "car",
      href: "/(root)/(tabs)/rides",
    },
    {
      id: "chat",
      title: "Messages",
      icon: "message-circle",
      href: "/(root)/(tabs)/chat",
      badge: 0, // Se actualizará dinámicamente
    },

    // Marketplace con subrutas
    {
      id: "marketplace",
      title: "Marketplace",
      icon: "shopping-bag",
      subroutes: [
        {
          id: "marketplace-browse",
          title: "Browse",
          icon: "search",
          href: "/(marketplace)/browse",
        },
        {
          id: "marketplace-restaurants",
          title: "Restaurants",
          icon: "utensils-crossed",
          href: "/(marketplace)/restaurants",
        },
        {
          id: "marketplace-groceries",
          title: "Groceries",
          icon: "shopping-cart",
          href: "/(marketplace)/groceries",
        },
        {
          id: "marketplace-favorites",
          title: "Favorites",
          icon: "heart",
          href: "/(marketplace)/favorites",
        },
      ],
    },

    // Servicios adicionales
    {
      id: "wallet",
      title: "Wallet",
      icon: "wallet",
      href: "/(wallet)",
    },
    {
      id: "emergency",
      title: "Emergency",
      icon: "alert-triangle",
      href: "/(emergency)",
    },

    // Separador
    {
      id: "divider-1",
      title: "",
      divider: true,
    },

    // Cambio a otros módulos
    {
      id: "switch-to-business",
      title: "Switch to Business",
      icon: "building",
      switchToModule: "business",
      requiresConfirmation: true,
    },
    {
      id: "switch-to-driver",
      title: "Become a Driver",
      icon: "car",
      switchToModule: "driver",
      requiresConfirmation: true,
    },

    // Separador
    {
      id: "divider-2",
      title: "",
      divider: true,
    },

    // Configuración
    {
      id: "profile",
      title: "Profile",
      icon: "user",
      href: "/(root)/(tabs)/profile",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings",
      href: "/(root)/settings",
    },
    {
      id: "support",
      title: "Support",
      icon: "help-circle",
      href: "/(root)/support",
    },
  ],
  footer: {
    copyright: "© 2024 Uber Clone",
    version: "v1.0.0",
  },
  theme: "auto",
  position: "left",
};
