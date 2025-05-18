import React, { useEffect, useState } from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const MEMORY_API = 'http://localhost:8001';

const MemoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMemoryStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${MEMORY_API}/memory/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch memory statistics');
        }
        
        const data = await response.json();
        
        // Transform the data for the chart
        const colorMap: Record<string, string> = {
          event: 'rgba(59, 130, 246, 0.8)',    // blue
          decision: 'rgba(139, 92, 246, 0.8)', // purple
          insight: 'rgba(6, 182, 212, 0.8)',   // cyan
          project: 'rgba(16, 185, 129, 0.8)',  // green
          error: 'rgba(239, 68, 68, 0.8)',     // red
          reflection: 'rgba(245, 158, 11, 0.8)' // amber
        };
        
        const transformedData: ChartData[] = Object.entries(data).map(([label, value]) => ({
          label,
          value: value as number,
          color: colorMap[label.toLowerCase()] || 'rgba(156, 163, 175, 0.8)' // gray as default
        }));
        
        // Sort by value in descending order
        transformedData.sort((a, b) => b.value - a.value);
        
        setChartData(transformedData);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching memory statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemoryStats();
  }, []);
  
  // Calculate the total value to get percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        Failed to load chart data: {error}
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center p-4">
        No memory data available
      </div>
    );
  }
  
  return (
    <div className="p-1">
      <div className="space-y-3">
        {/* Bar Chart */}
        {chartData.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="capitalize">{item.label}</span>
              <span className="font-medium">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${(item.value / total) * 100}%`,
                  backgroundColor: item.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryChart;