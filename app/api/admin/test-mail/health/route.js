import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import nodemailer from 'nodemailer';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.titan.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
      timeout: 5000 // 5 second timeout for health check
    });

    try {
      await transporter.verify();
      return NextResponse.json({ 
        status: 'online', 
        host: process.env.EMAIL_SERVER_HOST || 'smtp.titan.email',
        user: process.env.EMAIL_SERVER_USER ? 'Configured' : 'Missing'
      });
    } catch (error) {
      return NextResponse.json({ 
        status: 'offline', 
        error: error.message,
        code: error.code
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
