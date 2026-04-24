import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const scenarioData = await req.json();
    
    // Basic validation
    if (!scenarioData.title || !scenarioData.category || !scenarioData.steps) {
      return NextResponse.json({ error: 'Missing required scenario fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newScenario = {
      ...scenarioData,
      id: `custom_${Date.now()}`, // Unique ID for routing
      type: 'custom',
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      xpReward: scenarioData.xpReward || 50
    };

    const result = await db.collection('scenarios').insertOne(newScenario);

    return NextResponse.json({ success: true, scenario: newScenario, id: result.insertedId });
  } catch (error) {
    console.error("Scenario creation error:", error);
    return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const customScenarios = await db.collection('scenarios').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(customScenarios);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch custom scenarios' }, { status: 500 });
  }
}
