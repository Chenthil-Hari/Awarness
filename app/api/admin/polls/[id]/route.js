import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { logAudit } from '@/lib/audit';
import { ObjectId } from 'mongodb';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function PATCH(req, { params }) {
  try {
    const session = await checkAdmin();
    const { id } = params;
    const { status, correctOptionId } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const poll = await db.collection('polls').findOne({ _id: new ObjectId(id) });
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    // Update poll status and correct answer
    await db.collection('polls').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, correctOptionId, updatedAt: new Date() } }
    );

    // Reward users if a correct option was selected
    let rewardedCount = 0;
    if (correctOptionId !== undefined) {
      const winners = poll.votedBy
        .filter(v => typeof v === 'object' && v.optionId === correctOptionId)
        .map(v => new ObjectId(v.userId));

      if (winners.length > 0) {
        await db.collection('users').updateMany(
          { _id: { $in: winners } },
          { $inc: { xp: 50 } }
        );
        rewardedCount = winners.length;
      }
    }

    await logAudit(
      session.user.id, 
      session.user.name, 
      'PUBLISH_POLL_RESULT', 
      `Published poll: ${poll.question}. Correct option: ${correctOptionId}. Rewards: ${rewardedCount} users (+50 XP each)`
    );

    return NextResponse.json({ success: true, rewardedCount });
  } catch (error) {
    console.error('Poll patch error:', error);
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
