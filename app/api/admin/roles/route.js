import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { logAudit } from '@/lib/audit';

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
    const roles = [
      { id: 'admin', name: 'Super Admin', permissions: ['all'] },
      { id: 'moderator', name: 'Junior Moderator', permissions: ['reports', 'support', 'cms'] },
      { id: 'creator', name: 'Content Creator', permissions: ['cms', 'badges', 'missions'] }
    ];
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const { userId, role } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { role } }
    );

    await logAudit(session.user.id, session.user.name, 'UPDATE_ROLE', `Changed role for user ${userId} to ${role}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
