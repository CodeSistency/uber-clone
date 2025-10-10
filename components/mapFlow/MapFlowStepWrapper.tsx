import React, { useMemo } from 'react';
import { MapFlowStep } from '@/store/mapFlow';
import { useMapFlowPagerWithSteps } from '@/hooks/useMapFlowPagerWithSteps';

// Importar los componentes reales
import ServiceSelection from '@/components/unified-flow/steps/Client/ServiceSelection';
import TransportDefinition from '@/components/unified-flow/steps/Client/Viaje/TransportDefinition';
import ConfirmOrigin from '@/components/unified-flow/steps/Client/Viaje/ConfirmOrigin';
import ConfirmDestination from '@/components/unified-flow/steps/Client/Viaje/ConfirmDestination';
import TransportVehicleSelection from '@/components/unified-flow/steps/Client/Viaje/TransportVehicleSelection';
import PaymentMethodology from '@/components/unified-flow/steps/Client/Viaje/PaymentMethodology';
import DriverMatching from '@/components/unified-flow/steps/Client/Viaje/DriverMatching';
import WaitingForAcceptance from '@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance';
import DriverConfirmation from '@/components/unified-flow/steps/Driver/DriverConfirmation';
import DriverArrived from '@/components/unified-flow/steps/DriverArrived';
import RideInProgressAndFinalize from '@/components/unified-flow/steps/DriverArrived';
import RideInProgress from '@/components/unified-flow/steps/RideInProgress';
import RideCompleted from '@/components/unified-flow/steps/RideCompleted';
import RideCancelled from '@/components/unified-flow/steps/RideCancelled';
import ChooseDriver from '@/components/unified-flow/steps/Client/ChooseDriver';
import DriverConfirmationStep from '@/components/unified-flow/steps/Client/Viaje/DriverConfirmationStep';
import DeliveryBusinessSearch from '@/components/unified-flow/steps/Client/Delivery/DeliveryBusinessSearch';
import DeliveryCheckout from '@/components/unified-flow/steps/Client/Delivery/DeliveryCheckout';
import DeliveryTracking from '@/components/unified-flow/steps/Client/Delivery/DeliveryTracking';
import OrderBuilder from '@/components/unified-flow/steps/OrderBuilder';
import MandadoDetails from '@/components/unified-flow/steps/Client/Mandado/MandadoDetails';
import MandadoPriceAndPayment from '@/components/unified-flow/steps/Client/Mandado/MandadoPriceAndPayment';
import MandadoSearching from '@/components/unified-flow/steps/Client/Mandado/MandadoSearching';
import MandadoCommsAndConfirm from '@/components/unified-flow/steps/Client/Mandado/MandadoCommsAndConfirm';
import MandadoFinalize from '@/components/unified-flow/steps/Client/Mandado/MandadoFinalize';
import EnvioDetails from '@/components/unified-flow/steps/Client/Envio/EnvioDetails';
import EnvioPricingAndPayment from '@/components/unified-flow/steps/Client/Envio/EnvioPricingAndPayment';
import EnvioTracking from '@/components/unified-flow/steps/Client/Envio/EnvioTracking';
import EnvioDeliveryConfirm from '@/components/unified-flow/steps/Client/Envio/EnvioDeliveryConfirm';

interface MapFlowStepWrapperProps {
  step: MapFlowStep;
  onAction?: (action: string, data?: any) => void;
}

// Props adapter function to map onAction to specific component props
const getComponentProps = (step: MapFlowStep, onAction?: (action: string, data?: any) => void): any => {
  const baseProps = { onAction };
  
  switch (step) {
    case 'CUSTOMER_TRANSPORT_CONFIRM_ORIGIN':
    case 'CUSTOMER_TRANSPORT_CONFIRM_DESTINATION':
      return {
        ...baseProps,
        onConfirm: (location: any) => onAction?.('confirm', location),
        onBack: (location?: any) => onAction?.('back', location)
      };
    
    case 'CUSTOMER_TRANSPORT_SELECCION_VEHICULO':
      return {
        ...baseProps,
        onVehicleSelect: (vehicle: any) => onAction?.('vehicle_selected', vehicle),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_TRANSPORT_METODOLOGIA_PAGO':
      return {
        ...baseProps,
        onPaymentMethod: (method: any) => onAction?.('payment_method_selected', method),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
      return {
        ...baseProps,
        onDriverFound: (driver: any) => onAction?.('driver_found', driver),
        onCancel: () => onAction?.('cancel')
      };
    
    case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
      return {
        ...baseProps,
        onAcceptance: (accepted: boolean) => onAction?.('acceptance', { accepted }),
        onCancel: () => onAction?.('cancel')
      };
    
    case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
      return {
        ...baseProps,
        onConfirm: () => onAction?.('confirm'),
        onCancel: () => onAction?.('cancel')
      };
    
    case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
      return {
        ...baseProps,
        onStartRide: () => onAction?.('start_ride'),
        onCallDriver: () => onAction?.('call_driver')
      };
    
    case 'CUSTOMER_TRANSPORT_VIAJE_EN_CURSO':
      return {
        ...baseProps,
        onEmergency: () => onAction?.('emergency'),
        onCallDriver: () => onAction?.('call_driver')
      };
    
    case 'CUSTOMER_TRANSPORT_VIAJE_COMPLETADO':
      return {
        ...baseProps,
        onRate: (rating: number) => onAction?.('rate', { rating }),
        onFinish: () => onAction?.('finish')
      };
    
    case 'CUSTOMER_TRANSPORT_VIAJE_CANCELADO':
      return {
        ...baseProps,
        onRetry: () => onAction?.('retry'),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR':
      return {
        ...baseProps,
        onDriverSelect: (driver: any) => onAction?.('driver_selected', driver),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR':
      return {
        ...baseProps,
        onConfirm: () => onAction?.('confirm'),
        onBack: () => onAction?.('back')
      };
    
    // Delivery steps
    case 'CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO':
      return {
        ...baseProps,
        onBusinessSelect: (business: any) => onAction?.('business_selected', business),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_DELIVERY_ARMADO_PEDIDO':
      return {
        ...baseProps,
        onOrderComplete: (order: any) => onAction?.('order_complete', order),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION':
      return {
        ...baseProps,
        onCheckout: (checkout: any) => onAction?.('checkout', checkout),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY':
      return {
        ...baseProps,
        onTrack: () => onAction?.('track'),
        onCallDriver: () => onAction?.('call_driver')
      };
    
    // Mandado steps
    case 'CUSTOMER_MANDADO_DETALLES_MANDADO':
      return {
        ...baseProps,
        onDetailsComplete: (details: any) => onAction?.('details_complete', details),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_MANDADO_PRECIO_PAGO':
      return {
        ...baseProps,
        onPayment: (payment: any) => onAction?.('payment', payment),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR':
      return {
        ...baseProps,
        onDriverFound: (driver: any) => onAction?.('driver_found', driver),
        onCancel: () => onAction?.('cancel')
      };
    
    case 'CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION':
      return {
        ...baseProps,
        onConfirm: () => onAction?.('confirm'),
        onCancel: () => onAction?.('cancel')
      };
    
    case 'CUSTOMER_MANDADO_FINALIZACION':
      return {
        ...baseProps,
        onFinish: () => onAction?.('finish'),
        onRate: (rating: number) => onAction?.('rate', { rating })
      };
    
    // Envio steps
    case 'CUSTOMER_ENVIO_DETALLES_ENVIO':
      return {
        ...baseProps,
        onDetailsComplete: (details: any) => onAction?.('details_complete', details),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_ENVIO_CALCULAR_PRECIO':
      return {
        ...baseProps,
        onPriceCalculate: (price: any) => onAction?.('price_calculate', price),
        onBack: () => onAction?.('back')
      };
    
    case 'CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE':
      return {
        ...baseProps,
        onTrack: () => onAction?.('track'),
        onCallDriver: () => onAction?.('call_driver')
      };
    
    case 'CUSTOMER_ENVIO_CONFIRMACION_ENTREGA':
      return {
        ...baseProps,
        onDeliveryConfirm: () => onAction?.('delivery_confirm'),
        onRate: (rating: number) => onAction?.('rate', { rating })
      };
    
    default:
      return baseProps;
  }
};

const MapFlowStepWrapper: React.FC<MapFlowStepWrapperProps> = ({ 
  step, 
  onAction,

  }) => {
  // Mapeo directo de pasos a componentes - SIN hooks condicionales
  const StepComponent = useMemo(() => {
    console.log('[MapFlowStepWrapper] Rendering step:', step);
    
    switch (step) {
      case 'SELECCION_SERVICIO':
        return ServiceSelection;
      
      case 'CUSTOMER_TRANSPORT_DEFINICION_VIAJE':
        return TransportDefinition;
      
      case 'CUSTOMER_TRANSPORT_CONFIRM_ORIGIN':
        return ConfirmOrigin;
      
      case 'CUSTOMER_TRANSPORT_CONFIRM_DESTINATION':
        return ConfirmDestination;
      
      case 'CUSTOMER_TRANSPORT_SELECCION_VEHICULO':
        return TransportVehicleSelection;
      
      case 'CUSTOMER_TRANSPORT_METODOLOGIA_PAGO':
        return PaymentMethodology;
      
      case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
        return DriverMatching;
      
      case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
        return WaitingForAcceptance;
      
      case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
        return DriverConfirmation;
      
      case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
        return DriverArrived;
      
      case 'CUSTOMER_TRANSPORT_DURANTE_FINALIZACION':
        return RideInProgressAndFinalize;
      
      case 'CUSTOMER_TRANSPORT_VIAJE_EN_CURSO':
        return RideInProgress;
      
      case 'CUSTOMER_TRANSPORT_VIAJE_COMPLETADO':
        return RideCompleted;
      
      case 'CUSTOMER_TRANSPORT_VIAJE_CANCELADO':
        return RideCancelled;
      
      case 'CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR':
        return ChooseDriver;
      
      case 'CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR':
        return DriverConfirmationStep;
      
      case 'CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO':
        return DeliveryBusinessSearch;
      
      case 'CUSTOMER_DELIVERY_ARMADO_PEDIDO':
        return OrderBuilder;
      
      case 'CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION':
        return DeliveryCheckout;
      
      case 'CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY':
        return DeliveryTracking;
      
      case 'CUSTOMER_MANDADO_DETALLES_MANDADO':
        return MandadoDetails;
      
      case 'CUSTOMER_MANDADO_PRECIO_PAGO':
        return MandadoPriceAndPayment;
      
      case 'CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR':
        return MandadoSearching;
      
      case 'CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION':
        return MandadoCommsAndConfirm;
      
      case 'CUSTOMER_MANDADO_FINALIZACION':
        return MandadoFinalize;
      
      case 'CUSTOMER_ENVIO_DETALLES_ENVIO':
        return EnvioDetails;
      
      case 'CUSTOMER_ENVIO_CALCULAR_PRECIO':
        return EnvioPricingAndPayment;
      
      case 'CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE':
        return EnvioTracking;
      
      case 'CUSTOMER_ENVIO_CONFIRMACION_ENTREGA':
        return EnvioDeliveryConfirm;
      
      default:
        console.log('[MapFlowStepWrapper] No component found for step:', step);
        return null;
    }
  }, [step]);

  // Renderizar el componente si existe
  if (StepComponent) {
    try {
      console.log('[MapFlowStepWrapper] Rendering component for step:', step);
      
      // Usar el adaptador de props para mapear onAction a props específicas
      const componentProps = getComponentProps(step, onAction);
      
      return <StepComponent {...componentProps} />;
    } catch (error) {
      console.error('[MapFlowStepWrapper] Error rendering component:', error);
      return null;
    }
  }

  console.log('[MapFlowStepWrapper] No component available for step:', step);
  return null;
};

export default MapFlowStepWrapper;
