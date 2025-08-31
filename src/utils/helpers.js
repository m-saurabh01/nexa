// Date formatting utilities
import Logger from './logger';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString();
};

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Text utilities
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateChatTitle = (message) => {
  const words = message.trim().split(' ');
  if (words.length <= 6) return message;
  return words.slice(0, 6).join(' ') + '...';
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

// Storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    Logger.warn(`Error getting item from storage: ${key}`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    Logger.warn(`Error setting item to storage: ${key}`, error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    Logger.warn(`Error removing item from storage: ${key}`, error);
  }
};

// Clipboard utilities
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    Logger.warn('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Theme utilities
export const getPreferredTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};
