import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch all users
    const users = await db.collection("users").find({}).toArray();
    
    // In a real implementation, you would integrate with Resend/Nodemailer here
    console.log(`MANUAL DIGEST: Triggered broadcast to ${users.length} operatives.`);

    // Log the action in Audit Logs
    await db.collection("audit").insertOne({
      action: 'manual_digest_trigger',
      admin: session.user.email,
      userCount: users.length,
      timestamp: new Date()
    });

    return Response.json({ 
      success: true, 
      message: `Broadcast initiated for ${users.length} users.`,
      timestamp: new Date()
    });
  } catch (error) {
    return Response.json({ error: "Failed to initiate broadcast" }, { status: 500 });
  }
}
