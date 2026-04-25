import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import smishingScenarios from '@/app/data/smishingScenarios';

const SCORE_TIERS = [
  { min: 91, max: 100, xp: 500, label: 'Unhackable', badge: 'unhackable', color: '#10b981' },
  { min: 71, max: 90, xp: 300, label: 'Secure', badge: null, color: '#06b6d4' },
  { min: 41, max: 70, xp: 150, label: 'Cautious', badge: null, color: '#f59e0b' },
  { min: 0, max: 40, xp: 50, label: 'Vulnerable', badge: null, color: '#ef4444' },
];

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await request.json();
    // answers: [{ scenarioId: 1, action: 'block' }, ...]

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid answers payload' }, { status: 400 });
    }

    // Build a lookup map for scenarios
    const scenarioMap = Object.fromEntries(smishingScenarios.map(s => [s.id, s]));

    let totalScorePoints = 0;
    let earnedXP = 0;
    const maxScorePoints = smishingScenarios.length * 10; // 10 points per question max
    const breakdown = [];

    for (const answer of answers) {
      const scenario = scenarioMap[answer.scenarioId];
      if (!scenario) continue;

      const isCorrect = answer.action === scenario.correctAction;
      let scorePoints = 0;
      let xp = 0;

      if (isCorrect) {
        scorePoints = 10;
        xp = scenario.xpValue;
      } else {
        // Partial penalty for wrong action
        scorePoints = -5;
        xp = 0;
      }

      totalScorePoints += scorePoints;
      earnedXP += xp;

      breakdown.push({
        scenarioId: scenario.id,
        type: scenario.type,
        sender: scenario.sender,
        content: scenario.content,
        userAction: answer.action,
        correctAction: scenario.correctAction,
        isCorrect,
        explanation: scenario.explanation,
      });
    }

    // Clamp score to 0–100
    const rawScore = Math.max(0, totalScorePoints);
    const finalScore = Math.round((rawScore / maxScorePoints) * 100);

    // Determine tier
    const tier = SCORE_TIERS.find(t => finalScore >= t.min && finalScore <= t.max) || SCORE_TIERS[3];

    // Award XP and badge in DB
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const updatePayload = { $inc: { xp: earnedXP } };

    if (tier.badge) {
      updatePayload.$addToSet = { badges: tier.badge };
    }

    await usersCollection.updateOne(
      { email: session.user.email },
      updatePayload
    );

    return NextResponse.json({
      score: finalScore,
      tier: tier.label,
      tierColor: tier.color,
      earnedXP,
      breakdown,
    });

  } catch (error) {
    console.error('Smishing submit error:', error);
    return NextResponse.json({ error: 'Failed to process results' }, { status: 500 });
  }
}
