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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Premium Navigation Header Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              DEAZY AI DASHBOARD
            </h1>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              SYSTEM OPERATIONAL
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Terminal className="h-3.5 w-3.5" /> CORE CHAT
          </button>
          <button 
            onClick={() => setActiveTab('automation')}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-2 ${activeTab === 'automation' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Cpu className="h-3.5 w-3.5" /> AUTOMATION MODE
          </button>
        </div>
      </header>

      {/* Main Container Core */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[450px] max-h-[60vh]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-indigo-950/50 border-indigo-500/30 text-indigo-400'}`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-zinc-500 font-mono mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-indigo-950/50 border border-indigo-500/30 text-indigo-400"><Bot className="h-4 w-4" /></div>
                  <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm flex items-center gap-2 shadow-sm font-mono text-xs">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" /> Processing execution request...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What are we building today?"
                className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition-all"
                disabled={isLoading}
              />
              <button type="submit" disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Restored Multi-Module Automation System Interface */
          <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-1">
            <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl backdrop-blur-sm shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="h-4 w-4" />
                <h3 className="text-xs font-mono uppercase tracking-wider">Automation Control Panel</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">Input your video concept niche or topic. The engine will seamlessly generate tactical assets and audio renderings.</p>
              
              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Channel Niche / Topic Idea</label>
                <input
                  type="text"
                  value={nicheInput}
                  onChange={(e) => setNicheInput(e.target.value)}
                  placeholder="e.g., Luxury Car Reviews, Military Intelligence..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Three distinct action points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handleForgeBlueprint}
                  disabled={isAutomationLoading || !nicheInput.trim()}
                  className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 py-3 px-4 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
                >
                  <Cpu className={`h-4 w-4 text-indigo-400 ${isAutomationLoading ? 'animate-spin' : ''}`} />
                  1. FORGE BLUEPRINT
                </button>
                <button
                  onClick={handleGenerateScript}
                  disabled={isScriptLoading || !nicheInput.trim()}
                  className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 py-3 px-4 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
                >
                  <Terminal className={`h-4 w-4 text-indigo-400 ${isScriptLoading ? 'animate-pulse' : ''}`} />
                  2. BUILD SCRIPT
                </button>
                <button
                  onClick={handleCompileAudio}
                  disabled={isAudioLoading || !scriptResult}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-md shadow-indigo-600/10"
                >
                  <Volume2 className={`h-4 w-4 ${isAudioLoading ? 'animate-bounce' : ''}`} />
                  3. GENERATE AUDIO
                </button>
              </div>
            </div>

            {/* Dynamic Rendered Audio Frame Block Box */}
            {audioUrl && (
              <div className="bg-gradient-to-r from-indigo-950/40 to-zinc-900 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl"><Volume2 className="h-5 w-5 animate-pulse" /></div>
                  <div>
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-200">Voiceover Render Complete</h4>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Asset deployment package ready for download</p>
                  </div>
                </div>
                <audio src={audioUrl} controls className="w-full sm:w-auto accent-indigo-500 bg-transparent rounded-lg" />
              </div>
            )}

            {blueprintResult && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 shadow-lg space-y-3">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Asset Framework Package Blueprint</h4>
                <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap">
                  {blueprintResult}
                </div>
              </div>
            )}

            {scriptResult && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 shadow-lg space-y-3">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Cinematic Narration Script</h4>
                <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap">
                  {scriptResult}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
