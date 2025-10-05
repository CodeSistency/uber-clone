import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get("tierId");
    const estimatedMinutes = searchParams.get("minutes");
    const estimatedMiles = searchParams.get("miles");

    if (!tierId || !estimatedMinutes || !estimatedMiles) {
      return Response.json(
        { error: "Missing required parameters: tierId, minutes, miles" },
        { status: 400 },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const tier = await sql`
      SELECT name, base_fare, per_minute_rate, per_mile_rate FROM ride_tiers WHERE id = ${tierId};
    `;

    if (tier.length === 0) {
      return Response.json({ error: "Invalid tier ID" }, { status: 400 });
    }

    const baseFare = parseFloat(tier[0].base_fare);
    const perMinuteRate = parseFloat(tier[0].per_minute_rate);
    const perMileRate = parseFloat(tier[0].per_mile_rate);
    const minutes = parseFloat(estimatedMinutes);
    const miles = parseFloat(estimatedMiles);

    const estimatedFare =
      baseFare + perMinuteRate * minutes + perMileRate * miles;

    return Response.json({
      data: {
        tier: tier[0].name,
        baseFare,
        perMinuteRate,
        perMileRate,
        estimatedMinutes: minutes,
        estimatedMiles: miles,
        totalFare: estimatedFare,
      },
    });
  } catch (error) {
    
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
