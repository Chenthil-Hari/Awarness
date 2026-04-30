import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { intelId, xp } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    // Check if already collected
    if (user.intelCollected && user.intelCollected.includes(intelId)) {
      return Response.json({ error: "Intel already collected" }, { status: 400 });
    }

    // Award XP and track collection
    await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $inc: { xp: xp },
        $push: { 
          intelCollected: intelId,
          history: {
            type: 'intel_collect',
            id: intelId,
            xp: xp,
            success: true,
            timestamp: new Date()
          }
        }
      }
    );

    return Response.json({ success: true, newXp: (user.xp || 0) + xp });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
