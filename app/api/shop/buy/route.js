import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { itemId, price, itemName } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    if ((user.xp || 0) < price) {
      return Response.json({ error: "Insufficient XP" }, { status: 400 });
    }

    // Check if item already owned
    if (user.inventory && user.inventory.includes(itemId)) {
      return Response.json({ error: "Item already owned" }, { status: 400 });
    }

    // Deduct XP and add to inventory
    await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $inc: { xp: -price },
        $push: { inventory: itemId },
        $push: { 
          auditLog: { 
            action: 'purchase', 
            item: itemName, 
            price, 
            date: new Date() 
          } 
        }
      }
    );

    return Response.json({ success: true, newXp: user.xp - price });
  } catch (error) {
    console.error("Shop purchase error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
