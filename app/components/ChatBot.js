'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the Awareness Pro Sentinel. How can I help you stay secure today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].slice(-10) }), // Send last 10 for context
      });

      const data = await response.json();
      if (data.choices?.[0]?.message) {
        setMessages(prev => [...prev, data.choices[0].message]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--accent-primary)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute', top: -2, right: -2,
              width: '12px', height: '12px', background: '#10b981',
              borderRadius: '50%', border: '2px solid white'
            }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              position: 'absolute', bottom: '80px', right: 0,
              width: '380px', height: '520px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '1.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white', display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>AI Sentinel</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Groq-Powered Intelligence</div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ 
                    padding: '0.8rem 1.2rem',
                    borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: m.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.5, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {m.role === 'user' ? <User size={10}/> : <Bot size={10}/>}
                    {m.role === 'user' ? 'You' : 'Sentinel'}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '18px 18px 18px 2px', display: 'flex', gap: '4px' }}>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'relative', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Sentinel..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '0.8rem 1rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'white', border: 'none', borderRadius: '12px',
                    width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
              <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center', marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <AlertCircle size={10} /> AI can make mistakes. Verify critical info.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
