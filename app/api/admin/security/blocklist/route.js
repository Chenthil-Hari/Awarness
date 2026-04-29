import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { logAudit } from '@/lib/audit';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function GET() {
  try {
    await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection('config').findOne({ id: 'main' });
    return NextResponse.json(config?.blockedIPs || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const { ip, action } = await req.json();

    let update;
    if (action === 'block') {
      update = { $addToSet: { blockedIPs: ip } };
    } else {
      update = { $pull: { blockedIPs: ip } };
    }

    await db.collection('config').updateOne({ id: 'main' }, update, { upsert: true });
    await logAudit(session.user.id, session.user.name, `${action.toUpperCase()}_IP`, `${action === 'block' ? 'Banned' : 'Unbanned'} IP: ${ip}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
