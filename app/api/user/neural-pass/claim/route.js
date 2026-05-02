import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { NEURAL_PASS_TIERS } from '@/app/data/neuralPass';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier: tierNumber } = await req.json();
    const tier = NEURAL_PASS_TIERS.find(t => t.tier === tierNumber);

    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if eligible
    if ((user.xp || 0) < tier.requiredXp) {
      return NextResponse.json({ error: 'Insufficient XP' }, { status: 400 });
    }

    // Check if already claimed
    if (user.claimedTiers && user.claimedTiers.includes(tierNumber)) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
    }

    // Apply rewards
    const update = {
      $addToSet: { claimedTiers: tierNumber }
    };

    if (tier.reward.type === 'credits') {
      update.$inc = { xp: tier.reward.amount }; // Using XP as currency for now or add a separate credits field
    } else if (tier.reward.type === 'badge') {
      update.$addToSet.badges = { id: tier.reward.id, name: tier.reward.name, date: new Date() };
    } else if (tier.reward.type === 'item') {
        update.$addToSet.inventory = tier.reward.id;
    }

    await db.collection('users').updateOne(
      { email: session.user.email },
      update
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to claim Neural Pass tier:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
