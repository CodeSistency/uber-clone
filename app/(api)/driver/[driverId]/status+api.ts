import { neon } from "@neondatabase/serverless";

export async function PUT(
  request: Request,
  { driverId }: { driverId: string },
) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { status } = await request.json();

    if (!driverId || !status) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate status values
    const validStatuses = ["offline", "online", "in_ride"];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status value" }, { status: 400 });
    }

    const response = await sql`
      UPDATE drivers
      SET status = ${status}
      WHERE id = ${driverId}
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json({ error: "Driver not found" }, { status: 404 });
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
