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
    const badges = await db.collection('badges').find({}).toArray();
    return NextResponse.json(badges);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const badgeData = await req.json();

    const result = await db.collection('badges').insertOne({
      ...badgeData,
      createdAt: new Date()
    });

    await logAudit(session.user.id, session.user.name, 'CREATE_BADGE', `Created new badge: ${badgeData.name}`);

    return NextResponse.json({ success: true, badgeId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
