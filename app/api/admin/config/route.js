import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    let config = await db.collection('system_config').findOne({ id: 'global' });
    
    if (!config) {
      config = {
        id: 'global',
        maintenanceMode: false,
        xpMultiplier: 1,
        maxGuidesPerPage: 10,
        registrationEnabled: true,
        updatedAt: new Date()
      };
      await db.collection('system_config').insertOne(config);
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const updatedConfig = {
      ...data,
      id: 'global',
      updatedAt: new Date()
    };

    await db.collection('system_config').updateOne(
      { id: 'global' },
      { $set: updatedConfig },
      { upsert: true }
    );

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'UPDATE_CONFIG',
      details: 'Updated global system configuration',
      targetType: 'config'
    });

    return NextResponse.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
