import React from 'react';
import { useMemory } from '../context/MemoryContext';

const BAR_MAX_HEIGHT = 100;

const MemoryChart: React.FC = () => {
  const { entries } = useMemory();

  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="flex space-x-4 items-end h-32 p-4 bg-white rounded shadow">
      {Object.entries(counts).map(([type, count]) => (
        <div key={type} className="flex flex-col items-center flex-1">
          <div
            className="bg-blue-600 w-6"
            style={{ height: `${(count / max) * BAR_MAX_HEIGHT}px` }}
          />
          <span className="text-xs mt-1">{type}</span>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-gray-500">No data</p>
      )}
    </div>
  );
};

export default MemoryChart;
