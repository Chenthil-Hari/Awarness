import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const customScenariosCollection = db.collection("custom_scenarios");

    const pendingMissions = await customScenariosCollection
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ missions: pendingMissions });
  } catch (error) {
    console.error("Admin fetch pending error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
