import React, { createContext, useContext, useState, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';
import Logger from '../utils/logger';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState(null); // Track the latest message for typing effect

  // Load user's chat history
  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await chatAPI.getChats();
      setChats(response.chats || []);
    } catch (error) {
      Logger.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load specific chat conversation
  const loadChat = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChat(chatId);
      setCurrentChat(response.chat);
      setMessages(response.chat.messages || []);
      // Reset latest message ID when loading historical chat
      setLatestMessageId(null);
    } catch (error) {
      Logger.error('Failed to load chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new chat
  const createNewChat = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      // Clear current chat to prepare for new one
      setCurrentChat(null);
      setMessages([]);
      setLatestMessageId(null); // Reset latest message ID for new chat
      return true;
    } catch (error) {
      Logger.error('Failed to create chat:', error);
      return null;
    }
  }, [user?.id]);

  // Send message and get response
  const sendMessage = useCallback(async (prompt) => {
    if (!user?.id || !prompt.trim()) return;

    let chatId = currentChat?.id;
    
    try {
      setIsTyping(true);
      
      if (chatId) {
        // Send message to existing chat
        const response = await chatAPI.sendMessage(prompt, chatId);
        
        // Add user message
        const userMessage = {
          id: response.message.id || Date.now().toString(),
          content: prompt,
          role: 'user',
          timestamp: new Date().toISOString(),
        };
        
        // Add assistant message
        const assistantMessage = response.message;
        
        // Track the latest assistant message for typing effect
        setLatestMessageId(assistantMessage.id);
        
        setMessages(prev => [...prev, userMessage, assistantMessage]);
        
      } else {
        // Create new chat
        const response = await chatAPI.sendMessage(prompt);
        
        // Get the latest assistant message from the new chat
        const newMessages = response.chat.messages || [];
        const latestAssistantMessage = newMessages
          .filter(msg => msg.role === 'assistant' || msg.sender === 'assistant')
          .pop();
        
        if (latestAssistantMessage) {
          setLatestMessageId(latestAssistantMessage.id);
        }
        
        setCurrentChat(response.chat);
        setMessages(response.chat.messages || []);
        setChats(prev => [response.chat, ...prev]);
      }

      // Note: Removed loadChats() call to prevent overwriting current chat state

    } catch (error) {
      Logger.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [user?.id, currentChat?.id]);

  // Delete chat
  const deleteChat = useCallback(async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      Logger.error('Failed to delete chat:', error);
    }
  }, [currentChat?.id]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
  }, []);

  const value = {
    chats,
    currentChat,
    messages,
    isLoading,
    isTyping,
    latestMessageId,
    loadChats,
    loadChat,
    createNewChat,
    sendMessage,
    deleteChat,
    clearCurrentChat,
    setCurrentChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
