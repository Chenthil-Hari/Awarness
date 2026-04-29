import clientPromise from './mongodb';

export async function logAudit({ userId, userName, action, details, targetId = null, targetType = null }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('audit_logs').insertOne({
      userId,
      userName,
      action,
      details,
      targetId,
      targetType,
      timestamp: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Audit logging failed:', error);
    return false;
  }
}
