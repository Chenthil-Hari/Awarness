import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Fetch top 10 users sorted by XP
    // We'll also return their name and username
    const topUsers = await usersCollection
      .find({})
      .sort({ xp: -1 })
      .limit(10)
      .project({ name: 1, username: 1, xp: 1, badges: 1 })
      .toArray();

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
