import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { rideId }: { rideId: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    if (!rideId) {
      return Response.json({ error: "Ride ID is required" }, { status: 400 });
    }

    const messages = await sql`
      SELECT
        id,
        ride_id,
        sender_clerk_id,
        message_text,
        created_at
      FROM
        chat_messages
      WHERE
        ride_id = ${rideId}
      ORDER BY
        created_at ASC;
    `;

    return Response.json({ data: messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { rideId }: { rideId: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { senderClerkId, messageText } = await request.json();

    if (!rideId || !senderClerkId || !messageText) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO chat_messages (
        ride_id,
        sender_clerk_id,
        message_text
      )
      VALUES (
        ${rideId},
        ${senderClerkId},
        ${messageText}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
