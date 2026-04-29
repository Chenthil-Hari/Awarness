import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logAudit } from '@/lib/audit';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, xpAmount, reason } = await req.json();
    const client = await clientPromise;
    const db = client.db('awareness');

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { xp: parseInt(xpAmount) } },
      { returnDocument: 'after' }
    );

    const updatedUser = result.value || result;

    // Trigger real-time update via Pusher
    try {
      const { pusherServer } = await import('@/lib/pusher');
      await pusherServer.trigger(`user-${userId}`, 'xp-update', {
        xp: updatedUser.xp,
        xpAmount: parseInt(xpAmount),
        reason
      });
    } catch (pusherError) {
      console.error("Pusher reward broadcast failed:", pusherError);
    }

    await logAudit(session.user.name, 'USER_REWARD', `Rewarded ${xpAmount} XP to user ${userId} for ${reason}`);

    return NextResponse.json({ message: 'Reward issued', newXp: updatedUser.xp });
  } catch (error) {
    console.error("Reward API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
