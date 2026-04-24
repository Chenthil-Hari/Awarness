import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const tickets = await db.collection('support_tickets').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { ticketId, reply } = await req.json();
    if (!ticketId || !reply) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('support_tickets').updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $push: { 
          replies: {
            adminId: session.user.id,
            adminName: session.user.name,
            message: reply,
            createdAt: new Date().toISOString()
          } 
        },
        $set: { status: 'answered' }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}
