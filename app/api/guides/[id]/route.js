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
    const client = await clientPromise;
    const db = client.db();

    // Verify ownership before deleting
    const guide = await db.collection('guides').findOne({ _id: new ObjectId(id) });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (guide.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this guide' }, { status: 403 });
    }

    await db.collection('guides').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
