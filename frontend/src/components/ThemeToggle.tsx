import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="mb-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
    >
      {dark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
