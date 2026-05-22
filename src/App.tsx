import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Terminal, Cpu, Zap, RefreshCw, Volume2 } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'chat' | 'automation'>('chat');
  const [nicheInput, setNicheInput] = useState('');
  const [blueprintResult, setBlueprintResult] = useState('');
  const [scriptResult, setScriptResult] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isAutomationLoading, setIsAutomationLoading] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error");
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply || "No response received.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: `Error connecting to engine: ${error.message || error}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgeBlueprint = async () => {
    if (!nicheInput.trim() || isAutomationLoading) return;
    setIsAutomationLoading(true);
    setBlueprintResult('');
    setAudioUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nicheInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Overload");
      setBlueprintResult(data.blueprint);
    } catch (error: any) {
      setBlueprintResult(`❌ Core Processing Failure: ${error.message || error}`);
    } finally {
      setIsAutomationLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!nicheInput.trim() || isScriptLoading) return;
    setIsScriptLoading(true);
    setScriptResult('');
    setAudioUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nicheInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Overload");
      setScriptResult(data.script);
    } catch (error: any) {
      setScriptResult(`❌ Script Module Failure: ${error.message || error}`);
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleCompileAudio = async () => {
    if (!scriptResult || isAudioLoading) return;
    setIsAudioLoading(true);
    setAudioUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scriptResult }),
      });

      if (!response.ok) throw new Error("Audio synthesis failed");

      const audioBlob = await response.blob();
      const localizedUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(localizedUrl);
    } catch (error) {
      console.error("❌ Audio generation fault:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Premium Header Layout */}
      <header className="border-b border-zinc-900/80 bg-zinc-900/40 backdrop-blur-md px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-zinc-100 font-mono">DEAZY AI</h1>
            <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" /> CORE ONLINE
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition-all flex items-center gap-1.5 ${activeTab === 'chat' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400'}`}
          >
            <Terminal className="h-3 w-3" /> CHAT
          </button>
          <button 
            onClick={() => setActiveTab('automation')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition-all flex items-center gap-1.5 ${activeTab === 'automation' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400'}`}
          >
            <Cpu className="h-3 w-3" /> AUTOMATION
          </button>
        </div>
      </header>

      {/* Main Viewport Content Box */}
      <main className="flex-1 max-w-2xl w-full mx-auto relative flex flex-col overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Scrollable Chat History Wrapper */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-indigo-950/50 border-indigo-500/20 text-indigo-400'}`}>
                    {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200'}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[9px] text-zinc-600 font-mono mt-0.5 ${msg.sender === 'user' ? 'text-right' : ''}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-7 w-7 rounded-md flex items-center justify-center bg-indigo-950/50 border border-indigo-500/20 text-indigo-400"><Bot className="h-3.5 w-3.5" /></div>
                  <div className="bg-zinc-900 border border-zinc-800/80 text-zinc-400 rounded-xl px-3.5 py-2 text-xs font-mono flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" /> Computing sequence...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Anchored Input Form Element at bottom layout boundary */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent p-4 pt-10 border-t border-zinc-900/20">
              <form onSubmit={handleSendMessage} className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-1.5 flex gap-2 items-center backdrop-blur-md shadow-lg">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What are we building today?"
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
                  disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white p-2.5 rounded-lg flex items-center justify-center transition-all shrink-0">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Scrollable Automation Interface Container */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                <h3 className="text-[10px] font-mono uppercase tracking-wider font-bold">Automation Command Console</h3>
              </div>
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder="Enter channel niche context or concept idea..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button onClick={handleForgeBlueprint} disabled={isAutomationLoading || !nicheInput.trim()} className="bg-zinc-900 border border-zinc-700 text-zinc-300 py-2.5 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 disabled:opacity-40">
                  <Cpu className={`h-3 w-3 ${isAutomationLoading ? 'animate-spin' : ''}`} /> 1. BLUEPRINT
                </button>
                <button onClick={handleGenerateScript} disabled={isScriptLoading || !nicheInput.trim()} className="bg-zinc-900 border border-zinc-700 text-zinc-300 py-2.5 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 disabled:opacity-40">
                  <Terminal className={`h-3 w-3 ${isScriptLoading ? 'animate-pulse' : ''}`} /> 2. SCRIPT
                </button>
                <button onClick={handleCompileAudio} disabled={isAudioLoading || !scriptResult} className="bg-indigo-600 text-white py-2.5 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm shadow-indigo-600/20">
                  <Volume2 className={`h-3 w-3 ${isAudioLoading ? 'animate-bounce' : ''}`} /> 3. AUDIO VOICE
                </button>
              </div>
            </div>

            {audioUrl && (
              <div className="bg-gradient-to-r from-indigo-950/30 to-zinc-900 border border-indigo-500/20 p-4 rounded-xl flex flex-col gap-2 shadow-md">
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Voiceover Engine Stream Available</span>
                <audio src={audioUrl} controls className="w-full accent-indigo-500" />
              </div>
            )}

            {blueprintResult && (
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">System Deployment Blueprint</span>
                <div className="bg-zinc-950/40 rounded-lg p-3 text-xs leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap border border-zinc-900">{blueprintResult}</div>
              </div>
            )}

            {scriptResult && (
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Narrator Script Deployment Block</span>
                <div className="bg-zinc-950/40 rounded-lg p-3 text-xs leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap border border-zinc-900">{scriptResult}</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
