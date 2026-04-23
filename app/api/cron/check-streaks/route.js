import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendStreakLostEmail } from '@/lib/mail';

export async function GET(req) {
  // Simple security check (you can add a CRON_SECRET to your .env for better security)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find users who logged in between 2 and 3 days ago 
    // AND haven't been sent a reminder for this streak yet
    const usersToNudge = await usersCollection.find({
      lastLoginDate: {
        $lte: twoDaysAgo.toISOString(),
        $gt: threeDaysAgo.toISOString()
      },
      streakNudgeSent: { $ne: true },
      streak: { $gt: 0 }
    }).toArray();

    const results = {
      sent: 0,
      errors: 0
    };

    for (const user of usersToNudge) {
      try {
        await sendStreakLostEmail(user.email, user.name || 'User', user.streak);
        
        // Mark as sent so we don't spam them tomorrow
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { streakNudgeSent: true } }
        );
        
        results.sent++;
      } catch (error) {
        console.error(`Failed to nudge user ${user.email}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({ 
      message: `Streak check complete. Sent ${results.sent} nudges.`,
      results 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
