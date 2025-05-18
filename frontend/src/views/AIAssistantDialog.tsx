import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

/**
 * AIAssistantDialog
 * -----------------
 * Chat-like interface for conversing with the AI assistant.
 * Maintains local message history, persists settings, and logs
 * assistant replies to the backend memory API.
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface DialogSettings {
  model: 'gpt-4o' | 'claude-3';
  temperature: number;
  maxTokens: number;
  openAiKey: string;
  anthropicKey: string;
}

const MEMORY_API = import.meta.env.VITE_MEMORY_API_URL || 'http://localhost:8001';

const defaultSettings: DialogSettings = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 300,
  openAiKey: '',
  anthropicKey: ''
};

const AIAssistantDialog: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('aid_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<DialogSettings>(() => {
    const saved = localStorage.getItem('aid_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  // Persist history to localStorage and keep scroll at bottom
  useEffect(() => {
    localStorage.setItem('aid_messages', JSON.stringify(messages));
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('aid_settings', JSON.stringify(settings));
    setShowSettings(false);
  };

  const showTempToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const prompt = input;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/proxy/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          prompt,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          openai_key: settings.openAiKey,
          anthropic_key: settings.anthropicKey
        })
      });

      const data = await res.json();
      const reply: string = data.message || data.response || data.content || '';
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      try {
        await fetch(`${MEMORY_API}/memory/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'interaction',
            content: `${prompt}\n---\n${reply}`
          })
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

  const renderMessage = (msg: ChatMessage) => {
    const html = { __html: marked.parse(msg.content) };
    const base = 'max-w-lg px-4 py-2 rounded-lg inline-block whitespace-pre-wrap';
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

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEnd} />
      </div>
      <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type your message..."
            className="form-input flex-1"
          />
          <button onClick={sendMessage} className="btn-primary" disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-secondary">
            Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card w-full max-w-md slide-in">
            <div className="card-header flex justify-between items-center">
              <h3 className="font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="btn-secondary text-sm px-2 py-1">
                X
              </button>
            </div>
            <div className="card-body space-y-3">
              <label className="form-label">Model</label>
              <select
                value={settings.model}
                onChange={e => setSettings({ ...settings, model: e.target.value as DialogSettings['model'] })}
                className="form-input"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3">Claude 3</option>
              </select>

              <label className="form-label">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="form-input"
              />

              <label className="form-label">Max Tokens</label>
              <input
                type="number"
                min="50"
                max="4000"
                value={settings.maxTokens}
                onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value, 10) })}
                className="form-input"
              />

              <label className="form-label">OpenAI API Key</label>
              <input
                type="text"
                value={settings.openAiKey}
                onChange={e => setSettings({ ...settings, openAiKey: e.target.value })}
                className="form-input"
              />

              <label className="form-label">Anthropic API Key</label>
              <input
                type="text"
                value={settings.anthropicKey}
                onChange={e => setSettings({ ...settings, anthropicKey: e.target.value })}
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

export default AIAssistantDialog;
