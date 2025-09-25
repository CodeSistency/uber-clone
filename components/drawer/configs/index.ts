// Re-export de todas las configuraciones de drawer
export { customerDrawerConfig } from "./customerDrawerConfig";
export { businessDrawerConfig } from "./businessDrawerConfig";
export { driverDrawerConfig } from "./driverDrawerConfig";

// Configuraciones agrupadas por módulo
import { customerDrawerConfig } from "./customerDrawerConfig";
import { businessDrawerConfig } from "./businessDrawerConfig";
import { driverDrawerConfig } from "./driverDrawerConfig";
import { DrawerConfig, ModuleType } from "../types";

export const drawerConfigs: Record<ModuleType, DrawerConfig> = {
  customer: customerDrawerConfig,
  business: businessDrawerConfig,
  driver: driverDrawerConfig,
};
