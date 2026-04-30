import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { pusherServer } from "@/lib/pusher";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pollsCollection = db.collection("polls");

    // Fetch the most recent poll that is either not scheduled or has reached its scheduled time
    const now = new Date();
    let activePoll = await pollsCollection.findOne({
      $or: [
        { scheduledFor: { $exists: false } },
        { scheduledFor: { $lte: now.toISOString() } },
        { scheduledFor: null }
      ]
    }, { sort: { createdAt: -1 } });

    // Seed a default poll if none exist
    if (!activePoll) {
      const defaultPoll = {
        question: "Which cybersecurity trend concerns you most today?",
        options: [
          { id: 1, text: "AI-Generated Voice Clones", votes: 0 },
          { id: 2, text: "Malicious QR Codes (Quishing)", votes: 0 },
          { id: 3, text: "Urgent 'CEO' Direct Messages", votes: 0 },
          { id: 4, text: "Fake Multi-Factor Prompts", votes: 0 }
        ],
        votedBy: [],
        createdAt: new Date()
      };
      const result = await pollsCollection.insertOne(defaultPoll);
      activePoll = { ...defaultPoll, _id: result.insertedId };
    }

    return NextResponse.json(activePoll);
  } catch (error) {
    console.error("Poll fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pollId, optionId } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const pollsCollection = db.collection("polls");

    const poll = await pollsCollection.findOne({ _id: new ObjectId(pollId) });
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user has already voted (handling both old and new schema)
    const hasVoted = poll.votedBy.some(v => 
      (typeof v === 'string' && v === session.user.id) || 
      (typeof v === 'object' && v.userId === session.user.id)
    );

    if (hasVoted) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    // Update the vote count for the specific option and record the specific vote
    const result = await pollsCollection.updateOne(
      { _id: new ObjectId(pollId), "options.id": Number(optionId) },
      { 
        $inc: { "options.$.votes": 1 },
        $push: { votedBy: { userId: session.user.id, optionId, votedAt: new Date() } }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to record vote. Option may be invalid." }, { status: 400 });
    }

    const updatedPoll = await pollsCollection.findOne({ _id: new ObjectId(pollId) });
    
    await pusherServer.trigger('polls', 'poll-updated', { type: 'voted', pollId });

    return NextResponse.json(updatedPoll);
  } catch (error) {
    console.error("Poll vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
