import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    console.log("[API] Fetching rides for user:", id);

    const response = await sql`
        SELECT
            rides.ride_id as ride_id,
            rides.origin_address,
            rides.destination_address,
            rides.origin_latitude,
            rides.origin_longitude,
            rides.destination_latitude,
            rides.destination_longitude,
            rides.ride_time,
            rides.fare_price,
            rides.payment_status,
            rides.created_at,
            CASE
                WHEN drivers.id IS NOT NULL THEN
                    json_build_object(
                        'driver_id', drivers.id,
                        'first_name', drivers.first_name,
                        'last_name', drivers.last_name,
                        'profile_image_url', drivers.profile_image_url,
                        'car_image_url', drivers.car_image_url,
                        'car_seats', drivers.car_seats,
                        'rating', 4.5
                    )
                ELSE NULL
            END AS driver
        FROM
            rides
        LEFT JOIN
            drivers ON rides.driver_id = drivers.id
        WHERE
            rides.user_id = ${id}
        ORDER BY
            rides.created_at DESC
        LIMIT 10;
    `;

    console.log("[API] Rides found:", response?.length || 0);
    if (response && response.length > 0) {
      console.log("[API] First ride sample:", response[0]);
    }

    // For testing: If no rides found, return dummy data
    if (!response || response.length === 0) {
      console.log("[API] No rides found, returning dummy data for testing");
      const dummyRides = [
        {
          ride_id: 1,
          origin_address: "123 Main St, Downtown",
          destination_address: "456 Broadway Ave, Uptown",
          origin_latitude: 40.7128,
          origin_longitude: -74.0060,
          destination_latitude: 40.7589,
          destination_longitude: -73.9851,
          ride_time: 15,
          fare_price: 25.50,
          payment_status: "completed",
          created_at: new Date().toISOString(),
          driver: {
            driver_id: 1,
            first_name: "John",
            last_name: "Doe",
            profile_image_url: null,
            car_image_url: null,
            car_seats: 4,
            rating: 4.5
          }
        },
        {
          ride_id: 2,
          origin_address: "789 Oak St, Midtown",
          destination_address: "321 Pine Ave, Brooklyn",
          origin_latitude: 40.7505,
          origin_longitude: -73.9934,
          destination_latitude: 40.6782,
          destination_longitude: -73.9442,
          ride_time: 20,
          fare_price: 32.75,
          payment_status: "completed",
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          driver: {
            driver_id: 2,
            first_name: "Jane",
            last_name: "Smith",
            profile_image_url: null,
            car_image_url: null,
            car_seats: 4,
            rating: 4.8
          }
        }
      ];
      return Response.json({ data: dummyRides });
    }

    // Always return an array, even if empty
    return Response.json({ data: response || [] });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    console.error("Error details:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}
