import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { promoCode, rideAmount } = await request.json();

    if (!promoCode || !rideAmount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const promotion = await sql`
      SELECT * FROM promotions
      WHERE promo_code = ${promoCode}
      AND is_active = true
      AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE);
    `;

    if (promotion.length === 0) {
      return Response.json(
        { error: "Invalid or expired promo code" },
        { status: 400 },
      );
    }

    const promo = promotion[0];
    let discountAmount = 0;
    let discountPercentage = 0;

    if (promo.discount_amount) {
      discountAmount = parseFloat(promo.discount_amount);
    } else if (promo.discount_percentage) {
      discountPercentage = parseFloat(promo.discount_percentage);
      discountAmount = (parseFloat(rideAmount) * discountPercentage) / 100;
    }

    const finalAmount = Math.max(0, parseFloat(rideAmount) - discountAmount);

    return Response.json({
      data: {
        promoCode: promo.promo_code,
        discountAmount,
        discountPercentage,
        originalAmount: parseFloat(rideAmount),
        finalAmount,
      },
    });
  } catch (error) {
    console.error("Error applying promo code:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
