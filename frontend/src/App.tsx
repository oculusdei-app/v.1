import React, { useState } from 'react';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';
import MemoryChart from './components/MemoryChart';
import ThemeToggle from './components/ThemeToggle';
import { MemoryProvider } from './context/MemoryContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'visualize' | 'browse'>('add');

  return (
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
            {/* Navigation Tabs */}
            <nav className="flex bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 px-4 py-3 text-center transition-colors ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Add Memory
              </button>
              <button
                onClick={() => setActiveTab('visualize')}
                className={`flex-1 px-4 py-3 text-center transition-colors ${activeTab === 'visualize' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Visualize
              </button>
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex-1 px-4 py-3 text-center transition-colors ${activeTab === 'browse' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Browse Memories
              </button>
            </nav>

            {/* Content based on active tab */}
            {activeTab === 'add' && <MemoryForm />}
            {activeTab === 'visualize' && <MemoryChart />}
            {activeTab === 'browse' && <MemoryList />}
          </div>
        </main>

        <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Oculus Dei - Life Management System
        </footer>
      </div>
    </MemoryProvider>
  );
};

export default App;
