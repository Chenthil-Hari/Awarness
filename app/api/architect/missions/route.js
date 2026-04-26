import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const customScenariosCollection = db.collection("custom_scenarios");

    // Fetch all public custom missions
    const missions = await customScenariosCollection.find({ status: 'public' }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ missions });
  } catch (error) {
    console.error("Architect fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
