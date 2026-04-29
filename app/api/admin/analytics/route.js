import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. User Growth (Daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await db.collection('users').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // 2. Guide Distribution by Category
    const guideStats = await db.collection('guides').aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // 3. Top XP Earners
    const topEarners = await db.collection('users')
      .find({})
      .sort({ xp: -1 })
      .limit(5)
      .project({ name: 1, xp: 1, username: 1 })
      .toArray();

    // 4. Mission Completion Stats (if missions exist)
    // For now, returning dummy or simplified data if collection doesn't exist
    let missionStats = [];
    try {
        missionStats = await db.collection('completed_missions').aggregate([
            { $group: { _id: "$missionId", completions: { $sum: 1 } } },
            { $limit: 10 }
        ]).toArray();
    } catch (e) {}

    return NextResponse.json({
      userGrowth,
      guideStats,
      topEarners,
      missionStats
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
