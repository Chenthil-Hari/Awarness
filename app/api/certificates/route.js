import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generatePDF } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { domain } = await req.json();

    // 1. Verify user has completed the domain (Mocked for now, but should check DB)
    // const completedMissions = session.user.completedMissions || [];
    // if (!canClaimCertificate(completedMissions, domain)) {
    //   return NextResponse.json({ error: "Domain not completed" }, { status: 400 });
    // }

    // 2. Prepare data for CraftMyPDF
    const certificateData = {
      user_name: session.user.username || session.user.name || "Operative",
      domain_name: domain,
      issue_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificate_id: `NEURAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      rank: session.user.league || "Bronze"
    };

    // 3. Call PDF generation service
    // Note: Template ID should be configured in your CraftMyPDF dashboard
    const TEMPLATE_ID = process.env.CRAFT_MY_PDF_CERT_TEMPLATE_ID || "default_template";
    
    // In a real scenario, this returns a URL to the PDF
    // For this demo, we'll return a mock success
    const result = await generatePDF(TEMPLATE_ID, certificateData, { export_type: 'json' });

    return NextResponse.json({ 
      success: true, 
      message: "Certificate generated successfully",
      download_url: result.file_url || "https://example.com/mock-cert.pdf"
    });

  } catch (error) {
    console.error("Certificate API Error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
