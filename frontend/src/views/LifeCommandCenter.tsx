import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

/**
 * LifeCommandCenter
 * ------------------
 * Core Oculus Dei interface for interacting with the life assistant.
 * Provides chat-based interaction, memory logging, and basic project/goal
 * visualization.
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Settings {
  model: 'gpt-4' | 'gpt-4o' | 'claude-3';
  temperature: number;
  maxTokens: number;
  openAiKey: string;
  anthropicKey: string;
}

interface ProjectSummary {
  name: string;
  description: string;
  [key: string]: unknown;
}

interface GoalEntry {
  id: string;
  content: string;
  timestamp: string;
}

const MEMORY_API = 'http://localhost:8001';
const PLAN_API = 'http://localhost:8000';

const defaultSettings: Settings = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 300,
  openAiKey: '',
  anthropicKey: '',
};

const LifeCommandCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ldc_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'command' | 'reflect' | 'plan'>('command');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('ldc_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('ldc_messages', JSON.stringify(messages));
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch sidebar data on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${PLAN_API}/projects`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    };

    const fetchGoals = async () => {
      try {
        const res = await fetch(`${MEMORY_API}/memory/type/goal?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setGoals(data.entries || []);
        }
      } catch (e) {
        console.error('Failed to load goals', e);
      }
    };

    fetchProjects();
    fetchGoals();
  }, []);

  // Persist settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('ldc_settings', JSON.stringify(settings));
    setShowSettings(false);
  };

  const showTempToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/proxy/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: settings.model,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          mode,
          openai_key: settings.openAiKey,
          anthropic_key: settings.anthropicKey,
        }),
      });

      const data = await res.json();
      const replyText: string = data.response || data.content || '';
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        await fetch(`${MEMORY_API}/memory/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: mode === 'reflect' ? 'reflection' : 'interaction',
            content: replyText,
            metadata: { mode },
          }),
        });
        showTempToast('Saved to memory');
      } catch (err) {
        console.error('Memory save failed', err);
        showTempToast('Memory save failed');
      }
    } catch (err) {
      console.error('Assistant error', err);
      showTempToast('Assistant error');
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

  const renderMessage = (msg: Message) => {
    const html = { __html: marked.parse(msg.content) };
    const baseClasses =
      'max-w-lg px-4 py-2 rounded-lg inline-block whitespace-pre-wrap';
    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="text-right">
          <div className={`${baseClasses} bg-blue-600 text-white ml-auto`}> 
            {msg.content}
          </div>
        </div>
      );
    }
    return (
      <div key={msg.id}>
        <div
          className={`${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          dangerouslySetInnerHTML={html}
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen relative">
      {/* Chat Column */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(renderMessage)}
          <div ref={messagesEnd} />
        </div>
        <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-end space-x-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'command' | 'reflect' | 'plan')}
              className="form-input w-32"
            >
              <option value="command">Command</option>
              <option value="reflect">Reflect</option>
              <option value="plan">Plan</option>
            </select>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Type your message..."
              className="form-input flex-1"
            />
            <button
              onClick={sendMessage}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '...' : 'Send'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Active Project</h3>
          </div>
          <div className="card-body text-sm space-y-1">
            {projects.length ? (
              <>
                <div className="font-medium">{projects[0].name}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {projects[0].description}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No projects</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Today's Goals</h3>
          </div>
          <div className="card-body text-sm space-y-1">
            {goals.map((g) => (
              <div key={g.id}>• {g.content}</div>
            ))}
            {!goals.length && <div className="text-gray-500">No goals</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Time Focus Map</h3>
          </div>
          <div className="card-body text-sm text-gray-500">Planned...</div>
        </div>
      </aside>

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card w-full max-w-md slide-in">
            <div className="card-header flex justify-between items-center">
              <h3 className="font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="btn-secondary text-sm px-2 py-1">X</button>
            </div>
            <div className="card-body space-y-3">
              <label className="form-label">Model</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value as Settings['model'] })}
                className="form-input"
              >
                <option value="gpt-4">OpenAI GPT-4</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3">Claude 3</option>
              </select>

              <label className="form-label">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="form-input"
              />

              <label className="form-label">Max Tokens</label>
              <input
                type="number"
                min="50"
                max="4000"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value, 10) })}
                className="form-input"
              />

              <label className="form-label">OpenAI API Key</label>
              <input
                type="text"
                value={settings.openAiKey}
                onChange={(e) => setSettings({ ...settings, openAiKey: e.target.value })}
                className="form-input"
              />

              <label className="form-label">Anthropic API Key</label>
              <input
                type="text"
                value={settings.anthropicKey}
                onChange={(e) => setSettings({ ...settings, anthropicKey: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="p-4 flex justify-end space-x-2">
              <button onClick={saveSettings} className="btn-primary">Save</button>
              <button onClick={() => setShowSettings(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default LifeCommandCenter;

