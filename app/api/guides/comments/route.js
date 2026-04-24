import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guideId, content, parentCommentId } = await req.json();

    if (!guideId || !content) {
      return NextResponse.json({ error: 'Missing guideId or content' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newComment = {
      id: new ObjectId().toString(),
      author: session.user.name,
      authorId: session.user.id,
      username: session.user.username,
      content,
      createdAt: new Date().toISOString(),
      replies: []
    };

    // Determine query for guide (handle both string and ObjectId)
    const guideQuery = (typeof guideId === 'string' && guideId.length === 24 && /^[0-9a-fA-F]{24}$/.test(guideId)) 
      ? { _id: new ObjectId(guideId) } 
      : { _id: guideId };

    if (parentCommentId) {
      // NESTED REPLY
      // Note: We're simplifying to one level of nesting for better UX/Performance
      await db.collection('guides').updateOne(
        { ...guideQuery, "comments.id": parentCommentId },
        { $push: { "comments.$.replies": newComment } }
      );
    } else {
      // TOP-LEVEL COMMENT
      await db.collection('guides').updateOne(
        guideQuery,
        { $push: { comments: newComment } }
      );
    }

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Comment Error:", error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
