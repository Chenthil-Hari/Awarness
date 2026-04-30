import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('awareness');
    let config = await db.collection('system_config').findOne({ type: 'global' });
    
    if (!config) {
      config = { type: 'global', maintenanceMode: false, xpMultiplier: 1, registrationEnabled: true };
      await db.collection('system_config').insertOne(config);
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('awareness');

    await db.collection('system_config').updateOne(
      { type: 'global' },
      { $set: { 
          maintenanceMode: body.maintenanceMode,
          maintenanceUntil: body.maintenanceUntil,
          xpMultiplier: body.xpMultiplier,
          registrationEnabled: body.registrationEnabled
        } 
      },
      { upsert: true }
    );

    await logAudit(session.user.name, 'UPDATE_CONFIG', 'Global system configuration modified');

    return NextResponse.json({ message: 'Config updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
