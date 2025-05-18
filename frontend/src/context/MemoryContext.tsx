import React, { useContext, useEffect, useState, useCallback } from 'react';

export interface MemoryEntry {
  id: string;
  timestamp: string;
  type: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface AddParams {
  type: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface MemoryContextType {
  entries: MemoryEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addEntry: (params: AddParams) => Promise<void>;
  searchEntries: (query: string) => Promise<MemoryEntry[]>;
  getEntriesByType: (type: string) => Promise<MemoryEntry[]>;
}

const API_BASE_URL = import.meta.env.VITE_MEMORY_API_URL || 'http://localhost:8001';

const MemoryContext = React.createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/memory/last?n=20`);
      if (!res.ok) {
        throw new Error(`Error fetching memories: ${res.status}`);
      }
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to refresh memories:', err);
      setError('Failed to load memories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = async (params: AddParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/memory/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error creating memory: ${res.status}`);
      }

      await refresh();
      return;
    } catch (err) {
      console.error('Failed to add memory:', err);
      setError(err instanceof Error ? err.message : 'Failed to store memory');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchEntries = async (query: string): Promise<MemoryEntry[]> => {
    if (!query || query.length < 2) return [];

    try {
      const res = await fetch(`${API_BASE_URL}/memory/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Error searching memories: ${res.status}`);
      }
      const data = await res.json();
      return data.entries || [];
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  };

  const getEntriesByType = async (type: string): Promise<MemoryEntry[]> => {
    if (!type) return [];

    try {
      const res = await fetch(`${API_BASE_URL}/memory/type/${encodeURIComponent(type)}`);
      if (!res.ok) {
        throw new Error(`Error fetching memories by type: ${res.status}`);
      }
      const data = await res.json();
      return data.entries || [];
    } catch (err) {
      console.error(`Failed to get entries of type ${type}:`, err);
      return [];
    }
  };

  useEffect(() => {
    refresh();

    // Optional: Set up periodic refresh every 30 seconds
    const intervalId = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  return (
    <MemoryContext.Provider
      value={{
        entries,
        isLoading,
        error,
        refresh,
        addEntry,
        searchEntries,
        getEntriesByType
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = (): MemoryContextType => {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemory must be used within MemoryProvider');
  return ctx;
};
