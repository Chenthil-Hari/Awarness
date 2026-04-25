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

    const { xpToAdd, badgeAwarded, scenarioId, activityId } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already completed to prevent XP farming
    const alreadyCompletedMission = scenarioId && user.completedMissions?.includes(scenarioId);
    const alreadyCompletedActivity = activityId && user.completedActivities?.includes(activityId);

    const actualXpToAdd = (alreadyCompletedMission || alreadyCompletedActivity) ? 0 : (xpToAdd || 0);

    // Update user's XP and add badge if awarded
    const updateQuery = {
      $inc: { xp: actualXpToAdd }
    };

    updateQuery.$addToSet = {};
    if (badgeAwarded) updateQuery.$addToSet.badges = badgeAwarded;
    if (scenarioId) updateQuery.$addToSet.completedMissions = scenarioId;
    if (activityId) updateQuery.$addToSet.completedActivities = activityId;

    if (Object.keys(updateQuery.$addToSet).length === 0) {
      delete updateQuery.$addToSet;
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
