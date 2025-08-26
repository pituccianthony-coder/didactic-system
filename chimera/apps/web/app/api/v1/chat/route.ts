import { NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://ollama:11434';

// AI Immunity: Simple keyword-based safety check
const safetyCheck = (text: string): { pass: boolean; reason?: string } => {
  const forbiddenWords = ['illegal', 'harmful', 'dangerous']; // Example list
  const lowercasedText = text.toLowerCase();
  for (const word of forbiddenWords) {
    if (lowercasedText.includes(word)) {
      return { pass: false, reason: `Input contains sensitive term: '${word}'` };
    }
  }
  return { pass: true };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // 1. Safety check on user input
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const userInputCheck = safetyCheck(lastUserMessage);
    if (!userInputCheck.pass) {
      console.log(`[AI_IMMUNITY] Blocked user input. Reason: ${userInputCheck.reason}`);
      const immunityResponse = {
        role: 'assistant',
        content: `[System]: My immune system has detected a potential issue with your query and has blocked the request. Reason: ${userInputCheck.reason}`,
      };
      return NextResponse.json({ response: immunityResponse });
    }

    // 2. Call the real Ollama service
    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // Or another model like 'mistral'
        messages: messages,
        stream: false, // For simplicity, not streaming for now
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API request failed with status ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const llmMessageContent = ollamaData.message?.content || '';

    // 3. Safety check on LLM output
    const llmOutputCheck = safetyCheck(llmMessageContent);
    if (!llmOutputCheck.pass) {
        console.log(`[AI_IMMUNITY] Blocked LLM output. Reason: ${llmOutputCheck.reason}`);
        const immunityResponse = {
            role: 'assistant',
            content: `[System]: My own generated response was flagged by my immune system and has been withheld. A new response will be generated if you rephrase your query.`,
        };
        return NextResponse.json({ response: immunityResponse });
    }

    const finalResponse = {
        role: 'assistant',
        content: llmMessageContent,
    };

    return NextResponse.json({ response: finalResponse });

  } catch (error) {
    console.error('[CHAT_API]', error);
    return new NextResponse('Internal Error connecting to the core intelligence.', { status: 500 });
  }
}
