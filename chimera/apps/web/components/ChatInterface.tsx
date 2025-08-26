'use client';

import { useState, FormEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// A simple event emitter for cross-component communication
const eventBus = {
  dispatch(event: string, data?: any) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantMessage = data.response as Message;
      setMessages((prev) => [...prev, assistantMessage]);

      // --- Sensory Feedback ---
      if (assistantMessage.role === 'assistant' && !assistantMessage.content.startsWith('[System]')) {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(100);
        }
        eventBus.dispatch('assistant-insight');
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ height: '70vh', overflowY: 'auto', border: '1px solid #444', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#333',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          style={{ width: 'calc(100% - 80px)', padding: '10px', backgroundColor: '#222', border: '1px solid #444', color: 'white' }}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={isLoading} style={{ width: '70px', padding: '10px', marginLeft: '10px' }}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
