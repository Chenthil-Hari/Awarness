import clientPromise from './mongodb';

export async function logAudit(userName, action, details) {
  try {
    const client = await clientPromise;
    const db = client.db('awareness');
    await db.collection('audit_logs').insertOne({
      userName,
      action,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}
