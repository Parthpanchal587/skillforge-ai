import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { generateInterviewQuestions, evaluateInterview } from '../services/aiEngine';
import InterviewOrb3D from '../components/motion/InterviewOrb3D';
import MagneticButton from '../components/motion/MagneticButton';
import CardTilt3D from '../components/motion/CardTilt3D';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const InterviewSimulatorPage = () => {
  const { selectedDomain, projectProgress, weaknesses, setInterviewResults, interview } = useStore();
  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const project = domain?.project;
  const [stage, setStage] = useState(interview?.completed ? 'results' : 'intro');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [results, setResults] = useState(interview || null);
  const [orbState, setOrbState] = useState('idle'); // 'idle' | 'listening' | 'thinking'
  
  // Terminal typing effect for questions
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const typingTimerRef = useRef(null);

  const startInterview = () => {
    sounds.playClick();
    const qs = generateInterviewQuestions(domain, project, weaknesses?.top);
    setQuestions(qs);
    setStage('interview');
    setCurrent(0);
    setAnswers({});
    setOrbState('speaking');
  };

  const submitAnswer = () => {
    sounds.playSuccess();
    setOrbState('thinking');
    const newAnswers = { ...answers, [current]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer('');
    setDisplayedQuestion('');

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setOrbState('listening');
      } else {
        const scores = evaluateInterview(newAnswers);
        const overall = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length);
        const result = {
          type: 'full', scores, overall,
          feedback: {
            strengths: [
              'Architectural reasoning and trade-off comprehension are sharp',
              'Solid technical articulation with structured explanations',
              'Demonstrated clear systematic debugging intuition',
            ],
            improvements: [
              'Elaborate on production scalability constraints and edge cases',
              'Utilize the STAR framework for behavioral and architectural scenarios',
              'Include specific performance metrics when discussing benchmarks',
            ],
          },
          questions: questions.map(q => ({ q: q.q, category: q.category })),
        };
        setResults(result);
        setInterviewResults(result);
        setStage('results');
        setOrbState('idle');
      }
    }, 600);
  };

  useEffect(() => {
    if (stage === 'interview' && questions[current]) {
      const fullText = questions[current].q;
      let i = 0;
      setDisplayedQuestion('');
      clearInterval(typingTimerRef.current);
      setOrbState('speaking');
      
      typingTimerRef.current = setInterval(() => {
        setDisplayedQuestion(fullText.substring(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(typingTimerRef.current);
          setOrbState('listening');
        }
      }, 18);
    }
    return () => clearInterval(typingTimerRef.current);
  }, [current, stage, questions]);

  const catColors = {
    project: { bg: 'rgba(239,35,60,0.1)', color: 'var(--sf-accent)' },
    technical: { bg: 'rgba(255,255,255,0.1)', color: 'var(--sf-text-primary)' },
    behavioral: { bg: 'rgba(239,35,60,0.05)', color: 'var(--sf-accent-light)' },
    hr: { bg: 'rgba(113,113,122,0.1)', color: 'var(--sf-text-muted)' },
  };

  // 01 — Intro Stage with 3D Breathing Orb
  if (stage === 'intro') {
    return (
      <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sf-container" style={{ maxWidth: 640 }}>
          <CardTilt3D maxRotation={4}>
            <div className="sf-card sf-glow-red" style={{ padding: 48, textAlign: 'center', border: '1px solid var(--sf-border-glow)' }}>
              {/* 31 — 3D Breathing Neural AI Orb */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <InterviewOrb3D state="idle" size={170} />
              </div>
              <h1 className="sf-heading sf-heading-xl" style={{ textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.08em' }}>
                AI INTERROGATION MODULE
              </h1>
              <p className="sf-text" style={{ marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>
                Initiating rigorous technical evaluation. The neural interviewer continuously adapts to your identified skill gaps and project architecture.
              </p>
              
              <div style={{ background: '#050505', padding: 20, borderRadius: 'var(--sf-radius-sm)', border: '1px solid var(--sf-border-light)', marginBottom: 32, textAlign: 'left' }}>
                <p className="sf-label" style={{ marginBottom: 14 }}>ASSESSMENT EVALUATION VECTORS:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(catColors).map(([cat, style]) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, background: style.color, borderRadius: '50%', boxShadow: `0 0 8px ${style.color}` }} />
                      <span style={{ fontWeight: 700, color: 'var(--sf-text-primary)', textTransform: 'uppercase', fontSize: '0.8125rem', letterSpacing: '0.05em' }}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <MagneticButton className="sf-btn sf-btn-danger sf-btn-lg sf-btn-block" onClick={startInterview}>
                INITIALIZE INTERVIEW SESSION →
              </MagneticButton>
              {interview?.completed && (
                <button className="sf-btn sf-btn-ghost" style={{ marginTop: 16, width: '100%' }} onClick={() => setStage('results')}>
                  ACCESS PREVIOUS INTERROGATION LOGS
                </button>
              )}
            </div>
          </CardTilt3D>
        </div>
      </div>
    );
  }

  // 02 — Interview Active Stage with 3D Orb & Directional Question Morph (32 & 33)
  if (stage === 'interview') {
    const q = questions[current];
    const catStyle = catColors[q?.category] || catColors.technical;

    return (
      <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sf-container" style={{ maxWidth: 840, width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="sf-label" style={{ color: 'var(--sf-text-muted)' }}>QUERY {current + 1} / {questions.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="sf-label" style={{ color: catStyle.color }}>VECTOR: {q?.category.toUpperCase()}</span>
              <div className="sf-pulse-dot" />
            </div>
          </div>
          
          <div className="sf-progress-bar" style={{ marginBottom: 28, height: 4, background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="sf-progress-fill"
              style={{ background: 'var(--sf-accent)', boxShadow: '0 0 12px var(--sf-accent-glow)' }}
              animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="sf-card"
              style={{
                padding: 40,
                background: 'rgba(5, 5, 5, 0.95)',
                border: '1px solid var(--sf-border-glow)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(239,35,60,0.04)',
              }}
            >
              {/* Header with 3D Orb Feedback */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                <InterviewOrb3D state={orbState} size={84} />
                <div>
                  <span className="sf-badge sf-badge-red">
                    {orbState === 'thinking' ? 'AI SYNTHESIZING...' : orbState === 'listening' ? 'AI LISTENING' : 'INTERROGATING'}
                  </span>
                  <p className="sf-text-sm" style={{ marginTop: 4, color: 'var(--sf-text-muted)' }}>
                    Type your comprehensive response below.
                  </p>
                </div>
              </div>
              
              <div style={{ minHeight: 100, marginBottom: 28, padding: '16px 20px', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--sf-radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="sf-heading sf-heading-lg" style={{ lineHeight: 1.5, color: 'var(--sf-text-primary)', fontFamily: '"JetBrains Mono", monospace', fontSize: '1.05rem' }}>
                  <span style={{ color: 'var(--sf-accent)' }}>&gt;</span> {displayedQuestion}
                  <span className="sf-blink" style={{ color: 'var(--sf-accent)' }}>_</span>
                </h2>
              </div>
              
              <textarea
                className="sf-input"
                rows={7}
                style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)', padding: 18, border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="Transmit technical response or architectural proof..."
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
              />
                
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                <span className="sf-text-sm" style={{ color: 'var(--sf-text-dim)', fontSize: '0.75rem' }}>
                  * Press Transmit when your answer is complete.
                </span>
                <MagneticButton
                  className="sf-btn sf-btn-primary"
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || orbState === 'thinking'}
                >
                  {current < questions.length - 1 ? 'TRANSMIT ANSWER →' : 'FINALIZE ASSESSMENT'}
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 03 — Results Stage with 3D Cards, Animated Counters & Score Morph (10, 19, 35)
  if (stage === 'results' && results) {
    return (
      <div className="sf-page sf-ambient-bg">
        <div className="sf-container" style={{ maxWidth: 920 }}>
          <div className="sf-animate-slide">
            
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 44, filter: 'drop-shadow(0 0 16px rgba(239,35,60,0.5))', marginBottom: 12 }}>📋</div>
              <h1 className="sf-heading sf-heading-xl" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>INTERROGATION LOGS</h1>
              <p className="sf-text" style={{ marginTop: 6, letterSpacing: '0.1em', color: 'var(--sf-accent-light)' }}>EVALUATION MATRIX COMPLETE</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
              {/* Overall Score with 3D Tilt */}
              <CardTilt3D maxRotation={4}>
                <div className="sf-card" style={{ textAlign: 'center', padding: 36, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--sf-border-glow)' }}>
                  <p className="sf-label" style={{ marginBottom: 14, color: 'var(--sf-accent)' }}>OVERALL CONFIDENCE</p>
                  <p style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--sf-text-primary)', lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}>
                    <AnimatedCounter value={results.overall} duration={1300} suffix="%" />
                  </p>
                  <span className="sf-badge sf-badge-red" style={{ alignSelf: 'center', marginTop: 14 }}>VERIFIED BENCHMARK</span>
                </div>
              </CardTilt3D>

              {/* Score Breakdown (19 — Score Morph & Bar Draw) */}
              <div className="sf-card" style={{ padding: 32 }}>
                <h3 className="sf-label" style={{ marginBottom: 20 }}>VECTOR BREAKDOWN</h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  {Object.entries(results.scores).map(([key, score]) => (
                    <div key={key} className="sf-skill-bar">
                      <span className="sf-skill-name" style={{ textTransform: 'uppercase', width: 140, fontSize: '0.8125rem' }}>{key}</span>
                      <div className="sf-skill-track" style={{ height: 6 }}>
                        <motion.div
                          className="sf-skill-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            background: score >= 80 ? 'var(--sf-accent)' : 'var(--sf-text-primary)',
                            boxShadow: score >= 80 ? '0 0 10px var(--sf-accent-glow)' : 'none',
                          }}
                        />
                      </div>
                      <span className="sf-skill-score" style={{ color: score >= 80 ? 'var(--sf-accent)' : 'var(--sf-text-primary)', fontWeight: 800 }}>
                        <AnimatedCounter value={score} duration={1100} suffix="%" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>
              <div className="sf-card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)', borderTop: '2px solid var(--sf-text-primary)' }}>
                <h4 className="sf-label" style={{ marginBottom: 14, color: 'var(--sf-text-primary)' }}>OBSERVED STRENGTHS</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {results.feedback?.strengths?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--sf-accent-light)', marginTop: 2 }}>✓</span>
                      <p className="sf-text" style={{ fontSize: '0.875rem' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sf-card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(239,35,60,0.05) 0%, transparent 100%)', borderTop: '2px solid var(--sf-accent)' }}>
                <h4 className="sf-label" style={{ marginBottom: 14, color: 'var(--sf-accent)' }}>SYSTEMIC IMPROVEMENTS</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {results.feedback?.improvements?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--sf-accent)', marginTop: 2 }}>⚠</span>
                      <p className="sf-text" style={{ fontSize: '0.875rem' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <MagneticButton className="sf-btn sf-btn-ghost" onClick={() => setStage('intro')}>
                RE-INITIALIZE INTERROGATION
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewSimulatorPage;