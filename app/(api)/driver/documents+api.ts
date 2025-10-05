import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { driverId, documentType, documentUrl } = await request.json();

    if (!driverId || !documentType || !documentUrl) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO driver_documents (
        driver_id,
        document_type,
        document_url
      )
      VALUES (
        ${driverId},
        ${documentType},
        ${documentUrl}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 201,
    });
  } catch (error) {
    
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
