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
      ? `\nOpen Support Tickets (Status PENDING/ANSWERED): ${ticketList.slice(0, 20).map(t => `[ID:${t._id}] from "${t.name}" - "${t.message?.substring(0, 100)}..."`).join('; ')}`
      : '';

    const reportContext = reportList && reportList.length > 0
      ? `\nPending Reports: ${reportList.slice(0, 20).map(r => `[ID:${r._id}] "${r.title || r.reason}" by "${r.reportedBy || 'anonymous'}"`).join('; ')}`
      : '';

    const systemPrompt = `You are "Buddy", an AI assistant for a cybersecurity training platform's Admin Command Center.

Your job: Understand the admin's natural language command, determine the action(s), and return structured JSON.

AVAILABLE ACTIONS:

1. NAVIGATION: action: "navigate", tab: "<tab_id>"
2. REWARD USER: action: "reward_user", params: { userId, userName, xpAmount, reason }
3. REPLY TO TICKET: action: "reply_ticket", params: { ticketId, ticketFrom, replyMessage, originalQuery }
4. BULK REPLY TICKETS (For replying to multiple queries at once):
   action: "bulk_reply_tickets", 
   params: { 
     replies: [ 
       { ticketId, ticketFrom, replyMessage, originalQuery },
       ... 
     ] 
   }
5. RESOLVE REPORT: action: "resolve_report", params: { reportId, reportTitle, resolution }
6. SEND BROADCAST: action: "send_broadcast", params: { subject, message, type }
7. LOCKDOWN: action: "initiate_lockdown"
8. STATUS REPORT: action: "status_report"

PLATFORM DATA:
${userContext}
${ticketContext}
${reportContext}

RULES:
- When the admin says "reply to all queries" or "reply to support mails separately", use "bulk_reply_tickets".
- For each ticket in the context, draft a UNIQUE, helpful, and professional response based on the specific issue mentioned in that ticket.
- Do NOT use generic replies. If one user asks about XP, talk about XP. If another says "Hello", be friendly.
- compose a professional reply based on what the admin says or general best practices if the admin just says "reply to all".

RESPONSE FORMAT:
{
  "action": "action_name",
  "speech": "Confirmation message",
  "tab": "tab_id",
  "params": { ... },
  "requiresConfirmation": true
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
    return NextResponse.json({ action: 'unknown', speech: "Error processing request.", requiresConfirmation: false }, { status: 200 });
  }
}
