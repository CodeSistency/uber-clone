import { neon } from "@neondatabase/serverless";

export async function POST(
  request: Request,
  { rideId }: { rideId: string }
) {
  try {
    const body = await request.json();
    const { driverId } = body;

    if (!driverId) {
      return Response.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    console.log("[API] Starting ride:", { rideId, driverId });

    // First, verify that the ride exists and driver is assigned
    const rideCheck = await sql`
      SELECT
        rides.*,
        drivers.first_name,
        drivers.last_name,
        drivers.car_model,
        drivers.license_plate,
        drivers.car_seats
      FROM rides
      LEFT JOIN drivers ON rides.driver_id = drivers.id
      WHERE rides.ride_id = ${rideId}
        AND rides.driver_id = ${driverId}
        AND rides.status = 'accepted'
        AND rides.payment_status = 'paid'
    `;

    if (rideCheck.length === 0) {
      return Response.json(
        { error: "Ride not found, driver not assigned, or invalid status" },
        { status: 404 }
      );
    }

    const ride = rideCheck[0];

    // Update ride status to in_progress and set start time
    const response = await sql`
      UPDATE rides
      SET status = 'in_progress',
          actual_start_time = CURRENT_TIMESTAMP
      WHERE ride_id = ${rideId}
        AND driver_id = ${driverId}
        AND status = 'accepted'
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "Failed to start ride - status transition failed" },
        { status: 500 }
      );
    }

    const updatedRide = response[0];

    console.log("[API] Ride started successfully:", updatedRide);

    // Format response according to documentation
    const result = {
      rideId: updatedRide.ride_id,
      status: updatedRide.status,
      actualStartTime: updatedRide.actual_start_time,
      driver: {
        id: ride.driver_id,
        firstName: ride.first_name,
        lastName: ride.last_name,
        carModel: ride.car_model,
        licensePlate: ride.license_plate,
        carSeats: ride.car_seats
      },
      origin: {
        address: updatedRide.origin_address,
        latitude: parseFloat(updatedRide.origin_latitude),
        longitude: parseFloat(updatedRide.origin_longitude)
      },
      destination: {
        address: updatedRide.destination_address,
        latitude: parseFloat(updatedRide.destination_latitude),
        longitude: parseFloat(updatedRide.destination_longitude)
      }
    };

    return Response.json(result, { status: 200 });

  } catch (error) {
    console.error("Error starting ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
