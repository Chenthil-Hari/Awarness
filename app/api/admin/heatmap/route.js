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
    // In a real app, this would query a 'simulation_logs' collection with geolocation data
    // For now, we generate dynamic "war room" style dots
    const dots = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      intensity: Math.random(),
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    }));

    return NextResponse.json(dots);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
