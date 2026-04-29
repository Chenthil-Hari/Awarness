import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function GET() {
  try {
    await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    
    const userStats = await db.collection('users').aggregate([
      { $group: { _id: null, avgXP: { $avg: "$xp" }, total: { $sum: 1 } } }
    ]).toArray();
    
    const { avgXP = 0, total = 0 } = userStats[0] || {};
    
    // Risk Score: Inverse of average XP relative to a 'safe' benchmark of 5000 XP
    const riskScore = Math.max(10, Math.min(95, 100 - (avgXP / 50)));
    
    const forecast = {
      riskScore: Math.round(riskScore),
      riskTrend: avgXP > 1000 ? 'down' : 'up',
      predictedActiveUsers: [
        { day: 'Mon', count: Math.round(total * 0.8) },
        { day: 'Tue', count: Math.round(total * 0.95) },
        { day: 'Wed', count: total },
        { day: 'Thu', count: Math.round(total * 1.1) },
        { day: 'Fri', count: Math.round(total * 1.3) },
        { day: 'Sat', count: Math.round(total * 1.5) },
        { day: 'Sun', count: Math.round(total * 1.2) }
      ],
      contentGaps: avgXP < 2000 ? ['Social Engineering', 'Password Security'] : ['Advanced Phishing', 'Incident Response']
    };
    
    return NextResponse.json(forecast);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
