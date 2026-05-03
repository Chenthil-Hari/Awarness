import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { isPro: true, proSince: new Date().toISOString() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Operative upgraded to PRO status.'
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 });
  }
}
