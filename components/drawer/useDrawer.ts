import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";

import { useUI } from "@/components/UIWrapper";
import { useModuleStore, useModuleTransition } from "@/store/module";

import { drawerConfigs } from "./configs";
import {
  UseDrawerOptions,
  UseDrawerReturn,
  DrawerRoute,
  ModuleType,
  DrawerConfig,
} from "./types";

// Importar configuraciones

// Hook personalizado para manejar el estado y lógica del drawer
export const useDrawer = (options: UseDrawerOptions = {}): UseDrawerReturn => {
  const {
    module: forcedModule,
    initialOpen = false,
    persistState = true,
    config: configOverride,
  } = options;

  // Estado local del drawer
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  // Estado global de módulos
  const moduleStore = useModuleStore();
  const moduleTransition = useModuleTransition();
  const { showModal, showSuccess, showError } = useUI();

  // Hook de Expo Router para obtener la ruta actual
  const currentPath = usePathname();

  // Determinar el módulo actual (del store global o forzado)
  const currentModule = forcedModule || moduleStore.currentModule;
  const isTransitioning = moduleStore.isTransitioning;

  // Obtener configuración del módulo actual
  const baseConfig = drawerConfigs[currentModule];

  // Aplicar overrides si existen
  const config: DrawerConfig = useMemo(() => {
    if (configOverride) {
      return {
        ...baseConfig,
        ...configOverride,
        routes: configOverride.routes || baseConfig.routes,
        header: { ...baseConfig.header, ...configOverride.header },
        footer: { ...baseConfig.footer, ...configOverride.footer },
      };
    }
    return baseConfig;
  }, [baseConfig, configOverride]);

  // Efecto para determinar la ruta activa basada en la URL actual
  useEffect(() => {
    if (!currentPath) return;

    const findActiveRoute = (routes: DrawerRoute[]): string | null => {
      for (const route of routes) {
        // Verificar si la ruta actual coincide con el href
        if (route.href && currentPath.startsWith(route.href.replace("*", ""))) {
          return route.id;
        }

        // Verificar rutas anidadas recursivamente
        if (route.subroutes) {
          const activeSubroute = findActiveRoute(route.subroutes);
          if (activeSubroute) {
            // Expandir automáticamente la ruta padre si hay una subruta activa
            setExpandedRoutes((prev) => new Set([...prev, route.id]));
            return activeSubroute;
          }
        }
      }
      return null;
    };

    const active = findActiveRoute(config.routes);
    if (active !== activeRoute) {
      console.log(
        "[useDrawer] Active route updated:",
        active,
        "from path:",
        currentPath,
      );
      setActiveRoute(active);
    }
  }, [currentPath, config.routes, activeRoute]);

  // Efecto para cargar estado persistido
  useEffect(() => {
    if (!persistState) return;

    const loadPersistedState = async () => {
      try {
        const [savedExpanded, savedActive] = await Promise.all([
          AsyncStorage.getItem(`drawer_expanded_${currentModule}`),
          AsyncStorage.getItem(`drawer_active_${currentModule}`),
        ]);

        if (savedExpanded) {
          const expanded = new Set<string>(JSON.parse(savedExpanded));
          setExpandedRoutes(expanded);
        }

        if (savedActive && savedActive !== "null") {
          setActiveRoute(savedActive);
        }
      } catch (error) {
        console.error("[useDrawer] Error loading persisted state:", error);
      }
    };

    loadPersistedState();
  }, [currentModule, persistState]);

  // Función para persistir estado
  const persistStateAsync = useCallback(
    async (key: string, value: any) => {
      if (!persistState) return;
      try {
        await AsyncStorage.setItem(
          `drawer_${key}_${currentModule}`,
          JSON.stringify(value),
        );
      } catch (error) {
        console.error("[useDrawer] Error persisting state:", error);
      }
    },
    [persistState, currentModule],
  );

  // Acciones del drawer
  const toggle = useCallback(() => {
    console.log("[useDrawer] Toggle drawer");
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    console.log("[useDrawer] Open drawer");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    console.log("[useDrawer] Close drawer");
    setIsOpen(false);
  }, []);

  const setActiveRouteHandler = useCallback(
    (routeId: string) => {
      console.log("[useDrawer] Set active route:", routeId);
      setActiveRoute(routeId);
      persistStateAsync("active", routeId);
    },
    [persistStateAsync],
  );

  const toggleExpandedHandler = useCallback(
    (routeId: string) => {
      console.log("[useDrawer] Toggle expanded route:", routeId);
      setExpandedRoutes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(routeId)) {
          newSet.delete(routeId);
        } else {
          newSet.add(routeId);
        }
        persistStateAsync("expanded", Array.from(newSet));
        return newSet;
      });
    },
    [persistStateAsync],
  );

  // Función para manejar cambios de módulo
  const switchModule = useCallback(
    async (targetModule: ModuleType) => {
      console.log("[useDrawer] Switch module requested:", targetModule);

      // Buscar la ruta que cambia al módulo objetivo
      const switchRoute = config.routes.find(
        (r) => r.switchToModule === targetModule,
      );

      if (switchRoute?.requiresConfirmation) {
        // Mostrar modal de confirmación
        const confirmed = await new Promise<boolean>((resolve) => {
          showModal({
            id: "module-switch-confirmation",
            title: `Switch to ${targetModule}?`,
            content: `Are you sure you want to switch to ${targetModule} mode? This will change your app experience.`,
            actions: [
              {
                label: "Cancel",
                variant: "secondary" as const,
                onPress: () => resolve(false),
              },
              {
                label: "Switch",
                variant: "primary" as const,
                onPress: () => resolve(true),
              },
            ],
          });
        });

        if (!confirmed) {
          console.log("[useDrawer] Module switch cancelled by user");
          return;
        }
      }

      try {
        // Ejecutar cambio de módulo con splash
        await moduleTransition.switchModule(targetModule);

        // Cerrar drawer
        close();

        // Navegar a la pantalla inicial del nuevo módulo
        const initialRoutes: Record<ModuleType, string> = {
          customer: "/(root)/(tabs)/home",
          business: "/(auth)/business-register",
          driver: "/(auth)/driver-register",
        };

        console.log(
          "[useDrawer] Navigating to initial route for module:",
          targetModule,
        );
        router.replace(initialRoutes[targetModule] as any);

        // Mostrar notificación de éxito
        showSuccess("Success", `Switched to ${targetModule} mode`);
      } catch (error) {
        console.error("[useDrawer] Error switching module:", error);
        showError("Switch Failed", "Unable to switch modes. Please try again.");
      }
    },
    [config.routes, moduleStore, close, showModal, showSuccess, showError],
  );

  // Handler principal para presionar rutas
  const handleRoutePress = useCallback(
    (route: DrawerRoute) => {
      console.log("[useDrawer] Route pressed:", route.id, route);

      // Si es un cambio de módulo
      if (route.switchToModule) {
        switchModule(route.switchToModule);
        return;
      }

      // Si tiene acción personalizada
      if (route.onPress) {
        route.onPress();
        return;
      }

      // Si tiene href, navegar
      if (route.href) {
        console.log("[useDrawer] Navigating to:", route.href);
        router.push(route.href as any);
        setActiveRouteHandler(route.id);
        close(); // Cerrar drawer después de navegar
        return;
      }

      // Si tiene subrutas, toggle expanded
      if (route.subroutes && route.subroutes.length > 0) {
        toggleExpandedHandler(route.id);
        return;
      }

      console.warn(
        "[useDrawer] Route pressed but no action defined:",
        route.id,
      );
    },
    [switchModule, setActiveRouteHandler, close, toggleExpandedHandler],
  );

  return {
    // Estado
    isOpen,
    activeRoute,
    expandedRoutes,
    currentModule,
    isTransitioning,

    // Acciones
    toggle,
    open,
    close,
    setActiveRoute: setActiveRouteHandler,
    toggleExpanded: toggleExpandedHandler,

    // Cambios de módulo
    switchModule,

    // Config
    config,
    routes: config.routes,

    // Handlers
    handleRoutePress,
  };
};
