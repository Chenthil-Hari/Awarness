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
    
    // Fetch the 30 most recently active users or simulations
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(30).toArray();
    
    // Generate deterministic but scattered dots based on user IDs
    const dots = users.map(user => {
      // Use name/id as seed for consistent-ish placement
      const hash = user.email.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      return {
        id: user._id,
        x: 10 + (Math.abs(hash) % 80), // Keep within 10-90% bounds
        y: 10 + (Math.abs(hash >> 8) % 80),
        intensity: (user.xp % 100) / 100,
        timestamp: user.createdAt
      };
    });

    return NextResponse.json(dots);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
