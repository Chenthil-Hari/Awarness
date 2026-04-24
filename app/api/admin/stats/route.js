import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

// HELPER: Ensure only admins can access these routes
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

// 1. STATS API
export async function GET(req) {
  try {
    await checkAdmin();
    const client = await clientPromise;
    const db = client.db();

    const [usersCount, guidesCount, reportsCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('guides').countDocuments(),
      db.collection('reports').countDocuments({ status: 'pending' })
    ]);

    return NextResponse.json({
      users: usersCount,
      guides: guidesCount,
      reports: reportsCount
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
