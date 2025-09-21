import { registerMocks } from '@/lib/dev';

const ok = (data: any) => ({ data });

registerMocks({
  'POST rides/flow/client/transport/define-ride': ok({ rideId: 101, paymentStatus: 'pending' }),
  'POST rides/flow/client/transport/101/select-vehicle': ok({ rideId: 101, tierId: 2 }),
  'POST rides/flow/client/transport/101/request-driver': { ok: true },
  'POST rides/flow/client/transport/101/confirm-payment': ok({ rideId: 101, paymentStatus: 'pending' }),
  'POST rides/flow/client/transport/101/join': { ok: true, room: 'ride-101' },
  'GET rides/flow/client/transport/101/status': ok({ rideId: 101, status: 'requested' }),
  'POST rides/flow/client/transport/101/cancel': { ok: true },
  'POST rides/flow/client/transport/101/rate': ok({ ratingId: 555 }),

  'POST rides/flow/client/delivery/create-order': ok({ orderId: 201, status: 'pending' }),
  'POST rides/flow/client/delivery/201/confirm-payment': ok({ orderId: 201, paymentStatus: 'pending' }),
  'POST rides/flow/client/delivery/201/join': { ok: true, room: 'order-201' },
  'GET rides/flow/client/delivery/201/status': ok({ orderId: 201, status: 'created' }),
  'POST rides/flow/client/delivery/201/cancel': { ok: true },

  'POST rides/flow/client/errand/create': ok({ id: 301, status: 'requested' }),
  'POST rides/flow/client/errand/301/join': { ok: true, room: 'errand-301' },
  'GET rides/flow/client/errand/301/status': ok({ id: 301, status: 'requested' }),
  'POST rides/flow/client/errand/301/cancel': { ok: true },

  'POST rides/flow/client/parcel/create': ok({ id: 401, status: 'requested' }),
  'POST rides/flow/client/parcel/401/join': { ok: true, room: 'parcel-401' },
  'GET rides/flow/client/parcel/401/status': ok({ id: 401, status: 'requested' }),
  'POST rides/flow/client/parcel/401/cancel': { ok: true },
});



