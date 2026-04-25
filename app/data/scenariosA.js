export const scenariosA = [
  {
    id: 'phishing-ceo-fraud',
    title: 'The CEO Request',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'Your "CEO" urgently emails asking you to transfer money to a vendor.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You get an email from ceo@yourcompany-secure.net: 'Transfer $5,000 to our new vendor TODAY. Keep this confidential.' What do you do?",
        options: [
          { text: "Transfer immediately — the CEO said it's urgent.", nextStep: 'fail', feedback: "This is CEO Fraud (BEC). Always verify large transfers via a phone call to a known number.", points: -150 },
          { text: "Call the CEO directly on their known number to verify.", nextStep: 'win', feedback: "Correct! BEC scams rely on urgency. Always verify financial requests out-of-band.", points: 100 },
          { text: "Reply to the email asking for more details.", nextStep: 'fail_reply', feedback: "Replying goes to the attacker, not the real CEO. Use a different channel to verify.", points: -50 }
        ]
      },
      fail_reply: { text: "The attacker confirmed the transfer details. You sent $5,000 to a criminal.", isFinal: true, failed: true },
      fail: { text: "You wired $5,000 to scammers. Business Email Compromise (BEC) costs companies billions annually.", isFinal: true, failed: true },
      win: { text: "The real CEO had no idea about this request. You stopped a BEC fraud attempt!", isFinal: true }
    }
  },
  {
    id: 'password-reuse',
    title: 'The Leaked Database',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'A website you use suffers a data breach. Your credentials are exposed.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "HaveIBeenPwned notifies you that your email and password were found in a data breach from a gaming site. You use the same password on your email and bank. What first?",
        options: [
          { text: "Change only the gaming site password.", nextStep: 'fail', feedback: "You reused the password! Hackers try breached credentials on banking and email sites immediately.", points: -100 },
          { text: "Change passwords on ALL sites where you used that password.", nextStep: 'win', feedback: "Correct! Credential stuffing attacks rely on password reuse across sites.", points: 100 },
          { text: "Ignore it — it was just a gaming site.", nextStep: 'fail', feedback: "Attackers use automated tools to try leaked credentials across hundreds of sites within hours.", points: -150 }
        ]
      },
      fail: { text: "Your email and bank account were accessed using the leaked password. Always use unique passwords.", isFinal: true, failed: true },
      win: { text: "Smart move! Consider using a password manager to keep unique passwords for every site.", isFinal: true }
    }
  },
  {
    id: 'public-wifi',
    title: 'Airport Hotspot Trap',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'You need to check your bank balance at the airport. Free Wi-Fi is available.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You see two networks: 'Airport_Free_WiFi' and 'Airport Free WiFi Official'. Both are open. You need to log into your bank. What do you do?",
        options: [
          { text: "Connect to the first one and check your bank quickly.", nextStep: 'fail', feedback: "Evil Twin attacks use convincing network names to intercept your traffic.", points: -100 },
          { text: "Use your phone's mobile data hotspot instead.", nextStep: 'win', feedback: "Perfect! Mobile data is encrypted by default and far safer than public Wi-Fi for sensitive tasks.", points: 100 },
          { text: "Connect and use a VPN before accessing the bank.", nextStep: 'win_vpn', feedback: "Good thinking! A VPN encrypts your traffic even on untrusted networks.", points: 80 }
        ]
      },
      fail: { text: "Both networks were Evil Twins set up by attackers. Your bank credentials were intercepted via MITM.", isFinal: true, failed: true },
      win: { text: "Mobile data was the safest choice. Never access financial accounts on public Wi-Fi.", isFinal: true },
      win_vpn: { text: "VPN protected your traffic. Always enable a trusted VPN before using public Wi-Fi for sensitive tasks.", isFinal: true }
    }
  },
  {
    id: 'ransomware-usb',
    title: 'The Mystery USB Drive',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'You find a USB drive in the office parking lot labeled "Payroll Q4".',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You find a USB labeled 'Payroll Q4 - CONFIDENTIAL' in the parking lot. What do you do?",
        options: [
          { text: "Plug it in to see if it belongs to a colleague.", nextStep: 'fail', feedback: "USB Baiting is a common attack vector. Malware executes the moment you plug it in.", points: -200 },
          { text: "Hand it to IT security without plugging it in.", nextStep: 'win', feedback: "Excellent! IT can safely analyze the device in an isolated environment.", points: 100 },
          { text: "Plug into a personal phone to check — it's safer than a work computer.", nextStep: 'fail', feedback: "Phones are also vulnerable. The malware doesn't care what device you use.", points: -150 }
        ]
      },
      fail: { text: "The USB contained ransomware. It encrypted your entire company network within minutes.", isFinal: true, failed: true },
      win: { text: "IT confirmed it was a penetration test. You passed! USB baiting is a classic social engineering technique.", isFinal: true }
    }
  },
  {
    id: 'mfa-bypass',
    title: 'The Urgent MFA Push',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'You receive unexpected MFA approval requests on your phone at 2 AM.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "It's 2 AM. You get 10 rapid MFA push notifications on your phone saying 'Approve sign-in?' You didn't initiate any login. What now?",
        options: [
          { text: "Approve one to make them stop — must be a glitch.", nextStep: 'fail', feedback: "This is MFA Fatigue (Push Bombing). Approving gives the attacker full access to your account.", points: -200 },
          { text: "Deny all and immediately change your password.", nextStep: 'win', feedback: "Correct! The attacker had your password but not your MFA. Changing the password blocks them completely.", points: 100 },
          { text: "Ignore them and go back to sleep.", nextStep: 'fail_ignore', feedback: "Ignoring allows the attacker to keep trying. They may exploit a session or trick you when you're tired.", points: -50 }
        ]
      },
      fail: { text: "Approving the push gave the attacker full access. MFA Fatigue attacks are increasingly common.", isFinal: true, failed: true },
      fail_ignore: { text: "You ignored it, but by morning the attacker found another way in. Always act immediately on suspicious MFA requests.", isFinal: true, failed: true },
      win: { text: "You stopped an MFA Fatigue attack. Report the incident to your IT team so they can investigate.", isFinal: true }
    }
  },
  {
    id: 'social-media-overshare',
    title: 'The Innocent Post',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'You want to share your excitement about your new job on LinkedIn.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You post on LinkedIn: 'Excited to start at MegaCorp tomorrow as a Finance Manager! Using SAP ERP daily!' What is the risk?",
        options: [
          { text: "None — it's just a professional post.", nextStep: 'fail', feedback: "You've revealed your company, role, and the exact software you use. Attackers use this for targeted spear-phishing.", points: -100 },
          { text: "Minimal risk. LinkedIn is for professional networking.", nextStep: 'fail', feedback: "Attackers actively scrape LinkedIn to craft targeted phishing emails. Your post is an OSINT goldmine.", points: -80 },
          { text: "Significant — I've given attackers my company, role, and tech stack for spear-phishing.", nextStep: 'win', feedback: "Correct! Be mindful of the operational details you share publicly.", points: 100 }
        ]
      },
      fail: { text: "A week later you received a perfect spear-phish pretending to be a SAP software update for MegaCorp Finance teams.", isFinal: true, failed: true },
      win: { text: "Great awareness! Sharing job titles and tools publicly creates a detailed target profile for attackers.", isFinal: true }
    }
  },
  {
    id: 'finance-crypto-scam',
    title: 'The Crypto Guru',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'An Instagram influencer promises guaranteed 300% returns on crypto.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "An influencer DMs you: 'My insider crypto strategy returned 300% last month. Invest $500 now, I'll triple it in 2 weeks. Limited spots!' What do you do?",
        options: [
          { text: "Invest $500 — the testimonials look real!", nextStep: 'fail', feedback: "Classic Pig Butchering / Ponzi scam. No legitimate investment guarantees specific returns.", points: -200 },
          { text: "Ask for their license and regulated platform details first.", nextStep: 'mid', feedback: "Smart! Legitimate financial advisors are always registered with a regulatory body.", points: 50 },
          { text: "Block and report the account immediately.", nextStep: 'win', feedback: "Correct! Unsolicited investment DMs are almost always scams. Report to protect others.", points: 100 }
        ]
      },
      mid: {
        text: "They get aggressive: 'I'm not registered but my results speak for themselves! Don't miss out!' What now?",
        options: [
          { text: "They make a good point, invest anyway.", nextStep: 'fail', feedback: "Unregistered financial advisors are illegal. This is a scam.", points: -200 },
          { text: "Block and report the account.", nextStep: 'win', feedback: "Good call! Legitimate advisors don't pressure you or refuse to disclose credentials.", points: 100 }
        ]
      },
      fail: { text: "You sent $500. The account went silent. Your money is gone. Guaranteed returns are the biggest scam red flag.", isFinal: true, failed: true },
      win: { text: "You avoided a classic investment fraud. Always verify credentials before trusting anyone with your money.", isFinal: true }
    }
  },
  {
    id: 'finance-budget-overspend',
    title: 'The Budget Buster',
    domain: 'Financial Literacy',
    difficulty: 'Beginner',
    description: 'Your spending app shows you are 20% over budget mid-month.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "It's the 15th and you've already spent your entire monthly budget. You still have 15 days to go. What's your move?",
        options: [
          { text: "Use your credit card for the rest of the month and deal with it next month.", nextStep: 'fail', feedback: "This creates a debt spiral where each month starts worse than the last.", points: -100 },
          { text: "Review your spending, cut non-essentials, and use only cash for the rest of the month.", nextStep: 'win', feedback: "Correct! A spending freeze on non-essentials resets your habits immediately.", points: 100 },
          { text: "Take a short-term loan from a friend.", nextStep: 'mid', feedback: "This can strain relationships. Better to cut spending first.", points: -20 }
        ]
      },
      mid: {
        text: "Your friend agrees but asks when you'll pay back. You're not sure. What do you say?",
        options: [
          { text: "Promise a specific date tied to your next paycheck.", nextStep: 'win_mid', feedback: "Specific repayment dates preserve friendships and build trust.", points: 60 },
          { text: "Say 'soon' and hope for the best.", nextStep: 'fail_friend', feedback: "Vague repayment promises damage relationships.", points: -50 }
        ]
      },
      fail: { text: "Credit card debt compounded. You started every month deeper in the hole.", isFinal: true, failed: true },
      fail_friend: { text: "Your friend felt taken advantage of. Financial stress damaged your friendship.", isFinal: true, failed: true },
      win: { text: "A spending freeze helped you finish the month without debt and reset your habits.", isFinal: true },
      win_mid: { text: "You repaid on time and learned to review your budget weekly going forward.", isFinal: true }
    }
  },
  {
    id: 'mental-health-burnout',
    title: 'The Endless Workday',
    domain: 'Mental Health',
    difficulty: 'Intermediate',
    description: 'You have been working 12-hour days for 3 weeks. You feel exhausted and irritable.',
    icon: 'Brain',
    steps: {
      start: {
        text: "You can't sleep, snap at family, and dread mornings. Your manager just added another project. What do you do?",
        options: [
          { text: "Push through — it's just temporary stress.", nextStep: 'fail', feedback: "Ignoring burnout leads to physical illness, mental health crises, and often job loss anyway.", points: -100 },
          { text: "Schedule a conversation with your manager about workload capacity.", nextStep: 'win', feedback: "Correct! Advocating for yourself early prevents full burnout and improves work relationships.", points: 100 },
          { text: "Quit immediately without another job lined up.", nextStep: 'fail_quit', feedback: "Financial stress on top of burnout often makes mental health worse. Plan the exit first.", points: -50 }
        ]
      },
      fail: { text: "After 2 more weeks you collapsed and needed two weeks of medical leave. Early intervention is always better.", isFinal: true, failed: true },
      fail_quit: { text: "Financial pressure made burnout worse. Always have a plan before leaving.", isFinal: true, failed: true },
      win: { text: "Your manager redistributed work. Recognizing and naming burnout early is the bravest and smartest move.", isFinal: true }
    }
  },
  {
    id: 'life-skill-first-aid',
    title: 'The Choking Child',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'A child at your dinner table starts choking on food.',
    icon: 'Zap',
    steps: {
      start: {
        text: "A 7-year-old child at your table grabs their throat and cannot speak or breathe. What is your first action?",
        options: [
          { text: "Give them water to wash it down.", nextStep: 'fail', feedback: "Water can worsen a blockage. Never give liquids to someone who is choking.", points: -150 },
          { text: "Lean them forward and give 5 firm back blows between the shoulder blades.", nextStep: 'win', feedback: "Correct! For children over 1 year — 5 back blows followed by 5 abdominal thrusts if needed.", points: 100 },
          { text: "Wait to see if they cough it out.", nextStep: 'fail_wait', feedback: "Choking is a time-critical emergency. Every second without oxygen causes brain damage.", points: -200 }
        ]
      },
      fail: { text: "The blockage worsened. Choking requires immediate physical intervention, not liquids.", isFinal: true, failed: true },
      fail_wait: { text: "Waiting cost critical seconds. The child lost consciousness. Always act immediately.", isFinal: true, failed: true },
      win: { text: "The back blows dislodged the food. You saved a life. Learn the Heimlich maneuver — it takes 5 minutes to learn.", isFinal: true }
    }
  }
];
