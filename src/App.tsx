import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Terminal, Cpu, Zap, Copy, Check, FileText } from 'lucide-react';

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
  
  // Automation and Scripting states
  const [automationInput, setAutomationInput] = useState('');
  const [automationResult, setAutomationResult] = useState('');
  const [scriptResult, setScriptResult] = useState('');
  const [isAutomating, setIsAutomating] = useState(false);
  const [isScripting, setIsScripting] = useState(false);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyBlueprint = () => {
    if (!automationResult) return;
    navigator.clipboard.writeText(automationResult);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const handleCopyScript = () => {
    if (!scriptResult) return;
    navigator.clipboard.writeText(scriptResult);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Chat Submission Handler (Streaming)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      if (!response.body) throw new Error("No stream body available.");

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
                    msg.id === aiMessageId ? { ...msg, text: msg.text + parsedJSON.reply } : msg
                  )
                );
              }
            } catch (err) {}
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Ran into a snag connecting to the streaming engine.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId).concat(errorMessage));
    }
  };

  // YouTube Automation Blueprint Generation Handler
  const handleRunAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!automationInput.trim() || isAutomating) return;

    const topicText = automationInput.trim();
    setIsAutomating(true);
    setAutomationResult('');
    setScriptResult(''); // Reset script when a new niche runs

    try {
      const response = await fetch(`${API_BASE_URL}/api/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicText }),
      });

      const data = await response.json();
      if (data.blueprint) {
        setAutomationResult(data.blueprint);
      } else if (data.error) {
        setAutomationResult(`❌ Core Processing Failure: ${data.error}`);
      }
    } catch (err) {
      setAutomationResult("❌ System Error: Unable to establish contact with the backend blueprint module.");
    } finally {
      setIsAutomating(false);
    }
  };

  // Full Cinematic Script Generator Trigger
  const handleGenerateFullScript = async () => {
    if (!automationInput.trim() || isScripting) return;
    
    setIsScripting(true);
    setScriptResult('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: automationInput.trim() }),
      });

      const data = await response.json();
      if (data.script) {
        setScriptResult(data.script);
      } else if (data.error) {
        setScriptResult(`❌ Script Error: ${data.error}`);
      }
    } catch (err) {
      setScriptResult("❌ System Error: Unable to communicate with script production route.");
    } finally {
      setIsScripting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header Bar */}
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

        {/* Tab Selection Switches */}
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 ${
              activeTab === 'chat' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            CORE CHAT
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 ${
              activeTab === 'automation' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            AUTOMATION MODE
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 pt-24 pb-6 px-4 md:px-6 max-w-5xl w-full mx-auto flex flex-col h-[calc(100vh-2rem)]">
        {activeTab === 'chat' ? (
          <div className="flex-1 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl flex flex-col backdrop-blur-sm overflow-hidden shadow-2xl relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${msg.sender === 'user' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-indigo-950/50 border-indigo-800/40 text-indigo-400'}`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-inner ${msg.sender === 'user' ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700/40' : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 rounded-tl-none'}`}>
                      {msg.text}
                      {msg.text === '' && isLoading && (
                        <span className="inline-flex gap-1 items-center pt-1 px-1">
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-mono text-zinc-500 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-zinc-900/40 border-t border-zinc-800/60 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="What are we building today?"
                  className="w-full bg-zinc-950/80 text-sm text-zinc-100 placeholder-zinc-500 pl-4 pr-14 py-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-60 shadow-inner"
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
          /* Multi-Module Active Automation and Scripting Panel */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 overflow-hidden min-h-0">
            {/* Control Sidebar Left */}
            <div className="md:col-span-2 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col backdrop-blur-sm shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                <h2 className="text-xs font-bold tracking-wider font-mono text-zinc-400 uppercase">Automation Engine</h2>
              </div>

              <form onSubmit={handleRunAutomation} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Target Niche Idea</label>
                  <input
                    type="text"
                    value={automationInput}
                    onChange={(e) => setAutomationInput(e.target.value)}
                    disabled={isAutomating || isScripting}
                    placeholder="e.g., Luxury Watches, Military Tech"
                    className="w-full bg-zinc-950/60 text-xs text-zinc-100 placeholder-zinc-600 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!automationInput.trim() || isAutomating || isScripting}
                  className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 border border-zinc-800 flex items-center justify-center gap-2 transition"
                >
                  <Cpu className={`h-3.5 w-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                  {isAutomating ? 'FORGING BLUEPRINT...' : '1. FORGE BLUEPRINT'}
                </button>
              </form>

              <hr className="border-zinc-800/60" />

              {/* Second Action Button to Generate Full Length Script */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Asset Extension</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                    Once your high-level blueprint has generated, run the Script Module to produce cinematic narrator text scripts.
                  </p>
                </div>
                <button
                  onClick={handleGenerateFullScript}
                  disabled={!automationResult || isScripting || isAutomating}
                  className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border-zinc-900 shadow-md shadow-indigo-600/10 border border-indigo-500/20 flex items-center justify-center gap-2 transition"
                >
                  <FileText className={`h-3.5 w-3.5 ${isScripting ? 'animate-pulse' : ''}`} />
                  {isScripting ? 'COMPILING FULL SCRIPT...' : '2. GENERATE FULL SCRIPT'}
                </button>
              </div>
            </div>

            {/* Split Display Panels Window Right */}
            <div className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Box A: High-Level Titles/Hooks Blueprint Output */}
              <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl flex flex-col min-h-[220px] max-h-[300px] shadow-xl overflow-hidden shrink-0">
                <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Asset Blueprint Package</span>
                  {automationResult && (
                    <button onClick={handleCopyBlueprint} className="p-1 rounded hover:bg-zinc-800 text-zinc-400">
                      {copiedBlueprint ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <div className="flex-1 p-4 font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950/20 whitespace-pre-wrap overflow-y-auto">
                  {isAutomating ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-[11px] animate-pulse">Running blueprint engine query...</div>
                  ) : automationResult ? automationResult : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-[11px]">Run Step 1 to trigger high-level video assets.</div>
                  )}
                </div>
              </div>

              {/* Box B: Full Narrative Production Script Output */}
              <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl flex flex-col flex-1 min-h-[280px] shadow-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Cinematic Narration Script</span>
                  {scriptResult && (
                    <button onClick={handleCopyScript} className="p-1 rounded hover:bg-zinc-800 text-zinc-400">
                      {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <div className="flex-1 p-4 font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950/20 whitespace-pre-wrap overflow-y-auto">
                  {isScripting ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-[11px] animate-pulse">Expanding outline into full narration draft...</div>
                  ) : scriptResult ? scriptResult : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-[11px]">Generate blueprint first, then unlock Step 2 script compilation.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
