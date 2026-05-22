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
  const [activeTab, setActiveTab] = useState<'chat' | 'automation'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat box to the latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Core Network Request Tunnel to Google Colab (Streaming Version)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const targetUrl = `${API_BASE_URL}/api/chat`;
    console.log(`🚀 Route initialized: streaming from ${targetUrl}`);

    const aiMessageId = crypto.randomUUID();
    const aiPlaceholderMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiPlaceholderMessage]);

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

      if (!response.body) {
        throw new Error("No response body available for streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let incompleteChunk = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const textSegment = decoder.decode(value, { stream: true });
        const combinedLines = (incompleteChunk + textSegment).split("\n\n");
        
        incompleteChunk = combinedLines.pop() || "";

        for (const line of combinedLines) {
          if (line.startsWith("data: ")) {
            try {
              const rawDataString = line.slice(6).trim();
              const parsedJSON = JSON.parse(rawDataString);

              if (parsedJSON.reply) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, text: msg.text + parsedJSON.reply }
                      : msg
                  )
                );
              }
            } catch (jsonErr) {
              console.log("Skipping partial chunk segment parsing...", jsonErr);
            }
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error("❌ Connection bridge broken:", error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Ran into a snag connecting to the streaming engine. Please confirm your Google Colab backend is active.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId).concat(errorMessage));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header Navbar Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
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

        {/* Dashboard Segment Toggles */}
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-zinc-800 text-white shadow-md shadow-black/40 border border-zinc-700/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            CORE CHAT
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 ${
              activeTab === 'automation'
                ? 'bg-zinc-800 text-white shadow-md shadow-black/40 border border-zinc-700/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            AUTOMATION MODE
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 pt-24 pb-6 px-4 md:px-6 max-w-5xl w-full mx-auto flex flex-col h-[calc(100vh-2rem)]">
        {activeTab === 'chat' ? (
          <div className="flex-1 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl flex flex-col backdrop-blur-sm overflow-hidden shadow-2xl relative">
            
            {/* Conversations Stream Window */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-indigo-950/50 border-indigo-800/40 text-indigo-400'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-inner ${
                        msg.sender === 'user'
                          ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700/40'
                          : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                      {msg.text === '' && isLoading && (
                        <span className="inline-flex gap-1 items-center pt-1 px-1">
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-mono text-zinc-500 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Text Entry Panel */}
            <div className="p-4 bg-zinc-900/40 border-t border-zinc-800/60 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="What are we building today?"
                  className="w-full bg-zinc-950/80 text-sm text-zinc-100 placeholder-zinc-500 pl-4 pr-14 py-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-150 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-md shadow-indigo-600/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Automation Mode Placeholder Layout Container */
          <div className="flex-1 bg-zinc-900/10 border border-zinc-800/40 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-md">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-mono font-bold tracking-wider text-zinc-300 uppercase">
              Automation Modules Offline
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1.5 leading-relaxed">
              Ready to execute scripts. Connect backend triggers to launch autonomous agents for content creation or automated research flows.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
