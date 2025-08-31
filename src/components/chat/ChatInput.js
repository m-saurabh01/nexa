import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import './ChatInput.css';

const ChatInput = () => {
  const { sendMessage, isTyping } = useChat();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const messageToSend = message.trim();
    setMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setMessage('');
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [message]);

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTyping}
            rows={1}
            className="message-input"
          />
          
          <div className="input-actions">
            {message.trim() && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="action-button clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isTyping}
              >
                <RotateCcw size={18} />
              </motion.button>
            )}
            
            <motion.button
              type="submit"
              className={`action-button send ${message.trim() ? 'active' : ''}`}
              disabled={!message.trim() || isTyping}
              whileHover={{ scale: message.trim() && !isTyping ? 1.1 : 1 }}
              whileTap={{ scale: message.trim() && !isTyping ? 0.9 : 1 }}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </form>
      
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="typing-indicator"
        >
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>AI is thinking...</span>
        </motion.div>
      )}
    </div>
  );
};

export default ChatInput;
