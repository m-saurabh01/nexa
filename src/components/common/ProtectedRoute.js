import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: '#6b7280'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
