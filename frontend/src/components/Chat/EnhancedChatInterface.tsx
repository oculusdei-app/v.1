import React, { useEffect, useRef, useState } from 'react';
import ChatMessage, { Message } from './ChatMessage';

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

const EnhancedChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
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
  const [mode, setMode] = useState<'command' | 'reflect' | 'plan'>('command');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist history to localStorage and keep scroll at bottom
  useEffect(() => {
    localStorage.setItem('aid_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('aid_settings', JSON.stringify(settings));
    setShowSettings(false);
    showTempToast('Settings saved');
  };

  const showTempToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
      showTempToast('Conversation cleared');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const prompt = input;
    const userMsg: Message = {
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
          mode: mode,
          openai_key: settings.openAiKey,
          anthropic_key: settings.anthropicKey
        })
      });

      const data = await res.json();
      const reply: string = data.message || data.response || data.content || '';
      const assistantMsg: Message = {
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
            type: mode === 'reflect' ? 'reflection' : 'interaction',
            content: `${prompt}\n---\n${reply}`,
            metadata: { 
              mode, 
              model: settings.model,
              temperature: settings.temperature
            }
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

  return (
    <div className="flex flex-col h-full relative bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
        <div className="flex space-x-2 w-full sm:w-auto">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'command' | 'reflect' | 'plan')}
            className="form-input px-2 sm:px-3 py-1 text-sm w-full sm:w-32"
          >
            <option value="command">Command</option>
            <option value="reflect">Reflect</option>
            <option value="plan">Plan</option>
          </select>
          <div className="flex items-center ml-2 sm:ml-0">
            <div className={`w-2 h-2 rounded-full mr-2 ${mode === 'command' ? 'bg-blue-500' : mode === 'reflect' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium">
              {mode === 'command' ? 'Command Mode' : mode === 'reflect' ? 'Reflection Mode' : 'Planning Mode'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearConversation}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Clear conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-3 bg-gray-50/50 dark:bg-dark-900/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 space-y-4 sm:space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 dark:from-indigo-600 dark:to-blue-700 flex items-center justify-center shadow-lg p-5 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-indigo-700 dark:text-indigo-300">Start a conversation</div>
            <div className="text-sm sm:text-base max-w-md text-center bg-white/70 dark:bg-dark-800/30 p-3 sm:p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
              Ask me questions about your schedule, projects, or request reflections on your progress.
            </div>
            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:space-x-3 mt-2 w-full px-4 sm:px-0">
              <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm hover:shadow transition-all duration-200 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn More
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started
              </button>
            </div>
          </div>
        )}
        
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        <div ref={messagesEndRef} />
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-indigo-100/50 dark:border-indigo-800/30 p-3 sm:p-4 md:p-5 bg-gradient-to-b from-indigo-50/30 to-white/90 dark:from-indigo-900/10 dark:to-dark-900/80">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={`Type your message in ${mode} mode...`}
              className="form-input flex-1 min-h-[48px] max-h-32 resize-none py-2 sm:py-3 pr-12 shadow-sm hover:shadow-md transition-all duration-300 focus:shadow-md rounded-xl border-indigo-200/50 dark:border-indigo-700/30 pl-3 sm:pl-4"
              style={{ 
                height: 'auto',
                minHeight: '48px',
                overflowY: input.split('\n').length > 1 ? 'auto' : 'hidden',
                width: '100%'
              }}
            />
            <span className={`absolute right-2 sm:right-3 bottom-2 sm:bottom-3 text-xs px-1.5 sm:px-2 py-0.5 rounded-full transition-all ${
              mode === 'command' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30' 
                : mode === 'reflect' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800/30'
            }`}>
              {mode}
            </span>
          </div>
          <button 
            onClick={sendMessage} 
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-xl px-4 sm:px-6 h-[48px] flex items-center justify-center hover:scale-105 transform transition-all duration-300 active:scale-95 shadow-sm hover:shadow min-w-[48px] sm:min-w-[64px]"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs text-gray-500 dark:text-gray-400 px-1">
          <div className="bg-white/70 dark:bg-dark-800/30 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm w-full sm:w-auto">
            <span>Press <span className="text-indigo-600 dark:text-indigo-400 font-medium">Enter</span> to send, <span className="text-indigo-600 dark:text-indigo-400 font-medium">Shift+Enter</span> for new line</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/70 dark:bg-dark-800/30 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${mode === 'command' ? 'bg-blue-500' : mode === 'reflect' ? 'bg-purple-500' : 'bg-green-500'} animate-pulse-slow`}></span>
            <span>Mode: <span className="font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span></span>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="card w-full max-w-[95%] sm:max-w-lg scale-in elevation-3">
            <div className="card-header flex justify-between items-center bg-gradient-to-r from-white to-gray-50 dark:from-dark-800 dark:to-dark-700">
              <h3 className="font-semibold text-lg text-brand-800 dark:text-brand-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Assistant Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="btn-icon-ghost text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="card-body space-y-4 sm:space-y-5 p-4 sm:p-5">
              <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                <label className="form-label flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={e => setSettings({ ...settings, model: e.target.value as DialogSettings['model'] })}
                  className="form-input shadow-sm hover:shadow transition-shadow duration-200"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <label className="form-label flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  <span className="text-blue-600 dark:text-blue-400">Precise</span>
                  <span className="text-purple-600 dark:text-purple-400">Balanced</span>
                  <span className="text-red-600 dark:text-red-400">Creative</span>
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <label className="form-label flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="50"
                  max="4000"
                  value={settings.maxTokens}
                  onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value, 10) })}
                  className="form-input shadow-sm hover:shadow transition-shadow duration-200"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <label className="form-label flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.openAiKey}
                  onChange={e => setSettings({ ...settings, openAiKey: e.target.value })}
                  className="form-input shadow-sm hover:shadow transition-shadow duration-200"
                  placeholder="sk-..."
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                <label className="form-label flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={settings.anthropicKey}
                  onChange={e => setSettings({ ...settings, anthropicKey: e.target.value })}
                  className="form-input shadow-sm hover:shadow transition-shadow duration-200"
                  placeholder="sk-ant-..."
                />
              </div>
            </div>
            <div className="p-4 flex justify-end space-x-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-dark-800/50">
              <button onClick={saveSettings} className="btn-primary hover:scale-105 transform transition-transform active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </button>
              <button onClick={() => setShowSettings(false)} className="btn-secondary hover:scale-105 transform transition-transform active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-dark-800/90 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl shadow-lg z-50 slide-in-bottom flex items-center space-x-2 sm:space-x-3 border border-dark-700/50 backdrop-blur-sm max-w-[90%] sm:max-w-md">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatInterface;