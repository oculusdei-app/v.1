import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';

const MEMORY_TYPE_COLORS: Record<string, string> = {
  event: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  decision: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  insight: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  project: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
};

const ICON_MAP: Record<string, string> = {
  event: '📅',
  decision: '🔍',
  insight: '💡',
  project: '📋',
};

const MemoryList: React.FC = () => {
  const { entries, refresh, error } = useMemory();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle entry expansion
  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter entries by type and search query
  const filteredEntries = entries.filter(entry => {
    const matchesType = !activeFilter || entry.type === activeFilter;
    const matchesSearch = !searchQuery ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get unique memory types for filter buttons
  const memoryTypes = Array.from(new Set(entries.map(entry => entry.type)));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Memory Browser</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Browse and search your stored memories
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${!activeFilter
              ? 'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            All
          </button>
          {memoryTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(prev => prev === type ? null : type)}
              className={`px-3 py-1 text-sm font-medium rounded-md flex items-center transition-colors ${activeFilter === type
                ? MEMORY_TYPE_COLORS[type] || 'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <span className="mr-1">{ICON_MAP[type] || ''}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Memory List */}
      <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${filteredEntries.length > 5 ? 'max-h-[32rem] overflow-y-auto' : ''}`}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => {
            const isExpanded = expandedEntries.has(entry.id);
            return (
              <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`inline-block px-2 py-1 text-xs font-medium rounded-md capitalize mr-2 ${MEMORY_TYPE_COLORS[entry.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      <span className="mr-1">{ICON_MAP[entry.type] || ''}</span>
                      {entry.type}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`mt-2 transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-12 overflow-hidden'}`}>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  {isExpanded && entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Additional Information</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {Object.entries(entry.metadata).map(([key, value]) => (
                          <div key={key} className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 dark:text-gray-400 capitalize">{key.replace('_', ' ')}:</dt>
                            <dd className="text-gray-800 dark:text-gray-200">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery || activeFilter ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No matching memories found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter(null);
                  }}
                  className="mt-4 px-3 py-1 text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p className="text-lg">No memories available</p>
                <p className="text-sm mt-1">Create new memories to see them here</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryList;
