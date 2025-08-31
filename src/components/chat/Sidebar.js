import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { formatDate } from '../../utils/helpers';
import Logger from '../../utils/logger';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { 
    chats, 
    currentChat, 
    loadChats, 
    loadChat, 
    createNewChat, 
    deleteChat
  } = useChat();
  const [deletingChatId, setDeletingChatId] = useState(null);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleNewChat = useCallback(async () => {
    await createNewChat();
  }, [createNewChat]);

  const handleChatSelect = useCallback(async (chat) => {
    if (chat.id === currentChat?.id) return;
    await loadChat(chat.id);
  }, [currentChat?.id, loadChat]);

  const handleDeleteChat = useCallback(async (chatId, e) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    
    try {
      await deleteChat(chatId);
    } catch (error) {
      Logger.error('Failed to delete chat:', error);
    } finally {
      setDeletingChatId(null);
    }
  }, [deleteChat]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const chatGroups = useMemo(() => {
    return chats.reduce((groups, chat) => {
      const dateKey = formatDate(chat.updated_at || chat.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
      return groups;
    }, {});
  }, [chats]);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isCollapsed && window.innerWidth <= 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={onToggleCollapse}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '0px' : '280px',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <motion.button
              onClick={handleNewChat}
              className="new-chat-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              <span>New Chat</span>
            </motion.button>
            
            <button
              onClick={onToggleCollapse}
              className="collapse-btn desktop-only"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Chat History */}
          <div className="chat-history">
            <AnimatePresence>
              {Object.entries(chatGroups).map(([dateGroup, groupChats]) => (
                <motion.div
                  key={dateGroup}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="chat-group"
                >
                  <div className="chat-group-header">
                    <span>{dateGroup}</span>
                  </div>
                  
                  <div className="chat-list">
                    {groupChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`chat-item ${
                          currentChat?.id === chat.id ? 'active' : ''
                        }`}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <div className="chat-item-content">
                          <MessageSquare size={16} />
                          <span className="chat-title" title={chat.title}>
                            {chat.title || 'New Chat'}
                          </span>
                        </div>
                        
                        <motion.button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="delete-chat-btn"
                          disabled={deletingChatId === chat.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {deletingChatId === chat.id ? (
                            <div className="loading-spinner" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {chats.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>No conversations yet</p>
                <span>Start a new chat to begin</span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">
                <User size={18} />
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <motion.button
                onClick={handleLogout}
                className="logout-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Logout"
              >
                <LogOut size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggleCollapse}
        className="mobile-sidebar-toggle"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>
    </>
  );
};

export default Sidebar;
