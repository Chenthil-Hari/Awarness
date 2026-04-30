import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("config").findOne({ id: "main" });
    
    return Response.json({
      maintenanceMode: config?.maintenanceMode || false,
      registrationEnabled: config?.registrationEnabled !== false
    });
  } catch (error) {
    return Response.json({ maintenanceMode: false }, { status: 500 });
  }
}
