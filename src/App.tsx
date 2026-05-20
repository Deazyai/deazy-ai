
   
   import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Terminal, Cpu, Zap, RefreshCw } from 'lucide-react';

// 1. Setup the direct bridge link pointing to your Netlify variable / Ngrok tunnel
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I am your custom Deazy AI engine. How can I help you automate or build today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat box to the latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. The Core Network Request Tunnel to Google Colab
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput(''); // Clear text input box instantly

    // Add user's message bubble to the screen layout
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const targetUrl = `${API_BASE_URL}/api/chat`;
    console.log(`📡 Route initialized: connecting to ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`Server status error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add Gemini's response bubble to the screen layout
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("❌ Connection bridge broken:", error);
      
      // Gracefully show the snag fallback bubble to the user
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Ran into a snag connecting to the engine. Please confirm that your Google Colab backend server cell is running!",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header Navbar Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              DEAZY AI DASHBOARD
            </h1>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              SYSTEM OPERATIONAL
            </p>
          </div>
        </div>
        
        {/* Status Mode Metadata Indicators */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-zinc-400 bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-800/60">
          <div className="flex items-center gap-1.5"><Cpu className="h-3 w-3 text-indigo-400" /> AUTOMATION MODE</div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5"><Terminal className="h-3 w-3 text-violet-400" /> TYPESCRIPT NATIVE</div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-400" /> FLASH MODEL V3</div>
        </div>
      </header>

      {/* Live Main Chat Presentation Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-180px)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
              msg.sender === 'user' 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                : 'bg-indigo-950/60 border-indigo-800/50 text-indigo-400'
            }`}>
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            
            <div className={`flex flex-col gap-1.5`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              <span className={`text-[10px] text-zinc-500 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic Loading Message Thinking State Bubble */}
        {isLoading && (
          <div className="flex gap-4 self-start max-w-[85%]">
            <div className="h-8 w-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Submit Chat Box Area Footbar */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 p-4 sticky bottom-0 z-40">
        <form onSubmit={handleSendMessage} className="max-w-4xl w-full mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="What are we building today?"
            className="w-full bg-zinc-900/90 border border-zinc-800 text-sm rounded-xl pl-4 pr-12 py-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </footer>
    </div>
  );
} 
