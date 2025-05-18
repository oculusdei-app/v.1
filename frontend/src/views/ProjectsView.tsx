import React, { useEffect, useState } from 'react';
import { fetchProjects, ProjectEntry } from '../api';

/**
 * ProjectsView
 * ------------
 * Displays a simple list of projects fetched from the backend.
 */
const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(data => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Projects</h2>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : projects.length ? (
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{p.description}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">No projects found.</div>
      )}
    </div>
  );
};

export default ProjectsView;
