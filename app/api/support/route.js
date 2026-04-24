import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, category } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const ticket = {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      message,
      category: category || 'General Support',
      status: 'pending',
      replies: [],
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('support_tickets').insertOne(ticket);

    return NextResponse.json({ success: true, ticketId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    
    // Users can only see their own tickets
    const tickets = await db.collection('support_tickets')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
