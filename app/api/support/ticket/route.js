import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message, category } = await req.json();
    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing subject or message' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const ticket = {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      subject,
      message,
      category: category || 'general',
      status: 'pending',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('support_tickets').insertOne(ticket);

    return NextResponse.json({ success: true, ticketId: result.insertedId });
  } catch (error) {
    console.error("Support ticket submission error:", error);
    return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const tickets = await db.collection('support_tickets')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
