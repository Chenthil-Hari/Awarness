import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing guide ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Determine if we should use ObjectId or string ID
    // MongoDB ObjectIds are always 24 hex characters
    const query = (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) 
      ? { _id: new ObjectId(id) } 
      : { _id: id };

    // Verify ownership before deleting
    const guide = await db.collection('guides').findOne(query);
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Check ownership
    // Ensure we compare strings to strings
    const isOwner = guide.authorId === session.user.id;
    const isSystem = session.user.id === 'official' || session.user.role === 'admin';

    if (!isOwner && !isSystem) {
      return NextResponse.json({ error: 'Forbidden: You do not own this guide' }, { status: 403 });
    }

    const result = await db.collection('guides').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Internal server error during deletion' }, { status: 500 });
  }
}
