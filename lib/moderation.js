/**
 * AI Sentinel - Smart Moderation Engine
 * Analyzes text for toxicity, spam, and misinformation patterns.
 */

const TOXIC_KEYWORDS = ['stupid', 'idiot', 'scam', 'hack', 'fake', 'worst', 'hate'];
const MISINFO_KEYWORDS = ['password is 1234', 'no need for 2fa', 'security is useless', 'disable firewall'];

export async function scanContent(text) {
  if (!text) return { status: 'safe', score: 0 };

  const lowerText = text.toLowerCase();
  let toxicScore = 0;
  let misinfoScore = 0;

  // Toxicity check
  TOXIC_KEYWORDS.forEach(word => {
    if (lowerText.includes(word)) toxicScore += 25;
  });

  // Misinformation check
  MISINFO_KEYWORDS.forEach(word => {
    if (lowerText.includes(word)) misinfoScore += 40;
  });

  // Length check (potential spam)
  if (text.length > 2000) toxicScore += 20;

  let status = 'safe';
  let reason = '';

  if (toxicScore >= 50) {
    status = 'toxic';
    reason = 'Potential toxic language or harassment detected.';
  } else if (misinfoScore >= 40) {
    status = 'inaccurate';
    reason = 'Content contains known security misinformation.';
  } else if (toxicScore + misinfoScore >= 30) {
    status = 'flagged';
    reason = 'AI Sentinel detected suspicious patterns.';
  }

  return {
    status,
    score: toxicScore + misinfoScore,
    reason,
    timestamp: new Date().toISOString()
  };
}
