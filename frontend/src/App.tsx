import React, { useEffect } from 'react';
import { BrowserRouter, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import { MemoryProvider } from './context/MemoryContext';
import AppRouter from './router';

// Navigation component with responsive design
const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  // Listen for window resize to toggle mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For mobile: dropdown select navigation
  if (isMobile) {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      window.location.href = e.target.value;
    };

    return (
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
        <select 
          value={location.pathname} 
          onChange={handleSelectChange}
          className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
        >
          <option value="/">Add Memory</option>
          <option value="/visualize">Visualize</option>
          <option value="/command">Command Center</option>
          <option value="/ai-assistant">AI Assistant</option>
        </select>
      </div>
    );
  }

  // For desktop: tab navigation
  return (
    <nav className="flex bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <NavLink
        to="/"
        className={({ isActive }) => 
          `flex-1 px-4 py-3 text-center transition-colors ${
            isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        Add Memory
      </NavLink>
      <NavLink
        to="/visualize"
        className={({ isActive }) => 
          `flex-1 px-4 py-3 text-center transition-colors ${
            isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        Visualize
      </NavLink>
      <NavLink
        to="/command"
        className={({ isActive }) => 
          `flex-1 px-4 py-3 text-center transition-colors ${
            isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        Command Center
      </NavLink>
      <NavLink
        to="/ai-assistant"
        className={({ isActive }) => 
          `flex-1 px-4 py-3 text-center transition-colors ${
            isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        AI Assistant
      </NavLink>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MemoryProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Oculus Dei</h1>
              <ThemeToggle />
            </div>
          </header>

          <main className="container mx-auto p-4">
            <div className="flex flex-col space-y-6">
              {/* Navigation */}
              <Navigation />
              
              {/* Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <AppRouter />
              </div>
            </div>
          </main>

          <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Oculus Dei - Life Management System
          </footer>
        </div>
      </MemoryProvider>
    </BrowserRouter>
  );
};

export default App;
