import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let id = context.params?.id;
    
    if (!id) {
      const urlParts = req.url.split('/');
      id = urlParts[urlParts.length - 1];
    }

    if (!id || id === 'guides' || id === '') {
      return NextResponse.json({ error: 'Missing guide ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    let query;
    try {
      query = (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) 
        ? { _id: new ObjectId(id) } 
        : { _id: id };
    } catch (e) {
      query = { _id: id };
    }

    const guide = await db.collection('guides').findOne(query);
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const isOwner = guide.authorId?.toString() === session.user.id?.toString();
    const isSystem = session.user.id === 'official' || session.user.role === 'admin';

    if (!isOwner && !isSystem) {
      return NextResponse.json({ error: 'Forbidden: You do not own this guide' }, { status: 403 });
    }

    const result = await db.collection('guides').deleteOne(query);

    return NextResponse.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
