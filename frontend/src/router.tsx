import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemoryForm from './components/MemoryForm';
import MemoryChart from './components/MemoryChart';
import MemoryList from './components/MemoryList';
import CommandDashboard from './views/CommandDashboard';
import AIAssistantDialog from './views/AIAssistantDialog';

// Wrap MemoryForm in a MemoryPage component
const MemoryPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Memory</h2>
      <MemoryForm />
    </div>
  );
};

// Define the application router
const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MemoryPage />} />
      <Route path="/visualize" element={<MemoryChart />} />
      <Route path="/command" element={<CommandDashboard />} />
      <Route path="/ai-assistant" element={<AIAssistantDialog />} />
      <Route path="/browse" element={<MemoryList />} />
    </Routes>
  );
};

export default AppRouter; 