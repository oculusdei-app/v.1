import React, { useEffect, useState } from 'react';
import AIAssistantDialog from './AIAssistantDialog';

/**
 * LifeCommandCenter
 * ------------------
 * Main interface combining the assistant dialog with basic project
 * and goal summaries.
 */

interface ProjectSummary {
  name: string;
  description: string;
  [key: string]: unknown;
}

interface GoalEntry {
  id: string;
  content: string;
  timestamp: string;
}

const MEMORY_API = 'http://localhost:8001';
const PLAN_API = 'http://localhost:8000';

const LifeCommandCenter: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);

  // Fetch sidebar data on mount
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
      }
    };

    fetchProjects();
    fetchGoals();
  }, []);

  return (
    <div className="flex h-screen relative">
      {/* Chat Column */}
      <div className="flex flex-col flex-1">
        <AIAssistantDialog />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Active Project</h3>
          </div>
          <div className="card-body text-sm space-y-1">
            {projects.length ? (
              <>
                <div className="font-medium">{projects[0].name}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {projects[0].description}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No projects</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Today's Goals</h3>
          </div>
          <div className="card-body text-sm space-y-1">
            {goals.map((g) => (
              <div key={g.id}>• {g.content}</div>
            ))}
            {!goals.length && <div className="text-gray-500">No goals</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Time Focus Map</h3>
          </div>
          <div className="card-body text-sm text-gray-500">Planned...</div>
        </div>
      </aside>
    </div>
  );
};

export default LifeCommandCenter;
