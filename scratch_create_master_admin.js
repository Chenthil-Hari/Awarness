const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = 'mongodb+srv://chenthilhari_db_user:fvteZPJimKDACQIm@cluster0.ncypaik.mongodb.net/awareness_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    const email = 'admin@awareness.pro';
    const password = 'AwarenessAdmin2026!';
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const adminUser = {
      name: 'Central Admin',
      email: email,
      password: hashedPassword,
      username: 'admin_central',
      role: 'admin',
      xp: 9999,
      createdAt: new Date().toISOString()
    };

    // Upsert so we don't create duplicates
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: adminUser },
      { upsert: true }
    );

    console.log(`Master Admin account created/updated.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
