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

    const { guideId } = await req.json();
    if (!guideId) {
      return NextResponse.json({ error: 'Missing guide ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user has already voted
    const guide = await db.collection('guides').findOne({ _id: new ObjectId(guideId) });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const hasVoted = guide.voters?.includes(session.user.id);

    if (hasVoted) {
      // Remove vote (unlike)
      await db.collection('guides').updateOne(
        { _id: new ObjectId(guideId) },
        { 
          $inc: { upvotes: -1 },
          $pull: { voters: session.user.id }
        }
      );
      return NextResponse.json({ message: 'Vote removed', upvotes: guide.upvotes - 1 });
    } else {
      // Add vote
      await db.collection('guides').updateOne(
        { _id: new ObjectId(guideId) },
        { 
          $inc: { upvotes: 1 },
          $push: { voters: session.user.id }
        }
      );
      return NextResponse.json({ message: 'Vote added', upvotes: guide.upvotes + 1 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
