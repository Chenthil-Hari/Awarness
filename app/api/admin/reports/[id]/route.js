import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const client = await clientPromise;
    const db = client.db();

    let reportOid;
    try {
      reportOid = new ObjectId(id);
    } catch (e) {
      // If it's already an ObjectId or some other format that failed conversion
      reportOid = id;
    }

    let result = await db.collection('reports').deleteOne({ _id: reportOid });

    // If not found by ObjectId, try as a plain string
    if (result.deletedCount === 0) {
      result = await db.collection('reports').deleteOne({ _id: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Report not found in database' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report dismissed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to dismiss report' }, { status: 500 });
  }
}
