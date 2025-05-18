import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MemoryProvider } from './context/MemoryContext';
import AppLayout from './components/Layout/AppLayout';
import LifeCommandCenter from './views/LifeCommandCenter';
import EnhancedChatInterface from './components/Chat/EnhancedChatInterface';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MemoryProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LifeCommandCenter />} />
              <Route path="/chat" element={<EnhancedChatInterface />} />
            </Routes>
          </AppLayout>
        </Router>
      </MemoryProvider>
    </ThemeProvider>
  );
};

export default App;