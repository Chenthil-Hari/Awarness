import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const notifications = await db.collection('notifications')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, action } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    if (action === 'read') {
      await db.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId), userId: session.user.id },
        { $set: { read: true } }
      );
    } else if (action === 'read_all') {
      await db.collection('notifications').updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

// System can POST here from other internal routes
export async function POST(req) {
  try {
    const { userId, title, message, type, link } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const notification = {
      userId,
      title,
      message,
      type: type || 'info',
      link: link || '#',
      read: false,
      createdAt: new Date().toISOString()
    };

    await db.collection('notifications').insertOne(notification);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
