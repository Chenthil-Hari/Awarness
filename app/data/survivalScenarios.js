export const survivalScenarios = [
  {
    id: 's1',
    round: 1,
    title: 'The Suspicious Link',
    description: 'You receive an email from "IT Security" with a link to "Reset your compromised password immediately." The URL is https://it-security-portal-verify.net/reset. What do you do?',
    options: [
      { text: 'Click and reset to stay safe', correct: false, eliminationMessage: 'You fell for a classic phishing domain. ELIMINATED.' },
      { text: 'Hover to check URL, then delete', correct: true },
      { text: 'Reply to the email asking for proof', correct: false, eliminationMessage: 'Interacting with the attacker exposed your active email status. ELIMINATED.' }
    ],
    difficulty: 'Easy',
    initialPlayers: 100,
    eliminationRate: 0.4 // 40% of wrong-answering simulated players
  },
  {
    id: 's2',
    round: 2,
    title: 'Public Wi-Fi Trap',
    description: 'You are at an airport. You see "FREE_AIRPORT_WIFI_HIGH_SPEED" (Open) and "Airport_Official_Secure" (WPA3). You need to check your bank balance.',
    options: [
      { text: 'Use the open one, it is faster', correct: false, eliminationMessage: 'Evil Twin attack detected. Your credentials were sniffed. ELIMINATED.' },
      { text: 'Use Official Secure with VPN', correct: true },
      { text: 'Wait until you get home', correct: true } // Multiple correct for survival
    ],
    difficulty: 'Medium',
    eliminationRate: 0.5
  },
  {
    id: 's3',
    round: 3,
    title: 'The Social Engineer',
    description: 'A "maintenance worker" at your office asks you to hold the secure door open because their hands are full of equipment. They don\'t have a visible badge.',
    options: [
      { text: 'Be polite and hold it open', correct: false, eliminationMessage: 'Tailgating successful. The intruder breached the server room. ELIMINATED.' },
      { text: 'Ask to see their badge first', correct: true },
      { text: 'Call security immediately', correct: true }
    ],
    difficulty: 'Hard',
    eliminationRate: 0.6
  },
  {
    id: 's4',
    round: 4,
    title: 'The Final Boss: Zero Day',
    description: 'A major vulnerability (CVE-2026-X) is announced for your primary firewall. An "unofficial" patch is circulating on GitHub that claims to fix it before the vendor release.',
    options: [
      { text: 'Apply unofficial patch ASAP', correct: false, eliminationMessage: 'The patch contained a back-door. Your network is now a botnet. ELIMINATED.' },
      { text: 'Isolate affected systems', correct: true },
      { text: 'Wait for official vendor patch', correct: true }
    ],
    difficulty: 'Extreme',
    eliminationRate: 0.8
  }
];
