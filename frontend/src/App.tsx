import React from 'react';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';
import MemoryChart from './components/MemoryChart';
import ThemeToggle from './components/ThemeToggle';
import { MemoryProvider } from './context/MemoryContext';

const App: React.FC = () => {
  return (
    <MemoryProvider>
      <div className="container mx-auto p-4">
        <ThemeToggle />
        <h1 className="text-2xl font-bold mb-4">Oculus Dei Memory</h1>
        <MemoryForm />
        <MemoryChart />
        <MemoryList />
      </div>
    </MemoryProvider>
  );
};

export default App;
