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

    // Get or create wallet for user
    let wallet = await sql`
      SELECT * FROM wallets WHERE user_clerk_id = ${userClerkId};
    `;

    if (wallet.length === 0) {
      // Create wallet if it doesn't exist
      wallet = await sql`
        INSERT INTO wallets (user_clerk_id, balance)
        VALUES (${userClerkId}, 0.00)
        RETURNING *;
      `;
    }

    // Get recent transactions
    const transactions = await sql`
      SELECT
        amount,
        transaction_type,
        description,
        created_at
      FROM wallet_transactions
      WHERE wallet_id = ${wallet[0].id}
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    return Response.json({
      data: {
        wallet: wallet[0],
        recentTransactions: transactions
      }
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { userClerkId, amount, description } = await request.json();

    if (!userClerkId || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get or create wallet for user
    let wallet = await sql`
      SELECT * FROM wallets WHERE user_clerk_id = ${userClerkId};
    `;

    if (wallet.length === 0) {
      wallet = await sql`
        INSERT INTO wallets (user_clerk_id, balance)
        VALUES (${userClerkId}, 0.00)
        RETURNING *;
      `;
    }

    const walletId = wallet[0].id;
    const creditAmount = parseFloat(amount);

    // Update wallet balance
    await sql`
      UPDATE wallets
      SET balance = balance + ${creditAmount}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${walletId};
    `;

    // Record transaction
    await sql`
      INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description)
      VALUES (${walletId}, ${creditAmount}, 'credit', ${description || 'Wallet top-up'});
    `;

    // Get updated wallet
    const updatedWallet = await sql`
      SELECT * FROM wallets WHERE id = ${walletId};
    `;

    return new Response(JSON.stringify({ data: updatedWallet[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
