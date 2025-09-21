import { DrawerConfig } from '../types';

// Configuración del drawer para el módulo Business
export const businessDrawerConfig: DrawerConfig = {
  module: 'business',
  header: {
    title: 'Business Mode',
    subtitle: 'Manage your business and orders',
  },
  routes: [
    // Dashboard y gestión
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'bar-chart-3',
      href: '/(business)/dashboard',
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: 'clipboard-list',
      href: '/(business)/orders',
      badge: 0, // Se actualizará dinámicamente
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'trending-up',
      href: '/(business)/analytics',
    },

    // Inventario y productos
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'package',
      href: '/(business)/inventory',
    },
    {
      id: 'menu',
      title: 'Menu Management',
      icon: 'file-text',
      href: '/(business)/menu',
    },

    // Marketplace integrado
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: 'shopping-bag',
      subroutes: [
        {
          id: 'marketplace-products',
          title: 'My Products',
          icon: 'box',
          href: '/(business)/products',
        },
        {
          id: 'marketplace-orders',
          title: 'Market Orders',
          icon: 'shopping-cart',
          href: '/(business)/market-orders',
        },
        {
          id: 'marketplace-analytics',
          title: 'Market Analytics',
          icon: 'pie-chart',
          href: '/(business)/market-analytics',
        },
      ],
    },

    // Servicios adicionales
    {
      id: 'wallet',
      title: 'Business Wallet',
      icon: 'wallet',
      href: '/(business)/wallet',
    },
    {
      id: 'emergency',
      title: 'Emergency',
      icon: 'alert-triangle',
      href: '/(business)/emergency',
    },

    // Separador
    {
      id: 'divider-1',
      title: '',
      divider: true,
    },

    // Cambio a otros módulos
    {
      id: 'switch-to-customer',
      title: 'Switch to Customer',
      icon: 'user',
      switchToModule: 'customer',
    },
    {
      id: 'switch-to-driver',
      title: 'Become a Driver',
      icon: 'car',
      switchToModule: 'driver',
      requiresConfirmation: true,
    },

    // Separador
    {
      id: 'divider-2',
      title: '',
      divider: true,
    },

    // Configuración del negocio
    {
      id: 'business-settings',
      title: 'Business Settings',
      icon: 'settings',
      href: '/(business)/settings',
    },
    {
      id: 'team',
      title: 'Team Management',
      icon: 'users',
      href: '/(business)/team',
    },
    {
      id: 'support',
      title: 'Business Support',
      icon: 'help-circle',
      href: '/(business)/support',
    },
  ],
  footer: {
    copyright: '© 2024 Uber Clone',
    version: 'v1.0.0',
  },
  theme: 'auto',
  position: 'left',
};
