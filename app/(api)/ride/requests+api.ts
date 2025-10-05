import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const driverLat = url.searchParams.get("driverLat");
    const driverLng = url.searchParams.get("driverLng");
    const radius = url.searchParams.get("radius") || "5"; // Default 5km

    

    // Validate required parameters
    if (!driverLat || !driverLng) {
      return Response.json(
        { error: "Driver location (driverLat, driverLng) is required" },
        { status: 400 },
      );
    }

    const driverLatNum = parseFloat(driverLat);
    const driverLngNum = parseFloat(driverLng);
    const radiusNum = parseFloat(radius);

    // Calculate bounding box for efficient search
    const earthRadius = 6371; // Earth's radius in kilometers
    const latDelta = (radiusNum / earthRadius) * (180 / Math.PI);
    const lngDelta =
      ((radiusNum / earthRadius) * (180 / Math.PI)) /
      Math.cos((driverLatNum * Math.PI) / 180);

    const minLat = driverLatNum - latDelta;
    const maxLat = driverLatNum + latDelta;
    const minLng = driverLngNum - lngDelta;
    const maxLng = driverLngNum + lngDelta;

    // Query for available rides in the bounding box with user information
    const query = `
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
        ride_tiers.base_fare,
        ride_tiers.image_url as tier_image,
        users.name as user_name,
        users.clerk_id as user_clerk_id
      FROM rides
      LEFT JOIN ride_tiers ON rides.tier_id = ride_tiers.id
      LEFT JOIN users ON rides.user_id = users.clerk_id
      WHERE rides.driver_id IS NULL
        AND rides.scheduled_for IS NULL
        AND rides.payment_status = 'pending'
        AND rides.origin_latitude BETWEEN ${minLat} AND ${maxLat}
        AND rides.origin_longitude BETWEEN ${minLng} AND ${maxLng}
        AND rides.created_at >= NOW() - INTERVAL '30 minutes'
      ORDER BY rides.created_at DESC
      LIMIT 20;
    `;

    

    const availableRides = await sql(query);

    

    // Calculate exact distance and filter by radius
    const filteredRides = availableRides
      .map((ride: any) => {
        const distance = calculateDistance(
          driverLatNum,
          driverLngNum,
          parseFloat(ride.origin_latitude),
          parseFloat(ride.origin_longitude),
        );

        if (distance <= radiusNum) {
          return {
            rideId: ride.ride_id,
            originAddress: ride.origin_address,
            destinationAddress: ride.destination_address,
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            estimatedFare: parseFloat(ride.fare_price),
            rideTime: ride.ride_time,
            createdAt: ride.created_at,
            tier: {
              name: ride.tier_name || "Standard",
              baseFare: parseFloat(ride.base_fare || "2.5"),
            },
            user: {
              name: ride.user_name,
              clerkId: ride.user_clerk_id,
            },
          };
        }
        return null;
      })
      .filter(Boolean);

    

    return Response.json({ data: filteredRides }, { status: 200 });
  } catch (error) {
    
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
