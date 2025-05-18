import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MemoryProvider } from './context/MemoryContext';
import AppLayout from './components/Layout/AppLayout';
import LifeCommandCenter from './views/LifeCommandCenter';
import EnhancedChatInterface from './components/Chat/EnhancedChatInterface';
import MemoryPage from './views/MemoryPage';
import ProjectsView from './views/ProjectsView';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MemoryProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LifeCommandCenter />} />
              <Route path="/memory" element={<MemoryPage />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/chat" element={<EnhancedChatInterface />} />
            </Routes>
          </AppLayout>
        </Router>
      </MemoryProvider>
    </ThemeProvider>
  );
};

export default App;