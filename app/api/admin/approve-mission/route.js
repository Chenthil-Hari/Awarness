import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const { missionId, action } = await req.json(); // action: 'approve' or 'reject'

    if (!missionId || !action) {
      return NextResponse.json({ error: "Mission ID and action are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const customScenariosCollection = db.collection("custom_scenarios");

    const status = action === 'approve' ? 'public' : 'rejected';

    const result = await customScenariosCollection.updateOne(
      { _id: new ObjectId(missionId) },
      { $set: { status: status, reviewedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `Mission ${action}d successfully` });
  } catch (error) {
    console.error("Admin approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
