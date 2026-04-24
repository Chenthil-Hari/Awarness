import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { scenarios as defaultScenarios } from '@/app/data/scenarios';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch custom scenarios from database
    const customScenarios = await db.collection('scenarios')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Merge default and custom scenarios
    // Ensure default ones have a 'type: default' property for distinction
    const processedDefaults = defaultScenarios.map(s => ({ ...s, type: 'default' }));
    const combinedScenarios = [...processedDefaults, ...customScenarios];

    return NextResponse.json(combinedScenarios);
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    // Fallback to defaults if DB fails
    return NextResponse.json(defaultScenarios.map(s => ({ ...s, type: 'default' })));
  }
}
