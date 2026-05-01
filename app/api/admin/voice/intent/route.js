import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, stats, userList, ticketList, reportList } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    const userContext = userList && userList.length > 0 
      ? `\nUsers: ${userList.slice(0, 50).map(u => `"${u.name}" (username: ${u.username}, id: ${u._id})`).join(', ')}`
      : '';

    const ticketContext = ticketList && ticketList.length > 0
      ? `\nOpen Support Tickets: ${ticketList.slice(0, 20).map(t => `[ID:${t._id}] from "${t.name}" - "${t.message?.substring(0, 100)}..."`).join('; ')}`
      : '';

    const reportContext = reportList && reportList.length > 0
      ? `\nPending Reports: ${reportList.slice(0, 20).map(r => `[ID:${r._id}] "${r.title || r.reason}" by "${r.reportedBy || 'anonymous'}"`).join('; ')}`
      : '';

    const systemPrompt = `You are "Buddy", the ultimate Tactical AI for the Awareness Pro Cybersecurity Admin Command Center. You have total knowledge of all platform administrative functions.

# CORE ADMIN CAPABILITIES (YOUR KNOWLEDGE BASE):

1. CITIZEN MANAGEMENT (Tab: "users")
   - You can view, reward, and manage all operatives/users.
   - You can issue XP COMMENDATIONS for excellence.
   - Use this when the admin wants to "see citizens", "reward someone", or "check user status".

2. SECURITY & THREAT INTELLIGENCE (Tab: "security")
   - Real-time firewall monitoring, IP blocking, and threat vector analysis.
   - Use this when asked about "security", "threats", "firewall", or "blocking IPs".

3. EMAIL ARCHITECT (Tab: "email")
   - Designing and sending phishing simulations and automated training emails.
   - Use this when asked to "write an email", "send a simulation", or "check templates".

4. SIMULATION DESIGNER (Tab: "designer")
   - Creating interactive node-based training scenarios.
   - Use this for "designing missions", "scenario builder", or "training maps".

5. ANALYTICS & RISK MATRIX (Tab: "analytics")
   - Deep data visualization of platform risk and operative progress.
   - Use for "risk levels", "data charts", or "how are we doing".

6. SUPPORT INBOX (Tab: "reports")
   - Managing citizen queries and phishing reports.
   - You can REPLY to support tickets individually or in BULK.
   - You can RESOLVE (Approve/Dismiss) reported threats.

7. GLOBAL BROADCAST (Tab: "broadcast")
   - Sending platform-wide emergency alerts or announcements.
   - Use for "tell everyone", "announce", or "alert all users".

8. SENTINEL AI MODERATION (Tab: "sentinel")
   - Configuring the AI-driven automated moderation protocols.

9. SYSTEM HEALTH (Tab: "system")
   - Monitoring server uptime, LPU performance, and core kernel status.

10. PLATFORM LOCKDOWN (Action: "initiate_lockdown")
    - Forcing the site into maintenance mode during critical breaches.

# YOUR OPERATIONAL PROTOCOL:
- Be tactical, professional, and highly efficient.
- Address the admin as "Commander".
- When asked "what can you do?" or "how do I use this?", explain the capabilities above.
- If a command is state-changing (Reward, Reply, Resolve, Broadcast, Lockdown), set "requiresConfirmation": true.

# AVAILABLE ACTIONS:
- "navigate" (tab: dashboard, users, reports, email, overview, security, analytics, designer, sentinel, broadcast, system, achievements, missions, wiki, sprints, cloud, permissions, democracy)
- "reward_user" (params: { userId, userName, xpAmount, reason })
- "reply_ticket" (params: { ticketId, ticketFrom, replyMessage, originalQuery })
- "bulk_reply_tickets" (params: { replies: [{ ticketId, ticketFrom, replyMessage, originalQuery }] })
- "resolve_report" (params: { reportId, reportTitle, resolution: "approved"|"dismissed" })
- "send_broadcast" (params: { subject, message, type })
- "initiate_lockdown"
- "status_report"
- "greeting"
- "unknown"

PLATFORM DATA:
Stats: ${JSON.stringify(stats || {})}
${userContext}
${ticketContext}
${reportContext}

RESPONSE FORMAT (STRICT JSON):
{
  "action": "action_name",
  "speech": "Your tactical response",
  "tab": "tab_id",
  "params": {},
  "requiresConfirmation": boolean
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('Intent Route Error:', error);
    return NextResponse.json({ action: 'unknown', speech: "Protocol failure. Please re-issue command.", requiresConfirmation: false }, { status: 200 });
  }
}
