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
    const suggestions = await db.collection('suggestions').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const { id, status } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    await db.collection('suggestions').updateOne(
      { _id: id },
      { $set: { status, reviewedAt: new Date(), reviewedBy: session.user.name } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
