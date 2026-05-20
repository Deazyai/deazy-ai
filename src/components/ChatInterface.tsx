import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Sparkles, 
  History, 
  Settings, 
  Plus, 
  MessageSquare,
  LayoutDashboard,
  Terminal,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { Message, ChatHistoryItem } from '../types';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm Deazy. Let's build something efficient today. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "I'm Deazy. Let's build something efficient today. What's on your mind?",
      timestamp: new Date(),
    }]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history: ChatHistoryItem[] = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Ran into a snag. Let's try that again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { icon: <MessageSquare size={18} />, label: 'Current Session' },
    { icon: <History size={18} />, label: 'Optimization Log' },
    { icon: <Terminal size={18} />, label: 'Automation Scripts' },
    { icon: <LayoutDashboard size={18} />, label: 'Analytics' },
  ];

  const recentChats = [
    "Scale Business v2",
    "Automation Workflow",
    "Clean Code Review",
    "Market Entry Strategy"
  ];

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-card border-r border-white/5 flex flex-col relative z-20"
      >
        <div className="p-6 flex flex-col h-full min-w-[280px]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg">
              <Zap size={16} className="text-black fill-black" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Deazy AI</span>
          </div>

          <button 
            onClick={clearChat}
            className="flex items-center gap-2 w-full bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 mb-8 text-sm font-medium border border-white/5"
          >
            <Plus size={18} />
            New Collaboration
          </button>

          <nav className="space-y-1 mb-8">
            {sidebarItems.map((item, i) => (
              <button key={i} className="flex items-center gap-3 w-full p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm group">
                <span className="opacity-70 group-hover:opacity-100">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex-1">
             <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-3 mb-4 font-bold">Recent Logs</h3>
             <div className="space-y-1">
               {recentChats.map((chat, i) => (
                 <button key={i} className="w-full text-left p-2.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors truncate">
                    {chat}
                 </button>
               ))}
             </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm">
                <Settings size={18} />
                System Settings
             </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Toggle Sidebar Button */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 p-2 bg-card border border-white/10 rounded-lg text-white/60 hover:text-white"
          >
            <Plus size={20} />
          </button>
        )}

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-surface/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            {isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/80">Active Session:</span>
              <span className="text-sm text-emerald-500 font-mono">deazy_main_v1</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Latency: 24ms</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold">
              TD
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 ${message.role === 'assistant' ? 'bg-white text-black' : 'bg-white/10'}`}>
                      {message.role === 'assistant' ? <Zap size={18} className="fill-current" /> : <User size={18} className="text-white/80" />}
                    </div>
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-white text-black font-medium' 
                          : 'bg-card border border-white/5 text-white/90'
                      }`}>
                        {message.content}
                      </div>
                      <span className="text-[10px] text-white/20 font-mono mt-2 px-1 uppercase tracking-widest">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-6"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white text-black">
                    <Zap size={18} className="fill-current" />
                  </div>
                  <div className="bg-card border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-white/20" />
                    <span className="text-sm text-white/30 font-mono italic">Deazy is processing...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-8 bg-gradient-to-t from-surface via-surface to-transparent">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are we building today?"
              className="w-full bg-card border border-white/5 rounded-2xl py-4.5 pl-6 pr-16 text-sm focus:outline-none focus:border-white/20 transition-all duration-300 placeholder:text-white/20 shadow-2xl"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 top-2.5 bottom-2.5 aspect-square bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-lg"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-4 flex justify-center gap-6 opacity-20 hover:opacity-40 transition-opacity">
             <span className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"><Sparkles size={10} /> Automation Mode</span>
             <span className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"><Terminal size={10} /> TypeScript Native</span>
             <span className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"><Zap size={10} /> Flash Model v3</span>
          </div>
        </div>
      </main>
    </div>
  );
}
