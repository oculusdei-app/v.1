import React, { useEffect, useState } from 'react';

interface ProjectSummary {
  name: string;
  description: string;
  priority_level?: string;
  category?: string;
  [key: string]: unknown;
}

interface GoalEntry {
  id: string;
  content: string;
  timestamp: string;
}

const MEMORY_API = 'http://localhost:8001';
const PLAN_API = 'http://localhost:8000';

const AppSidebar: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [memoryStats, setMemoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState({
    projects: true,
    goals: true,
    stats: true
  });
  const [toast, setToast] = useState<string | null>(null);

  const showTempToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${PLAN_API}/projects`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to load projects', e);
        showTempToast('Failed to load projects');
      } finally {
        setLoading(prev => ({ ...prev, projects: false }));
      }
    };

    const fetchGoals = async () => {
      try {
        const res = await fetch(`${MEMORY_API}/memory/type/goal?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setGoals(data.entries || []);
        }
      } catch (e) {
        console.error('Failed to load goals', e);
        showTempToast('Failed to load goals');
      } finally {
        setLoading(prev => ({ ...prev, goals: false }));
      }
    };

    const fetchMemoryStats = async () => {
      try {
        const res = await fetch(`${MEMORY_API}/memory/stats`);
        if (res.ok) {
          const data = await res.json();
          setMemoryStats(data);
        }
      } catch (e) {
        console.error('Failed to load memory stats', e);
        showTempToast('Failed to load memory stats');
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    fetchProjects();
    fetchGoals();
    fetchMemoryStats();
  }, []);

  const getPriorityColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 xs:p-4 space-y-3 xs:space-y-4">
        {/* Active Project */}
        <div className="card">
          <div className="card-header flex justify-between items-center p-2 xs:p-4">
            <h3 className="font-semibold text-sm xs:text-base">Active Project</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{projects.length} total</span>
          </div>
          <div className="card-body text-sm space-y-2">
            {loading.projects ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : projects.length ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-y-1">
                  <div className="font-medium">{projects[0].name}</div>
                  <div className={`px-2 py-0.5 text-xs text-white rounded-full ${getPriorityColor(projects[0].priority_level as string)}`}>
                    {projects[0].priority_level || 'medium'}
                  </div>
                </div>
                <div className="text-gray-500 dark:text-gray-400 line-clamp-2 text-xs xs:text-sm">
                  {projects[0].description}
                </div>
                {projects[0].category && (
                  <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded inline-block">
                    {projects[0].category}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 py-2">
                No active projects
              </div>
            )}
          </div>
        </div>

        {/* Today's Goals */}
        <div className="card">
          <div className="card-header flex justify-between items-center p-2 xs:p-4">
            <h3 className="font-semibold text-sm xs:text-base">Today's Goals</h3>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Add Goal
            </button>
          </div>
          <div className="card-body text-sm space-y-2">
            {loading.goals ? (
              <div className="space-y-2">
                <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : goals.length ? (
              goals.map((g) => (
                <div key={g.id} className="flex items-start">
                  <span className="text-green-500 mr-1.5">•</span>
                  <span>{g.content}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 dark:text-gray-400 py-2">
                No goals for today
              </div>
            )}
          </div>
        </div>

        {/* Memory Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Memory Stats</h3>
          </div>
          <div className="card-body text-sm">
            {loading.stats ? (
              <div className="space-y-2">
                <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : Object.keys(memoryStats).length ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(memoryStats).map(([type, count]) => (
                  <div 
                    key={type}
                    className="p-2 rounded bg-gray-100 dark:bg-gray-700 flex flex-col items-center"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400">{type}</div>
                    <div className="text-lg font-semibold">{count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 py-2">
                No memory data
              </div>
            )}
          </div>
        </div>

      {/* Time Focus Map (Placeholder) */}
      <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Time Focus Map</h3>
          </div>
          <div className="card-body">
            <div className="py-8 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center flex-col">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Visualization coming soon</span>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AppSidebar;