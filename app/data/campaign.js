export const campaignMissions = [
  {
    id: 'campaign-mission-1',
    title: 'Mission 1: The Breach',
    domain: 'Cyber Security',
    description: 'A suspicious email has bypassed our primary filters. Your first assignment as a GDI Recruit is to analyze it.',
    difficulty: 'Beginner',
    relatedGuideId: 'phishing-basics',
    steps: {
      start: {
        text: 'You receive an email from "IT Support" (it-helpdesk@gdi-security.co). The subject is "URGENT: Password Expiry in 2 Hours". The email contains a link to "verify your credentials". What do you do?',
        options: [
          { text: 'Click the link and update my password immediately.', nextStep: 'fail_click', points: -50, feedback: 'Always verify the sender address carefully!' },
          { text: 'Check the sender email address closely.', nextStep: 'check_sender', points: 10, feedback: 'Good instinct. The domain .co is highly suspicious for an internal email.' },
          { text: 'Forward the email to a colleague.', nextStep: 'fail_forward', points: -20, feedback: 'Forwarding potential threats spreads the risk.' }
        ]
      },
      check_sender: {
        text: 'Upon closer inspection, you notice the domain is "gdi-security.co", not the official "gdi-security.com". This is a classic typo-squatting technique used by The Void.',
        options: [
          { text: 'Report the email as Phishing to the Security Operations Center.', nextStep: 'success', points: 100, feedback: 'Excellent work, Recruit. Threat neutralized.' },
          { text: 'Delete the email and ignore it.', nextStep: 'partial_success', points: 30, feedback: 'Safe, but reporting helps protect others.' }
        ]
      },
      fail_click: { text: 'You clicked the link and entered your credentials on a fake portal. The Void now has access to the GDI network. Mission Failed.', isFinal: true, failed: true },
      fail_forward: { text: 'Your colleague clicked the link, compromising their account. Mission Failed.', isFinal: true, failed: true },
      partial_success: { text: 'You safely avoided the trap, but the threat remains active for others. Mission Complete.', isFinal: true },
      success: { text: 'The SOC has isolated the threat and blocked the malicious domain. Excellent job! Mission Complete.', isFinal: true }
    }
  },
  {
    id: 'campaign-mission-2',
    title: 'Mission 2: Voice of The Void',
    domain: 'Social Engineering',
    description: 'The Void is escalating their attacks. They are now attempting direct contact via phone (Vishing).',
    difficulty: 'Intermediate',
    relatedGuideId: 'social-engineering-101',
    steps: {
      start: {
        text: 'Your desk phone rings. The Caller ID says "GDI Executive Office". The person on the line sounds frantic: "This is Director Vance. I am locked out of my account and need you to read me the 2FA code sent to your device, NOW!"',
        options: [
          { text: 'Read them the code immediately to help the Director.', nextStep: 'fail_code', points: -100, feedback: 'Never share 2FA codes. Not even with the CEO.' },
          { text: 'Ask them to verify their employee ID.', nextStep: 'ask_id', points: 20, feedback: 'A good start, but skilled attackers can fake IDs.' },
          { text: 'Hang up and call the Director back using the internal directory number.', nextStep: 'success_hangup', points: 150, feedback: 'Perfect response. Verify out-of-band.' }
        ]
      },
      ask_id: {
        text: 'The caller stammers and gets angry: "I do not have time for this! Give me the code or you are fired!"',
        options: [
          { text: 'Panicked, you give them the code.', nextStep: 'fail_code', points: -100, feedback: 'Fear is a tool used by attackers to bypass your logic.' },
          { text: 'Refuse and report the call to security.', nextStep: 'success_report', points: 100, feedback: 'Good job resisting pressure.' }
        ]
      },
      fail_code: { text: 'You provided the code. The Void bypassed our 2FA and breached the executive database. Mission Failed.', isFinal: true, failed: true },
      success_hangup: { text: 'You call the real Director Vance. He confirms he did not call you. You thwarted a major Vishing attack. Mission Complete.', isFinal: true },
      success_report: { text: 'Security traced the call. It originated from a spoofed VOIP number linked to The Void. Mission Complete.', isFinal: true }
    }
  },
  {
    id: 'campaign-mission-3',
    title: 'Mission 3: The Void Mainframe (Boss Fight)',
    domain: 'Advanced Threat Defense',
    description: 'The final showdown. A massive coordinated attack is hitting the GDI Mainframe. You must defend it.',
    difficulty: 'Expert',
    relatedGuideId: 'advanced-malware',
    steps: {
      start: {
        text: 'WARNING: MULTIPLE BREACHES DETECTED. The network is under heavy DDoS attack. Simultaneously, a pop-up appears on your screen: "URGENT SYSTEM UPDATE REQUIRED TO BLOCK ATTACK. CLICK HERE TO INSTALL." What is your first action?',
        options: [
          { text: 'Click the pop-up to install the emergency update.', nextStep: 'fail_popup', points: -200, feedback: 'Never trust unexpected pop-ups during a crisis. It was a decoy payload.' },
          { text: 'Ignore the pop-up and check the network traffic logs.', nextStep: 'check_logs', points: 50, feedback: 'Good. Prioritize visibility over panic.' },
          { text: 'Disconnect your terminal from the network immediately.', nextStep: 'disconnect', points: 20, feedback: 'Drastic, but it stops the spread locally. However, you can no longer defend the mainframe.' }
        ]
      },
      check_logs: {
        text: 'The logs show massive incoming traffic, but you notice a quiet, encrypted outbound connection to an unknown IP address communicating over Port 443.',
        options: [
          { text: 'Focus on blocking the massive incoming DDoS traffic.', nextStep: 'fail_ddos', points: -50, feedback: 'The DDoS was a distraction for data exfiltration.' },
          { text: 'Block the outbound connection to the unknown IP.', nextStep: 'block_ip', points: 100, feedback: 'Excellent catch. You stopped the data exfiltration attempt.' }
        ]
      },
      block_ip: {
        text: 'You blocked the exfiltration. Suddenly, the screen flashes red. "RANSOMWARE INITIATED." You have a backup drive plugged into your computer. What do you do?',
        options: [
          { text: 'Unplug the backup drive immediately.', nextStep: 'success_unplug', points: 150, feedback: 'Quick thinking! You saved the backups from being encrypted.' },
          { text: 'Try to run an antivirus scan.', nextStep: 'fail_av', points: -100, feedback: 'Too slow. The ransomware encrypted the backups while the scan was starting.' }
        ]
      },
      fail_popup: { text: 'The "update" was malware. The Void now controls your terminal. The Mainframe falls. Mission Failed.', isFinal: true, failed: true },
      disconnect: { text: 'You are safe, but the Mainframe was overrun because you abandoned your post. Mission Failed.', isFinal: true, failed: true },
      fail_ddos: { text: 'You mitigated the DDoS, but The Void successfully stole the GDI classified database. Mission Failed.', isFinal: true, failed: true },
      fail_av: { text: 'The ransomware encrypted everything, including your backups. GDI is destroyed. Mission Failed.', isFinal: true, failed: true },
      success_unplug: { text: 'You saved the backups! The system was encrypted, but we restored it within minutes from your saved drive. The Void\'s attack has been entirely neutralized. You are a hero, Sentinel. Mission Complete.', isFinal: true }
    }
  }
];
