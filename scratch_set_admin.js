const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://chenthilhari_db_user:fvteZPJimKDACQIm@cluster0.ncypaik.mongodb.net/awareness_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await client.db().collection('users').updateOne(
      { email: 'chenthilhari@gmail.com' },
      { $set: { role: 'admin' } }
    );
    console.log(`Matched ${result.matchedCount} user(s) and modified ${result.modifiedCount} user(s).`);
    console.log('Admin role granted to chenthilhari@gmail.com');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
