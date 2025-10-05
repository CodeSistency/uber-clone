// Exportar tipos
export type {
  ModuleType,
  DrawerRoute,
  DrawerConfig,
  DrawerProps,
  DrawerRouteItemProps,
  DrawerHeaderProps,
  DrawerFooterProps,
  ModuleSwitcherProps,
  UseDrawerOptions,
  UseDrawerReturn,
  ModuleState,
} from "./types";

// Exportar hook
export { useDrawer } from "./useDrawer";

// Exportar componentes
export { default as Drawer } from "./Drawer";
export { default as AnimatedDrawerLayout } from "./AnimatedDrawerLayout";
export { default as AnimatedBackdrop } from "./AnimatedBackdrop";
export { default as CustomerModuleDrawerContent } from "./CustomerModuleDrawerContent";
export { default as DriverModuleDrawerContent } from "./DriverModuleDrawerContent";
export { DrawerHeader } from "./DrawerHeader";
export { DrawerRouteItem } from "./DrawerRouteItem";
export { DrawerFooter } from "./DrawerFooter";
export { ModuleSwitcher } from "./ModuleSwitcher";
export { useAnimatedDrawerLayout } from "./useAnimatedDrawerLayout";

// Exportar configuraciones
export { drawerConfigs } from "./configs";
export { customerDrawerConfig } from "./configs/customerDrawerConfig";
export { businessDrawerConfig } from "./configs/businessDrawerConfig";
export { driverDrawerConfig } from "./configs/driverDrawerConfig";

// Exportar store de módulos
export {
  useModuleStore,
  initializeModuleStore,
  clearModuleStore,
} from "../../store/module";
