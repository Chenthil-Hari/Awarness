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

    const { badgeId, xp } = await req.json();

    if (!badgeId) {
      return NextResponse.json({ error: "Badge ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if badge already exists to avoid duplicate XP
    const hasBadge = user.badges?.includes(badgeId);
    const actualXpToAdd = hasBadge ? 0 : (xp || 0);

    const updateQuery = {
      $inc: { xp: actualXpToAdd },
      $addToSet: { badges: badgeId },
      $push: {
        history: {
          $each: [{
            id: `badge-${badgeId}`,
            type: 'Achievement',
            xp: actualXpToAdd,
            timestamp: new Date(),
            success: true
          }],
          $slice: -20
        }
      }
    };

    await usersCollection.updateOne(
      { email: session.user.email },
      updateQuery
    );

    return NextResponse.json({ 
      message: "Badge awarded successfully", 
      xpAdded: actualXpToAdd,
      alreadyHad: hasBadge 
    });
  } catch (error) {
    console.error("Badge award error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
