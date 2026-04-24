import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { xpToAdd, badgeAwarded, scenarioId } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Update user's XP and add badge if awarded
    const updateQuery = {
      $inc: { xp: xpToAdd || 0 }
    };

    if (badgeAwarded || scenarioId) {
      updateQuery.$addToSet = {};
      if (badgeAwarded) updateQuery.$addToSet.badges = badgeAwarded;
      if (scenarioId) updateQuery.$addToSet.completedMissions = scenarioId;
    }

    await usersCollection.updateOne(
      { email: session.user.email },
      updateQuery
    );

    // Update global stats
    const statsCollection = db.collection("stats");
    await statsCollection.updateOne(
      { name: "global" },
      { $inc: { neutralized_threats: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
