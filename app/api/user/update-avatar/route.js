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

    const { avatarUrl } = await req.json();

    if (!avatarUrl) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 });
    }

    // Security: Only allow internal avatars from our predefined set
    if (!avatarUrl.startsWith('/avatars/')) {
      return NextResponse.json({ error: "Invalid avatar selection" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { image: avatarUrl } }
    );

    return NextResponse.json({ message: "Avatar updated successfully", image: avatarUrl });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
