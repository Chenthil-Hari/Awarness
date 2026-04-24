import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { sendBroadcastEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subject, message, type } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Fetch all users with emails
    const users = await db.collection('users').find({ email: { $exists: true } }, { projection: { email: 1, name: 1 } }).toArray();

    if (users.length === 0) {
      return NextResponse.json({ error: 'No users found to broadcast to' }, { status: 404 });
    }

    // Process sends in small batches or sequentially to avoid SMTP limits/blocks
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await sendBroadcastEmail(user.email, user.name, subject, message, type);
        successCount++;
      } catch (err) {
        console.error(`Failed to send broadcast to ${user.email}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast complete. Sent to ${successCount} users. Errors: ${failCount}`,
      summary: { total: users.length, success: successCount, failed: failCount }
    });
  } catch (error) {
    console.error("Broadcast API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
