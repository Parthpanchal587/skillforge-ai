import React, { useState } from 'react';
import { sounds } from '../services/soundEffects';

const SLIDES = [
  {
    id: 1,
    title: 'The Engineering Graduate Crisis',
    subtitle: 'Degrees exist. Proof does not.',
    icon: '⚡',
    content: [
      { label: 'The Problem', detail: '80%+ of engineering graduates in emerging markets are deemed unhireable due to lack of practical evidence, not lack of certificates.' },
      { label: 'Traditional Platforms', detail: 'Coursera / Udemy provide passive video watches. LeetCode focuses purely on competitive algorithms, missing holistic career readiness.' },
    ],
  },
  {
    id: 2,
    title: 'The SkillForge AI Solution',
    subtitle: 'Don\'t Just Learn. Prove You\'re Ready.',
    icon: '🎯',
    content: [
      { label: 'Continuous Engine', detail: 'ASSESS → DIAGNOSE → LEARN → TEST → ADAPT → BUILD → PROVE → IMPROVE → INTERVIEW → MATCH' },
      { label: 'Skill Passport', detail: 'Verifiable, evidence-backed proof combining assessment accuracy, milestone projects, and AI-simulated interview performance.' },
    ],
  },
  {
    id: 3,
    title: 'The AI Adaptive Core',
    subtitle: 'Personalized engineering progression in real-time',
    icon: '🤖',
    content: [
      { label: 'Dynamic Mind Maps', detail: 'Skill nodes unlock based on performance. High scores accelerate, weak scores trigger targeted remediation sessions.' },
      { label: 'Simulated Interviews', detail: 'Personalized technical and behavioral question generation tailored to the candidate\'s actual project code and detected gaps.' },
    ],
  },
  {
    id: 4,
    title: 'Market Opportunity & Business Model',
    subtitle: 'Freemium to Enterprise Career Bridge',
    icon: '🚀',
    content: [
      { label: 'B2C Subscription', detail: 'Free tier for onboarding + basic assessments; Pro (₹499/mo) for unlimited AI tests, project scoring, and interview practice.' },
      { label: 'B2B Employer Matching', detail: 'Companies pay for pre-verified, evidence-backed candidate pools, reducing hiring latency and screening costs by 70%.' },
    ],
  },
];

const PitchDeckModal = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];

  const handleNext = () => {
    sounds.playClick();
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(c => c + 1);
  };

  const handlePrev = () => {
    sounds.playClick();
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  return (
    <div className="sf-overlay" onClick={onClose}>
      <div className="sf-modal sf-animate-scale" style={{ maxWidth: 720, padding: 36, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, background: 'transparent',
          border: 'none', color: 'var(--sf-text-muted)', fontSize: 20, cursor: 'pointer',
        }}>✕</button>

        {/* Header indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span className="sf-badge sf-badge-indigo">SkillForge AI Pitch Deck • Slide {currentSlide + 1} / {SLIDES.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                width: 24, height: 4, borderRadius: 999,
                background: i === currentSlide ? '#6366f1' : 'rgba(99,102,241,0.2)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Slide Content */}
        <div className="sf-slide sf-animate-in" key={currentSlide} style={{ padding: '20px 0', minHeight: 320 }}>
          <span style={{ fontSize: 44, marginBottom: 12 }}>{slide.icon}</span>
          <h2 className="sf-heading sf-heading-lg" style={{ marginBottom: 6 }}>{slide.title}</h2>
          <p className="sf-text" style={{ color: 'var(--sf-accent-light)', marginBottom: 28 }}>{slide.subtitle}</p>

          <div style={{ display: 'grid', gap: 16, width: '100%', textAlign: 'left' }}>
            {slide.content.map((item, idx) => (
              <div key={idx} className="sf-card-flat" style={{ padding: 20, background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4, color: 'var(--sf-text-primary)' }}>{item.label}</h4>
                <p className="sf-text-sm" style={{ lineHeight: 1.6 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--sf-border)' }}>
          <button className="sf-btn sf-btn-ghost" onClick={handlePrev} disabled={currentSlide === 0}>
            ← Previous
          </button>
          {currentSlide < SLIDES.length - 1 ? (
            <button className="sf-btn sf-btn-primary" onClick={handleNext}>Next Slide →</button>
          ) : (
            <button className="sf-btn sf-btn-primary" onClick={onClose}>Explore Platform 🚀</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PitchDeckModal;
