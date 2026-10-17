import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../../services/api';
import { MessageSquare, X, Send, RefreshCw, User, Activity, Stethoscope, Bot } from 'lucide-react';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! I am your **CarePulse Clinical Assistant**.\n\nAsk me anything about registered patients (e.g. *Sameer*, *Alex*), doctor schedules, bed occupancy, appointments, or billing records.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Find patient Sameer',
    'Check ICU bed availability',
    'List all doctors & fees',
    "Show today's appointments",
    'Hospital revenue & unpaid bills',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const queryText = userText || input;
    if (!queryText.trim() || loading) return;

    const userMessage = { role: 'user', text: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Pass recent history for multi-turn conversation
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await chatbotService.sendMessage({
        message: queryText,
        history,
      });

      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: res.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: 'I encountered an issue fetching data. Please try again.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `**Error connecting to the assistant:** ${err.message || 'Please ensure backend server is active.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: 'Chat history cleared. How can I assist you with hospital data today?',
      },
    ]);
  };

  // Simple Markdown Renderer for bold, headings, bullets, code
  const formatMarkdown = (content) => {
    if (!content) return '';

    return content
      .split('\n')
      .map((line, idx) => {
        // Headings
        if (line.startsWith('### ')) {
          return <h4 key={idx} style={{ margin: '8px 0 4px 0', color: 'var(--primary-700)', fontSize: '0.9rem' }}>{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} style={{ margin: '10px 0 6px 0', color: 'var(--slate-900)', fontSize: '0.95rem' }}>{line.replace('## ', '')}</h3>;
        }

        // Bullets
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const formatted = parseInlineMarkdown(line.trim().substring(2));
          return (
            <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '3px', fontSize: '0.85rem' }}>
              {formatted}
            </li>
          );
        }

        // Standard text
        return (
          <p key={idx} style={{ margin: '4px 0', fontSize: '0.85rem', lineHeight: '1.45' }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      });
  };

  const parseInlineMarkdown = (text) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'inherit', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--slate-100)',
              padding: '2px 5px',
              borderRadius: '4px',
              color: 'var(--primary-700)',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="chatbot-root">
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          title="Open clinical assistant"
          aria-label="Open clinical assistant"
        >
          <MessageSquare size={24} />
          <span className="chatbot-fab-dot" />
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-label="CarePulse clinical assistant">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
              <div className="chatbot-header-icon">
                <Stethoscope size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="chatbot-title">CarePulse Assistant</div>
                <div className="chatbot-status">
                  <span className="chatbot-status-dot" />
                  Connected to hospital records
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
              <button type="button" className="btn-icon" onClick={clearChat} title="Clear conversation" aria-label="Clear conversation">
                <RefreshCw size={15} />
              </button>
              <button type="button" className="btn-icon" onClick={() => setIsOpen(false)} title="Close chat" aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`chatbot-msg ${isUser ? 'user' : ''}`}>
                  <div className="chatbot-avatar">{isUser ? <User size={14} /> : <Bot size={14} />}</div>
                  <div className="chatbot-bubble">
                    {isUser ? <p style={{ margin: 0, fontSize: '0.875rem' }}>{m.text}</p> : formatMarkdown(m.text)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chatbot-msg">
                <div className="chatbot-avatar">
                  <Bot size={14} />
                </div>
                <div className="chatbot-bubble chatbot-typing">
                  <Activity size={14} className="animate-spin" color="var(--primary-600)" />
                  Looking that up...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-suggestions">
            {quickPrompts.map((prompt, i) => (
              <button key={i} type="button" className="chatbot-chip" onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chatbot-input-row">
            <input
              type="text"
              placeholder="Ask about patients, beds, billing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="Message"
            />
            <button
              type="button"
              className="chatbot-send"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
