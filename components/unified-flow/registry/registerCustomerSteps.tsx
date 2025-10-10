/**
 * Registro centralizado de componentes para pasos de Customer
 * Se ejecuta una sola vez al inicio de la aplicación
 */

import { stepRegistry } from './index';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';
import { log } from '@/lib/logger';

// Importar componentes de pasos
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

/**
 * Registra todos los componentes de pasos para Customer
 */
export const registerCustomerSteps = () => {
  log.registry.info('Registering customer steps...');

  // Service selection
  stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => {
    log.registry.debug('ServiceSelection component is being rendered!');
    return <ServiceSelection />;
  }, {
    role: 'customer',
  });

  // Transport steps
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <TransportDefinition />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_ORIGIN, () => (
    <ConfirmOrigin
      onConfirm={(location) => {
        log.registry.debug("Origin confirmed", { data: location });
      }}
      onBack={(location) => {
        log.registry.debug("Origin back", { data: location });
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_DESTINATION, () => (
    <ConfirmDestination
      onConfirm={(location) => {
        log.registry.debug("Destination confirmed", { data: location });
      }}
      onBack={(location) => {
        log.registry.debug("Destination back", { data: location });
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO, () => <TransportVehicleSelection />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO, () => <PaymentMethodology />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR, () => <DriverMatching />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR, () => <DriverConfirmationStep />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION, () => <WaitingForAcceptance />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR, () => <ChooseDriver />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION, () => <DriverConfirmation />, {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DURANTE_FINALIZACION, () => (
    <RideInProgressAndFinalize
      onReady={() => {
        log.registry.debug("Ride in progress - ready clicked");
      }}
      onCallDriver={() => {
        log.registry.debug("Call driver clicked");
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO, () => (
    <DriverArrived
      onReady={() => {
        log.registry.debug("Driver arrived - ready clicked");
      }}
      onCallDriver={() => {
        log.registry.debug("Call driver clicked");
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_VIAJE_EN_CURSO, () => (
    <RideInProgress
      estimatedTime={15}
      onCallDriver={() => {
        log.registry.debug("Call driver clicked");
      }}
      onEmergency={() => {
        log.registry.debug("Emergency clicked");
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_VIAJE_COMPLETADO, () => (
    <RideCompleted
      driverName="Carlos Rodriguez"
      fare={18.5}
      distance={12.5}
      duration={25}
      onRateDriver={() => {
        log.registry.debug("Rate driver clicked");
      }}
      onNewRide={() => {
        log.registry.debug("New ride clicked");
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_VIAJE_CANCELADO, () => (
    <RideCancelled
      reason="El conductor canceló el viaje"
      canRebook={true}
      onRebook={() => {
        log.registry.debug("Rebook clicked");
      }}
      onGoHome={() => {
        log.registry.debug("Go home clicked");
      }}
    />
  ), {
    role: 'customer',
    service: 'transport',
  });

  // Delivery steps
  stepRegistry.register(FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO, () => <DeliveryBusinessSearch />, {
    role: 'customer',
    service: 'delivery',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_DELIVERY_ARMADO_PEDIDO, () => <OrderBuilder />, {
    role: 'customer',
    service: 'delivery',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION, () => <DeliveryCheckout />, {
    role: 'customer',
    service: 'delivery',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY, () => <DeliveryTracking />, {
    role: 'customer',
    service: 'delivery',
  });

  // Mandado steps
  stepRegistry.register(FLOW_STEPS.CUSTOMER_MANDADO_DETALLES_MANDADO, () => <MandadoDetails />, {
    role: 'customer',
    service: 'mandado',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_MANDADO_PRECIO_PAGO, () => <MandadoPriceAndPayment />, {
    role: 'customer',
    service: 'mandado',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR, () => <MandadoSearching />, {
    role: 'customer',
    service: 'mandado',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION, () => <MandadoCommsAndConfirm />, {
    role: 'customer',
    service: 'mandado',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_MANDADO_FINALIZACION, () => <MandadoFinalize />, {
    role: 'customer',
    service: 'mandado',
  });

  // Envio steps
  stepRegistry.register(FLOW_STEPS.CUSTOMER_ENVIO_DETALLES_ENVIO, () => <EnvioDetails />, {
    role: 'customer',
    service: 'envio',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_ENVIO_CALCULAR_PRECIO, () => <EnvioPricingAndPayment />, {
    role: 'customer',
    service: 'envio',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE, () => <EnvioTracking />, {
    role: 'customer',
    service: 'envio',
  });
  
  stepRegistry.register(FLOW_STEPS.CUSTOMER_ENVIO_CONFIRMACION_ENTREGA, () => <EnvioDeliveryConfirm />, {
    role: 'customer',
    service: 'envio',
  });

  log.registry.info('Customer steps registered successfully');
};
