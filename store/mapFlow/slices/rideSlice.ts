import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  LocationSnapshot, 
  DriverSnapshot, 
  RouteInfoSnapshot, 
  PriceBreakdownSnapshot 
} from '../types';
import { RideType } from '../../../lib/unified-flow/constants';
import { mapFlowLogger } from '../logger';

/**
 * Slice para manejar estado de viajes del MapFlow
 * Responsabilidades:
 * - Estado de viajes (rideId, orderId, etc.)
 * - Matching de conductores
 * - Confirmaciones de ubicación
 * - Configuración de viaje
 */
export interface RideSlice {
  // Estado de IDs
  rideId: number | null;
  orderId: number | null;
  errandId: number | null;
  parcelId: number | null;
  
  // Estado de tipo de viaje y confirmaciones
  rideType: RideType;
  confirmedOrigin: LocationSnapshot | null;
  confirmedDestination: LocationSnapshot | null;
  phoneNumber: string | undefined;
  
  // Estado de matching de conductor
  isMatching: boolean;
  matchedDriver: DriverSnapshot | null;
  matchingTimeout: number;
  matchingStartTime: Date | undefined;
  acceptanceTimeout: number;
  acceptanceStartTime: Date | undefined;
  
  // Estado de configuración de viaje
  selectedTierId: number | undefined;
  selectedVehicleTypeId: number | undefined;
  
  // Estado de información de ruta y precio
  estimatedPrice: number | undefined;
  routeInfo: RouteInfoSnapshot | null;
  priceBreakdown: PriceBreakdownSnapshot | null;
  
  // Actions de IDs
  setRideId: (id: number | null) => void;
  setOrderId: (id: number | null) => void;
  setErrandId: (id: number | null) => void;
  setParcelId: (id: number | null) => void;
  
  // Actions de tipo de viaje y confirmaciones
  setRideType: (type: RideType) => void;
  setConfirmedOrigin: (location: LocationSnapshot | null) => void;
  setConfirmedDestination: (location: LocationSnapshot | null) => void;
  setPhoneNumber: (phone?: string) => void;
  
  // Actions de matching de conductor
  startMatching: (timeoutSeconds?: number) => void;
  stopMatching: () => void;
  setMatchedDriver: (driver: DriverSnapshot | null) => void;
  clearMatchedDriver: () => void;
  startAcceptanceTimer: (timeoutSeconds?: number) => void;
  stopAcceptanceTimer: () => void;
  
  // Actions de configuración de viaje
  setSelectedTierId: (tierId?: number) => void;
  setSelectedVehicleTypeId: (vehicleTypeId?: number) => void;
  
  // Actions de información de ruta y precio
  setEstimatedPrice: (price?: number) => void;
  setRouteInfo: (routeInfo?: RouteInfoSnapshot) => void;
  setPriceBreakdown: (breakdown?: PriceBreakdownSnapshot) => void;
  
  // Selectors
  getRideState: () => {
    rideId: number | null;
    orderId: number | null;
    errandId: number | null;
    parcelId: number | null;
  };
  getMatchingState: () => {
    isMatching: boolean;
    matchedDriver: DriverSnapshot | null;
    matchingTimeout: number;
    matchingStartTime: Date | undefined;
  };
  getRideConfig: () => {
    rideType: RideType;
    selectedTierId: number | undefined;
    selectedVehicleTypeId: number | undefined;
    confirmedOrigin: LocationSnapshot | null;
    confirmedDestination: LocationSnapshot | null;
  };
  getPricingInfo: () => {
    estimatedPrice: number | undefined;
    routeInfo: RouteInfoSnapshot | null;
    priceBreakdown: PriceBreakdownSnapshot | null;
  };
}

export const useRideSlice = create<RideSlice>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    rideId: null,
    orderId: null,
    errandId: null,
    parcelId: null,
    rideType: RideType.NORMAL,
    confirmedOrigin: null,
    confirmedDestination: null,
    phoneNumber: undefined,
    isMatching: false,
    matchedDriver: null,
    matchingTimeout: 30,
    matchingStartTime: undefined,
    acceptanceTimeout: 30,
    acceptanceStartTime: undefined,
    selectedTierId: undefined,
    selectedVehicleTypeId: undefined,
    estimatedPrice: undefined,
    routeInfo: null,
    priceBreakdown: null,
    
    // Actions de IDs
    setRideId: (id: number | null) => {
      mapFlowLogger('debug', 'setRideId', { id });
      set({ rideId: id });
    },
    
    setOrderId: (id: number | null) => {
      mapFlowLogger('debug', 'setOrderId', { id });
      set({ orderId: id });
    },
    
    setErrandId: (id: number | null) => {
      mapFlowLogger('debug', 'setErrandId', { id });
      set({ errandId: id });
    },
    
    setParcelId: (id: number | null) => {
      mapFlowLogger('debug', 'setParcelId', { id });
      set({ parcelId: id });
    },
    
    // Actions de tipo de viaje y confirmaciones
    setRideType: (type: RideType) => {
      mapFlowLogger('debug', 'setRideType', { type });
      set({ rideType: type });
    },
    
    setConfirmedOrigin: (location: LocationSnapshot | null) => {
      mapFlowLogger('debug', 'setConfirmedOrigin', { location });
      set({ confirmedOrigin: location });
    },
    
    setConfirmedDestination: (location: LocationSnapshot | null) => {
      mapFlowLogger('debug', 'setConfirmedDestination', { location });
      set({ confirmedDestination: location });
    },
    
    setPhoneNumber: (phone?: string) => {
      mapFlowLogger('debug', 'setPhoneNumber', { phone });
      set({ phoneNumber: phone });
    },
    
    // Actions de matching de conductor
    startMatching: (timeoutSeconds: number = 30) => {
      mapFlowLogger('debug', 'startMatching', { timeoutSeconds });
      
      set({
        isMatching: true,
        matchingTimeout: timeoutSeconds,
        matchingStartTime: new Date(),
        matchedDriver: null,
      });
    },
    
    stopMatching: () => {
      mapFlowLogger('debug', 'stopMatching');
      
      set({
        isMatching: false,
        matchingStartTime: undefined,
      });
    },
    
    setMatchedDriver: (driver: DriverSnapshot | null) => {
      mapFlowLogger('debug', 'setMatchedDriver', { driver });
      
      set({
        matchedDriver: driver,
        isMatching: false,
      });
    },
    
    clearMatchedDriver: () => {
      mapFlowLogger('debug', 'clearMatchedDriver');
      
      set({ matchedDriver: null });
    },
    
    startAcceptanceTimer: (timeoutSeconds: number = 30) => {
      mapFlowLogger('debug', 'startAcceptanceTimer', { timeoutSeconds });
      
      set({
        acceptanceTimeout: timeoutSeconds,
        acceptanceStartTime: new Date(),
      });
    },
    
    stopAcceptanceTimer: () => {
      mapFlowLogger('debug', 'stopAcceptanceTimer');
      
      set({ acceptanceStartTime: undefined });
    },
    
    // Actions de configuración de viaje
    setSelectedTierId: (tierId?: number) => {
      mapFlowLogger('debug', 'setSelectedTierId', { tierId });
      set({ selectedTierId: tierId });
    },
    
    setSelectedVehicleTypeId: (vehicleTypeId?: number) => {
      mapFlowLogger('debug', 'setSelectedVehicleTypeId', { vehicleTypeId });
      set({ selectedVehicleTypeId: vehicleTypeId });
    },
    
    // Actions de información de ruta y precio
    setEstimatedPrice: (price?: number) => {
      mapFlowLogger('debug', 'setEstimatedPrice', { price });
      set({ estimatedPrice: price });
    },
    
    setRouteInfo: (routeInfo?: RouteInfoSnapshot) => {
      mapFlowLogger('debug', 'setRouteInfo', { routeInfo });
      set({ routeInfo: routeInfo || null });
    },
    
    setPriceBreakdown: (breakdown?: PriceBreakdownSnapshot) => {
      mapFlowLogger('debug', 'setPriceBreakdown', { breakdown });
      set({ priceBreakdown: breakdown || null });
    },
    
    // Selectors
    getRideState: () => {
      const state = get();
      return {
        rideId: state.rideId,
        orderId: state.orderId,
        errandId: state.errandId,
        parcelId: state.parcelId,
      };
    },
    
    getMatchingState: () => {
      const state = get();
      return {
        isMatching: state.isMatching,
        matchedDriver: state.matchedDriver,
        matchingTimeout: state.matchingTimeout,
        matchingStartTime: state.matchingStartTime,
      };
    },
    
    getRideConfig: () => {
      const state = get();
      return {
        rideType: state.rideType,
        selectedTierId: state.selectedTierId,
        selectedVehicleTypeId: state.selectedVehicleTypeId,
        confirmedOrigin: state.confirmedOrigin,
        confirmedDestination: state.confirmedDestination,
      };
    },
    
    getPricingInfo: () => {
      const state = get();
      return {
        estimatedPrice: state.estimatedPrice,
        routeInfo: state.routeInfo,
        priceBreakdown: state.priceBreakdown,
      };
    },
  }))
);

// Selectors optimizados para componentes
export const useRideId = () => 
  useRideSlice((state) => state.rideId);

export const useIsMatching = () => 
  useRideSlice((state) => state.isMatching);

export const useMatchedDriver = () => 
  useRideSlice((state) => state.matchedDriver);

export const useRideType = () => 
  useRideSlice((state) => state.rideType);

export const useConfirmedOrigin = () => 
  useRideSlice((state) => state.confirmedOrigin);

export const useConfirmedDestination = () => 
  useRideSlice((state) => state.confirmedDestination);

export const useEstimatedPrice = () => 
  useRideSlice((state) => state.estimatedPrice);

export const useRouteInfo = () => 
  useRideSlice((state) => state.routeInfo);
