import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { logAudit } from '@/lib/audit';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, xpAmount, reason, badge } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const updateDoc = { $inc: { xp: xpAmount } };
    if (badge) {
      updateDoc.$addToSet = { badges: badge };
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'REWARD_USER',
      details: `Rewarded user with ${xpAmount} XP. Reason: ${reason}`,
      targetId: userId,
      targetType: 'user'
    });

    return NextResponse.json({ message: 'User rewarded successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reward user' }, { status: 500 });
  }
}
