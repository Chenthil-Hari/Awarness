import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Fetch top 3 users overall, excluding admins
    const topUsers = await usersCollection
      .find({ role: { $ne: 'admin' } })
      .sort({ xp: -1 })
      .limit(3)
      .project({ name: 1, username: 1, xp: 1, badges: 1, league: 1, avatar: 1 })
      .toArray();

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Hall of Fame error:", error);
    return NextResponse.json({ error: "Failed to fetch Hall of Fame" }, { status: 500 });
  }
}
