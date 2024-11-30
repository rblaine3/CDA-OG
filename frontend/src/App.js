import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import MobileChat from './pages/MobileChat';
import ChatSetup from './pages/ChatSetup';
import History from './pages/History';
import Settings from './pages/Settings';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#64ffda',
    },
    background: {
      default: '#0a0a2e',
      paper: '#1a1a3a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
});

// Wrapper component for MainLayout
const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/mobile-chat" element={<MobileChat />} />
          <Route element={<MainLayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat-setup" element={<ChatSetup />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
