import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    // Prepare payload for Groq
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('response_format', 'json');
    groqFormData.append('language', 'en'); // Force English for tactical clarity

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: groqFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error:', data);
      return NextResponse.json({ error: data.error?.message || 'Transcription failed' }, { status: response.status });
    }

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Transcription Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
