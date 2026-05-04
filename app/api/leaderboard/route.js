import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const LEAGUE_ORDER = ['Bronze', 'Silver', 'Gold', 'Hacker-Tier'];

function getLeagueFromXp(xp = 0) {
  if (xp >= 3000) return 'Hacker-Tier';
  if (xp >= 1500) return 'Gold';
  if (xp >= 500)  return 'Silver';
  return 'Bronze';
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueQuery = searchParams.get('league') || 'Bronze';

    // Determine the requesting user's league from their XP
    const userLeague = getLeagueFromXp(session.user?.xp || 0);
    const userLeagueIndex    = LEAGUE_ORDER.indexOf(userLeague);
    const requestedLeagueIndex = LEAGUE_ORDER.indexOf(leagueQuery);

    // Block access: user can only view their own league or lower
    if (requestedLeagueIndex > userLeagueIndex) {
      return NextResponse.json({ error: "Locked", locked: true }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const query = { role: { $ne: 'admin' } };

    if (leagueQuery === 'Bronze') {
      query.$or = [
        { league: 'Bronze' },
        { league: { $exists: false } },
        { league: null }
      ];
    } else {
      query.league = leagueQuery;
    }

    const topUsers = await usersCollection
      .find(query)
      .sort({ xp: -1 })
      .limit(50)
      .project({ name: 1, username: 1, xp: 1, badges: 1, league: 1 })
      .toArray();

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
