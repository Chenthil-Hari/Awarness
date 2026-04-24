import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { scanContent } from '@/lib/moderation';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const guides = await db.collection('guides')
      .find({})
      .sort({ upvotes: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(guides);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, scenarioId, domain, videoUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // AI SENTINEL SCAN
    const scanResult = await scanContent(`${title} ${content}`);

    const newGuide = {
      title,
      content,
      videoUrl: videoUrl || null,
      scenarioId: scenarioId || null,
      domain: domain || 'General',
      author: session.user.name,
      authorId: session.user.id,
      username: session.user.username,
      upvotes: 0,
      voters: [],
      createdAt: new Date().toISOString(),
      aiStatus: scanResult.status, // safe, toxic, inaccurate, flagged
      aiReason: scanResult.reason,
      aiScore: scanResult.score
    };

    const result = await db.collection('guides').insertOne(newGuide);

    return NextResponse.json({ ...newGuide, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
  }
}
