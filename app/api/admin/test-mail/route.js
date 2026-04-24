import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { sendWelcomeEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });

    console.log("🚀 STARTING MANUAL EMAIL TEST TO:", email);
    
    try {
      const info = await sendWelcomeEmail(email, "Admin Test User");
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully!',
        messageId: info.messageId 
      });
    } catch (mailError) {
      console.error("❌ TEST MAIL FAILED:", mailError.message);
      return NextResponse.json({ 
        success: false, 
        error: mailError.message,
        code: mailError.code,
        command: mailError.command
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'System error during test' }, { status: 500 });
  }
}
