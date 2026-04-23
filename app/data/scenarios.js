export const scenarios = [
  {
    id: 'cybersecurity-phishing',
    title: 'The Suspicious Invoice',
    domain: 'Cybersecurity',
    difficulty: 'Beginner',
    description: 'You receive an urgent email regarding a payment you don\'t remember making.',
    icon: 'ShieldAlert',
    steps: {
      start: {
        text: "You open your inbox and see an email from 'Account Services (billing@pay-pal-secure.com)' with the subject: 'URGENT: Suspicious activity on your account - Action Required'. What do you do?",
        options: [
          {
            text: "Click the 'Verify Now' button to secure your account immediately.",
            nextStep: 'click_link',
            feedback: "Wait! Always check the sender's email address first. 'pay-pal-secure.com' is not a legitimate PayPal domain.",
            points: -50
          },
          {
            text: "Check the sender's email address and hover over the link without clicking.",
            nextStep: 'check_details',
            feedback: "Great first step! Hovering reveals the true destination of the link.",
            points: 50
          },
          {
            text: "Forward the email to your IT department or report as phishing.",
            nextStep: 'success_report',
            feedback: "Excellent! Reporting phishing helps protect others in your organization.",
            points: 100
          }
        ]
      },
      click_link: {
        text: "The link takes you to a page that looks exactly like PayPal. It asks for your username, password, and Credit Card details. What's your next move?",
        options: [
          {
            text: "Fill in the details to resolve the issue quickly.",
            nextStep: 'fail_data_theft',
            feedback: "This was a phishing site. You've just given your credentials to hackers.",
            points: -200
          },
          {
            text: "Wait, the URL looks weird: 'http://security-check-782.xyz'. I'll close the tab.",
            nextStep: 'success_close',
            feedback: "Good catch! Legitimate sites use HTTPS and recognizable domains.",
            points: 50
          }
        ]
      },
      check_details: {
        text: "The link points to 'bit.ly/secure-your-login'. The email also has several spelling mistakes like 'dear valued custumer'. What now?",
        options: [
          {
            text: "It looks official enough, I'll proceed.",
            nextStep: 'fail_data_theft',
            feedback: "Spelling errors and URL shorteners are huge red flags in official emails.",
            points: -100
          },
          {
            text: "Delete the email and log in to PayPal through their official website in a new tab.",
            nextStep: 'success_official',
            feedback: "Perfect! Never use links from suspicious emails to access sensitive accounts.",
            points: 100
          }
        ]
      },
      // Final states
      success_report: { text: "Scenario Complete: You successfully identified and reported a phishing attempt. You kept your data safe!", isFinal: true },
      success_close: { text: "Scenario Complete: You realized the danger just in time. Always trust your gut when a URL looks suspicious.", isFinal: true },
      success_official: { text: "Scenario Complete: This is the safest way to handle such emails. You verified the status through official channels.", isFinal: true },
      fail_data_theft: { text: "Scenario Complete: Unfortunately, you fell for the trap. In the real world, this could lead to identity theft and financial loss.", isFinal: true, failed: true }
    }
  },
  {
    id: 'finance-emergency',
    title: 'The Unforeseen Repair',
    domain: 'Financial Literacy',
    difficulty: 'Intermediate',
    description: 'Your car breaks down, and you need $800 for repairs. How do you handle it?',
    icon: 'Wallet',
    steps: {
      start: {
        text: "The mechanic says it's $800. You have $500 in your checking account and $2,000 in your Emergency Fund. What do you do?",
        options: [
          {
            text: "Pay using your credit card to keep your cash for now.",
            nextStep: 'credit_card',
            feedback: "Credit cards are convenient, but interest rates can make the repair much more expensive if not paid off immediately.",
            points: -20
          },
          {
            text: "Use $800 from your Emergency Fund.",
            nextStep: 'success_efund',
            feedback: "This is exactly what an Emergency Fund is for! It prevents you from going into debt.",
            points: 100
          },
          {
            text: "Take a 'Payday Loan' from the shop nearby.",
            nextStep: 'fail_payday',
            feedback: "Payday loans have predatory interest rates (often 400%+) and can trap you in a debt cycle.",
            points: -150
          }
        ]
      },
      credit_card: {
        text: "You used the credit card. At the end of the month, you can only afford to pay the minimum balance of $40. What now?",
        options: [
          {
            text: "Just pay the minimum. I'll pay it off when I get a bonus.",
            nextStep: 'fail_debt_spiral',
            feedback: "Paying only the minimum leads to long-term debt and high interest costs.",
            points: -50
          },
          {
            text: "Take $760 from the Emergency Fund now to pay off the card in full.",
            nextStep: 'success_late_pay',
            feedback: "Better late than never. You avoided the high interest trap.",
            points: 50
          }
        ]
      },
      // Final states
      success_efund: { text: "Scenario Complete: You handled the emergency responsibly without incurring debt. Now, remember to replenish your fund!", isFinal: true },
      success_late_pay: { text: "Scenario Complete: You avoided a long-term debt trap by using your savings to clear the high-interest debt.", isFinal: true },
      fail_payday: { text: "Scenario Complete: The payday loan led to a cycle of debt that took months to escape. Avoid these at all costs.", isFinal: true, failed: true },
      fail_debt_spiral: { text: "Scenario Complete: The credit card interest started compounding, making the $800 repair cost you over $1,200 in the long run.", isFinal: true, failed: true }
    }
  },
  {
    id: 'fire-safety-kitchen',
    title: 'Kitchen Crisis',
    domain: 'Life Skills',
    difficulty: 'Intermediate',
    description: 'A pan on the stove catches fire while you are cooking. Do you have the right tools to stop it?',
    icon: 'Zap',
    steps: {
      start: {
        text: "You're frying some snacks when suddenly the oil in the pan ignites! Thick black smoke starts filling the room. What's your first move?",
        options: [
          {
            text: "Turn off the heat and quickly find a Fire Extinguisher in the hallway.",
            nextStep: 'have_extinguisher',
            givesItem: 'Fire Extinguisher',
            feedback: "Found it! You now have a Fire Extinguisher in your inventory.",
            points: 50
          },
          {
            text: "Grab a nearby Wet Towel from the sink.",
            nextStep: 'have_towel',
            givesItem: 'Wet Towel',
            feedback: "You've dampened the towel. It might help smother small flames.",
            points: 30
          },
          {
            text: "Try to carry the burning pan to the sink to douse it with water.",
            nextStep: 'fail_sink_explosion',
            feedback: "CRITICAL ERROR! Moving a burning pan is extremely dangerous, and water on a grease fire causes a massive explosion.",
            points: -200
          }
        ]
      },
      have_extinguisher: {
        text: "The flames are getting higher and reaching the cabinets. You're standing 2 meters away with the extinguisher. What now?",
        options: [
          {
            text: "Aim at the base of the fire and squeeze the handle.",
            requiresItem: 'Fire Extinguisher',
            nextStep: 'success_extinguished',
            feedback: "PASS (Pull, Aim, Squeeze, Sweep) technique worked perfectly!",
            points: 100
          },
          {
            text: "Throw the extinguisher into the fire.",
            nextStep: 'fail_kaboom',
            feedback: "That's... not how extinguishers work. The pressure vessel could explode.",
            points: -150
          }
        ]
      },
      have_towel: {
        text: "The fire is localized to the pan. You have the wet towel. How do you use it?",
        options: [
          {
            text: "Carefully place the towel over the pan to smother the flames.",
            requiresItem: 'Wet Towel',
            nextStep: 'success_smothered',
            feedback: "Nice! By cutting off the oxygen, you've put out the fire.",
            points: 80
          },
          {
            text: "Wave the towel over the fire to blow it out.",
            nextStep: 'fail_spread',
            feedback: "Oxygen feeds fire! Waving the towel just fanned the flames onto the curtains.",
            points: -100
          }
        ]
      },
      // Final states
      success_extinguished: { text: "Scenario Complete: You acted quickly and used the right tool to prevent a house fire. Great job!", isFinal: true },
      success_smothered: { text: "Scenario Complete: You successfully smothered the grease fire. Remember: Never use water on burning oil!", isFinal: true },
      fail_sink_explosion: { text: "Scenario Complete: The fire exploded when it hit the water, causing severe burns and spreading the fire instantly. Never move a burning pan.", isFinal: true, failed: true },
      fail_kaboom: { text: "Scenario Complete: The fire spread, and the extinguisher was wasted. Always use safety equipment as intended.", isFinal: true, failed: true },
      fail_spread: { text: "Scenario Complete: The fire spread to the rest of the kitchen. You should have smothered it instead of fanning it.", isFinal: true, failed: true }
    }
  }
];
