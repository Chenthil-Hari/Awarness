/**
 * Rotating daily micro-challenges
 */
export const flashChallenges = [
  {
    id: 'flash_001',
    type: 'identify',
    title: 'THE SENDER CHECK',
    question: 'Which of these email addresses is the legitimate Netflix support?',
    options: [
      { text: 'support@netflix-global.com', correct: false, feedback: 'Close, but netflix-global.com is a spoofed domain.' },
      { text: 'info@mailer.netflix.com', correct: true, feedback: 'Correct! netflix.com is the root domain.' },
      { text: 'security@netflix-help.net', correct: false, feedback: '.net and hyphenated domains are common red flags.' }
    ],
    xp: 50
  },
  {
    id: 'flash_002',
    type: 'verify',
    title: 'THE URL WHISPERER',
    question: 'Is this URL safe? https://secure-login.amazon.co.uk.secure-check.net',
    options: [
      { text: 'Safe - It has HTTPS and Amazon in it.', correct: false, feedback: 'The root domain is secure-check.net, NOT amazon.' },
      { text: 'Danger - It is a subdomain of secure-check.net.', correct: true, feedback: 'Spot on! The last two parts of the domain (before the first /) are the real host.' }
    ],
    xp: 50
  },
  {
    id: 'flash_003',
    type: 'smishing',
    title: 'SMS ANALYSIS',
    question: 'You get a text: "Your USPS package is stuck. Pay $1.50 at usps-delivery-fee.com". Legit?',
    options: [
      { text: 'Legit - It is only $1.50.', correct: false, feedback: 'The low price is a "hook" to get your credit card info.' },
      { text: 'Scam - USPS will never text for payment via .com.', correct: true, feedback: 'Correct. USPS uses .gov and typically won\'t text you for small fees.' }
    ],
    xp: 50
  }
];

export function getTodayFlash(seed) {
  const index = seed % flashChallenges.length;
  return flashChallenges[index];
}
