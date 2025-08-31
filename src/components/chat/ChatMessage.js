import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import Logger from '../../utils/logger';
import './ChatMessage.css';

const ChatMessage = React.memo(({ message, isLast }) => {
  const [copied, setCopied] = useState(false);
  const { latestMessageId } = useChat();
  const { theme } = useTheme();
  const isUser = message.sender === 'user' || message.role === 'user';
  
  // Only enable typing effect for the latest assistant message
  const shouldShowTyping = !isUser && message.id === latestMessageId;
  
  // Add typing effect for assistant messages only when they are the latest
  const { displayedText } = useTypingEffect(
    message.content,
    10, // Faster typing speed
    shouldShowTyping
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Logger.error('Failed to copy text:', error);
    }
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="code-block">
          <div className="code-header">
            <span className="code-language">{match[1]}</span>
            <button
              onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
              className="copy-code-btn"
            >
              <Copy size={14} />
            </button>
          </div>
          <SyntaxHighlighter
            style={theme === 'light' ? oneLight : vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="markdown-link"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`chat-message ${isUser ? 'user' : 'assistant'} ${isLast ? 'last' : ''}`}
    >
      <div className="message-container">
        <div className="message-avatar">
          {isUser ? (
            <User size={20} />
          ) : (
            <Bot size={20} />
          )}
        </div>
        
        <div className="message-content">
          <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                components={markdownComponents}
                className="markdown-content"
              >
                {shouldShowTyping ? displayedText : message.content}
              </ReactMarkdown>
            )}
          </div>
          
          <div className="message-actions">
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            
            <button
              onClick={handleCopy}
              className="copy-message-btn"
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    sender: PropTypes.string,
    role: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    isError: PropTypes.bool,
  }).isRequired,
  isLast: PropTypes.bool,
};

ChatMessage.defaultProps = {
  isLast: false,
};

export default ChatMessage;
