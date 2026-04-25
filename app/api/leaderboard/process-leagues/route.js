import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// This endpoint would typically be hit by a cron job (e.g., Vercel Cron, GitHub Actions)
// every week to process league promotions and demotions.
export async function POST(request) {
  try {
    // In a real production app, you would verify an authorization header
    // to ensure only your cron job can hit this endpoint.
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // The logic:
    // 1. Get all users per league (excluding admins)
    // 2. Sort by XP descending
    // 3. Top 10 go up a league
    // 4. Bottom 10 go down a league
    // 5. Update their DB records

    const leagues = ['Bronze', 'Silver', 'Gold', 'Hacker-Tier'];
    let processedCount = 0;

    for (let i = 0; i < leagues.length; i++) {
      const currentLeague = leagues[i];
      
      // Bronze query includes users with no league
      const query = { role: { $ne: 'admin' } };
      if (currentLeague === 'Bronze') {
        query.$or = [
          { league: 'Bronze' },
          { league: { $exists: false } },
          { league: null }
        ];
      } else {
        query.league = currentLeague;
      }

      const usersInLeague = await usersCollection
        .find(query)
        .sort({ xp: -1 })
        .project({ _id: 1 })
        .toArray();

      // Only process if there are enough users, or just process whoever is there
      // Top 10 (Promotions)
      if (i < leagues.length - 1) { // Can't promote from Hacker-Tier
        const nextLeague = leagues[i + 1];
        const toPromote = usersInLeague.slice(0, 10).map(u => u._id);
        
        if (toPromote.length > 0) {
          await usersCollection.updateMany(
            { _id: { $in: toPromote } },
            { $set: { league: nextLeague } }
          );
          processedCount += toPromote.length;
        }
      }

      // Bottom 10 (Demotions)
      if (i > 0) { // Can't demote from Bronze
        const prevLeague = leagues[i - 1];
        // Only demote if there are more than 10 users, otherwise we might demote everyone
        // For a league of 50, bottom 10 is index length-10 to length
        const toDemote = usersInLeague.length > 10 
          ? usersInLeague.slice(-10).map(u => u._id)
          : []; // If 10 or fewer, no demotions, or you could change logic

        if (toDemote.length > 0) {
          await usersCollection.updateMany(
            { _id: { $in: toDemote } },
            { $set: { league: prevLeague } }
          );
          processedCount += toDemote.length;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed leagues. Updated ${processedCount} users.` 
    });

  } catch (error) {
    console.error("League processing error:", error);
    return NextResponse.json({ error: "Failed to process leagues" }, { status: 500 });
  }
}
