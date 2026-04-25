export const scenariosC = [
  {
    id: 'cyber-supply-chain',
    title: 'The Poisoned Update',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'A software update from a trusted vendor is flagged by your security tool.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "Your company's EDR tool flags an update from a trusted software vendor as suspicious. Your team says it's probably a false positive and wants to approve it. What do you recommend?",
        options: [
          { text: "Approve it — it's from a trusted vendor, must be a false positive.", nextStep: 'fail', feedback: "Supply chain attacks inject malware into trusted updates (like the SolarWinds attack). Always investigate flags.", points: -150 },
          { text: "Isolate one test machine, install the update there, and monitor for 24 hours before rolling out.", nextStep: 'win', feedback: "Correct! Sandbox testing and staged rollouts are the gold standard for supply chain risk management.", points: 100 },
          { text: "Block the update entirely and never update.", nextStep: 'fail_block', feedback: "Never updating creates different vulnerabilities. Staged rollout is the right balance.", points: -50 }
        ]
      },
      fail: { text: "It was a supply chain attack. The malware gave attackers access to all 500 company endpoints simultaneously.", isFinal: true, failed: true },
      fail_block: { text: "Months later, an unpatched vulnerability in the old version was exploited. Always update — just safely.", isFinal: true, failed: true },
      win: { text: "The test machine showed unusual outbound connections. It was a supply chain attack. Your caution saved the company.", isFinal: true }
    }
  },
  {
    id: 'cyber-open-redirect',
    title: 'The Trusted Link Trick',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'A link starting with "google.com" redirects to a malicious site.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You receive a link: 'https://www.google.com/url?q=http://evil-site.xyz/login'. It starts with google.com so it looks safe. Do you click it?",
        options: [
          { text: "Yes — it starts with google.com so it's safe.", nextStep: 'fail', feedback: "This is an open redirect attack. google.com/url?q= is a redirect service that can forward you anywhere.", points: -150 },
          { text: "Hover over it first — the final destination after 'q=' is what matters.", nextStep: 'win', feedback: "Correct! Always check the full URL after redirect parameters like ?url=, ?q=, or ?redirect=", points: 100 },
          { text: "Copy just the google.com part and visit that instead.", nextStep: 'win_partial', feedback: "Smart instinct! Visiting only the base domain is safe, though you lose access to the intended content.", points: 80 }
        ]
      },
      fail: { text: "You were redirected to a credential harvesting page styled like Google. Open redirects bypass URL-based trust.", isFinal: true, failed: true },
      win: { text: "You spotted the open redirect! The ?q= parameter was pointing to a phishing site. Always read the full URL.", isFinal: true },
      win_partial: { text: "Safe move! You avoided the redirect. Remember: the trusted domain at the start doesn't guarantee a safe destination.", isFinal: true }
    }
  },
  {
    id: 'finance-ponzi',
    title: 'The Investment Club',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'A friend invites you to an exclusive investment club with guaranteed 15% monthly returns.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "A friend vouches for an 'exclusive investment club' — $2,000 entry, guaranteed 15% per month returns, paid every month. 10 friends already joined and got their first payment. What do you do?",
        options: [
          { text: "Join! My friend already got paid and vouches for it.", nextStep: 'fail', feedback: "Ponzi schemes pay early investors with new investor money. First payments are bait. 15%/month = 180%/year — mathematically impossible legitimately.", points: -200 },
          { text: "Research the investment strategy, request audited financial statements, verify with your financial regulator.", nextStep: 'win', feedback: "Correct! Legitimate investments have audited records and registered managers. Anything 'exclusive' with guaranteed returns is a red flag.", points: 100 },
          { text: "Invest a small amount of $200 to test it.", nextStep: 'fail_test', feedback: "Small test investments are how Ponzi schemes hook people. You'll get paid, then invest more, then lose everything.", points: -100 }
        ]
      },
      fail: { text: "Months later payments stopped. The operator disappeared with $2M. Your friend also lost their money. Ponzis destroy friendships.", isFinal: true, failed: true },
      fail_test: { text: "Your $200 returned $230. You then invested $2,000. Months later it collapsed and you lost everything.", isFinal: true, failed: true },
      win: { text: "No audited records existed. The regulator confirmed it was unregistered. You saved $2,000 and warned your friends.", isFinal: true }
    }
  },
  {
    id: 'finance-insurance-gap',
    title: 'The Insurance Gap',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'You get a good job offer but it means losing your health insurance for 2 months.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "Your new job starts in 2 months, but your current health insurance ends in 2 weeks. You feel healthy. Do you go uninsured for 6 weeks to save money?",
        options: [
          { text: "Yes — I'm young and healthy. 6 weeks is nothing.", nextStep: 'fail', feedback: "One emergency room visit without insurance can cost $30,000+. A broken leg, appendicitis, or car accident can happen to anyone.", points: -150 },
          { text: "Research COBRA continuation coverage or a short-term health plan for the gap.", nextStep: 'win', feedback: "Correct! Even a basic short-term plan for 6 weeks costs far less than one uninsured ER visit.", points: 100 },
          { text: "Ask your new employer if they can start benefits earlier.", nextStep: 'win_early', feedback: "Great initiative! Many employers accommodate this request for qualified candidates.", points: 80 }
        ]
      },
      fail: { text: "3 weeks in, you broke your arm. $28,000 in medical bills wiped out your savings.", isFinal: true, failed: true },
      win: { text: "Your short-term plan cost $180 for 6 weeks. You stayed covered and transferred seamlessly.", isFinal: true },
      win_early: { text: "HR agreed to accelerate your start date by 2 weeks. Problem solved through communication.", isFinal: true }
    }
  },
  {
    id: 'mental-health-grief',
    title: 'The Weight of Loss',
    domain: 'Mental Health',
    difficulty: 'Intermediate',
    description: 'You lost a close family member 3 months ago and still cannot function normally.',
    icon: 'Brain',
    steps: {
      start: {
        text: "3 months after losing your parent, you still can't concentrate at work, have stopped eating properly, and have no interest in things you used to love. Your friend says 'just move on.' What do you do?",
        options: [
          { text: "Try harder to 'move on' like they suggest.", nextStep: 'fail', feedback: "Grief has no timeline. Forcing yourself to suppress grief delays processing and can lead to complicated grief disorder.", points: -100 },
          { text: "Speak to a grief counsellor or therapist who specialises in loss.", nextStep: 'win', feedback: "Correct! Complicated grief is a recognized condition. Professional support dramatically improves outcomes.", points: 100 },
          { text: "Use alcohol to numb the pain temporarily.", nextStep: 'fail_alcohol', feedback: "Alcohol is a depressant. It delays grief processing while creating dependency risk during vulnerable periods.", points: -150 }
        ]
      },
      fail: { text: "Suppressed grief resurfaced 2 years later as severe depression. There is no shortcut through grief — only through it.", isFinal: true, failed: true },
      fail_alcohol: { text: "What started as numbing became dependency. Grief plus alcohol is a clinical risk factor for serious addiction.", isFinal: true, failed: true },
      win: { text: "Therapy gave you tools to process grief at your own pace. Grief is love with nowhere to go — it needs a healthy outlet.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-scam-call',
    title: 'The Police Phone Scam',
    domain: 'Life Skills',
    difficulty: 'Intermediate',
    description: 'You receive a call from someone claiming to be a police officer saying your identity was used in a crime.',
    icon: 'Zap',
    steps: {
      start: {
        text: "A caller says: 'This is Inspector Sharma, Crime Branch. Your Aadhaar was used for drug smuggling. To clear your name, transfer ₹20,000 to this safe account. Do not tell anyone or you will be arrested.' What do you do?",
        options: [
          { text: "Transfer the money immediately to avoid arrest.", nextStep: 'fail', feedback: "Real police never demand money over the phone. This is a 'Digital Arrest' scam sweeping India.", points: -200 },
          { text: "Hang up and call the police station directly using the number from their official website.", nextStep: 'win', feedback: "Correct! Real officers give verifiable details. Call back on verified numbers — never the one they call from.", points: 100 },
          { text: "Stay on the call and ask for their badge number.", nextStep: 'mid', feedback: "They will fabricate a badge number. The key is to verify through an independent channel.", points: 30 }
        ]
      },
      mid: {
        text: "They give a badge number and say you'll be arrested if you hang up. The fear escalates. What now?",
        options: [
          { text: "They sound so official, transfer the money to be safe.", nextStep: 'fail', feedback: "Manufactured authority and urgency are the core weapons of this scam. Real police don't work this way.", points: -200 },
          { text: "Hang up regardless and call 100 (police) to verify.", nextStep: 'win', feedback: "Hanging up and calling an independent verified number is always the right move.", points: 100 }
        ]
      },
      fail: { text: "₹20,000 was transferred to scammers. This 'Digital Arrest' scam has defrauded thousands across India.", isFinal: true, failed: true },
      win: { text: "The local police had no record of any such case. You reported the scam number and helped catch the gang.", isFinal: true }
    }
  },
  {
    id: 'cyber-shoulder-surfing',
    title: 'The Coffee Shop Observer',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'You are working on confidential client data at a coffee shop.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You're reviewing confidential client contracts at a coffee shop. The person behind you is angled perfectly to see your screen. What do you do?",
        options: [
          { text: "Continue working — probably overthinking it.", nextStep: 'fail', feedback: "Shoulder surfing is a real and common physical security threat. Sensitive data should never be visible in public.", points: -100 },
          { text: "Reposition your screen, or get a privacy screen filter for public work.", nextStep: 'win', feedback: "Correct! A privacy screen filter is a $20 solution to a serious data breach risk.", points: 100 },
          { text: "Save the work and continue from home later.", nextStep: 'win_home', feedback: "Perfect! Some sensitive work should only happen in secured locations.", points: 90 }
        ]
      },
      fail: { text: "A competitor used information seen over your shoulder to undercut your client proposal. Physical security matters as much as digital.", isFinal: true, failed: true },
      win: { text: "A $20 privacy screen filter protects millions in client data. Physical security is digital security.", isFinal: true },
      win_home: { text: "Best practice: sensitive work in secure, private environments only. Your client thanks you.", isFinal: true }
    }
  },
  {
    id: 'finance-lifestyle-inflation',
    title: 'The Raise Trap',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'You just got a 30% salary increase. You immediately start spending more.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "You got a ₹15,000/month raise! You immediately upgrade to a premium apartment (+₹8,000/month) and buy a new phone on EMI (+₹4,000/month). Sound familiar?",
        options: [
          { text: "I deserve the upgrade! I worked hard for this raise.", nextStep: 'fail', feedback: "Lifestyle inflation is when your expenses grow as fast as your income. Your savings rate stays zero.", points: -100 },
          { text: "Keep current expenses, invest 70% of the raise, and allow 30% for a modest upgrade.", nextStep: 'win', feedback: "This is the secret to wealth building. A raise is an investment opportunity, not a spending mandate.", points: 100 },
          { text: "Save all of the raise and change nothing.", nextStep: 'win_save', feedback: "Excellent discipline! Even saving 100% of a raise while living the same builds wealth exponentially.", points: 90 }
        ]
      },
      fail: { text: "5 years later, despite 3 raises, your savings were identical to when you started. Lifestyle inflation is wealth's silent killer.", isFinal: true, failed: true },
      win: { text: "5 years later you had ₹8 lakhs invested. Your colleagues earned the same raises and had nothing to show for them.", isFinal: true },
      win_save: { text: "Living below your means while income grows is the most powerful wealth-building strategy available to anyone.", isFinal: true }
    }
  },
  {
    id: 'mental-health-toxic-workplace',
    title: 'The Toxic Manager',
    domain: 'Mental Health',
    difficulty: 'Advanced',
    description: 'Your manager publicly humiliates you in meetings and takes credit for your work.',
    icon: 'Brain',
    steps: {
      start: {
        text: "Your manager shouts at you in front of the whole team when you make a small mistake, and later presents your idea as their own to leadership. You feel worthless and dread coming to work. What do you do?",
        options: [
          { text: "Keep your head down — complaining will make things worse.", nextStep: 'fail', feedback: "Silent suffering in toxic environments causes lasting psychological damage. It also signals that the behavior is acceptable.", points: -100 },
          { text: "Document incidents with dates and witnesses, then report to HR formally.", nextStep: 'win', feedback: "Correct! Documentation is everything in workplace disputes. HR investigations require evidence, not just feelings.", points: 100 },
          { text: "Confront your manager aggressively in the next team meeting.", nextStep: 'fail_confront', feedback: "Public confrontation typically escalates conflict and puts you at a disadvantage professionally.", points: -80 }
        ]
      },
      fail: { text: "2 years of silent suffering led to clinical depression and burnout. You left the industry entirely. Document and act early.", isFinal: true, failed: true },
      fail_confront: { text: "You were put on a performance improvement plan immediately after. Workplace disputes require process, not confrontation.", isFinal: true, failed: true },
      win: { text: "HR found a pattern of behavior. Your manager was reassigned. Your documented evidence was decisive.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-flood-safety',
    title: 'Flash Flood Warning',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'A flash flood warning is issued while you are driving through a low-lying area.',
    icon: 'Zap',
    steps: {
      start: {
        text: "Your phone alerts: 'FLASH FLOOD WARNING — Your area.' You're in your car approaching a low section of road with water flowing across it. It looks like only 6 inches of water. What do you do?",
        options: [
          { text: "Drive through slowly — it's only 6 inches of water.", nextStep: 'fail', feedback: "6 inches of fast-moving water can knock a person down. 12 inches can float most cars. NEVER drive into flood water.", points: -200 },
          { text: "Turn around immediately and find a higher route.", nextStep: 'win', feedback: "Correct! 'Turn Around, Don't Drown' — more flood deaths occur in vehicles than anywhere else.", points: 100 },
          { text: "Wait at the water's edge to see if it recedes.", nextStep: 'fail_wait', feedback: "Flash floods rise in minutes, not hours. Waiting at the edge puts you in the flood zone.", points: -100 }
        ]
      },
      fail: { text: "The car stalled in 18 inches of water and was swept 200 meters downstream. Never drive through flood water.", isFinal: true, failed: true },
      fail_wait: { text: "The water rose 3 feet in 10 minutes. Your car was swept away. Move away from flood zones immediately.", isFinal: true, failed: true },
      win: { text: "You turned around safely. The road was submerged 10 minutes later. 'Turn Around, Don't Drown' saves lives.", isFinal: true }
    }
  }
];
