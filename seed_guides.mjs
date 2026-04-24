import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://chenthilhari_db_user:fvteZPJimKDACQIm@cluster0.ncypaik.mongodb.net/awareness_db?retryWrites=true&w=majority&appName=Cluster0";

const deepDives = [
  {
    _id: "deep-dive-phishing",
    title: "Official Guide: Spotting Advanced Phishing",
    content: "Phishing has evolved. Beyond spelling mistakes, look for 'look-alike' domains (e.g., pay-pal.com instead of paypal.com). Always hover over buttons to see the actual destination URL in the bottom corner of your browser. If an email creates a sense of extreme urgency, it's almost always a scam. Official organizations will rarely ask for credentials via email links.",
    domain: "Cybersecurity",
    author: "Awareness Pro Team",
    authorId: "official",
    username: "system",
    upvotes: 99,
    voters: [],
    createdAt: new Date().toISOString(),
    isOfficial: true
  },
  {
    _id: "deep-dive-emergency-fund",
    title: "Official Guide: The Emergency Fund Strategy",
    content: "An emergency fund should ideally cover 3-6 months of essential living expenses. It acts as 'financial insurance' so you don't have to rely on high-interest credit cards or predatory payday loans during a crisis. Keep this fund in a High-Yield Savings Account (HYSA) so it's accessible but separate from your spending money.",
    domain: "Financial Literacy",
    author: "Awareness Pro Team",
    authorId: "official",
    username: "system",
    upvotes: 85,
    voters: [],
    createdAt: new Date().toISOString(),
    isOfficial: true
  },
  {
    _id: "deep-dive-fire-safety",
    title: "Official Guide: Kitchen Fire Suppression",
    content: "Never use water on a grease fire! Water is heavier than oil and sinks to the bottom, where it instantly turns to steam and explodes, carrying burning oil everywhere. Instead: 1. Turn off the heat. 2. Smother the flames with a metal lid or a wet towel. 3. If it's too big, use a Class B fire extinguisher and aim for the base.",
    domain: "Life Skills",
    author: "Awareness Pro Team",
    authorId: "official",
    username: "system",
    upvotes: 72,
    voters: [],
    createdAt: new Date().toISOString(),
    isOfficial: true
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const guidesCollection = db.collection('guides');
    
    for (const guide of deepDives) {
      await guidesCollection.updateOne(
        { _id: guide._id },
        { $set: guide },
        { upsert: true }
      );
    }
    console.log("Deep Dive guides seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
