import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch reports and join with guide info
    const reports = await db.collection('reports')
      .aggregate([
        { $match: { status: 'pending' } },
        {
          $lookup: {
            from: 'guides',
            localField: 'guideId',
            foreignField: '_id',
            as: 'guide'
          }
        },
        { $unwind: '$guide' },
        {
          $project: {
            _id: 1,
            guideId: 1,
            reason: 1,
            details: 1,
            createdAt: 1,
            guideTitle: '$guide.title'
          }
        },
        { $sort: { createdAt: -1 } }
      ]).toArray();

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
