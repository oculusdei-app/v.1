import React, { ReactNode, useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/70 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-[85vw] max-w-[280px] transform transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static lg:inset-0 bg-white dark:bg-gray-800 shadow-lg
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img 
              src="/eye-logo.svg" 
              alt="Oculus Dei" 
              className="w-8 h-8 mr-2"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+';
              }}
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Oculus Dei</span>
          </div>
          <button 
            className="p-1 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <AppSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        {/* Top navigation */}
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            className="p-1 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-4 text-lg font-semibold lg:hidden">Oculus Dei</div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;