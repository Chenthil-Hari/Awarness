import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // 1. Get total user count
    const userCount = await db.collection("users").countDocuments();

    // 2. Get global stats
    const globalStats = await db.collection("stats").findOne({ name: "global" });
    
    // 3. Get poll activity (proxy for engagement)
    const pollStats = await db.collection("polls").findOne({}, { sort: { createdAt: -1 } });
    const totalVotes = pollStats?.options?.reduce((acc, opt) => acc + opt.votes, 0) || 0;

    return NextResponse.json({
      activeUsers: userCount,
      neutralizedThreats: globalStats?.neutralized_threats || 0,
      communityEngagement: totalVotes
    });
  } catch (error) {
    console.error("Global stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
