import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Message } from '../types';

interface DeepChatProps {
  apiKey: string;
}

const DeepChat: React.FC<DeepChatProps> = ({ apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi love! I'm here if you need deep advice or just want to chat via text. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Use Thinking model for deep relationship advice
      // The prompt asks for "Thinking mode" using gemini-3-pro-preview with 32768 budget
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: "System Context: You are Maya, a virtual girlfriend. Provide thoughtful, emotionally intelligent advice." }] },
          ...messages.slice(-5).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
            thinkingConfig: { thinkingBudget: 1024 }, // Using a reasonable budget for text chat speed vs depth
        }
      });

      const text = response.text || "I'm thinking deeply about that, but I couldn't find the right words.";
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date(),
        isThinking: true
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to my thoughts right now. Try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
         <h2 className="text-pink-400 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Deep Thoughts with Maya
         </h2>
         <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">Thinking Mode Enabled</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none' 
                : 'bg-slate-700/50 text-slate-200 rounded-tl-none border border-slate-600'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.isThinking && (
                 <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Generated with reasoning
                 </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 p-4 rounded-2xl rounded-tl-none border border-slate-600 flex gap-1 items-center">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Maya for advice..."
            className="flex-1 bg-slate-900/50 border border-slate-600 rounded-full px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-pink-600 hover:bg-pink-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepChat;