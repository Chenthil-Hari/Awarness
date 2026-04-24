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

    const { newUsername } = await req.json();

    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json({ error: "Username too short" }, { status: 400 });
    }

    // Sanitize username (lowercase, no spaces, only alphanumeric and underscores)
    const sanitizedUsername = newUsername.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check if the username is already taken by someone else
    const existingUser = await usersCollection.findOne({ username: sanitizedUsername });
    
    if (existingUser && existingUser.email !== session.user.email) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Update the user
    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { username: sanitizedUsername } }
    );

    return NextResponse.json({ message: "Username updated", username: sanitizedUsername });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
