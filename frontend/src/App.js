import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import MobileChat from './pages/MobileChat';
import ChatSetup from './pages/ChatSetup';
import History from './pages/History';
import Settings from './pages/Settings';
import DesignSystem from './pages/DesignSystem';
import { theme } from './design-system/theme';
import './App.css';

// Wrapper component for MainLayout
const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route element={<MainLayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat-setup" element={<ChatSetup />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/design" element={<DesignSystem />} />
          </Route>
          <Route path="/mobile-chat" element={<MobileChat />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
