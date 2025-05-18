import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import {
  fetchGoals,
  fetchMemoryFeed,
  fetchInsights,
  fetchProjects,
  sendAssistantMessage,
  GoalEntry,
  MemoryEntry,
  ProjectEntry,
  InsightEntry,
} from '../api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * CommandDashboard
 * ----------------
 * Unified interface for interacting with the Oculus Dei assistant.
 * Displays goals, chat dialog, memory feed, project tracker and insights.
 */
const CommandDashboard: React.FC = () => {
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [memoryFeed, setMemoryFeed] = useState<MemoryEntry[]>([]);
  const [insights, setInsights] = useState<InsightEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refreshAll = async () => {
    const [g, m, i, p] = await Promise.all([
      fetchGoals(),
      fetchMemoryFeed(),
      fetchInsights(),
      fetchProjects(),
    ]).catch(() => [[], [], [], []]);
    setGoals(g as GoalEntry[]);
    setMemoryFeed(m as MemoryEntry[]);
    setInsights(i as InsightEntry[]);
    setProjects(p as ProjectEntry[]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, user]);
    setInput('');
    setLoading(true);
    try {
      const data = await sendAssistantMessage({ message: user.content, mode: 'command' });
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error('assistant error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderChatMessage = (msg: ChatMessage) => {
    const html = { __html: marked.parse(msg.content) };
    const base = 'max-w-lg px-3 py-2 rounded-lg inline-block whitespace-pre-wrap';
    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="text-right">
          <div className={`${base} bg-blue-600 text-white ml-auto`}>{msg.content}</div>
        </div>
      );
    }
    return (
      <div key={msg.id}>
        <div
          className={`${base} bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          dangerouslySetInnerHTML={html}
        />
      </div>
    );
  };

  const filteredFeed = memoryFeed.filter((e) =>
    filter ? e.type?.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className="h-screen bg-gray-900 text-gray-100 p-4 grid gap-4 grid-rows-[auto_1fr_auto] grid-cols-3">
      {/* Goals Panel */}
      <header className="row-start-1 col-span-3 flex items-center justify-between bg-gray-800 p-3 rounded">
        <div className="flex space-x-4 overflow-x-auto">
          {goals.map((g) => (
            <span key={g.id} className="px-3 py-1 bg-blue-700 rounded text-sm whitespace-nowrap">
              {g.content}
            </span>
          ))}
          {!goals.length && <span className="text-gray-400 text-sm">No goals</span>}
        </div>
        <button className="text-gray-400 hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 100-8 4 4 0 000 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3" />
          </svg>
        </button>
      </header>

      {/* Assistant Dialog */}
      <section className="row-start-2 col-span-2 bg-gray-800 rounded flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(renderChatMessage)}
          <div ref={messagesEnd} />
        </div>
        <div className="border-t border-gray-700 p-3 flex space-x-2">
          <textarea
            className="form-input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask the assistant..."
          />
          <button className="btn-primary" onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </section>

      {/* Memory Feed */}
      <aside className="row-start-2 col-start-3 bg-gray-800 rounded p-3 flex flex-col">
        <div className="mb-2 flex items-center">
          <input
            type="text"
            placeholder="Filter type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input flex-1 mr-2"
          />
          <button onClick={() => refreshAll()} className="btn-secondary text-sm">Refresh</button>
        </div>
        <div className="overflow-y-auto space-y-2 flex-1">
          {filteredFeed.map((m) => (
            <div key={m.id} className="bg-gray-700 p-2 rounded text-sm">
              <div className="text-gray-400 text-xs mb-1">{m.type}</div>
              <div>{m.content}</div>
            </div>
          ))}
          {!filteredFeed.length && <div className="text-gray-400 text-sm">No memories</div>}
        </div>
      </aside>

      {/* Project Tracker */}
      <section className="row-start-3 col-span-2 bg-gray-800 rounded p-3 overflow-y-auto max-h-48">
        <h3 className="font-semibold mb-2">Projects</h3>
        {projects.map((p) => (
          <div key={p.id} className="mb-1">
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-400 text-sm">{p.description}</div>
          </div>
        ))}
        {!projects.length && <div className="text-gray-400 text-sm">No projects</div>}
      </section>

      {/* Insight Panel */}
      <aside className="row-start-3 col-start-3 bg-gray-800 rounded p-3 overflow-y-auto max-h-48">
        <h3 className="font-semibold mb-2">Insights</h3>
        {insights.map((i) => (
          <div key={i.id} className="mb-2 text-sm">
            {i.content}
          </div>
        ))}
        {!insights.length && <div className="text-gray-400 text-sm">No insights</div>}
      </aside>
    </div>
  );
};

export default CommandDashboard;
