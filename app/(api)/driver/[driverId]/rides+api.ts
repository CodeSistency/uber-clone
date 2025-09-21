import { neon } from "@neondatabase/serverless";

export async function GET(
  request: Request,
  { driverId }: { driverId: string },
) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    console.log("[API] Fetching driver rides:", {
      driverId,
      status,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    // Validate driver ID
    if (!driverId || isNaN(parseInt(driverId))) {
      return Response.json(
        { error: "Valid driver ID is required" },
        { status: 400 },
      );
    }

    const driverIdNum = parseInt(driverId);

    // Build dynamic WHERE clause for rides filtering
    let whereClause = `WHERE rides.driver_id = $${1}`;
    const queryParams: any[] = [driverIdNum];
    let paramIndex = 2;

    // Add status filter
    if (status) {
      whereClause += ` AND rides.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Add date range filters
    if (dateFrom) {
      whereClause += ` AND rides.created_at >= $${paramIndex}`;
      queryParams.push(new Date(dateFrom));
      paramIndex++;
    }

    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      whereClause += ` AND rides.created_at < $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM rides
      ${whereClause.replace("rides.", "")}
    `;

    const countResult = await sql(countQuery, queryParams);
    const totalCount = parseInt(countResult[0].total);

    // Main query to get rides with full details
    const ridesQuery = `
      SELECT
        rides.ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.fare_price,
        rides.status,
        rides.created_at,
        rides.actual_start_time,
        rides.actual_end_time,
        rides.distance,
        rides.duration,
        users.name as passenger_name,
        users.clerk_id as passenger_clerk_id,
        ride_tiers.name as tier_name,
        AVG(ratings.rating_value) as avg_rating,
        COUNT(ratings.id) as rating_count
      FROM rides
      LEFT JOIN users ON rides.user_id = users.clerk_id
      LEFT JOIN ride_tiers ON rides.tier_id = ride_tiers.id
      LEFT JOIN ratings ON ratings.ride_id = rides.ride_id
        AND ratings.rated_by_clerk_id = users.clerk_id
      ${whereClause}
      GROUP BY
        rides.ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.fare_price,
        rides.status,
        rides.created_at,
        rides.actual_start_time,
        rides.actual_end_time,
        rides.distance,
        rides.duration,
        users.name,
        users.clerk_id,
        ride_tiers.name
      ORDER BY rides.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    console.log("[API] Executing rides query:", {
      query: ridesQuery,
      params: queryParams,
    });

    const rides = await sql(ridesQuery, queryParams);

    console.log(`[API] Found ${rides.length} rides for driver ${driverId}`);

    // Format rides data
    const formattedRides = rides.map((ride: any) => ({
      rideId: ride.ride_id,
      originAddress: ride.origin_address,
      destinationAddress: ride.destination_address,
      farePrice: parseFloat(ride.fare_price),
      status: ride.status,
      createdAt: ride.created_at,
      completedAt: ride.actual_end_time,
      distance: ride.distance ? parseFloat(ride.distance) : null,
      duration: ride.duration ? parseInt(ride.duration) : null,
      passenger: {
        name: ride.passenger_name,
        clerkId: ride.passenger_clerk_id,
      },
      tier: {
        name: ride.tier_name || "Standard",
      },
      ratings: ride.avg_rating
        ? [
            {
              ratingValue: Math.round(parseFloat(ride.avg_rating) * 10) / 10,
              comment: null, // Could be expanded to include actual comments
              createdAt: ride.actual_end_time,
            },
          ]
        : [],
    }));

    // Calculate summary statistics
    const completedRides = formattedRides.filter(
      (ride) => ride.status === "completed",
    );
    const cancelledRides = formattedRides.filter(
      (ride) => ride.status === "cancelled",
    );
    const totalEarnings = completedRides.reduce(
      (sum, ride) => sum + ride.farePrice,
      0,
    );

    // Calculate average rating from all ratings
    const allRatings = formattedRides.flatMap((ride) => ride.ratings || []);
    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, rating) => sum + rating.ratingValue, 0) /
          allRatings.length
        : 0;

    const summary = {
      totalRides: formattedRides.length,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      completedRides: completedRides.length,
      cancelledRides: cancelledRides.length,
    };

    const result = {
      data: formattedRides,
      summary,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    };

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
