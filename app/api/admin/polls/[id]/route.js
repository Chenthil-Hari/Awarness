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
    const { status, correctOptionIds, xpAmount } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const poll = await db.collection('polls').findOne({ _id: new ObjectId(id) });
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    // Update poll status and correct answers
    await db.collection('polls').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, correctOptionIds, xpAmount: xpAmount || 50, updatedAt: new Date() } }
    );

    // Reward users if correct options were selected
    let rewardedCount = 0;
    if (correctOptionIds && correctOptionIds.length > 0) {
      const rewardValue = xpAmount || 50;
      const winners = poll.votedBy
        .filter(v => typeof v === 'object' && correctOptionIds.includes(v.optionId))
        .map(v => new ObjectId(v.userId));

      if (winners.length > 0) {
        // Use a Set to avoid double rewarding if a user somehow voted twice (though logic prevents it)
        const uniqueWinners = [...new Set(winners.map(w => w.toString()))].map(id => new ObjectId(id));
        
        await db.collection('users').updateMany(
          { _id: { $in: uniqueWinners } },
          { $inc: { xp: rewardValue } }
        );
        rewardedCount = uniqueWinners.length;
      }
    }

    await logAudit(
      session.user.id, 
      session.user.name, 
      'PUBLISH_POLL_RESULT', 
      `Published poll: ${poll.question}. Correct options: ${correctOptionIds?.join(',')}. Rewards: ${rewardedCount} users (+${xpAmount || 50} XP each)`
    );

    return NextResponse.json({ success: true, rewardedCount });
  } catch (error) {
    console.error('Poll patch error:', error);
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
