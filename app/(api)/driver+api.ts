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

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
