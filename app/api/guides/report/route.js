import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guideId, reason, details } = await req.json();

    if (!guideId || !reason) {
      return NextResponse.json({ error: 'Missing guide ID or reason' }, { status: 400 });
    }

    let processedGuideId = guideId;
    if (typeof guideId === 'object' && guideId?.$oid) {
      processedGuideId = guideId.$oid;
    }

    let dbGuideId = processedGuideId;
    if (typeof processedGuideId === 'string' && /^[0-9a-fA-F]{24}$/.test(processedGuideId)) {
      dbGuideId = new ObjectId(processedGuideId);
    }

    const client = await clientPromise;
    const db = client.db();

    const report = {
      guideId: dbGuideId,
      reporterId: session.user.id,
      reporterUsername: session.user.username,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('reports').insertOne(report);

    // Also mark the guide as reported (optional, for visual flagging)
    await db.collection('guides').updateOne(
      { _id: dbGuideId },
      { $inc: { reportCount: 1 } }
    );

    return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Report Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
