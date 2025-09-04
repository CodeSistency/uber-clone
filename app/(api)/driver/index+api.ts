import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'online';
    const verified = url.searchParams.get('verified');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const radius = url.searchParams.get('radius') || '10'; // Default 10km

    console.log("[API] Fetching drivers with params:", {
      status,
      verified,
      lat,
      lng,
      radius
    });

    // Build dynamic WHERE clause
    let whereClause = `WHERE verification_status = 'approved'`;
    const queryParams: any[] = [];

    // Add status filter
    if (status) {
      whereClause += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    // Add verification filter
    if (verified) {
      const verifiedBool = verified === 'true';
      whereClause += ` AND verification_status = $${queryParams.length + 1}`;
      queryParams.push(verifiedBool ? 'approved' : 'pending');
    }

    // Add location filtering if coordinates provided
    if (lat && lng) {
      const radiusKm = parseFloat(radius);
      whereClause += `
        AND current_latitude IS NOT NULL
        AND current_longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians($${queryParams.length + 1})) *
            cos(radians(current_latitude)) *
            cos(radians(current_longitude) - radians($${queryParams.length + 2})) +
            sin(radians($${queryParams.length + 1})) *
            sin(radians(current_latitude))
          )
        ) <= $${queryParams.length + 3}
      `;
      queryParams.push(lat, lng, radiusKm);
    }

    // Base query to get drivers with advanced filtering
    const query = `
      SELECT
        id,
        first_name,
        last_name,
        profile_image_url,
        car_image_url,
        car_model,
        license_plate,
        car_seats,
        rating,
        status,
        verification_status,
        current_latitude,
        current_longitude,
        last_location_update
      FROM drivers
      ${whereClause}
      ORDER BY
        CASE WHEN current_latitude IS NOT NULL THEN 0 ELSE 1 END,
        RANDOM()
      LIMIT 50;
    `;

    console.log("[API] Executing driver query:", { query, params: queryParams });

    const response = await sql(query, queryParams);

    console.log(`[API] Found ${response.length} drivers`);

    // Transform to match API response format
    const transformedDrivers = response.map((driver: any) => ({
      id: driver.id,
      firstName: driver.first_name,
      lastName: driver.last_name,
      status: driver.status,
      verificationStatus: driver.verification_status,
      carModel: driver.car_model,
      licensePlate: driver.license_plate,
      carSeats: driver.car_seats,
      currentLat: driver.current_latitude ? parseFloat(driver.current_latitude) : null,
      currentLng: driver.current_longitude ? parseFloat(driver.current_longitude) : null,
      lastLocationUpdate: driver.last_location_update
    }));

    const result = {
      data: transformedDrivers,
      total: transformedDrivers.length,
      filters: {
        status,
        verified: verified ? verified === 'true' : undefined,
        location: lat && lng ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: parseFloat(radius)
        } : undefined
      }
    };

    return Response.json(result, { status: 200 });

  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
