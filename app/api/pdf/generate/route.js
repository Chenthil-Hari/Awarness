import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generatePDF } from '@/lib/pdf';
import clientPromise from '@/lib/mongodb';

/**
 * Internal API to trigger PDF generation based on achievement types
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, metadata } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    let templateId = '';
    let pdfData = {};

    switch (type) {
      case 'CAMPAIGN_CERTIFICATE':
        templateId = process.env.CAMPAIGN_CERT_TEMPLATE_ID;
        pdfData = {
          userName: session.user.name,
          rank: session.user.league || 'Bronze',
          date: new Date().toLocaleDateString(),
          platform: 'AWARENESS GDI'
        };
        break;

      case 'LEAGUE_PROMOTION':
        templateId = process.env.PROMOTION_TEMPLATE_ID;
        pdfData = {
          userName: session.user.name,
          newLeague: metadata.newLeague,
          date: new Date().toLocaleDateString()
        };
        break;

      case 'ADMIN_COMPLIANCE_REPORT':
        templateId = process.env.COMPLIANCE_REPORT_TEMPLATE_ID;
        pdfData = {
          organization: metadata.orgName || 'GDI Global',
          totalUsers: metadata.totalUsers,
          date: new Date().toLocaleDateString(),
          timestamp: metadata.timestamp
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID not configured' }, { status: 500 });
    }

    const result = await generatePDF(templateId, pdfData);

    // Save metadata to user's certificates array
    await db.collection('users').updateOne(
      { _id: session.user.id },
      { 
        $push: { 
          certificates: {
            type,
            url: result.file_url,
            createdAt: new Date()
          } 
        }
      }
    );

    return NextResponse.json({ pdfUrl: result.file_url });

  } catch (error) {
    console.error('PDF Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
