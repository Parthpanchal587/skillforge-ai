import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { sounds } from '../services/soundEffects';
import MagneticButton from './motion/MagneticButton';

const AICopilotWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Operational. I am your SkillForge Career Intelligence Copilot. How can I assist your engineering trajectory today?' },
  ]);
  const messagesEndRef = useRef(null);
  const { selectedDomain, weaknesses, onboarding } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = (customPrompt) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim()) return;
    sounds.playClick();
    
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setQuery('');
    setIsTyping(true);

    // AI Response generation
    setTimeout(() => {
      let aiText = `Analyzing profile for ${selectedDomain || 'Full Stack Development'}: `;
      const lower = textToSend.toLowerCase();

      if (lower.includes('gap') || lower.includes('weak') || lower.includes('bottleneck')) {
        const topWeak = weaknesses?.top?.[0];
        aiText += topWeak ? `Your primary technical gap is ${topWeak.name} (scored at ${topWeak.score}% vs ${topWeak.target}% target). Recommend initiating a targeted vulnerability drill now.` : 'Your diagnostic skill matrix is currently meeting all baseline parameters!';
      } else if (lower.includes('interview') || lower.includes('interrogat')) {
        aiText += 'In technical interrogation, state architectural trade-offs before writing code. Use the STAR framework for behavioral vectors.';
      } else if (lower.includes('project') || lower.includes('mission')) {
        aiText += 'Complete remaining mission milestones in Project Challenge and submit for AI Evaluation to boost your readiness score past 85%.';
      } else if (lower.includes('internship') || lower.includes('job')) {
        aiText += 'Based on your verified skills, you have an 88% match for upcoming Full Stack and Backend engineering internships.';
      } else {
        aiText += `Maintain your daily cadence of ${onboarding?.learningTime || '1 hour/day'}. You are in the top 15% readiness bracket for entry-level engineering roles.`;
      }

      sounds.playSuccess();
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 600);
  };

  const quickPrompts = [
    'What is my biggest skill gap?',
    'How do I pass the AI interview?',
    'Check internship matches',
  ];

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Toggle Button with Red Noir Glow */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { sounds.playClick(); setOpen(true); }}
          className="sf-btn sf-btn-primary sf-glow-red"
          style={{
            borderRadius: 999,
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#080808',
            border: '1px solid var(--sf-accent)',
            boxShadow: '0 8px 30px rgba(239, 35, 60, 0.4)',
          }}
        >
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ fontWeight: 800, letterSpacing: '0.05em', color: '#fff', fontSize: '0.875rem' }}>AI COPILOT</span>
        </motion.button>
      )}

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="sf-card sf-glow-red"
            style={{
              width: 380,
              height: 520,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239,35,60,0.15)',
              border: '1px solid var(--sf-border-glow)',
              background: 'rgba(8, 8, 8, 0.98)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'rgba(239,35,60,0.08)',
              borderBottom: '1px solid var(--sf-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sf-accent)', boxShadow: '0 0 8px var(--sf-accent)' }} />
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#fff', letterSpacing: '0.05em' }}>
                    SKILLFORGE COPILOT
                  </p>
                  <p className="sf-label" style={{ fontSize: '0.65rem', color: 'var(--sf-accent-light)' }}>
                    NEURAL AGENT ACTIVE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--sf-text-muted)', cursor: 'pointer', fontSize: 18, padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: 'var(--sf-radius-sm)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    background: m.sender === 'user' ? 'var(--sf-accent)' : 'rgba(255,255,255,0.03)',
                    color: '#ffffff',
                    border: m.sender === 'ai' ? '1px solid var(--sf-border)' : 'none',
                    boxShadow: m.sender === 'user' ? '0 4px 15px rgba(239,35,60,0.3)' : 'none',
                  }}
                >
                  {m.text}
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--sf-radius-sm)', border: '1px solid var(--sf-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div className="sf-pulse-dot" />
                  <span className="sf-text-sm" style={{ fontSize: '0.75rem', color: 'var(--sf-text-muted)' }}>Synthesizing career advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div style={{ padding: '8px 14px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#050505' }}>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--sf-border)',
                    color: 'var(--sf-text-secondary)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div style={{ padding: 14, borderTop: '1px solid var(--sf-border)', display: 'flex', gap: 10, background: '#050505' }}>
              <input
                className="sf-input"
                style={{ fontSize: '0.85rem', padding: '10px 14px', background: '#080808' }}
                placeholder="Ask intelligence copilot..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <MagneticButton
                className="sf-btn sf-btn-primary sf-btn-sm"
                onClick={() => handleSend()}
                disabled={!query.trim() || isTyping}
              >
                SEND →
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICopilotWidget;
