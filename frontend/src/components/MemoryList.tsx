import React, { useEffect, useState } from 'react';

interface MemoryEntry {
  id: string;
  timestamp: string;
  type: string;
  content: string;
}

const MemoryList: React.FC = () => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);

  const fetchEntries = async () => {
    const res = await fetch('http://localhost:8001/memory/last?n=10');
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

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
