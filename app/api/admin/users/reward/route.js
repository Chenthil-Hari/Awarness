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

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { xp: xpAmount } }
    );

    await logAudit(session.user.name, 'USER_REWARD', `Rewarded 100 XP to user ${userId} for ${reason}`);

    return NextResponse.json({ message: 'Reward issued' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
