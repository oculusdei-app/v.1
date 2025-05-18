import React from 'react';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';

const App: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Oculus Dei Memory</h1>
      <MemoryForm />
      <MemoryList />
    </div>
  );
};

export default App;
