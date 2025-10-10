/**
 * Registro centralizado de componentes para pasos de Driver
 * Se ejecuta una sola vez al inicio de la aplicación
 */

import { stepRegistry } from './index';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';
import { log } from '@/lib/logger';

// Componentes de Driver - Availability
import DriverAvailability from '@/components/unified-flow/steps/Client/Delivery/DriverAvailability';

// Componentes de Driver - General
import DriverIncomingRequest from '@/components/unified-flow/steps/Driver/DriverIncomingRequest';
import DriverFinalizationRating from '@/components/unified-flow/steps/Driver/DriverFinalizationRating';
import DriverTransportRating from '@/components/unified-flow/steps/Driver/DriverTransportRating';

// Componentes de Driver - Transport (Viaje)
import DriverTransportAcceptReject from '@/components/unified-flow/steps/Driver/Viaje/DriverTransportAcceptReject';
import DriverTransportNavigateToOrigin from '@/components/unified-flow/steps/Driver/Viaje/DriverTransportNavigateToOrigin';
import DriverTransportArrivedAtOrigin from '@/components/unified-flow/steps/Driver/Viaje/DriverTransportArrivedAtOrigin';
import DriverTransportInProgress from '@/components/unified-flow/steps/Driver/Viaje/DriverTransportInProgress';
import DriverTransportEndPayment from '@/components/unified-flow/steps/Driver/Viaje/DriverTransportEndPayment';

// Componentes de Driver - Delivery
import DriverDeliveryNavigateToBusiness from '@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryNavigateToBusiness';
import DriverDeliveryPickupOrder from '@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryPickupOrder';
import DriverDeliveryToCustomer from '@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryToCustomer';
import DriverDeliveryConfirmFinish from '@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryConfirmFinish';

// Componentes de Driver - Mandado
import DriverMandadoNavigateToOriginChat from '@/components/unified-flow/steps/Driver/Mandado/DriverMandadoNavigateToOriginChat';
import DriverMandadoManage from '@/components/unified-flow/steps/Driver/Mandado/DriverMandadoManage';
import DriverMandadoNavigateToDestination from '@/components/unified-flow/steps/Driver/Mandado/DriverMandadoNavigateToDestination';
import DriverMandadoFinish from '@/components/unified-flow/steps/Driver/Mandado/DriverMandadoFinish';

// Componentes de Driver - Envío
import DriverEnvioNavigateToOrigin from '@/components/unified-flow/steps/Driver/Envio/DriverEnvioNavigateToOrigin';
import DriverEnvioPickupPackage from '@/components/unified-flow/steps/Driver/Envio/DriverEnvioPickupPackage';
import DriverEnvioNavigateToDestination from '@/components/unified-flow/steps/Driver/Envio/DriverEnvioNavigateToDestination';
import DriverEnvioDeliveryConfirm from '@/components/unified-flow/steps/Driver/Envio/DriverEnvioDeliveryConfirm';

/**
 * Registra todos los componentes de pasos para Driver
 */
export const registerDriverSteps = () => {
  log.registry.info('Registering driver steps...');

  // Driver Transport steps
  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD, () => <DriverIncomingRequest />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_ACEPTAR_RECHAZAR, () => <DriverTransportAcceptReject />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_EN_CAMINO_ORIGEN, () => <DriverTransportNavigateToOrigin />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_EN_ORIGEN, () => <DriverTransportArrivedAtOrigin />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_INICIAR_VIAJE, () => <DriverTransportInProgress />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_EN_VIAJE, () => <DriverTransportInProgress />, {
    role: 'driver',
    service: 'transport',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE, () => <DriverTransportEndPayment />, {
    role: 'driver',
    service: 'transport',
  });

  // Driver Delivery steps
  stepRegistry.register(FLOW_STEPS.DRIVER_DELIVERY_RECIBIR_SOLICITUD, () => <DriverIncomingRequest />, {
    role: 'driver',
    service: 'delivery',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_DELIVERY_PREPARAR_PEDIDO, () => <DriverDeliveryNavigateToBusiness />, {
    role: 'driver',
    service: 'delivery',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_DELIVERY_RECOGER_PEDIDO, () => <DriverDeliveryPickupOrder />, {
    role: 'driver',
    service: 'delivery',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_DELIVERY_EN_CAMINO_ENTREGA, () => <DriverDeliveryToCustomer />, {
    role: 'driver',
    service: 'delivery',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_DELIVERY_ENTREGAR_PEDIDO, () => <DriverDeliveryConfirmFinish />, {
    role: 'driver',
    service: 'delivery',
  });

  // Driver Mandado steps
  stepRegistry.register(FLOW_STEPS.DRIVER_MANDADO_RECIBIR_SOLICITUD, () => <DriverIncomingRequest />, {
    role: 'driver',
    service: 'mandado',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_MANDADO_EN_CAMINO_ORIGEN, () => <DriverMandadoNavigateToOriginChat />, {
    role: 'driver',
    service: 'mandado',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_MANDADO_RECOGER_PRODUCTOS, () => <DriverMandadoManage />, {
    role: 'driver',
    service: 'mandado',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_MANDADO_EN_CAMINO_DESTINO, () => <DriverMandadoNavigateToDestination />, {
    role: 'driver',
    service: 'mandado',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_MANDADO_ENTREGAR_MANDADO, () => <DriverMandadoFinish />, {
    role: 'driver',
    service: 'mandado',
  });

  // Driver Envio steps
  stepRegistry.register(FLOW_STEPS.DRIVER_ENVIO_RECIBIR_SOLICITUD, () => <DriverIncomingRequest />, {
    role: 'driver',
    service: 'envio',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_ENVIO_EN_CAMINO_ORIGEN, () => <DriverEnvioNavigateToOrigin />, {
    role: 'driver',
    service: 'envio',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_ENVIO_RECOGER_PAQUETE, () => <DriverEnvioPickupPackage />, {
    role: 'driver',
    service: 'envio',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_ENVIO_EN_CAMINO_DESTINO, () => <DriverEnvioNavigateToDestination />, {
    role: 'driver',
    service: 'envio',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_ENVIO_ENTREGAR_PAQUETE, () => <DriverEnvioDeliveryConfirm />, {
    role: 'driver',
    service: 'envio',
  });

  // Rating and finalization steps
  stepRegistry.register(FLOW_STEPS.DRIVER_FINALIZACION_RATING, () => <DriverTransportRating />, {
    role: 'driver',
  });

  stepRegistry.register(FLOW_STEPS.DRIVER_DISPONIBILIDAD, () => <DriverAvailability />, {
    role: 'driver',
  });

  log.registry.info('Driver steps registered successfully');
};
