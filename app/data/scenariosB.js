export const scenariosB = [
  {
    id: 'deepfake-video-call',
    title: 'The Deepfake Boss',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'A video call from your "manager" asks you to approve emergency wire transfers.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "A video call shows your manager's face asking you to approve a $20K wire transfer urgently. The video looks slightly blurry and lips seem slightly out of sync. What do you do?",
        options: [
          { text: "Approve it — I can see their face, it must be them.", nextStep: 'fail', feedback: "Deepfake video technology can convincingly mimic real faces. Visual confirmation is no longer enough.", points: -200 },
          { text: "Ask them a personal verification question only the real person would know, then call back on their personal number.", nextStep: 'win', feedback: "Smart! Out-of-band verification defeats deepfake attacks. Personal questions add another layer.", points: 100 },
          { text: "Tell them to email the request formally instead.", nextStep: 'win_email', feedback: "Good instinct. Email creates an audit trail and breaks the urgency manipulation.", points: 80 }
        ]
      },
      fail: { text: "It was a deepfake. $20K was wired to a criminal account. Deepfake fraud is the fastest-growing cybercrime.", isFinal: true, failed: true },
      win: { text: "You detected a deepfake attack. Establish verification protocols for all financial approvals.", isFinal: true },
      win_email: { text: "The attacker couldn't produce a legitimate email chain. The transfer was stopped.", isFinal: true }
    }
  },
  {
    id: 'sim-swap',
    title: 'The SIM Swap Attack',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    description: 'Your phone suddenly loses all service. Then your email sends a password reset.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "Your phone loses signal for no reason. Minutes later you get an email: 'Password reset requested for your bank account.' You didn't request this. What now?",
        options: [
          { text: "Nothing — probably a network glitch. I'll wait.", nextStep: 'fail', feedback: "This is a SIM Swap attack. Attackers port your number to receive your SMS OTPs.", points: -200 },
          { text: "Call your carrier immediately and freeze your account, then call your bank from a landline.", nextStep: 'win', feedback: "Correct! Speed is everything in SIM swap. Freeze the SIM before they intercept your OTPs.", points: 100 },
          { text: "Log in to your bank using the app to check if anything happened.", nextStep: 'fail_app', feedback: "Your app login triggers an SMS OTP — which the attacker now receives on their device.", points: -100 }
        ]
      },
      fail: { text: "The attacker reset your bank password using the OTP sent to the swapped SIM. Use authenticator apps instead of SMS for 2FA.", isFinal: true, failed: true },
      fail_app: { text: "Your OTP went to the attacker's device. They logged in before you did.", isFinal: true, failed: true },
      win: { text: "You froze the SIM in time. Switch to app-based authenticators (Google Authenticator, Authy) instead of SMS OTPs.", isFinal: true }
    }
  },
  {
    id: 'insider-threat',
    title: 'The Helpful Colleague',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    description: 'A coworker asks to borrow your login credentials while their account is reset.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "Your friendly colleague says: 'IT reset my account but I need to submit this report urgently! Can I use your login just this once?' What do you say?",
        options: [
          { text: "Sure, just this once — we're friends!", nextStep: 'fail', feedback: "Sharing credentials is a serious security and compliance violation. You're now responsible for whatever they do.", points: -150 },
          { text: "Offer to submit the report on their behalf while they watch.", nextStep: 'win_help', feedback: "This helps them without compromising your credentials.", points: 80 },
          { text: "Decline and suggest they contact IT for emergency access.", nextStep: 'win', feedback: "Correct answer. IT has proper emergency access procedures that maintain accountability.", points: 100 }
        ]
      },
      fail: { text: "They submitted a fraudulent report using your account. You were held responsible due to shared credentials.", isFinal: true, failed: true },
      win_help: { text: "You helped without exposing your credentials. A perfect balance of teamwork and security.", isFinal: true },
      win: { text: "IT provided a temporary guest account. Never share credentials regardless of trust level.", isFinal: true }
    }
  },
  {
    id: 'finance-impulse-buy',
    title: 'The Midnight Sale',
    domain: 'Financial Literacy',
    difficulty: 'Beginner',
    description: 'It is 11 PM and a flash sale ends in 1 hour on a luxury item you want.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "'FLASH SALE: 70% off! Only 3 left! Ends in 58 minutes!' You've wanted this $600 item (now $180) for months but it wasn't in your budget. What do you do?",
        options: [
          { text: "Buy it now — it's a great deal and it ends soon!", nextStep: 'fail', feedback: "Artificial urgency and scarcity are dark patterns that trigger impulse spending. $180 unplanned is still $180 gone.", points: -100 },
          { text: "Sleep on it. If you still want it tomorrow, see if you can budget for it next month.", nextStep: 'win', feedback: "The 24-hour rule eliminates 80% of impulse purchases. Real deals are rarely once-in-a-lifetime.", points: 100 },
          { text: "Buy using credit — pay it off next month.", nextStep: 'fail_credit', feedback: "Impulse + credit is a dangerous combination. What other 'deals' will next month bring?", points: -80 }
        ]
      },
      fail: { text: "The 'sale' happened again the following week. You bought an unbudgeted item and disrupted your finances.", isFinal: true, failed: true },
      fail_credit: { text: "Next month brought more impulse purchases. Credit card balance grew month by month.", isFinal: true, failed: true },
      win: { text: "The next morning you felt neutral about it. The 24-hour rule saved you $180 that month.", isFinal: true }
    }
  },
  {
    id: 'finance-investment-risk',
    title: 'All In On One Stock',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'Your coworker made 200% returns on a single stock and you want in.',
    icon: 'Wallet',
    steps: {
      start: {
        text: "Your coworker made $10K profit putting everything into one tech stock. You have $5,000 in savings. They say it'll keep going up. Do you invest all of it?",
        options: [
          { text: "Put all $5,000 into the same stock immediately.", nextStep: 'fail', feedback: "Survivorship bias — you only hear about the wins. Concentration risk can wipe out all savings instantly.", points: -150 },
          { text: "Invest 10-20% max and diversify the rest across index funds.", nextStep: 'win', feedback: "Smart! Never risk more than you can afford to lose on a single asset. Diversification protects you.", points: 100 },
          { text: "Don't invest at all — stocks are too risky.", nextStep: 'mid', feedback: "Avoiding all investing means losing to inflation over time. Managed risk is better than no risk.", points: 0 }
        ]
      },
      mid: {
        text: "Inflation erodes your savings by 5% per year. What's the smarter approach?",
        options: [
          { text: "Put savings into low-cost index funds for long-term growth.", nextStep: 'win', feedback: "Index funds are diversified, low-cost, and historically outperform most active strategies.", points: 100 },
          { text: "Leave it in a savings account.", nextStep: 'fail_inflation', feedback: "Savings accounts rarely beat inflation. Your money loses real value every year.", points: -50 }
        ]
      },
      fail: { text: "The stock dropped 70% in a month. You lost $3,500. Always diversify.", isFinal: true, failed: true },
      fail_inflation: { text: "After 10 years, inflation reduced your $5,000 to the equivalent of $3,000 in purchasing power.", isFinal: true, failed: true },
      win: { text: "Your diversified portfolio grew steadily while the single stock crashed. Slow and steady wins.", isFinal: true }
    }
  },
  {
    id: 'mental-health-anxiety',
    title: 'The Social Anxiety Loop',
    domain: 'Mental Health',
    difficulty: 'Intermediate',
    description: 'You have been avoiding social events for months due to anxiety.',
    icon: 'Brain',
    steps: {
      start: {
        text: "You've declined 8 social invitations in a row. Each refusal feels like relief but the isolation is growing. A close friend personally invites you to a small dinner. What do you do?",
        options: [
          { text: "Decline again — it's just too overwhelming.", nextStep: 'fail', feedback: "Avoidance relieves anxiety short-term but feeds it long-term. The cycle deepens with every avoided event.", points: -50 },
          { text: "Accept, set a time limit ('I'll stay 1 hour'), and plan an exit phrase.", nextStep: 'win', feedback: "Graduated exposure with a safety plan is the evidence-based approach. Small steps break the avoidance cycle.", points: 100 },
          { text: "Accept but cancel at the last minute as usual.", nextStep: 'fail_cancel', feedback: "Last-minute cancellations strain relationships and give anxiety the final victory each time.", points: -80 }
        ]
      },
      fail: { text: "Isolation deepened. Social anxiety grows in the dark. Gradual exposure is the only evidence-based cure.", isFinal: true, failed: true },
      fail_cancel: { text: "Your friend felt hurt. Anxiety won again. Set smaller, achievable steps instead.", isFinal: true, failed: true },
      win: { text: "You stayed 90 minutes and felt proud of yourself. Each small win shrinks anxiety's power.", isFinal: true }
    }
  },
  {
    id: 'mental-health-social-media',
    title: 'The Comparison Spiral',
    domain: 'Mental Health',
    difficulty: 'Beginner',
    description: 'Scrolling Instagram late at night is making you feel worthless about your life.',
    icon: 'Brain',
    steps: {
      start: {
        text: "It's midnight. After 90 minutes of scrolling, you feel like your life is a failure compared to everyone else's highlight reels. What is the healthiest response?",
        options: [
          { text: "Keep scrolling to find something that cheers you up.", nextStep: 'fail', feedback: "The algorithm shows more of what keeps you engaged — even negative content. More scrolling deepens the spiral.", points: -100 },
          { text: "Put the phone down, write 3 things you're grateful for, and sleep.", nextStep: 'win', feedback: "Correct! Breaking the scroll loop with a positive anchor resets your mental state.", points: 100 },
          { text: "Post something to get validation and likes.", nextStep: 'fail_post', feedback: "Seeking external validation creates a dependency loop. Likes don't cure comparison anxiety.", points: -50 }
        ]
      },
      fail: { text: "2 more hours of scrolling worsened depression symptoms. Set a phone curfew 1 hour before bed.", isFinal: true, failed: true },
      fail_post: { text: "You checked your phone every 5 minutes for likes all night. Sleep was ruined and anxiety increased.", isFinal: true, failed: true },
      win: { text: "You slept better and woke with clearer perspective. Social media is a highlight reel, not reality.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-car-breakdown',
    title: 'Highway Breakdown',
    domain: 'Life Skills',
    difficulty: 'Intermediate',
    description: 'Your car stalls on a busy highway at night.',
    icon: 'Zap',
    steps: {
      start: {
        text: "Your car sputters and dies on a busy 3-lane highway at night. You manage to coast slightly. What is your first priority?",
        options: [
          { text: "Get out immediately and call for help on the shoulder.", nextStep: 'fail', feedback: "The shoulder of a highway is extremely dangerous. Getting out exposes you to fast-moving traffic.", points: -100 },
          { text: "Turn on hazard lights, stay in the car, and call roadside assistance.", nextStep: 'win', feedback: "Correct! Hazard lights warn other drivers. Staying in the car is safer than standing on a highway.", points: 100 },
          { text: "Try to restart the car repeatedly to push to the next exit.", nextStep: 'mid', feedback: "If the car is completely stalled, forcing restarts can cause more damage.", points: -20 }
        ]
      },
      mid: {
        text: "The car won't start. You're in the right lane. What now?",
        options: [
          { text: "Turn on hazard lights and call 911/roadside assistance from inside the car.", nextStep: 'win', feedback: "Always make the car visible and wait safely inside.", points: 100 },
          { text: "Push the car to the shoulder by yourself.", nextStep: 'fail_push', feedback: "Pushing a car on a live highway is extremely dangerous without traffic control.", points: -150 }
        ]
      },
      fail: { text: "Standing on a highway shoulder at night is one of the most dangerous situations possible. Stay in the vehicle.", isFinal: true, failed: true },
      fail_push: { text: "An approaching car nearly hit you. Never push a vehicle on an active highway alone.", isFinal: true, failed: true },
      win: { text: "You stayed safe. Roadside assistance arrived in 30 minutes. Hazard lights and staying inside saved you.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-fake-news',
    title: 'The Viral Health Claim',
    domain: 'Life Skills',
    difficulty: 'Beginner',
    description: 'A viral WhatsApp message claims a common medicine causes cancer.',
    icon: 'Zap',
    steps: {
      start: {
        text: "Your family WhatsApp group is panicking. A forwarded message says: 'URGENT: [Common Medicine] causes cancer! Doctors are hiding this! Share to save lives!' What do you do?",
        options: [
          { text: "Forward it immediately to warn everyone — better safe than sorry.", nextStep: 'fail', feedback: "Forwarding unverified health claims causes real harm. People may stop essential medications.", points: -150 },
          { text: "Check WHO, NHS, or Mayo Clinic websites before sharing or acting on it.", nextStep: 'win', feedback: "Correct! Authoritative health organizations are the only reliable source for medical claims.", points: 100 },
          { text: "Ask a friend who is a nurse what they think.", nextStep: 'mid', feedback: "Better than forwarding, but authoritative sources beat anecdotal advice for broad medical claims.", points: 50 }
        ]
      },
      mid: {
        text: "Your nurse friend says they haven't heard of this. You find no evidence on NHS or WHO. What now?",
        options: [
          { text: "Share an evidence-based debunking in the group with the official source.", nextStep: 'win_debunk', feedback: "Perfect. You stopped misinformation and gave people a reliable resource.", points: 100 },
          { text: "Just quietly ignore it.", nextStep: 'fail_ignore', feedback: "Letting misinformation spread unchallenged in your network allows it to cause harm.", points: -30 }
        ]
      },
      fail: { text: "Three family members stopped their medication based on the false claim. One was hospitalized. Misinformation kills.", isFinal: true, failed: true },
      fail_ignore: { text: "The misinformation spread further in the group. Always politely debunk health misinformation.", isFinal: true, failed: true },
      win: { text: "You found it was completely fabricated. You shared a WHO debunking link. Crisis averted.", isFinal: true },
      win_debunk: { text: "Your family appreciated the correction. You're now the trusted fact-checker of the group.", isFinal: true }
    }
  },
  {
    id: 'lifeskill-online-hate',
    title: 'The Hate DM',
    domain: 'Mental Health',
    difficulty: 'Beginner',
    description: 'You receive a stream of hateful messages after posting a opinion online.',
    icon: 'Brain',
    steps: {
      start: {
        text: "After sharing your opinion on a topic online, you receive 50+ hateful DMs including threats. You feel scared and overwhelmed. What is the right sequence of actions?",
        options: [
          { text: "Engage with the messages to defend yourself.", nextStep: 'fail', feedback: "Engaging feeds the pile-on. It signals you're affected, which motivates more attacks.", points: -100 },
          { text: "Screenshot evidence, block all accounts, report to the platform, and if threats are credible, report to authorities.", nextStep: 'win', feedback: "Correct four-step response: document, block, report, escalate if needed.", points: 100 },
          { text: "Delete your account permanently.", nextStep: 'fail_delete', feedback: "Deleting loses your evidence and lets attackers win. Block and report first.", points: -50 }
        ]
      },
      fail: { text: "Engaging increased the pile-on tenfold. Never debate bad-faith online mobs.", isFinal: true, failed: true },
      fail_delete: { text: "You lost your evidence and your community. Document first, then decide on your future presence.", isFinal: true, failed: true },
      win: { text: "Multiple accounts were suspended. You kept your evidence and protected yourself effectively.", isFinal: true }
    }
  }
];
