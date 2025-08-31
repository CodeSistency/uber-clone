import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      firstName,
      lastName,
      email,
      clerkId,
      carModel,
      licensePlate,
      carSeats,
      profileImageUrl,
      carImageUrl
    } = await request.json();

    if (!firstName || !lastName || !email || !clerkId || !carModel || !licensePlate || !carSeats) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO drivers (
        first_name,
        last_name,
        email,
        clerk_id,
        car_model,
        license_plate,
        car_seats,
        profile_image_url,
        car_image_url
      )
      VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${clerkId},
        ${carModel},
        ${licensePlate},
        ${carSeats},
        ${profileImageUrl || null},
        ${carImageUrl || null}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
