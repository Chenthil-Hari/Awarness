import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pollsCollection = db.collection("polls");

    // FORCED RESET: Clear old test data permanently
    await pollsCollection.deleteMany({});

    // Fetch the most recent poll
    let activePoll = await pollsCollection.findOne({}, { sort: { createdAt: -1 } });

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

    // Check if user has already voted
    if (poll.votedBy.includes(session.user.id)) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    // Update the vote count for the specific option
    await pollsCollection.updateOne(
      { _id: new ObjectId(pollId), "options.id": optionId },
      { 
        $inc: { "options.$.votes": 1 },
        $push: { votedBy: session.user.id }
      }
    );

    const updatedPoll = await pollsCollection.findOne({ _id: new ObjectId(pollId) });
    return NextResponse.json(updatedPoll);
  } catch (error) {
    console.error("Poll vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
