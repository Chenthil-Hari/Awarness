import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('awareness');
    const config = await db.collection("system_config").findOne({ type: "global" });
    
    return Response.json({
      maintenanceMode: config?.maintenanceMode || false,
      maintenanceUntil: config?.maintenanceUntil || null,
      registrationEnabled: config?.registrationEnabled !== false
    });
  } catch (error) {
    return Response.json({ maintenanceMode: false }, { status: 500 });
  }
}
