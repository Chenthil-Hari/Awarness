export const scenariosE = [
  {
    id: 'cyber-wifi-hotspot',
    title: 'The Evil Twin Hotspot',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'You set up your laptop hotspot name and a stranger connects without asking.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You're at a conference. You notice your laptop hotspot (named after your company) has an unknown device connected. What do you do?",
        options: [
          { text: "Ignore it — probably just auto-connected.", nextStep: 'fail', feedback: "Unauthorized devices on your hotspot can intercept all your traffic or pivot into your devices.", points: -100 },
          { text: "Immediately disable the hotspot, change the password, and re-enable with a hidden SSID.", nextStep: 'win', feedback: "Correct! Always use a non-obvious hotspot name, strong password, and monitor connected devices.", points: 100 },
          { text: "Check the device's MAC address to identify who it is.", nextStep: 'mid', feedback: "MAC addresses can be spoofed and don't reliably identify the owner. Disable first, investigate later.", points: 30 }
        ]
      },
      mid: {
        text: "The MAC address shows a generic manufacturer. Still can't identify who connected. What now?",
        options: [
          { text: "Disable the hotspot and change the password.", nextStep: 'win', feedback: "When in doubt, cut off access. Security over convenience.", points: 100 },
          { text: "Leave it — they're probably just checking email.", nextStep: 'fail', feedback: "You have no way to know what an unauthorized device is doing on your network.", points: -100 }
        ]
      },
      fail: { text: "The connected device ran a MITM attack and captured your session cookies, hijacking your email account.", isFinal: true, failed: true },
      win: { text: "You secured your hotspot. Always use a non-obvious SSID, strong WPA3 password, and monitor connected devices.", isFinal: true }
    }
  },
  {
    id: 'finance-student-loan',
    title: 'The Loan Trap',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'You are offered a student loan with a low monthly payment but a 15-year term.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "You need ₹5 lakh for college. Lender A: ₹6,000/month for 7 years. Lender B: ₹3,500/month for 15 years. Lender B seems much more affordable. Which do you choose?",
        options: [
          { text: "Lender B — lower monthly payment is easier to manage.", nextStep: 'fail', feedback: "Lower monthly payments over longer terms cost dramatically more in total. Always calculate total cost, not just monthly cost.", points: -100 },
          { text: "Calculate the total repayment for both before deciding.", nextStep: 'win', feedback: "Correct! Lender A: ₹5.04 lakh total. Lender B: ₹6.3 lakh total. The 'affordable' option costs ₹1.26 lakh more.", points: 100 },
          { text: "Lender A — clear the debt faster.", nextStep: 'win_a', feedback: "Correct instinct. Shorter terms mean less total interest paid even if monthly payments are higher.", points: 90 }
        ]
      },
      fail: { text: "You paid ₹1.26 lakh extra in interest for the 'affordable' loan. Always calculate total cost of credit, not just EMI.", isFinal: true, failed: true },
      win: { text: "You chose Lender A and saved ₹1.26 lakh in interest. Total cost always beats monthly payment as a comparison metric.", isFinal: true },
      win_a: { text: "Smart! Shorter loan terms save significant money. Stretch your monthly budget to minimize total interest paid.", isFinal: true }
    }
  },
  {
    id: 'mental-health-perfectionism',
    title: 'The Paralyzed Perfectionist',
    domain: 'Mental Health',
    difficulty: 'Intermediate',
    description: 'You have been working on the same presentation for 3 weeks and cannot submit it.',
    icon: 'Brain',
    steps: {
      start: {
        text: "Your presentation has been 'almost done' for 3 weeks. Every time you're about to submit, you find something to fix. Your deadline is tomorrow. What's happening and what do you do?",
        options: [
          { text: "Work through the night to finally make it perfect before submitting.", nextStep: 'fail', feedback: "Perfectionism is a form of anxiety, not quality control. Perfection is a moving target — it never arrives.", points: -100 },
          { text: "Submit a 'good enough' version now. Feedback from real reviewers is more valuable than endless self-revision.", nextStep: 'win', feedback: "Correct! 'Done is better than perfect.' Real-world feedback outperforms self-review every time.", points: 100 },
          { text: "Ask for a deadline extension to perfect it.", nextStep: 'fail_extend', feedback: "Extensions without behavioral change just delay the same perfectionism loop.", points: -50 }
        ]
      },
      fail: { text: "You worked all night and submitted a presentation full of exhaustion-induced errors. Perfectionism caused the opposite of its goal.", isFinal: true, failed: true },
      fail_extend: { text: "With the extension, you spent 2 more weeks in the same loop. The root pattern wasn't addressed.", isFinal: true, failed: true },
      win: { text: "Your manager loved it. The issues you feared were invisible to everyone else. Perfectionism distorts our perception of our own work.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-earthquake',
    title: 'When the Ground Shakes',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'An earthquake strikes while you are inside a building.',
    icon: 'Zap',
    steps: {
      start: {
        text: "The building begins shaking violently. You're on the 4th floor of an office. What is the correct immediate action?",
        options: [
          { text: "Run for the stairs and exit the building immediately.", nextStep: 'fail', feedback: "Running during shaking is extremely dangerous. Falling debris and loss of balance cause most earthquake injuries during evacuation attempts.", points: -150 },
          { text: "Drop, Cover under a sturdy desk, and Hold On until shaking stops.", nextStep: 'win', feedback: "Correct! Drop, Cover, Hold On is the globally recommended earthquake response. Wait for shaking to fully stop before evacuating.", points: 100 },
          { text: "Stand in a doorframe — it's the strongest part of the building.", nextStep: 'fail_door', feedback: "The 'doorframe' myth has been debunked. Modern doorframes offer no special protection. Get under a desk instead.", points: -80 }
        ]
      },
      fail: { text: "Fallen debris from the ceiling injured several people attempting to run. Shaking lasts seconds — staying put is safer.", isFinal: true, failed: true },
      fail_door: { text: "The doorframe offered no protection from falling ceiling tiles. Drop, Cover, Hold On is the correct modern protocol.", isFinal: true, failed: true },
      win: { text: "Shaking stopped after 18 seconds. You then evacuated calmly using the stairs. No injuries. Drop, Cover, Hold On saves lives.", isFinal: true }
    }
  },
  {
    id: 'cyber-2fa-app',
    title: 'The Authentication Choice',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'Your bank offers three 2FA options. Which do you choose?',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "Your bank offers three 2FA methods: A) SMS OTP, B) Authenticator App (Google/Authy), C) Email OTP. Which do you choose for best security?",
        options: [
          { text: "A) SMS OTP — it's the most common and familiar.", nextStep: 'fail_sms', feedback: "SMS OTPs are vulnerable to SIM swapping, SS7 attacks, and MITM. They're the weakest 2FA option.", points: -50 },
          { text: "B) Authenticator App — it generates codes locally without network transmission.", nextStep: 'win', feedback: "Correct! App-based authenticators generate time-based codes locally. They're immune to SIM swaps and SMS interception.", points: 100 },
          { text: "C) Email OTP — my email is secure.", nextStep: 'fail_email', feedback: "Email OTPs are only as secure as your email account. If your email is compromised, all email-based 2FA falls too.", points: -30 }
        ]
      },
      fail_sms: { text: "A SIM swap attack redirected your SMS OTPs to an attacker. Use authenticator apps for all critical accounts.", isFinal: true, failed: true },
      fail_email: { text: "Your email was phished. The attacker used email OTPs to access all your linked accounts. Keep critical 2FA off email.", isFinal: true, failed: true },
      win: { text: "Authenticator apps are the gold standard for consumer 2FA. Hardware keys (YubiKey) are even stronger for high-value accounts.", isFinal: true }
    }
  },
  {
    id: 'finance-salary-negotiation',
    title: 'The Job Offer',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'You receive a job offer 15% below your expected salary.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "You get a job offer for ₹6 lakh/year. You know the market rate is ₹7-7.5 lakh for your role. The HR says 'This is our best offer.' Do you negotiate?",
        options: [
          { text: "Accept it — they said it's their best offer and I don't want to lose it.", nextStep: 'fail', feedback: "'This is our best offer' is a negotiation tactic. 73% of hiring managers have room to negotiate even after this statement.", points: -100 },
          { text: "Politely counter with market data: 'Based on my research, the market rate is ₹7-7.5L. Can we revisit the base?'", nextStep: 'win', feedback: "Correct! Data-backed, professional negotiation works. You risk nothing by asking — they've already decided they want you.", points: 100 },
          { text: "Ask for more time to think about it.", nextStep: 'mid', feedback: "Time can work, but use it to prepare a specific counter-offer, not just to delay.", points: 30 }
        ]
      },
      mid: {
        text: "After 2 days, HR asks for your decision. What do you say?",
        options: [
          { text: "Counter with market rate data: 'I've researched the role — ₹7L reflects my value. Can we align to this?'", nextStep: 'win', feedback: "Specific, evidence-based counters are most effective in salary negotiation.", points: 100 },
          { text: "Accept the original offer.", nextStep: 'fail', feedback: "The unclaimed ₹1 lakh/year compounds over your entire career at this company.", points: -80 }
        ]
      },
      fail: { text: "Accepting without negotiating cost you ₹1L/year — ₹5L over 5 years. Every rupee not negotiated is left permanently on the table.", isFinal: true, failed: true },
      win: { text: "HR came back at ₹6.75L. You counter-accepted at ₹7L. The 5-minute negotiation was worth ₹75,000/year.", isFinal: true }
    }
  },
  {
    id: 'mental-health-sleep',
    title: 'The 3 AM Doom Scroll',
    domain: 'Mental Health',
    difficulty: 'Beginner',
    description: 'You have been unable to sleep before 2 AM for 2 months.',
    icon: 'Brain',
    steps: {
      start: {
        text: "For 2 months you can't fall asleep before 2 AM. You scroll your phone in bed until exhaustion hits. You wake at 7 AM exhausted. What is the most impactful change you can make?",
        options: [
          { text: "Take sleeping pills — it's a medical problem.", nextStep: 'fail', feedback: "Sleep medication addresses symptoms not causes. It creates dependency and doesn't fix the underlying circadian rhythm disruption.", points: -50 },
          { text: "Keep phones out of the bedroom and maintain a fixed wake time (7 AM) even on weekends for 2 weeks.", nextStep: 'win', feedback: "Correct! Sleep restriction therapy — fixed wake time — is the most evidence-based non-pharmacological treatment for insomnia.", points: 100 },
          { text: "Sleep in on weekends to catch up on lost sleep.", nextStep: 'fail_weekend', feedback: "Social jet lag from sleeping in on weekends resets your circadian rhythm backwards every week.", points: -80 }
        ]
      },
      fail: { text: "Sleeping pills created dependency and the underlying problem worsened. Cognitive Behavioral Therapy for Insomnia (CBT-I) is the clinical gold standard.", isFinal: true, failed: true },
      fail_weekend: { text: "Monday mornings felt like jet lag. Inconsistent sleep schedules perpetuate insomnia. Fix the wake time first.", isFinal: true, failed: true },
      win: { text: "After 10 days of fixed wake times, your sleep pressure built naturally and you were asleep by midnight. Consistency is the cure.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-medication-error',
    title: 'The Wrong Dose',
    domain: 'Life Skills',
    difficulty: 'Advanced',
    description: 'You accidentally take double your prescribed medication dose.',
    icon: 'Zap',
    steps: {
      start: {
        text: "You realize you just took double your prescribed blood pressure medication. You feel fine right now. What do you do?",
        options: [
          { text: "Wait and see — I feel fine, probably nothing will happen.", nextStep: 'fail', feedback: "Many overdose effects are delayed by 30-90 minutes. 'Feeling fine' is not a reliable indicator of safety.", points: -150 },
          { text: "Call Poison Control (1800-116-117 in India) or your doctor immediately for guidance.", nextStep: 'win', feedback: "Correct! Poison Control gives real-time, medication-specific advice. Always call before symptoms appear.", points: 100 },
          { text: "Induce vomiting to remove the medication.", nextStep: 'fail_vomit', feedback: "Inducing vomiting for medication overdose is no longer recommended and can cause additional harm. Call Poison Control.", points: -100 }
        ]
      },
      fail: { text: "Blood pressure dropped dangerously 45 minutes later. You collapsed. Always call Poison Control immediately after a medication error.", isFinal: true, failed: true },
      fail_vomit: { text: "Vomiting damaged your oesophagus and didn't effectively remove the medication. Call Poison Control — don't self-treat.", isFinal: true, failed: true },
      win: { text: "Poison Control advised monitoring specific symptoms and when to go to the ER. You stayed safe with proper guidance.", isFinal: true }
    }
  },
  {
    id: 'cyber-data-privacy',
    title: 'The App Permission Request',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'A flashlight app requests access to your contacts, camera, microphone, and location.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You download a free flashlight app. On install, it requests: Contacts, Camera, Microphone, Location, and Phone State. What do you do?",
        options: [
          { text: "Grant all permissions — the more features the better.", nextStep: 'fail', feedback: "A flashlight app needs only the camera/flash permission. Requesting contacts, mic, and location indicates data harvesting.", points: -100 },
          { text: "Deny all unnecessary permissions. Flashlight only needs the torch/camera permission.", nextStep: 'win', feedback: "Correct! Only grant permissions that match the app's core function. Anything else is surveillance.", points: 100 },
          { text: "Uninstall and use the built-in phone flashlight instead.", nextStep: 'win_builtin', feedback: "Even better! Your phone's built-in flashlight needs zero extra permissions.", points: 90 }
        ]
      },
      fail: { text: "The app was spyware. It sold your contacts and location data to data brokers. Apply the minimum permission principle to every app.", isFinal: true, failed: true },
      win: { text: "Without your contacts and location, the app had no data to harvest. Always ask: does this permission make sense for this app?", isFinal: true },
      win_builtin: { text: "Built-in phone flashlights are universally available on modern phones. Zero third-party apps needed for basic functions.", isFinal: true }
    }
  },
  {
    id: 'finance-ponzi-pyramid',
    title: 'The Pyramid Scheme Invite',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'A friend invites you to join a business where income comes from recruiting others.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "A friend invites you to an 'amazing business opportunity'. The income plan: recruit 5 friends, they each recruit 5. The product is secondary — income is 80% from recruitment bonuses. What is this?",
        options: [
          { text: "A legitimate network marketing opportunity.", nextStep: 'fail', feedback: "When income is primarily from recruitment rather than product sales, it is a pyramid scheme — illegal in most countries.", points: -100 },
          { text: "A pyramid scheme. The math requires infinite recruits which is mathematically impossible.", nextStep: 'win', feedback: "Correct! Pyramid schemes collapse mathematically. Level 13 would require more people than exist on Earth.", points: 100 },
          { text: "I need more information before deciding.", nextStep: 'mid', feedback: "Smart. Ask the key question: what percentage of income comes from product sales vs. recruitment?", points: 50 }
        ]
      },
      mid: {
        text: "They reveal 75% of 'top earner' income comes from recruitment bonuses. Products are overpriced and hard to sell. What now?",
        options: [
          { text: "It's too recruitment-focused. Decline politely.", nextStep: 'win', feedback: "Correct. When recruitment drives income more than product value, the model is inherently pyramid-like.", points: 100 },
          { text: "Join — my friend seems successful.", nextStep: 'fail', feedback: "Your friend is in the early layers. 99% of MLM participants statistically lose money.", points: -100 }
        ]
      },
      fail: { text: "You invested ₹15,000 in starter kits. Couldn't recruit enough. Lost the investment. 99% of pyramid scheme participants lose money.", isFinal: true, failed: true },
      win: { text: "Declining was right. The FTC reports 99% of MLM participants lose money. Recruitment-driven income is a structural scam.", isFinal: true }
    }
  }
];
