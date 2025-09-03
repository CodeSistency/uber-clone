import { neon } from "@neondatabase/serverless";

export async function POST(request: Request, { rideId }: { rideId: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { ratedByClerkId, ratedClerkId, ratingValue, comment } =
      await request.json();

    if (!rideId || !ratedByClerkId || !ratedClerkId || !ratingValue) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate rating value
    const rating = parseInt(ratingValue);
    if (rating < 1 || rating > 5) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if ride exists and is completed
    const ride = await sql`
      SELECT * FROM rides WHERE ride_id = ${rideId};
    `;

    if (ride.length === 0) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    // Insert rating
    const response = await sql`
      INSERT INTO ratings (
        ride_id,
        rated_by_clerk_id,
        rated_clerk_id,
        rating_value,
        comment
      )
      VALUES (
        ${rideId},
        ${ratedByClerkId},
        ${ratedClerkId},
        ${rating},
        ${comment || null}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
