import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, type } = await req.json();
    if (!id || !type) return NextResponse.json({ error: 'Missing ID or Type' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    // Map types to collections
    const collectionMap = {
      'guide': 'guides',
      'comment': 'comments'
    };

    const collection = collectionMap[type];
    if (!collection) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          aiStatus: 'safe',
          aiReason: 'Manually authorized by administrator',
          moderatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Content authorized successfully' });
  } catch (error) {
    console.error("Moderation error:", error);
    return NextResponse.json({ error: 'Failed to authorize content' }, { status: 500 });
  }
}
