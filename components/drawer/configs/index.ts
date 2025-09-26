// Re-export de todas las configuraciones de drawer
// Configuraciones agrupadas por módulo
import { DrawerConfig, ModuleType } from "../types";

import { businessDrawerConfig } from "./businessDrawerConfig";
import { customerDrawerConfig } from "./customerDrawerConfig";
import { driverDrawerConfig } from "./driverDrawerConfig";

export { customerDrawerConfig } from "./customerDrawerConfig";
export { businessDrawerConfig } from "./businessDrawerConfig";
export { driverDrawerConfig } from "./driverDrawerConfig";

export const drawerConfigs: Record<ModuleType, DrawerConfig> = {
  customer: customerDrawerConfig,
  business: businessDrawerConfig,
  driver: driverDrawerConfig,
};
