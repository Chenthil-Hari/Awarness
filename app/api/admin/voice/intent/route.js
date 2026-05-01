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

    // Build context for intelligent matching
    const userContext = userList && userList.length > 0 
      ? `\nUsers: ${userList.slice(0, 50).map(u => `"${u.name}" (username: ${u.username}, id: ${u._id})`).join(', ')}`
      : '';

    const ticketContext = ticketList && ticketList.length > 0
      ? `\nOpen Support Tickets: ${ticketList.slice(0, 20).map(t => `[ID:${t._id}] from "${t.name}" - "${t.message?.substring(0, 60)}..."`).join('; ')}`
      : '';

    const reportContext = reportList && reportList.length > 0
      ? `\nPending Reports: ${reportList.slice(0, 20).map(r => `[ID:${r._id}] "${r.title || r.reason}" by "${r.reportedBy || 'anonymous'}"`).join('; ')}`
      : '';

    const systemPrompt = `You are "Buddy", an AI assistant for a cybersecurity training platform's Admin Command Center.

Your job: Understand the admin's natural language command, determine the action, and return structured JSON.

AVAILABLE ACTIONS:

1. NAVIGATION (tab switching):
   action: "navigate", tab: "<tab_id>"
   Tab IDs: dashboard, users, reports, email, overview, security, analytics, designer, sentinel, broadcast, system, achievements, missions, wiki, sprints, cloud, permissions, democracy

2. REWARD USER (give XP):
   action: "reward_user"
   params: { userId, userName, xpAmount, reason }

3. REPLY TO TICKET (support query response):
   action: "reply_ticket"
   params: { ticketId, ticketFrom, replyMessage, originalQuery }

4. RESOLVE REPORT (approve/dismiss a report):
   action: "resolve_report"
   params: { reportId, reportTitle, resolution: "approved" or "dismissed" }

5. SEND BROADCAST (announcement to all users):
   action: "send_broadcast"
   params: { subject, message, type: "announcement" or "warning" or "update" }

6. LOCKDOWN (maintenance mode):
   action: "initiate_lockdown"
   params: {}

7. STATUS REPORT:
   action: "status_report"
   params: {}

8. GREETING:
   action: "greeting"
   params: {}

9. UNKNOWN:
   action: "unknown"
   params: {}

PLATFORM DATA:
Stats: ${JSON.stringify(stats || {})}
${userContext}
${ticketContext}
${reportContext}

RESPONSE FORMAT (strict JSON):
{
  "action": "action_name",
  "speech": "Short, tactical confirmation message for the admin",
  "tab": "tab_id or empty string",
  "params": { ... action-specific parameters },
  "requiresConfirmation": true/false
}

RULES:
- Set requiresConfirmation to TRUE for any destructive/state-changing action (reward, reply, resolve, broadcast, lockdown)
- Set requiresConfirmation to FALSE for navigation, status, greetings
- For ticket replies, compose a professional reply based on what the admin says (e.g. "reply to john's ticket saying we fixed the issue" → generate a proper reply message)
- For rewards, extract the username and XP amount from the message and fuzzy-match against the user list
- For reports, match the report from the context
- For broadcasts, compose the full message based on the admin's intent
- Always be concise and tactical in speech
- Address admin as "Commander" occasionally

EXAMPLES:
"give 100 xp to john" → {"action":"reward_user","speech":"Preparing to issue 100 XP to John. Awaiting confirmation.","tab":"","params":{"userId":"abc","userName":"John","xpAmount":100,"reason":"Admin reward via Buddy"},"requiresConfirmation":true}
"reply to the first ticket saying we are looking into it" → {"action":"reply_ticket","speech":"Draft reply prepared for the support query. Ready for your approval.","tab":"","params":{"ticketId":"xyz","ticketFrom":"User","replyMessage":"Hello! Thank you for reaching out. We are actively looking into your issue and will get back to you shortly. Stay safe!","originalQuery":"..."},"requiresConfirmation":true}
"dismiss the phishing report" → {"action":"resolve_report","speech":"Marking the phishing report as dismissed. Confirm to proceed.","tab":"","params":{"reportId":"abc","reportTitle":"Phishing Report","resolution":"dismissed"},"requiresConfirmation":true}
"broadcast a maintenance warning" → {"action":"send_broadcast","speech":"Broadcast drafted. Awaiting your confirmation to send.","tab":"","params":{"subject":"Scheduled Maintenance","message":"Attention all operatives: The platform will undergo scheduled maintenance shortly. Please save your progress.","type":"warning"},"requiresConfirmation":true}
"show me citizens" → {"action":"navigate","speech":"Opening the Citizen Grid.","tab":"users","params":{},"requiresConfirmation":false}`;

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
        max_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq LLM Error:', data);
      return NextResponse.json({ error: data.error?.message || 'AI processing failed' }, { status: response.status });
    }

    const aiResponse = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('Intent Route Error:', error);
    return NextResponse.json({ 
      action: 'unknown', 
      speech: "Sorry Commander, I encountered an error processing your request.", 
      tab: "",
      params: {},
      requiresConfirmation: false
    }, { status: 200 });
  }
}
