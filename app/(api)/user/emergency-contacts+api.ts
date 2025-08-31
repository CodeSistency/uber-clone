import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userClerkId = searchParams.get('userId');

    if (!userClerkId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const contacts = await sql`
      SELECT id, contact_name, contact_phone FROM emergency_contacts
      WHERE user_clerk_id = ${userClerkId}
      ORDER BY contact_name;
    `;

    return Response.json({ data: contacts });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { userClerkId, contactName, contactPhone } = await request.json();

    if (!userClerkId || !contactName || !contactPhone) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO emergency_contacts (
        user_clerk_id,
        contact_name,
        contact_phone
      )
      VALUES (
        ${userClerkId},
        ${contactName},
        ${contactPhone}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
