import { neon } from "@neondatabase/serverless";

export async function POST(
  request: Request,
  { rideId }: { rideId: string }
) {
  try {
    const body = await request.json();
    const { cancelledBy, reason } = body;

    if (!cancelledBy) {
      return Response.json(
        { error: "Cancelled by field is required" },
        { status: 400 }
      );
    }

    if (!['passenger', 'driver'].includes(cancelledBy)) {
      return Response.json(
        { error: "Cancelled by must be 'passenger' or 'driver'" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    console.log("[API] Cancelling ride:", { rideId, cancelledBy, reason });

    // First, verify that the ride exists and can be cancelled
    const rideCheck = await sql`
      SELECT
        rides.*,
        drivers.first_name as driver_first_name,
        drivers.last_name as driver_last_name,
        users.name as passenger_name,
        users.clerk_id as passenger_clerk_id
      FROM rides
      LEFT JOIN drivers ON rides.driver_id = drivers.id
      LEFT JOIN users ON rides.user_id = users.clerk_id
      WHERE rides.ride_id = ${rideId}
        AND rides.status IN ('requested', 'accepted', 'in_progress')
    `;

    if (rideCheck.length === 0) {
      return Response.json(
        { error: "Ride not found or cannot be cancelled" },
        { status: 404 }
      );
    }

    const ride = rideCheck[0];

    // If cancelled by passenger, verify the passenger is the one who requested the ride
    if (cancelledBy === 'passenger') {
      // This would need authentication to verify the user
      // For now, we'll assume the cancellation is valid
      console.log("[API] Ride cancelled by passenger");
    }

    // If cancelled by driver, verify the driver is assigned to the ride
    if (cancelledBy === 'driver' && !ride.driver_id) {
      return Response.json(
        { error: "Driver not assigned to this ride" },
        { status: 403 }
      );
    }

    // Update ride status to cancelled
    const response = await sql`
      UPDATE rides
      SET status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          cancelled_by = ${cancelledBy},
          cancel_reason = ${reason || null}
      WHERE ride_id = ${rideId}
        AND status IN ('requested', 'accepted', 'in_progress')
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "Failed to cancel ride - status transition failed" },
        { status: 500 }
      );
    }

    const cancelledRide = response[0];

    console.log("[API] Ride cancelled successfully:", {
      rideId: cancelledRide.ride_id,
      cancelledBy,
      reason: reason || 'No reason provided'
    });

    // Format response according to documentation
    const result = {
      rideId: cancelledRide.ride_id,
      status: cancelledRide.status,
      cancelledAt: cancelledRide.cancelled_at,
      cancelledBy,
      reason: reason || 'No reason provided',
      passenger: cancelledBy === 'passenger' ? {
        name: ride.passenger_name,
        clerkId: ride.passenger_clerk_id
      } : undefined,
      driver: cancelledBy === 'driver' ? {
        id: ride.driver_id,
        firstName: ride.driver_first_name,
        lastName: ride.driver_last_name
      } : undefined
    };

    return Response.json(result, { status: 200 });

  } catch (error) {
    console.error("Error cancelling ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
