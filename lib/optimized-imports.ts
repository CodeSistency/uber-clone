/**
 * Optimized Imports - Bundle Size Optimization
 *
 * This file provides optimized import patterns to reduce bundle size
 * by using specific imports instead of full library imports where possible.
 */

// ===== REACT NATIVE SPECIFIC IMPORTS =====
// Instead of: import { View, Text, TouchableOpacity } from 'react-native'
// Use: import View from './optimized/View'; etc.

// Common React Native components with lazy loading
export { default as OptimizedView } from "react-native/Libraries/Components/View/View";
export { default as OptimizedText } from "react-native/Libraries/Text/Text";
export { default as OptimizedTouchableOpacity } from "react-native/Libraries/Components/Touchable/TouchableOpacity";
export { default as OptimizedScrollView } from "react-native/Libraries/Components/ScrollView/ScrollView";
export { default as OptimizedFlatList } from "react-native/Libraries/Lists/FlatList";
export { default as OptimizedActivityIndicator } from "react-native/Libraries/Components/ActivityIndicator/ActivityIndicator";

// ===== EXPO ROUTER OPTIMIZATIONS =====
// Instead of importing everything from expo-router, import only what you need
export { useRouter, usePathname } from "expo-router";

// ===== ZUSTAND SELECTOR OPTIMIZATIONS =====
// Pre-optimized selectors to prevent full store imports
export { useUserStore } from "@/store/user";
export { useLocationStore } from "@/store/location";
export { useRealtimeStore } from "@/store/realtime";

// ===== LIBRARY SPECIFIC OPTIMIZATIONS =====

// Socket.io - only import what you need
// export { io } from 'socket.io-client/io'; // Tree-shaken version - not available

// Date-fns - import specific functions instead of full library
// export {
//   format,
//   parseISO,
//   addMinutes,
//   differenceInMinutes,
//   isAfter,
//   isBefore,
// } from 'date-fns'; // date-fns not installed

// Lodash - if used, import specific functions
// export { debounce, throttle, pick, omit } from 'lodash-es'; // Tree-shaken version

// ===== COMPONENT OPTIMIZATIONS =====
// Lazy loaded heavy components
export const LazyMap = () => import("../components/Map");
export const LazyPayment = () => import("../components/Payment");
export const LazyGoogleTextInput = () =>
  import("../components/GoogleTextInput");

// ===== UTILITY FUNCTIONS =====
export const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// ===== PERFORMANCE HELPERS =====
export const measurePerformance = <T>(
  label: string,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      
    });
  }

  const end = performance.now();
  
  return result;
};

// Debounce utility (lighter than lodash)
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as any;
  };
};

// Throttle utility (lighter than lodash)
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
