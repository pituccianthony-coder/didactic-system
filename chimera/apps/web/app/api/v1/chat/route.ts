import { NextResponse } from 'next/server';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://ollama:11434';
const safetyCheck = (text: string): { pass: boolean; reason?: string } => {
  const forbiddenWords = ['illegal', 'harmful', 'dangerous'];
  const lowercasedText = text.toLowerCase();
  for (const word of forbiddenWords) { if (lowercasedText.includes(word)) return { pass: false, reason: `Input contains sensitive term: ''${word}''` }; }
  return { pass: true };
};
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const userInputCheck = safetyCheck(lastUserMessage);
    if (!userInputCheck.pass) {
      const immunityResponse = { role: 'assistant', content: `[System]: My immune system has detected a potential issue with your query and has blocked the request. Reason: ${userInputCheck.reason}` };
      return NextResponse.json({ response: immunityResponse });
    }
    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'llama3', messages: messages, stream: false }) });
    if (!ollamaResponse.ok) throw new Error(`Ollama API request failed`);
    const ollamaData = await ollamaResponse.json();
    const llmMessageContent = ollamaData.message?.content || '';
    const llmOutputCheck = safetyCheck(llmMessageContent);
    if (!llmOutputCheck.pass) {
        const immunityResponse = { role: 'assistant', content: `[System]: My own generated response was flagged by my immune system and has been withheld.` };
        return NextResponse.json({ response: immunityResponse });
    }
    const finalResponse = { role: 'assistant', content: llmMessageContent };
    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    return new NextResponse('Internal Error connecting to the core intelligence.', { status: 500 });
  }
}
