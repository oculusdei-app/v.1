import React from 'react';
import { useMemory } from '../context/MemoryContext';

const MemoryList: React.FC = () => {
  const { entries } = useMemory();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Recent Memories</h2>
      <ul>
        {entries.map(entry => (
          <li key={entry.id} className="border-b py-2">
            <div className="text-sm text-gray-600">{entry.timestamp} — {entry.type}</div>
            <div>{entry.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemoryList;
