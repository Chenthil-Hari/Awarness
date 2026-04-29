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
    // Mocked asset library
    const assets = [
      { id: 1, name: 'Phishing_Banner.png', type: 'image/png', size: '1.2 MB', url: '/images/phishing.png', category: 'Simulations' },
      { id: 2, name: 'Badge_Expert.svg', type: 'image/svg+xml', size: '45 KB', url: '/images/badge.svg', category: 'Badges' },
      { id: 3, name: 'Tutorial_Video.mp4', type: 'video/mp4', size: '24.8 MB', url: '/videos/tutorial.mp4', category: 'Wiki' }
    ];
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
