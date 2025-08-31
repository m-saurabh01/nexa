import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Logger from '../../utils/logger';
import './ChatLayout.css';

const ChatLayout = () => {
  const { user } = useAuth();
  const { messages, currentChat, isLoading, sendMessage } = useChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Handle prompt card clicks
  const handlePromptClick = async (prompt) => {
    try {
      await sendMessage(prompt);
    } catch (error) {
      Logger.error('Failed to send prompt:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="chat-layout">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
      />
      
      <main 
        className={`chat-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Floating Menu Button - shows when sidebar is collapsed */}
        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSidebarCollapsed(false)}
            className="floating-menu-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={20} />
          </motion.button>
        )}

        <div className="chat-container" ref={chatContainerRef}>
          {/* Welcome State */}
          {messages.length === 0 && !currentChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="welcome-state"
            >
              <div className="welcome-content">
                <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
                <p>
                  I'm your AI assistant. I can help you with questions, writing, 
                  analysis, coding, and much more. What would you like to explore today?
                </p>
                
                <div className="example-prompts">
                  <h3>Try asking me about:</h3>
                  <div className="prompt-grid">
                    <div 
                      className="prompt-card" 
                      onClick={() => handlePromptClick("Explain a complex concept in simple terms")}
                    >
                      <span className="prompt-icon">💡</span>
                      <span>Explain a complex concept</span>
                    </div>
                    <div 
                      className="prompt-card"
                      onClick={() => handlePromptClick("Help me write a professional email")}
                    >
                      <span className="prompt-icon">📝</span>
                      <span>Help with writing</span>
                    </div>
                    <div 
                      className="prompt-card"
                      onClick={() => handlePromptClick("Review this code and suggest improvements")}
                    >
                      <span className="prompt-icon">💻</span>
                      <span>Code review or debugging</span>
                    </div>
                    <div 
                      className="prompt-card"
                      onClick={() => handlePromptClick("Research the latest trends in technology")}
                    >
                      <span className="prompt-icon">🔍</span>
                      <span>Research and analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="messages-container">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="loading-state"
            >
              <div className="loading-spinner large" />
              <p>Loading conversation...</p>
            </motion.div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput />
      </main>
    </div>
  );
};

export default ChatLayout;
