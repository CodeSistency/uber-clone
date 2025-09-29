import { neon } from "@neondatabase/serverless";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return Response.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return Response.json(
        { error: "Unauthorized - No user ID in token" },
        { status: 401 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Check if user is a driver
    const driverResult = await sql`
      SELECT
        id,
        status,
        is_online as "isOnline",
        is_available as "isAvailable",
        last_online_time as "lastOnlineTime",
        total_online_time as "totalOnlineTime",
        created_at,
        updated_at
      FROM drivers
      WHERE user_id = ${userId}
      LIMIT 1;
    `;

    if (driverResult.length === 0) {
      // User is not a driver, return default status
      return Response.json({
        isDriver: false,
        driverRole: "customer",
        isOnline: false,
        isAvailable: false,
        status: "offline",
        lastOnlineTime: null,
        totalOnlineTime: 0,
        connectionHistory: [],
      });
    }

    const driver = driverResult[0];

    // Get connection history (last 10 entries)
    const connectionHistory = await sql`
      SELECT
        event_type as "eventType",
        timestamp,
        metadata
      FROM driver_connection_events
      WHERE driver_id = ${driver.id}
      ORDER BY timestamp DESC
      LIMIT 10;
    `;

    return Response.json({
      isDriver: true,
      driverRole: "driver",
      id: driver.id,
      isOnline: driver.isOnline || false,
      isAvailable: driver.isAvailable || false,
      status: driver.status || "offline",
      lastOnlineTime: driver.lastOnlineTime,
      totalOnlineTime: driver.totalOnlineTime || 0,
      connectionHistory: connectionHistory.map(event => ({
        eventType: event.eventType,
        timestamp: event.timestamp,
        metadata: event.metadata,
      })),
    });

  } catch (error) {
    console.error("Error fetching driver status:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        isDriver: false,
        driverRole: "customer",
        isOnline: false,
        isAvailable: false,
        status: "offline",
        lastOnlineTime: null,
        totalOnlineTime: 0,
        connectionHistory: [],
      },
      { status: 500 }
    );
  }
}
