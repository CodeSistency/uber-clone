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
} from './types';

// Exportar hook
export { useDrawer } from './useDrawer';

// Exportar componentes
export { default as Drawer } from './Drawer';
export { DrawerHeader } from './DrawerHeader';
export { DrawerRouteItem } from './DrawerRouteItem';
export { DrawerFooter } from './DrawerFooter';
export { ModuleSwitcher } from './ModuleSwitcher';

// Exportar configuraciones
export { drawerConfigs } from './configs';
export { customerDrawerConfig } from './configs/customerDrawerConfig';
export { businessDrawerConfig } from './configs/businessDrawerConfig';
export { driverDrawerConfig } from './configs/driverDrawerConfig';

// Exportar store de módulos
export { useModuleStore, initializeModuleStore, clearModuleStore } from '../../store/module';
