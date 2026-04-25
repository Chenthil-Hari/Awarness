export const scenariosD = [
  {
    id: 'cyber-malvertising',
    title: 'The Fake Download Ad',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'A Google search result ad leads to what looks like an official software download.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You search 'download VLC media player'. The first result is an ad: 'vlc-media-player.download.co — Free VLC Download!' It looks official. What do you do?",
        options: [
          { text: "Click the ad and download — it looks like the real site.", nextStep: 'fail', feedback: "Malvertising puts fake software in paid ad slots above real search results. Always download from the official domain.", points: -150 },
          { text: "Skip the ads and look for the official videolan.org domain in organic results.", nextStep: 'win', feedback: "Correct! Official software should always be downloaded from the developer's own domain, never from third-party sites.", points: 100 },
          { text: "Search 'is vlc-media-player.download.co safe?' before downloading.", nextStep: 'win_verify', feedback: "Good habit! Verifying suspicious domains before downloading is smart due diligence.", points: 80 }
        ]
      },
      fail: { text: "The downloaded file bundled malware with VLC. It gave attackers persistent access to your system.", isFinal: true, failed: true },
      win: { text: "You downloaded from videolan.org — the legitimate source. Always bookmark official software sites.", isFinal: true },
      win_verify: { text: "Multiple sources flagged it as a malware distribution site. Verification saved you.", isFinal: true }
    }
  },
  {
    id: 'cyber-voice-phishing',
    title: 'The Bank Verification Call',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'Someone calls claiming to be from your bank and asks you to verify your account details.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "A caller says: 'This is HDFC Fraud Prevention. We detected suspicious transactions on your account. I need to verify your account number, card details, and OTP for security.' What do you do?",
        options: [
          { text: "Provide the details — it's the bank calling to protect me.", nextStep: 'fail', feedback: "Banks NEVER ask for OTPs, full card numbers, or passwords over the phone. This is vishing (voice phishing).", points: -200 },
          { text: "Hang up and call the number on the back of your bank card.", nextStep: 'win', feedback: "Perfect! Always verify by calling back on a known, official number — never the one they called from.", points: 100 },
          { text: "Ask them to confirm your details first before you confirm yours.", nextStep: 'mid', feedback: "Scammers often have partial info (name, last 4 digits) to build false trust. Don't rely on this test.", points: 30 }
        ]
      },
      mid: {
        text: "They correctly say your name and last 4 digits of your card. Now they ask for the OTP sent to your phone. Do you give it?",
        options: [
          { text: "They already knew my details — must be legitimate.", nextStep: 'fail', feedback: "Last 4 digits and names are obtainable through data breaches. An OTP is the key to your account.", points: -200 },
          { text: "Hang up and call the bank directly.", nextStep: 'win', feedback: "Correct! Partial knowledge doesn't equal legitimacy. Never share OTPs with anyone.", points: 100 }
        ]
      },
      fail: { text: "The OTP let them transfer ₹85,000 from your account. Banks use OTPs to authorise transactions — sharing one is giving permission.", isFinal: true, failed: true },
      win: { text: "The real bank confirmed no such call was made. You saved your account. Never share OTPs with anyone.", isFinal: true }
    }
  },
  {
    id: 'finance-tax-scam',
    title: 'The Tax Refund Offer',
    domain: 'Financial Literacy',
    difficulty: 'Beginner',
    description: 'You receive an email claiming you have an unclaimed tax refund.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "Email: 'Income Tax Dept: You have an unclaimed refund of ₹14,230! Click here to claim within 48 hours and enter your bank details.' What do you do?",
        options: [
          { text: "Click and claim it immediately — it expires in 48 hours!", nextStep: 'fail', feedback: "The 48-hour urgency is manufactured to prevent rational thinking. Tax refunds are processed through the official income tax portal only.", points: -150 },
          { text: "Log directly into incometax.gov.in with your PAN to check for any legitimate refund.", nextStep: 'win', feedback: "Correct! Any genuine refund will appear in your official IT portal. Always verify through the official channel.", points: 100 },
          { text: "Forward the email to a friend asking if it's real.", nextStep: 'fail_forward', feedback: "Your friend isn't a tax authority. Only the official portal can confirm a real refund.", points: -30 }
        ]
      },
      fail: { text: "You entered your bank details on a phishing site. ₹32,000 was drained from your account.", isFinal: true, failed: true },
      fail_forward: { text: "Your friend thought it looked real. You both got scammed. Official portals are the only truth.", isFinal: true, failed: true },
      win: { text: "No refund existed. You reported the phishing email to the Cyber Crime portal (cybercrime.gov.in).", isFinal: true }
    }
  },
  {
    id: 'mental-health-loneliness',
    title: 'The Empty Apartment',
    domain: 'Mental Health',
    difficulty: 'Beginner',
    description: 'You moved to a new city for work and know nobody. Loneliness is crushing you.',
    icon: 'Brain',
    steps: {
      start: {
        text: "It's been 3 months in your new city. You go home to an empty apartment every night. You have 0 friends here. You feel profoundly lonely. What is the most effective first step?",
        options: [
          { text: "Wait — friendships take time to form naturally.", nextStep: 'fail', feedback: "Passive waiting rarely builds friendships as an adult. In a new city, proactive effort is required.", points: -50 },
          { text: "Join one recurring activity (sports league, hobby class, volunteer group) where you see the same people weekly.", nextStep: 'win', feedback: "Correct! Repeated, low-stakes exposure to the same people is how adult friendships actually form.", points: 100 },
          { text: "Download dating apps — at least that gets you meeting people.", nextStep: 'mid', feedback: "Dating apps have a narrow goal. Friendships form better through shared activities and repeated contact.", points: 20 }
        ]
      },
      mid: {
        text: "Dating apps produce anxiety and few connections. What additional strategy should you add?",
        options: [
          { text: "Join a hobby group or sports club for recurring social contact.", nextStep: 'win', feedback: "Recurring contact with the same people is the scientifically proven path to friendship formation.", points: 100 },
          { text: "Focus only on apps and keep trying.", nextStep: 'fail', feedback: "Transactional connection tools rarely build the deep friendships that cure loneliness.", points: -50 }
        ]
      },
      fail: { text: "3 more months of passive waiting deepened loneliness into depression. Loneliness requires active intervention.", isFinal: true, failed: true },
      win: { text: "By month 6 you had 3 people you saw regularly. Proximity and repetition are the ingredients of adult friendship.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-gas-leak',
    title: 'The Smell of Danger',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'You smell gas when you walk into your home.',
    icon: 'Zap',
    steps: {
      start: {
        text: "You enter your home and immediately smell the distinct rotten-egg odour of a gas leak. What is your FIRST action?",
        options: [
          { text: "Turn on the lights to see better and locate the source.", nextStep: 'fail', feedback: "CRITICAL ERROR. Any electrical switch — on or off — can create a spark that ignites gas. Do not touch any switch.", points: -200 },
          { text: "Open all windows and doors as you leave, don't touch any switches, then call the gas company from outside.", nextStep: 'win', feedback: "Correct! The sequence is: don't touch switches → ventilate as you exit → get everyone out → call from outside.", points: 100 },
          { text: "Turn off the gas at the stove first to stop the leak.", nextStep: 'fail_stove', feedback: "Moving through a gas-filled room to reach the stove increases exposure time and explosion risk.", points: -100 }
        ]
      },
      fail: { text: "The light switch spark ignited the gas. Never touch electrical switches during a gas leak.", isFinal: true, failed: true },
      fail_stove: { text: "A spark from another source ignited before you reached the stove. Evacuate first, always.", isFinal: true, failed: true },
      win: { text: "Gas company found a faulty connection. Your sequence saved lives. Never re-enter until cleared by the gas company.", isFinal: true }
    }
  },
  {
    id: 'cyber-juice-jacking',
    title: 'The Free Airport Charger',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'You find a free USB charging station at an airport. Your phone is at 8% battery.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "Your phone is at 8% battery in the airport. You see a free USB charging station. Do you plug in?",
        options: [
          { text: "Yes — free power, can't say no!", nextStep: 'fail', feedback: "Juice jacking: malicious USB chargers can transfer data or install malware the moment you plug in.", points: -100 },
          { text: "Use a USB Data Blocker ('USB condom') between your cable and the port.", nextStep: 'win', feedback: "Perfect! A USB data blocker allows power flow but blocks data transfer. They cost ₹300 and are essential travel gear.", points: 100 },
          { text: "Use your own wall adapter in a power outlet instead of the USB port.", nextStep: 'win_adapter', feedback: "Smart! Power outlets only carry electricity, not data. Always prefer outlets over USB charging ports in public.", points: 90 }
        ]
      },
      fail: { text: "The USB port installed malware that exfiltrated your contacts, photos, and banking apps in 90 seconds.", isFinal: true, failed: true },
      win: { text: "Your USB data blocker protected you perfectly. A ₹300 accessory that every traveller should own.", isFinal: true },
      win_adapter: { text: "AC power outlets cannot transmit data. Wall adapters are always safer than public USB ports.", isFinal: true }
    }
  },
  {
    id: 'finance-emergency-fund',
    title: 'Building Your Safety Net',
    domain: 'Financial Literacy',
    difficulty: 'Beginner',
    description: 'You want to start building an emergency fund but don\'t know where to start.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "You earn ₹40,000/month. Rent + bills = ₹25,000. You have no savings. Where do you start building an emergency fund?",
        options: [
          { text: "Wait until I earn more — impossible to save on ₹15,000/month surplus.", nextStep: 'fail', feedback: "Waiting for 'enough income' is how people reach retirement with no savings. Start small, start now.", points: -100 },
          { text: "Automate ₹1,500/month (10% of surplus) to a separate savings account on payday.", nextStep: 'win', feedback: "Correct! Automation removes willpower from the equation. Paying yourself first before discretionary spending builds the habit.", points: 100 },
          { text: "Invest all spare money in stocks for higher returns.", nextStep: 'fail_invest', feedback: "Emergency funds need to be liquid and stable. Stocks can drop 40% exactly when you need the money most.", points: -50 }
        ]
      },
      fail: { text: "A medical emergency left you with ₹30,000 in debt. Even ₹500/month saved over a year would have covered it.", isFinal: true, failed: true },
      fail_invest: { text: "When your job was at risk, the market dropped 35%. Your emergency fund was worth half what you needed.", isFinal: true, failed: true },
      win: { text: "In 6 months you had ₹9,000. In a year, ₹18,000. Your first real financial safety net. The habit is more valuable than the amount.", isFinal: true }
    }
  },
  {
    id: 'mental-health-anger',
    title: 'The Breaking Point',
    domain: 'Mental Health',
    difficulty: 'Intermediate',
    description: 'You are about to send an extremely angry email to your colleague in the heat of the moment.',
    icon: 'Brain',
    steps: {
      start: {
        text: "Your colleague took credit for your project in front of the director. You are furious. Your finger is hovering over SEND on a scathing email to them and the entire leadership team. What do you do?",
        options: [
          { text: "Send it — they need to be called out publicly!", nextStep: 'fail', feedback: "Anger emails sent in the heat of the moment almost always escalate conflict and damage YOUR professional reputation.", points: -150 },
          { text: "Save it as a draft, take a 10-minute walk, then decide whether to send it.", nextStep: 'win', feedback: "Correct! The 10-minute rule: Never send an emotional message without cooling down first. You'll almost always rewrite or delete it.", points: 100 },
          { text: "Ask your manager to mediate immediately.", nextStep: 'win_mediate', feedback: "Good option. Escalating through official channels while composed is professional and effective.", points: 80 }
        ]
      },
      fail: { text: "The email was forwarded to HR. Both you and your colleague were reprimanded. Your anger overshadowed the actual grievance.", isFinal: true, failed: true },
      win: { text: "After your walk, you wrote a calm, factual email to your manager with evidence of your contribution. It was far more effective.", isFinal: true },
      win_mediate: { text: "Your manager reviewed the project record and credited you publicly in the next team meeting.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-water-safety',
    title: 'The Rip Current',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'You are caught in a rip current at the beach.',
    icon: 'Zap',
    steps: {
      start: {
        text: "You're swimming and suddenly the sea pulls you away from shore rapidly. You're caught in a rip current 50 metres from the beach. What do you do?",
        options: [
          { text: "Swim as hard as possible straight back to shore.", nextStep: 'fail', feedback: "Swimming against a rip current is fighting a force stronger than any swimmer. You will exhaust yourself and drown.", points: -200 },
          { text: "Swim parallel to the shore until you exit the current, then swim back at an angle.", nextStep: 'win', feedback: "Correct! Rip currents are narrow. Swimming parallel escapes the current without exhausting you.", points: 100 },
          { text: "Float and signal for help while drifting.", nextStep: 'win_float', feedback: "Also valid. Conserving energy while signalling is safer than fighting. Rip currents don't pull you under — just out.", points: 90 }
        ]
      },
      fail: { text: "Exhaustion set in 20 metres from shore. Fighting rip currents directly is the leading cause of swimming fatalities.", isFinal: true, failed: true },
      win: { text: "You exited the rip current and safely reached shore. Teach this to everyone who swims in the ocean.", isFinal: true },
      win_float: { text: "A lifeguard spotted you and assisted. Floating and signalling conserves energy — the two things that keep you alive.", isFinal: true }
    }
  },
  {
    id: 'cyber-ransomware-response',
    title: 'The Ransomware Hit',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'You arrive at work and your entire team\'s files have been encrypted. A ransom note demands $50,000 in Bitcoin.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "All company files are encrypted. Ransom note: '$50,000 in Bitcoin in 72 hours or files are deleted and leaked.' What is the first action?",
        options: [
          { text: "Pay the ransom immediately to recover files fast.", nextStep: 'fail', feedback: "Only 65% of companies get their files back after paying. Paying funds criminal operations and marks you as willing to pay again.", points: -150 },
          { text: "Isolate all infected machines from the network immediately, then contact your incident response team and check backups.", nextStep: 'win', feedback: "Correct priority order: Contain → Assess → Recover from backup → Report to authorities. Never pay without exhausting alternatives.", points: 100 },
          { text: "Restart the affected computers to see if that clears it.", nextStep: 'fail_restart', feedback: "Restarting can trigger ransomware to spread further or destroy decryption keys.", points: -100 }
        ]
      },
      fail: { text: "You paid $50,000. Attackers sent a partial decryptor that only worked on 40% of files. You lost the money and most data.", isFinal: true, failed: true },
      fail_restart: { text: "Restarting triggered the ransomware to spread to backup drives that were still connected. All copies were encrypted.", isFinal: true, failed: true },
      win: { text: "Isolation stopped spread. Clean backups from 3 days prior were restored. Recovery took 2 days, not weeks. Backups save companies.", isFinal: true }
    }
  }
];
