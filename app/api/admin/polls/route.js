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
    const polls = await db.collection('polls').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(polls);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const pollData = await req.json();

    const result = await db.collection('polls').insertOne({
      ...pollData,
      options: pollData.options.map(opt => ({ text: opt, votes: 0 })),
      active: true,
      createdAt: new Date()
    });

    await logAudit(session.user.id, session.user.name, 'CREATE_POLL', `Created community poll: ${pollData.question}`);

    return NextResponse.json({ success: true, pollId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function DELETE(req) {
  try {
    const session = await checkAdmin();
    const { pollId } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    await db.collection('polls').deleteOne({ _id: pollId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
