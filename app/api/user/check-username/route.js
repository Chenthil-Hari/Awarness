import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    // Validate format (alphanumeric and underscores)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const existingUser = await db.collection('users').findOne({ 
      username: username.toLowerCase() 
    });

    return NextResponse.json({ 
      available: !existingUser,
      message: existingUser ? 'Username already taken' : 'Username available'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
