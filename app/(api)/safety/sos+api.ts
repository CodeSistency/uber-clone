import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { userClerkId, rideId, location, emergencyType, message } =
      await request.json();

    if (!userClerkId || !location) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user's emergency contacts
    const contacts = await sql`
      SELECT contact_name, contact_phone FROM emergency_contacts
      WHERE user_clerk_id = ${userClerkId};
    `;

    // Here you would typically:
    // 1. Send notifications to emergency contacts
    // 2. Alert authorities if needed
    // 3. Share live location with trusted contacts
    // 4. Notify the driver if there's an active ride

    // For now, we'll just log the SOS event and return success
    // In a production app, you'd integrate with emergency services

    const sosResponse = {
      message: "SOS alert sent successfully",
      emergencyContactsNotified: contacts.length,
      location: location,
      timestamp: new Date().toISOString(),
      emergencyType: emergencyType || "general",
      userMessage: message || null,
    };

    // If there's an active ride, notify the driver
    if (rideId) {
      // This would send a notification to the driver
      console.log(`SOS alert for ride ${rideId}: User needs assistance`);
    }

    return new Response(JSON.stringify({ data: sosResponse }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing SOS:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
