import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendWeeklySummaryEmail } from '@/lib/mail';
import { calculateLevel } from '@/lib/game';

export async function GET(req) {
  // Security check for CRON
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Get all users
    const users = await usersCollection.find({}).toArray();

    const results = {
      sent: 0,
      errors: 0
    };

    for (const user of users) {
      try {
        const xp = user.xp || 0;
        const level = calculateLevel(xp);
        
        await sendWeeklySummaryEmail(user.email, user.name || 'User', xp, level);
        results.sent++;
      } catch (error) {
        console.error(`Failed to send weekly summary to ${user.email}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({ 
      message: `Weekly summary processing complete. Sent ${results.sent} reports.`,
      results 
    });

  } catch (error) {
    console.error('Weekly summary cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
