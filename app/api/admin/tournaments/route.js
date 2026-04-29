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
    const tournaments = await db.collection('tournaments').find({}).sort({ startDate: -1 }).toArray();
    return NextResponse.json(tournaments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const tournamentData = await req.json();

    const result = await db.collection('tournaments').insertOne({
      ...tournamentData,
      participants: [],
      status: 'upcoming',
      createdAt: new Date()
    });

    await logAudit(session.user.id, session.user.name, 'CREATE_TOURNAMENT', `Scheduled tournament: ${tournamentData.title}`);

    return NextResponse.json({ success: true, tournamentId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
