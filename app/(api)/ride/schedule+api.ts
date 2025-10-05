import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      tier_id,
      scheduled_for,
      user_id,
    } = body;

    if (
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !tier_id ||
      !scheduled_for ||
      !user_id
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get the tier pricing
    const tier = await sql`
      SELECT base_fare, per_minute_rate, per_mile_rate FROM ride_tiers WHERE id = ${tier_id};
    `;

    if (tier.length === 0) {
      return Response.json({ error: "Invalid tier ID" }, { status: 400 });
    }

    // Calculate fare (simplified calculation)
    const baseFare = parseFloat(tier[0].base_fare);
    const perMinuteRate = parseFloat(tier[0].per_minute_rate);
    const perMileRate = parseFloat(tier[0].per_mile_rate);

    // Rough estimation: assume 20 minutes and 5 miles for calculation
    const fare_price = baseFare + perMinuteRate * 20 + perMileRate * 5;

    const response = await sql`
      INSERT INTO rides (
        origin_address,
        destination_address,
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        ride_time,
        fare_price,
        payment_status,
        tier_id,
        scheduled_for,
        user_id
      ) VALUES (
        ${origin_address},
        ${destination_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_latitude},
        ${destination_longitude},
        ${ride_time},
        ${fare_price},
        'pending',
        ${tier_id},
        ${scheduled_for},
        ${user_id}
      )
      RETURNING *;
    `;

    return Response.json({ data: response[0] }, { status: 201 });
  } catch (error) {
    
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
