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
          title: 'CERTIFICATE OF COMPLETION',
          recipient: session.user.name,
          desc: `For successfully neutralizing "The Void" threat in the GDI campaign. Final Rank: ${session.user.league || 'Bronze'}.`,
          date: new Date().toLocaleDateString(),
          signature: 'Sentinel-Alpha',
          signer_name: 'GLOBAL DEFENSE INITIATIVE'
        };
        break;

      case 'LEAGUE_PROMOTION':
        templateId = process.env.PROMOTION_TEMPLATE_ID;
        pdfData = {
          company_name: 'GLOBAL DEFENSE INITIATIVE',
          client_name: session.user.name,
          contract_date: new Date().toLocaleDateString(),
          service_description: `Promotion to ${metadata.newLeague} rank within the GDI hierarchy. This operative is now granted Level ${calculateLevel(session.user.xp || 0)} clearance and access to higher-tier sector nodes.`
        };
        break;

      case 'ADMIN_COMPLIANCE_REPORT':
        templateId = process.env.COMPLIANCE_REPORT_TEMPLATE_ID;
        const allUsers = await db.collection('users').find({}).sort({ xp: -1 }).toArray();
        
        pdfData = {
          organization: metadata.orgName || 'GDI Global',
          totalUsers: allUsers.length,
          date: new Date().toLocaleDateString(),
          timestamp: metadata.timestamp,
          // Mapping to your "Travel Itinerary" template fields
          trips: allUsers.map(u => ({
            dateFrom: u.name,
            dateTo: u.league || 'Bronze',
            countryCode: (u.xp || 0).toString(),
            placeToVisit: 'Operational'
          }))
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
