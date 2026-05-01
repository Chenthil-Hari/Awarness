import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, stats } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are "Buddy", an AI assistant for a cybersecurity training platform's Admin Command Center. You help the admin manage their platform through natural language commands.

Your job is to:
1. Understand the admin's intent from their message
2. Return a JSON response with the action to take and a short, friendly spoken response

Available actions:
- "navigate_users" - Open the Citizens/Users management tab
- "navigate_overview" - Open the Overview/Dashboard tab  
- "navigate_email" - Open the Email Architect tab
- "navigate_security" - Open the Security tab
- "navigate_analytics" - Open the Analytics tab
- "navigate_designer" - Open the Simulation Designer tab
- "navigate_sentinel" - Open the Sentinel Moderation tab
- "navigate_broadcast" - Open the Broadcast tab
- "navigate_system" - Open the System Health tab
- "navigate_achievements" - Open the Achievements tab
- "navigate_reports" - Open the Reports tab
- "navigate_missions" - Open the Missions tab
- "navigate_sprints" - Open the Sprints tab
- "navigate_cloud" - Open the Cloud Vault tab
- "navigate_permissions" - Open the Permissions tab
- "initiate_lockdown" - Trigger maintenance/lockdown mode
- "status_report" - Give a status briefing (use the stats provided)
- "greeting" - Respond to a greeting
- "unknown" - If you can't determine the intent

Current platform stats: ${JSON.stringify(stats || {})}

IMPORTANT: Always respond with valid JSON in this exact format:
{"action": "action_name", "speech": "Your friendly response to the admin", "tab": "tab_id_if_navigation"}

Tab IDs for navigation: dashboard, users, reports, email, overview, security, analytics, designer, sentinel, broadcast, system, achievements, missions, wiki, sprints, cloud, permissions, democracy

Example responses:
User: "show me all citizens" -> {"action": "navigate_users", "speech": "Opening the Citizen Grid for you, Commander.", "tab": "users"}
User: "hey buddy" -> {"action": "greeting", "speech": "Hey there! Buddy is standing by. What do you need?", "tab": ""}
User: "lock the platform" -> {"action": "initiate_lockdown", "speech": "Understood. Initiating platform lockdown protocol.", "tab": ""}`;

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
        max_tokens: 200,
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
      tab: "" 
    }, { status: 200 });
  }
}
