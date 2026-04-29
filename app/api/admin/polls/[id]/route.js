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
    const updateData = await req.json();
    const client = await clientPromise;
    const db = client.db();

    await db.collection('polls').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    await logAudit(session.user.id, session.user.name, 'PUBLISH_POLL_RESULT', `Published results for poll ID: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
