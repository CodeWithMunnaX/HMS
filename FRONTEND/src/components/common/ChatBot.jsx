import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../../services/api';
import {
  MessageSquare,
  X,
  Send,
  RefreshCw,
  User,
  ChevronDown,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Bot,
} from 'lucide-react';

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
          text: `⚠️ **Error connecting to AI:** ${err.message || 'Please ensure backend server is active.'}`,
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
          return <h4 key={idx} style={{ margin: '8px 0 4px 0', color: '#0e7490', fontSize: '0.95rem' }}>{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} style={{ margin: '10px 0 6px 0', color: '#0f172a', fontSize: '1rem' }}>{line.replace('## ', '')}</h3>;
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
        return <strong key={i} style={{ color: '#0f172a' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: '#f1f5f9',
              padding: '2px 5px',
              borderRadius: '4px',
              color: '#0e7490',
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
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4), 0 4px 10px rgba(14, 116, 144, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid #ffffff',
            position: 'relative',
          }}
          title="Open Clinical Assistant Desk"
        >
          <Stethoscope size={26} />
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff',
            }}
          />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          style={{
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '580px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUpChat 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
              color: '#ffffff',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stethoscope size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  CarePulse Clinical Desk
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  Clinical Database Connected
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={clearChat}
                style={{ color: '#ffffff', opacity: 0.8, padding: '4px', cursor: 'pointer' }}
                title="Clear Conversation"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: '#ffffff', opacity: 0.8, padding: '4px', cursor: 'pointer' }}
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              backgroundColor: '#f8fafc',
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isUser ? '#0e7490' : '#0891b2',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: '14px',
                      backgroundColor: isUser ? '#0e7490' : '#ffffff',
                      color: isUser ? '#ffffff' : '#334155',
                      boxShadow: isUser ? '0 2px 6px rgba(14, 116, 144, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      borderTopRightRadius: isUser ? '2px' : '14px',
                      borderTopLeftRadius: isUser ? '14px' : '2px',
                    }}
                  >
                    {isUser ? (
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>{m.text}</p>
                    ) : (
                      formatMarkdown(m.text)
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#0891b2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={14} />
                </div>
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                    color: '#64748b',
                  }}
                >
                  <Activity size={14} className="animate-spin" color="#0891b2" />
                  Querying clinical database...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: '600',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#ecfeff',
                  color: '#0e7490',
                  border: '1px solid #a5f3fc',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              placeholder="Ask anything from hospital data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.625rem 0.875rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: '#f8fafc',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: input.trim() ? '#0e7490' : '#cbd5e1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
