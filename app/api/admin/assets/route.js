import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

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
    
    let assets = await db.collection('assets').find({}).toArray();
    
    // Default fallback for demo if empty
    if (assets.length === 0) {
      assets = [
        { id: 'def_1', name: 'Security_Shield.png', type: 'image/png', size: '1.2 MB', url: '/images/shield.png', category: 'Simulations' },
        { id: 'def_2', name: 'Master_Badge.svg', type: 'image/svg+xml', size: '45 KB', url: '/images/badge.svg', category: 'Badges' }
      ];
    }
    
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req) {
  try {
    await checkAdmin();
    const client = await clientPromise;
    const db = client.db();
    const data = await req.json();
    
    const newAsset = {
      ...data,
      id: `asset_${Date.now()}`,
      createdAt: new Date()
    };
    
    await db.collection('assets').insertOne(newAsset);
    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
