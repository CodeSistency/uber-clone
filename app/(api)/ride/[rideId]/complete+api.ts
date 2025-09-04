import { neon } from "@neondatabase/serverless";

export async function POST(
  request: Request,
  { rideId }: { rideId: string }
) {
  try {
    const body = await request.json();
    const { driverId, finalDistance, finalTime } = body;

    if (!driverId) {
      return Response.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    console.log("[API] Completing ride:", { rideId, driverId, finalDistance, finalTime });

    // First, verify that the ride is in progress and driver is assigned
    const rideCheck = await sql`
      SELECT
        rides.*,
        drivers.first_name,
        drivers.last_name,
        ride_tiers.base_fare,
        ride_tiers.per_minute_rate,
        ride_tiers.per_mile_rate
      FROM rides
      LEFT JOIN drivers ON rides.driver_id = drivers.id
      LEFT JOIN ride_tiers ON rides.tier_id = ride_tiers.id
      WHERE rides.ride_id = ${rideId}
        AND rides.driver_id = ${driverId}
        AND rides.status = 'in_progress'
        AND rides.payment_status = 'paid'
    `;

    if (rideCheck.length === 0) {
      return Response.json(
        { error: "Ride not found, not in progress, or driver not assigned" },
        { status: 404 }
      );
    }

    const ride = rideCheck[0];

    // Calculate final fare based on actual distance/time if provided
    let finalFare = parseFloat(ride.fare_price);

    if (finalDistance && finalTime) {
      const baseFare = parseFloat(ride.base_fare || '2.5');
      const perMinuteRate = parseFloat(ride.per_minute_rate || '0.25');
      const perMileRate = parseFloat(ride.per_mile_rate || '1.25');

      const distanceFare = finalDistance * perMileRate;
      const timeFare = finalTime * perMinuteRate;
      finalFare = baseFare + distanceFare + timeFare;

      console.log("[API] Fare recalculation:", {
        originalFare: ride.fare_price,
        baseFare,
        perMinuteRate,
        perMileRate,
        finalDistance,
        finalTime,
        distanceFare,
        timeFare,
        finalFare: Math.round(finalFare * 100) / 100
      });
    }

    // Round final fare to 2 decimal places
    finalFare = Math.round(finalFare * 100) / 100;

    // Update ride status to completed and set end time
    const response = await sql`
      UPDATE rides
      SET status = 'completed',
          actual_end_time = CURRENT_TIMESTAMP,
          fare_price = ${finalFare}
      WHERE ride_id = ${rideId}
        AND driver_id = ${driverId}
        AND status = 'in_progress'
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "Failed to complete ride - status transition failed" },
        { status: 500 }
      );
    }

    const completedRide = response[0];

    // Calculate driver earnings (80% of fare) and platform fee (20%)
    const driverEarnings = Math.round(finalFare * 0.8 * 100) / 100;
    const platformFee = Math.round(finalFare * 0.2 * 100) / 100;

    console.log("[API] Ride completed successfully:", {
      rideId: completedRide.ride_id,
      finalFare,
      driverEarnings,
      platformFee,
      duration: finalTime || 'not provided'
    });

    // Format response according to documentation
    const result = {
      rideId: completedRide.ride_id,
      status: completedRide.status,
      finalFare,
      finalDistance: finalDistance || null,
      finalTime: finalTime || null,
      completedAt: completedRide.actual_end_time,
      driver: {
        id: ride.driver_id,
        firstName: ride.first_name,
        lastName: ride.last_name
      },
      earnings: {
        driverEarnings,
        platformFee
      }
    };

    return Response.json(result, { status: 200 });

  } catch (error) {
    console.error("Error completing ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
