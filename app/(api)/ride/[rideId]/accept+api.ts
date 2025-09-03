import { neon } from "@neondatabase/serverless";

export async function POST(request: Request, { rideId }: { rideId: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { driverId } = await request.json();

    if (!rideId || !driverId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if ride exists and is available
    const rideCheck = await sql`
      SELECT * FROM rides WHERE ride_id = ${rideId} AND driver_id IS NULL;
    `;

    if (rideCheck.length === 0) {
      return Response.json(
        { error: "Ride not found or already accepted" },
        { status: 404 },
      );
    }

    // Update the ride with the driver
    const response = await sql`
      UPDATE rides
      SET driver_id = ${driverId}
      WHERE ride_id = ${rideId} AND driver_id IS NULL
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "Ride was already accepted by another driver" },
        { status: 409 },
      );
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error accepting ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
