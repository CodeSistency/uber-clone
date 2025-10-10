/**
 * Barrel exports para todos los slices del MapFlow
 * Proporciona acceso centralizado a todos los slices y sus selectors
 */

// Exportar slices principales
export { useConfigSlice } from './configSlice';
export { useFlowSlice } from './flowSlice';
export { useNavigationSlice } from './navigationSlice';
export { useRideSlice } from './rideSlice';
export { useSearchSlice } from './searchSlice';

// Exportar selectors optimizados de configSlice
export {
  useStepConfig,
  useStepBottomSheet,
  useStepMapInteraction,
  useStepTransition,
} from './configSlice';

// Exportar selectors optimizados de flowSlice
export {
  useCurrentStep,
  useCurrentRole,
  useCurrentService,
  useFlowHistory,
  useIsStepActive,
} from './flowSlice';

// Exportar selectors optimizados de navigationSlice
export {
  useVariantState,
  useIsPagerViewActive,
  useCurrentPageIndex,
  useTotalPages,
  useIsTransitioning,
  useHasError,
  useCompletedSteps,
} from './navigationSlice';

// Exportar selectors optimizados de rideSlice
export {
  useRideId,
  useIsMatching,
  useMatchedDriver,
  useRideType,
  useConfirmedOrigin,
  useConfirmedDestination,
  useEstimatedPrice,
  useRouteInfo,
} from './rideSlice';

// Exportar selectors optimizados de searchSlice
export {
  useAsyncSearchState,
  useIsSearching,
  useSearchTimeRemaining,
  useSearchError,
  useAsyncMatchedDriver,
} from './searchSlice';

// Exportar tipos
export type { ConfigSlice } from './configSlice';
export type { FlowSlice } from './flowSlice';
export type { NavigationSlice } from './navigationSlice';
export type { RideSlice } from './rideSlice';
export type { SearchSlice } from './searchSlice';
