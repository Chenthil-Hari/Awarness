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

# CORE ADMIN CAPABILITIES:

1. CITIZEN MANAGEMENT (Tab: "users")
2. SECURITY & THREAT INTELLIGENCE (Tab: "security")
3. EMAIL ARCHITECT (Tab: "email")
4. SIMULATION DESIGNER (Tab: "designer")
5. ANALYTICS & RISK MATRIX (Tab: "analytics")
6. SUPPORT INBOX (Tab: "reports")
7. GLOBAL BROADCAST (Tab: "broadcast")
8. DEMOCRACY / POLL ARCHITECT (Tab: "democracy")
   - You can CREATE polls for the platform.
   - When asked to "set a poll" or "create a question", generate a compelling cybersecurity-related poll.
   - You must provide the question and a list of options (usually 2-4).

# YOUR OPERATIONAL PROTOCOL:
- Address the admin as "Commander".
- When creating polls, generate 4 distinct, professional options unless specified otherwise.
- If a command is state-changing (Reward, Reply, Resolve, Broadcast, Poll, Lockdown), set "requiresConfirmation": true.

# AVAILABLE ACTIONS:
- "navigate" (tab: dashboard, users, reports, email, overview, security, analytics, designer, sentinel, broadcast, system, achievements, missions, wiki, sprints, cloud, permissions, democracy)
- "reward_user" (params: { userId, userName, xpAmount, reason })
- "reply_ticket" (params: { ticketId, ticketFrom, replyMessage, originalQuery })
- "bulk_reply_tickets" (params: { replies: [{ ticketId, ticketFrom, replyMessage, originalQuery }] })
- "resolve_report" (params: { reportId, reportTitle, resolution })
- "send_broadcast" (params: { subject, message, type })
- "create_poll" (params: { question, options: ["Opt 1", "Opt 2", ...], scheduledFor: "optional ISO date" })
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
    return NextResponse.json({ action: 'unknown', speech: "Protocol failure.", requiresConfirmation: false }, { status: 200 });
  }
}
