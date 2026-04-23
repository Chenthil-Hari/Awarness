import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { xpToAdd, badgeAwarded } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Update user's XP and add badge if awarded
    const updateQuery = {
      $inc: { xp: xpToAdd || 0 }
    };

    if (badgeAwarded) {
      updateQuery.$addToSet = { badges: badgeAwarded };
    }

    await usersCollection.updateOne(
      { email: session.user.email },
      updateQuery
    );

    return NextResponse.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
