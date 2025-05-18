import React, { useState } from 'react';

const MEMORY_TYPES = ['event', 'decision', 'insight', 'project'];

const MemoryForm: React.FC = () => {
  const [type, setType] = useState('event');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    const res = await fetch('http://localhost:8001/memory/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content, metadata: {} })
    });

    if (res.ok) {
      setContent('');
      setMessage('Memory stored');
    } else {
      setMessage('Failed to store');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4">
      <div className="flex items-center mb-2">
        <label className="mr-2">Type:</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border rounded p-1"
        >
          {MEMORY_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border rounded w-full p-2"
          rows={3}
          placeholder="Memory content"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
};

export default MemoryForm;
