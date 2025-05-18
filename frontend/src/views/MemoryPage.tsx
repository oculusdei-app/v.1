import React from 'react';
import MemoryForm from '../components/MemoryForm';

/**
 * MemoryPage
 * ----------
 * Simple page wrapper that displays the MemoryForm component.
 */
const MemoryPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Memory</h2>
        <MemoryForm />
      </div>
    </div>
  );
};

export default MemoryPage;
