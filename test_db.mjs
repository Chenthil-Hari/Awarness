import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://chenthilhari_db_user:fvteZPJimKDACQIm@cluster0.ncypaik.mongodb.net/awareness_db?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  const client = new MongoClient(uri);
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Connection failed!");
    console.error(err);
  } finally {
    await client.close();
  }
}

testConnection();
