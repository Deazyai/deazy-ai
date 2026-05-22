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
  // Chat Core States
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

  // Automation Module States
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

  // Chat Route Trigger
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
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply || "No response received.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Ran into a snag connecting to the engine. Confirm Google Colab is running.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Blueprint Generator Execution
  const handleForgeBlueprint = async () => {
    if (!nicheInput.trim() || isAutomationLoading) return;
    setIsAutomationLoading(true);
    setBlueprintResult('');
    setScriptResult('');
    setAudioUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nicheInput.trim() }),
      });

      const data = await response.json();
      setBlueprintResult(data.blueprint);
    } catch (error) {
      setBlueprintResult("❌ Blueprint Generation Failure.");
    } finally {
      setIsAutomationLoading(false);
    }
  };

  // 2. Script Generator Execution
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
      setScriptResult(data.script);
    } catch (error) {
      setScriptResult("❌ Script Module Failure.");
    } finally {
      setIsScriptLoading(false);
    }
  };

  // 3. Audio Voiceover Generation Engine Trigger
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

      // Transmit blob binary data streams straight into localized HTML5 playback objects
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
      {/* Navbar Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wide text-white">DEAZY AI DASHBOARD</h1>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> CORE BALANCED OPERATIONAL
            </p>
          </div>
        </div>

        {/* Tab Selection Switches */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-lg text-xs font-medium font-mono ${activeTab === 'chat' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
            <Terminal className="h-3.5 w-3.5 inline mr-1" /> CORE CHAT
          </button>
          <button onClick={() => setActiveTab('automation')} className={`px-4 py-2 rounded-lg text-xs font-medium font-mono ${activeTab === 'automation' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
            <Cpu className="h-3.5 w-3.5 inline mr-1" /> AUTOMATION
          </button>
        </div>
      </header>

      {/* Main Framework Frame */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[450px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap bg-zinc-900 border border-zinc-800">
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What are we building today?" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-indigo-600 p-3 rounded-xl"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        ) : (
          /* Multi-Module Automation Pipeline Control Interface Layout */
          <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-1">
            <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="h-4 w-4" />
                <h3 className="text-xs font-mono uppercase tracking-wider">Automation Module Operations</h3>
              </div>
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder="Enter topic/niche idea..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button onClick={handleForgeBlueprint} disabled={isAutomationLoading || !nicheInput.trim()} className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 py-3 rounded-xl font-mono text-xs text-zinc-300">
                  {isAutomationLoading ? 'FORGING...' : '1. FORGE BLUEPRINT'}
                </button>
                <button onClick={handleGenerateScript} disabled={isScriptLoading || !nicheInput.trim()} className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 py-3 rounded-xl font-mono text-xs text-zinc-300">
                  {isScriptLoading ? 'COMPILING...' : '2. BUILD SCRIPT'}
                </button>
                <button onClick={handleCompileAudio} disabled={isAudioLoading || !scriptResult} className="bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-mono text-xs font-bold text-white disabled:opacity-30">
                  {isAudioLoading ? 'SYNTHESIZING...' : '3. GENERATE AUDIO'}
                </button>
              </div>
            </div>

            {/* Live Audio Playback Dock Panel */}
            {audioUrl && (
              <div className="bg-gradient-to-r from-indigo-950/40 to-zinc-900 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <Volume2 className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-200">Voiceover Render Complete</h4>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Asset deployment package ready for editing</p>
                  </div>
                </div>
                <audio src={audioUrl} controls className="w-full sm:w-auto accent-indigo-500 bg-transparent rounded-lg" />
              </div>
            )}

            {blueprintResult && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-2">
                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Asset Package Blueprint</h4>
                <div className="bg-zinc-950/80 p-4 rounded-xl text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{blueprintResult}</div>
              </div>
            )}

            {scriptResult && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-2">
                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cinematic Narration Script</h4>
                <div className="bg-zinc-950/80 p-4 rounded-xl text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{scriptResult}</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
