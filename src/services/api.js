import axios from 'axios';
import Cookies from 'js-cookie';
import Logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      Logger.warn('Logout API call failed:', error);
    }
    Cookies.remove('auth_token');
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  // Get all user's chat sessions
  getChats: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },

  // Get specific chat conversation
  getChat: async (chatId) => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  // Create new chat or send a new message
  sendMessage: async (message, chatId = null) => {
    if (chatId) {
      // Send message to existing chat
      const response = await api.post(`/chat/${chatId}/message`, {
        message
      });
      return response.data;
    } else {
      // Create new chat
      const response = await api.post('/chat', {
        message
      });
      return response.data;
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    const response = await api.delete(`/chat/${chatId}`);
    return response.data;
  },

  // Clear all chats
  clearAllChats: async () => {
    const response = await api.delete('/chat/clear');
    return response.data;
  }
};

export default api;
