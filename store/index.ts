// Re-export all stores from their respective subdirectories
export * from "./user"; // EXPANDED: Now includes profile functionality
export * from "./location";
export * from "./driver"; // NEW: Consolidated driver store
// Vehicle store exports (specific to avoid conflicts with driver store)
export {
  useVehicleStore,
  useMyVehicles,
  useVehicleTiers,
  useCarTiers,
  useMotorcycleTiers,
  useTiersLoading,
  useTiersLastFetch,
  useVehiclesLoading,
  useMyVehiclesLoading,
  useCatalogLoading,
  useVehicleError,
  useVehicleData,
} from "./vehicle/vehicle";
export * from "./notification";
export * from "./realtime";
export * from "./chat";
export * from "./ui";
export * from "./emergency";
export * from "./onboarding";
export * from "./safety";
export * from "./ratings";
export * from "./payment";
export * from "./splash";
export * from "./rides";
export * from "./dev/dev";
export * from "./wallet";

// Re-export specific types to avoid conflicts
export type { VehicleTier, VehicleTiersData } from "./vehicle/vehicle";

// DEPRECATED: Individual driver stores (to be removed in Week 5)
/** @deprecated Use useDriverStore instead */
export * from "./driverState";
/** @deprecated Use useDriverStore instead */
export * from "./driverProfile";
/** @deprecated Use useDriverStore instead */
export * from "./driverRole";
/** @deprecated Use useDriverStore instead */
export * from "./driverOnboarding";
/** @deprecated Use useDriverStore instead */
export * from "./driverEarnings";
/** @deprecated Use useDriverStore instead */
export * from "./earnings";
/** @deprecated Use useVehicleStore instead */
export * from "./vehicles";
/** @deprecated Use useVehicleStore instead */
export * from "./vehicleTiers/vehicleTiers";
// Profile store is now integrated into user store
// export * from "./profile";

// Re-export specific functions to avoid conflicts
export { useVerificationStatus as useUserVerificationStatus } from "./user";
export { useSavedAddresses as useUserSavedAddresses } from "./user";
export { useIsProfileLoading as useDriverProfileLoading } from "./driver";

// Specific exports to avoid naming conflicts
export {
  useDriverConfigStore,
  DriverProfile,
  ServiceType as DriverServiceType,
} from "./driverConfig";

export {
  useMapFlowStore,
  MapFlowRole,
  ServiceType as FlowServiceType,
  FlowRole,
  FlowStep,
  MapFlowStep,
} from "./mapFlow";
