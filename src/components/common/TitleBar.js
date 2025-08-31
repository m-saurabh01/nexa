import React from 'react';
import { Brain, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './TitleBar.css';

const TitleBar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        {/* Logo and Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Brain size={24} />
          </div>
          <h1 className="brand-title">Nexa</h1>
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
