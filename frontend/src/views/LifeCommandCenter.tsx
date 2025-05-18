import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedChatInterface from '../components/Chat/EnhancedChatInterface';
import MemoryChart from '../components/Visualizations/MemoryChart';
import { useMemory } from '../context/MemoryContext';

/**
 * LifeCommandCenter
 * ------------------
 * Core Oculus Dei interface for interacting with the life assistant.
 * Provides chat-based interaction, memory logging, and basic project/goal
 * visualization.
 */

type ApiStatus = 'active' | 'inactive' | 'processing' | 'error';

interface ApiStatusData {
  name: string;
  status: ApiStatus;
  endpoint: string;
}

const MEMORY_API =
  import.meta.env.VITE_MEMORY_API_URL || 'http://localhost:8001';
const PLAN_API =
  import.meta.env.VITE_PLAN_API_URL || 'http://localhost:8000';

const LifeCommandCenter: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<ApiStatusData[]>([
    { name: 'Memory API', status: 'active', endpoint: MEMORY_API },
    { name: 'Plan API', status: 'active', endpoint: PLAN_API },
    { name: 'Reflection System', status: 'processing', endpoint: '' }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useMemory();

  // Simulate checking status of APIs on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      const updatedStatus = [...systemStatus];
      
      // Check each API endpoint
      for (let i = 0; i < updatedStatus.length; i++) {
        if (!updatedStatus[i].endpoint) continue;
        
        try {
          const res = await fetch(updatedStatus[i].endpoint, { 
            method: 'HEAD',
            // Using no-cors to avoid CORS issues during status check
            mode: 'no-cors',
            // Short timeout to prevent long waiting
            signal: AbortSignal.timeout(2000)
          });
          
          // This won't actually execute due to no-cors, but included for completeness
          updatedStatus[i].status = 'active';
        } catch (error) {
          // Assume endpoint is down if fetch fails
          updatedStatus[i].status = 'error';
        }
      }
      
      setSystemStatus(updatedStatus);
      setIsLoaded(true);
    };
    
    checkApiStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ApiStatus) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100 dark:bg-green-900/40',
          text: 'text-green-800 dark:text-green-200',
          dot: 'bg-green-400'
        };
      case 'processing':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/40',
          text: 'text-yellow-800 dark:text-yellow-200',
          dot: 'bg-yellow-400'
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/40',
          text: 'text-red-800 dark:text-red-200',
          dot: 'bg-red-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          dot: 'bg-gray-400'
        };
    }
  };

  return (
    <div className="flex h-full flex-col relative fade-in max-w-full overflow-x-hidden">
      {/* Modern header */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white h-1 sm:h-2 relative overflow-hidden">
      </div>
      
      {/* Main content area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 lg:gap-8 p-2 xs:p-3 sm:p-5 lg:p-8 bg-gray-50 dark:bg-dark-900 rounded-lg shadow-lg mx-1.5 xs:mx-2 sm:mx-3 md:mx-4 mt-1.5 xs:mt-2 sm:mt-3 md:mt-4 mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 stagger-fade-in border border-gray-100 dark:border-gray-800">
        {/* Left column - Memory Stats & System Status */}
        <div className="md:col-span-1 space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6 flex flex-col">
          {/* Memory distribution card */}
          <div className="card overflow-hidden interactive-card shadow-sm hover:shadow-lg transition-all duration-500 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
            <div className="card-header flex justify-between items-center bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-900/20 dark:to-blue-800/10 py-3 xs:py-4 px-3 xs:px-4 sm:px-5 border-b border-blue-100/50 dark:border-blue-800/30">
              <h2 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Memory Distribution
              </h2>
              <div className="flex items-center space-x-2">
                <span className="badge-primary badge-sm animate-pulse-slow">
                  Live Data
                </span>
                <span className="text-xs text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">Refresh</span>
              </div>
            </div>
            <div className="card-body p-3 xs:p-4 sm:p-6 bg-white/50 dark:bg-dark-800/50">
              <MemoryChart />
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <span>Memory usage analytics</span>
                <button className="text-blue-500 dark:text-blue-400 hover:underline">View details</button>
              </div>
            </div>
          </div>
          
          {/* System status card */}
          <div className="card overflow-hidden interactive-card shadow-sm hover:shadow-lg transition-all duration-500 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
            <div className="card-header flex justify-between items-center bg-gradient-to-r from-purple-50/80 to-purple-100/60 dark:from-purple-900/20 dark:to-purple-800/10 py-3 xs:py-4 px-3 xs:px-4 sm:px-5 border-b border-purple-100/50 dark:border-purple-800/30">
              <h2 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                System Status
              </h2>
              <div className="relative">
                <div className={`w-2 h-2 rounded-full ${isLoaded ? 'status-dot-success' : 'status-dot-warning'} animate-pulse absolute -top-1 -right-1`}></div>
                <span className={`badge ${isLoaded ? 'badge-success' : 'badge-warning'} badge-sm`}>
                  {isLoaded ? 'Updated' : 'Checking...'}
                </span>
              </div>
            </div>
            <div className="card-body p-3 xs:p-4 sm:p-6 bg-white/50 dark:bg-dark-800/50">
              <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800/50">
                {systemStatus.map((api, index) => {
                  const colors = getStatusColor(api.status);
                  return (
                    <div key={index} className={`flex justify-between items-center p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${index > 0 ? 'pt-3 sm:pt-4' : ''}`}>
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <span className={`w-2 h-2 mr-2 rounded-full ${colors.dot} animate-pulse`}></span>
                        {api.name}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 p-3 sm:p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-purple-100/50 dark:border-purple-800/30 flex flex-wrap xs:flex-nowrap justify-between items-center gap-y-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last checked: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="text-xs text-purple-500 dark:text-purple-400 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="card overflow-hidden interactive-card shadow-sm hover:shadow-lg transition-all duration-500 rounded-xl border border-green-100/50 dark:border-green-800/30">
            <div className="card-header flex justify-between items-center bg-gradient-to-r from-green-50/80 to-green-100/60 dark:from-green-900/20 dark:to-green-800/10 py-3 xs:py-4 px-3 xs:px-4 sm:px-5 border-b border-green-100/50 dark:border-green-800/30">
              <h2 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
            </div>
            <div className="card-body p-3 xs:p-4 sm:p-6 bg-white/50 dark:bg-dark-800/50 grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 stagger-fade-in">
              <button
                onClick={() => navigate('/memory')}
                className="btn-ghost flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow border border-blue-100/50 dark:border-blue-800/30"
              >
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center mb-1 xs:mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs font-medium">New Memory</span>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="btn-ghost flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 bg-purple-50/80 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow border border-purple-100/50 dark:border-purple-800/30"
              >
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center mb-1 xs:mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs font-medium">View Projects</span>
              </button>
              <button
                onClick={refresh}
                className="btn-ghost flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 bg-green-50/80 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-800/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow border border-green-100/50 dark:border-green-800/30"
              >
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center mb-1 xs:mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Refresh Data</span>
              </button>
              <button
                onClick={() => setShowApiPanel(true)}
                className="btn-ghost flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 bg-amber-50/80 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-800/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow border border-amber-100/50 dark:border-amber-800/30"
              >
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center mb-1 xs:mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs font-medium">API Panel</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Chat Interface */}
        <div className="md:col-span-1 lg:col-span-2 card overflow-hidden elevation-3 shadow-lg slide-in-right rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
          <div className="card-header flex justify-between items-center bg-gradient-to-r from-indigo-50/80 to-indigo-100/60 dark:from-indigo-900/20 dark:to-indigo-800/10 border-b border-indigo-100/50 dark:border-indigo-800/30 py-3 xs:py-4 px-3 xs:px-4 sm:px-5">
            <h2 className="font-semibold flex items-center text-indigo-800 dark:text-indigo-200">
              <div className="flex items-center justify-center w-7 h-7 bg-indigo-100 dark:bg-indigo-800/30 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              Assistant Interface
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300">Active</span>
            </h2>
            <div className="flex space-x-2">
              <button className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800/30 dark:hover:bg-indigo-700/40 rounded-full text-indigo-600 dark:text-indigo-300 transition-colors duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
              <div className="tooltip">
                <button className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800/30 dark:hover:bg-indigo-700/40 rounded-full text-indigo-600 dark:text-indigo-300 transition-colors duration-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <span className="tooltip-text tooltip-top">Assistant Help</span>
              </div>
              <button className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800/30 dark:hover:bg-indigo-700/40 rounded-full text-indigo-600 dark:text-indigo-300 transition-colors duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[calc(100vh-12rem)] xs:h-[calc(100vh-13rem)]">
            <EnhancedChatInterface />
          </div>
        </div>
      </div>

      {showApiPanel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md scale-in elevation-3 relative">
            <div className="card-header flex justify-between items-center bg-gradient-to-r from-purple-50/80 to-purple-100/60 dark:from-purple-900/20 dark:to-purple-800/10">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                API Status
              </h3>
              <button onClick={() => setShowApiPanel(false)} className="btn-icon-ghost text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="card-body p-4 space-y-3 divide-y divide-gray-100 dark:divide-gray-800/50">
              {systemStatus.map((api, idx) => {
                const colors = getStatusColor(api.status);
                return (
                  <div key={idx} className={`flex justify-between items-center ${idx > 0 ? 'pt-3' : ''}`}>
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className={`w-2 h-2 mr-2 rounded-full ${colors.dot} animate-pulse`}></span>
                      {api.name}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>{api.status.charAt(0).toUpperCase() + api.status.slice(1)}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-gradient-to-r from-purple-50/50 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 p-3 text-xs text-gray-500 dark:text-gray-400 border-t border-purple-100/50 dark:border-purple-800/30 flex justify-between items-center">
              <span>Last checked: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeCommandCenter;