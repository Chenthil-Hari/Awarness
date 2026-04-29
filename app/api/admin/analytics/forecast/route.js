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
    // In a real app, this would use a machine learning model or statistical regression
    // on top of simulation_logs and user_stats.
    const forecast = {
      riskScore: 68,
      riskTrend: 'down',
      predictedActiveUsers: [
        { day: 'Mon', count: 120 },
        { day: 'Tue', count: 145 },
        { day: 'Wed', count: 160 },
        { day: 'Thu', count: 130 },
        { day: 'Fri', count: 190 },
        { day: 'Sat', count: 210 },
        { day: 'Sun', count: 180 }
      ],
      contentGaps: ['Deepfake Detection', 'Ransomware Recovery', 'Cloud Security']
    };
    return NextResponse.json(forecast);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
