import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import TitleBar from './components/common/TitleBar';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './App.css';
import './styles/theme.css';

// Component to handle routing based on auth state
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner large" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage />
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/chat" : "/login"} replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <div className="app-container">
              <TitleBar />
              <AppRoutes />
            </div>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
