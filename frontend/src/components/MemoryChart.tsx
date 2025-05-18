import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';

const CHART_COLORS = {
  event: '#3B82F6', // blue-500
  decision: '#10B981', // emerald-500
  insight: '#8B5CF6', // violet-500
  project: '#F59E0B', // amber-500
  default: '#6B7280', // gray-500
};

const ICON_MAP: Record<string, string> = {
  event: '📅',
  decision: '🔍',
  insight: '💡',
  project: '📋',
};

const VIEW_TYPES = ['bar', 'pie', 'timeline'] as const;
type ViewType = typeof VIEW_TYPES[number];

const MemoryChart: React.FC = () => {
  const { entries } = useMemory();
  const [viewType, setViewType] = useState<ViewType>('bar');

  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const max = Math.max(...Object.values(counts), 1);

  // Calculate distribution percentages for pie chart
  const getPercentage = (type: string) => {
    const count = counts[type] || 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Sort entries for timeline view
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get the color for a memory type
  const getColor = (type: string) => {
    return CHART_COLORS[type as keyof typeof CHART_COLORS] || CHART_COLORS.default;
  };

  // Get formatted date for timeline
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Memory Insights</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Visualize your memory patterns and distribution
        </p>
      </div>

      {/* Chart Type Selection */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {VIEW_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${viewType === type
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} View
          </button>
        ))}
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg">No memory data available</p>
            <p className="text-sm mt-1">Add some memories to see insights</p>
          </div>
        ) : viewType === 'bar' ? (
          <div className="h-72 flex items-end justify-around space-x-2">
            {Object.entries(counts).map(([type, count]) => {
              const height = (count / max) * 100;
              return (
                <div key={type} className="flex flex-col items-center">
                  <div className="relative group w-20 flex justify-center">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </div>
                    <div
                      className="w-12 rounded-t-lg transition-all duration-500 ease-out"
                      style={{
                        height: `${height}%`,
                        backgroundColor: getColor(type),
                        minHeight: count > 0 ? '20px' : '0'
                      }}
                    />
                  </div>
                  <div className="mt-2 flex flex-col items-center">
                    <span className="text-lg">{ICON_MAP[type] || '📋'}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewType === 'pie' ? (
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-10 py-4">
            {/* SVG Pie Chart */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <circle r="16" cx="16" cy="16" fill="#f3f4f6" className="dark:fill-gray-700" />
                {Object.keys(counts).length > 0 ? (
                  <>
                    {Object.entries(counts).reduce((elements, [type, count], index, array) => {
                      const percentage = total > 0 ? (count / total) : 0;

                      // Calculate start and end angles for pie segments
                      let startAngle = elements.currentAngle;
                      let endAngle = startAngle + percentage * 2 * Math.PI;

                      // SVG arc path
                      const largeArc = percentage > 0.5 ? 1 : 0;
                      const startX = 16 + 16 * Math.cos(startAngle);
                      const startY = 16 + 16 * Math.sin(startAngle);
                      const endX = 16 + 16 * Math.cos(endAngle);
                      const endY = 16 + 16 * Math.sin(endAngle);

                      if (percentage > 0) {
                        elements.paths.push(
                          <path
                            key={type}
                            d={`M 16,16 L ${startX},${startY} A 16,16 0 ${largeArc},1 ${endX},${endY} Z`}
                            fill={getColor(type)}
                            className="hover:opacity-80 transition-opacity"
                          />
                        );
                      }

                      elements.currentAngle = endAngle;
                      return elements;
                    }, { paths: [] as React.ReactNode[], currentAngle: -Math.PI / 2 }).paths}
                  </>
                ) : (
                  <circle r="15" cx="16" cy="16" fill="#d1d5db" className="dark:fill-gray-600" />
                )}
              </svg>
              {total > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">{total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">total</div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(counts).map(([type, count]) => {
                const percentage = getPercentage(type);
                return (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColor(type) }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex items-center">
                        {type} <span className="ml-1">{ICON_MAP[type] || ''}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {count} ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Timeline view
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedEntries.length > 0 ? sortedEntries.map((entry) => (
              <div key={entry.id} className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                <div
                  className="w-4 h-4 mt-1 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: getColor(entry.type) }}
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize flex items-center">
                      {entry.type} {ICON_MAP[entry.type] || ''}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                    {entry.content}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No entries to display</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryChart;
