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

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Double check XP eligibility
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user || (user.xp || 0) < 3000) {
      return NextResponse.json({ error: "Architect privileges required (3,000+ XP)" }, { status: 403 });
    }

    const missionData = await req.json();

    // Basic validation
    if (!missionData.title || !missionData.phases || missionData.phases.length === 0) {
      return NextResponse.json({ error: "Incomplete mission architecture" }, { status: 400 });
    }

    const customScenariosCollection = db.collection("custom_scenarios");

    const newScenario = {
      ...missionData,
      creatorId: user._id,
      creatorName: user.username || user.name,
      createdAt: new Date(),
      status: 'pending', // Requires admin approval
      plays: 0,
      rating: 0
    };

    await customScenariosCollection.insertOne(newScenario);

    return NextResponse.json({ message: "Mission deployed to the network", id: newScenario._id });
  } catch (error) {
    console.error("Architect save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
