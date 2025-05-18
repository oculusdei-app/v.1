import React from 'react';
import { marked } from 'marked';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end mb-3 sm:mb-4 animate-fade-in">
        <div className="flex items-end">
          <div className="order-2 mx-2 flex flex-col items-end">
            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg rounded-bl-lg bg-brand-600 text-white max-w-[85vw] sm:max-w-md break-words shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base">
              {message.content}
            </div>
            <span className="text-xs text-gray-500 mt-1">{formattedTime}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // For assistant messages - using a simpler version without 'prose' class
  const html = { __html: marked.parse(message.content) };

  return (
    <div className="flex flex-col mb-3 sm:mb-4 animate-fade-in slide-in">
      <div className="flex items-end">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-pulse-slow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <div className="mx-2 flex flex-col">
          <div 
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg rounded-br-lg bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 shadow-sm text-dark-800 dark:text-dark-200 max-w-[85vw] sm:max-w-md break-words hover:shadow-md transition-all duration-200 text-sm sm:text-base"
            dangerouslySetInnerHTML={html}
          />
          <span className="text-xs text-gray-500 mt-1">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;