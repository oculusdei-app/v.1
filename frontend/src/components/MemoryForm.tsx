import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';

const MEMORY_TYPES = [
  { value: 'event', label: 'Event', icon: '📅', description: 'Something that happened' },
  { value: 'decision', label: 'Decision', icon: '🔍', description: 'A choice you made' },
  { value: 'insight', label: 'Insight', icon: '💡', description: 'A realization or learning' },
  { value: 'project', label: 'Project', icon: '📋', description: 'Work or task information' }
];

const MemoryForm: React.FC = () => {
  const [type, setType] = useState('event');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const { addEntry } = useMemory();

  const addMetadataField = (key: string, value: string) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const selectedType = MEMORY_TYPES.find(t => t.value === type) || MEMORY_TYPES[0];

  const getPlaceholder = () => {
    switch (type) {
      case 'event': return 'Describe what happened...';
      case 'decision': return 'What did you decide? What were the factors?';
      case 'insight': return 'What did you learn or realize?';
      case 'project': return 'Describe project updates or status...';
      default: return 'Memory content...';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage({ text: 'Please enter content for your memory', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await addEntry({ type, content, metadata });
      setContent('');
      setMetadata({});
      setMessage({ text: 'Memory successfully stored!', type: 'success' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);

    } catch {
      setMessage({ text: 'Failed to store memory. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <span>Add New Memory</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Record your experiences, decisions, and insights
        </p>
      </div>

      <form onSubmit={submit} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Memory Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MEMORY_TYPES.map(memType => (
              <button
                key={memType.value}
                type="button"
                onClick={() => setType(memType.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${type === memType.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{memType.icon}</span>
                <span className={`text-sm font-medium ${type === memType.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {memType.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            {selectedType.description}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            rows={4}
            placeholder={getPlaceholder()}
          />
        </div>

        {/* Additional context fields based on memory type */}
        {type === 'project' && (
          <div className="mb-4">
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              value={(metadata.project_name as string) || ''}
              onChange={e => addMetadataField('project_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter project name"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Memory'}
          </button>

          {message && (
            <div className={`text-sm px-3 py-1 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
              {message.text}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default MemoryForm;
