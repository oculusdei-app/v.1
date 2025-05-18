import React, { useState, useEffect } from 'react';
import EnhancedChatInterface from '../components/Chat/EnhancedChatInterface';
import MemoryChart from '../components/Visualizations/MemoryChart';

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

const LifeCommandCenter: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<ApiStatusData[]>([
    { name: 'Memory API', status: 'active', endpoint: 'http://localhost:8001' },
    { name: 'Plan API', status: 'active', endpoint: 'http://localhost:8000' },
    { name: 'Reflection System', status: 'processing', endpoint: '' }
  ]);
  
  const [isLoaded, setIsLoaded] = useState(false);

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
    <div className="flex h-full flex-col relative fade-in">
      {/* Intro header with parallax effect - enhanced with animations and gradient */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white py-7 px-7 rounded-t-lg shadow-md relative overflow-hidden">
        {/* Background decoration elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-10 -mr-16 animate-float-slow"></div>
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full -mb-8 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-float-slower"></div>
        
        <div className="relative z-10">
          <p className="text-white/90 max-w-2xl text-lg font-medium slide-in">
            Your life management system with adaptive planning and memory capabilities
          </p>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-7 p-7 bg-white dark:bg-dark-900 rounded-b-lg stagger-fade-in">
        {/* Left column - Memory Stats & System Status */}
        <div className="lg:col-span-1 space-y-7">
          {/* Memory distribution card */}
          <div className="card overflow-hidden interactive-card">
            <div className="card-header flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 py-4 px-5">
              <h2 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Memory Distribution
              </h2>
              <span className="badge-primary badge-sm animate-pulse-slow">
                Live Data
              </span>
            </div>
            <div className="card-body p-5">
              <MemoryChart />
            </div>
          </div>
          
          {/* System status card */}
          <div className="card overflow-hidden interactive-card">
            <div className="card-header flex justify-between items-center bg-purple-50 dark:bg-purple-900/30 py-4 px-5">
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
            <div className="card-body p-5">
              <div className="space-y-3">
                {systemStatus.map((api, index) => {
                  const colors = getStatusColor(api.status);
                  return (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="card overflow-hidden interactive-card">
            <div className="card-header flex justify-between items-center bg-green-50 dark:bg-green-900/30 py-4 px-5">
              <h2 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
            </div>
            <div className="card-body p-5 grid grid-cols-2 gap-4 stagger-fade-in">
              <button className="btn-ghost flex flex-col items-center justify-center p-3 bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:scale-105 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-xs font-medium">Add Memory</span>
              </button>
              <button className="btn-ghost flex flex-col items-center justify-center p-3 bg-purple-50/80 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:scale-105 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-medium">View Projects</span>
              </button>
              <button className="btn-ghost flex flex-col items-center justify-center p-3 bg-green-50/80 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30 hover:scale-105 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs font-medium">Refresh Data</span>
              </button>
              <button className="btn-ghost flex flex-col items-center justify-center p-3 bg-amber-50/80 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 hover:scale-105 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-medium">API Panel</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Chat Interface */}
        <div className="lg:col-span-2 card overflow-hidden elevation-2 slide-in-right">
          <div className="card-header flex justify-between items-center bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border-b border-brand-200/30 dark:border-brand-800/30 py-4 px-5">
            <h2 className="font-semibold flex items-center text-brand-800 dark:text-brand-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-500 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Assistant Interface
            </h2>
            <div className="flex space-x-2">
              <button className="btn-icon-ghost text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-800/30 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
              <div className="tooltip">
                <button className="btn-icon-ghost text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-800/30 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <span className="tooltip-text tooltip-top">Assistant Help</span>
              </div>
            </div>
          </div>
          <div className="h-[calc(100vh-13rem)]">
            <EnhancedChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeCommandCenter;