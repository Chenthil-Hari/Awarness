import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('awareness');

    const [userGrowth, guideStats, topEarners] = await Promise.all([
      db.collection('users').aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]).toArray(),
      db.collection('guides').aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]).toArray(),
      db.collection('users').find().sort({ xp: -1 }).limit(5).toArray()
    ]);

    return NextResponse.json({ userGrowth, guideStats, topEarners });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
