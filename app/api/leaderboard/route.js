import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Hacker-Tier'];

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueQuery = searchParams.get('league') || 'Bronze';

    // Removed tier blocking logic. Users can view any tier.

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Build the query
    const query = { role: { $ne: 'admin' } };

    if (leagueQuery === 'Bronze') {
      // Bronze includes users specifically in Bronze or users with no league assigned yet
      query.$or = [
        { league: 'Bronze' },
        { league: { $exists: false } },
        { league: null }
      ];
    } else {
      query.league = leagueQuery;
    }

    // Fetch top users for the requested league, sorted by XP
    const topUsers = await usersCollection
      .find(query)
      .sort({ xp: -1 })
      .limit(50) // Increased limit to show full league
      .project({ name: 1, username: 1, xp: 1, badges: 1, league: 1 })
      .toArray();

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
