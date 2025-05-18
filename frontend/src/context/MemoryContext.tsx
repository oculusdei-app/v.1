import React, { useContext, useEffect, useState } from 'react';

export interface MemoryEntry {
  id: string;
  timestamp: string;
  type: string;
  content: string;
}

interface AddParams {
  type: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface MemoryContextType {
  entries: MemoryEntry[];
  refresh: () => Promise<void>;
  addEntry: (params: AddParams) => Promise<void>;
}

const MemoryContext = React.createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);

  const refresh = async () => {
    const res = await fetch('http://localhost:8001/memory/last?n=10');
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
    }
  };

  const addEntry = async (params: AddParams) => {
    const res = await fetch('http://localhost:8001/memory/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      await refresh();
    } else {
      throw new Error('Failed to store');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <MemoryContext.Provider value={{ entries, refresh, addEntry }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = (): MemoryContextType => {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemory must be used within MemoryProvider');
  return ctx;
};
