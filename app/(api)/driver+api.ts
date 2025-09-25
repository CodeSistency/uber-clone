import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`SELECT * FROM drivers`;

    console.log("[API] Fetching drivers. Found:", response.length);
    console.log("[API] First driver sample:", {
      id: response[0]?.id,
      first_name: response[0]?.first_name,
      last_name: response[0]?.last_name,
    });

    // If no drivers in database, return dummy data for development
    if (!response || response.length === 0) {
      console.log("[API] No drivers found in database, returning dummy data");
      const dummyDrivers = [
        {
          id: 1,
          first_name: "Carlos",
          last_name: "Rodríguez",
          profile_image_url: "https://randomuser.me/api/portraits/men/1.jpg",
          rating: 4.8,
          car_model: "Toyota Corolla",
          car_color: "Blanco",
          license_plate: "ABC-123",
          current_location: { latitude: 4.6097, longitude: -74.0817 },
        },
        {
          id: 2,
          first_name: "María",
          last_name: "González",
          profile_image_url: "https://randomuser.me/api/portraits/women/2.jpg",
          rating: 4.9,
          car_model: "Honda Civic",
          car_color: "Negro",
          license_plate: "XYZ-789",
          current_location: { latitude: 4.61, longitude: -74.082 },
        },
        {
          id: 3,
          first_name: "José",
          last_name: "Martínez",
          profile_image_url: "https://randomuser.me/api/portraits/men/3.jpg",
          rating: 4.7,
          car_model: "Nissan Versa",
          car_color: "Gris",
          license_plate: "DEF-456",
          current_location: { latitude: 4.611, longitude: -74.083 },
        },
      ];
      return Response.json({ data: dummyDrivers });
    }

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);

    // Fallback to dummy data even on error for development
    console.log("[API] Database error, returning dummy data as fallback");
    const dummyDrivers = [
      {
        id: 1,
        first_name: "Carlos",
        last_name: "Rodríguez",
        profile_image_url: "https://randomuser.me/api/portraits/men/1.jpg",
        rating: 4.8,
        car_model: "Toyota Corolla",
        car_color: "Blanco",
        license_plate: "ABC-123",
        current_location: { latitude: 4.6097, longitude: -74.0817 },
      },
    ];
    return Response.json({ data: dummyDrivers });
  }
}
