import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get available ride requests (rides that don't have a driver assigned yet)
    const response = await sql`
      SELECT
        rides.ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.origin_latitude,
        rides.origin_longitude,
        rides.destination_latitude,
        rides.destination_longitude,
        rides.ride_time,
        rides.fare_price,
        rides.created_at,
        ride_tiers.name as tier_name,
        ride_tiers.image_url as tier_image
      FROM
        rides
      LEFT JOIN
        ride_tiers ON rides.tier_id = ride_tiers.id
      WHERE
        rides.driver_id IS NULL
        AND rides.scheduled_for IS NULL  -- Only immediate rides for now
      ORDER BY
        rides.created_at DESC;
    `;

    return Response.json({ data: response });
  } catch (error) {
    
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
