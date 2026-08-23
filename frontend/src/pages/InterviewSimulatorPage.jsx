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
  const [orbState, setOrbState] = useState('idle');
  
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
    project: { bg: 'rgba(255,82,119,0.15)', color: '#FF5277' },
    technical: { bg: 'rgba(255,255,255,0.1)', color: '#FFFFFF' },
    behavioral: { bg: 'rgba(255,225,53,0.15)', color: '#FFE135' },
    hr: { bg: 'rgba(179,136,255,0.1)', color: '#B388FF' },
  };

  // 01 — Intro Stage
  if (stage === 'intro') {
    return (
      <div className="sf-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A14' }}>
        <div className="sf-container" style={{ maxWidth: 640 }}>
          <CardTilt3D maxRotation={4}>
            <div style={{ padding: 48, textAlign: 'center', background: '#111122', border: '3px solid #1A1A2E', borderRadius: 16, boxShadow: '6px 6px 0px #1A1A2E' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <InterviewOrb3D state="idle" size={170} />
              </div>
              <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.08em' }}>
                AI INTERROGATION MODULE
              </h1>
              <p style={{ color: '#B0B0CC', marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>
                Initiating rigorous technical evaluation. The neural interviewer continuously adapts to your identified skill gaps and project architecture.
              </p>
              
              <div style={{ background: '#050510', padding: 20, borderRadius: 12, border: '2px solid #2A2A3E', marginBottom: 32, textAlign: 'left' }}>
                <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#FFE135', marginBottom: 14, textTransform: 'uppercase' }}>ASSESSMENT EVALUATION VECTORS:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(catColors).map(([cat, style]) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, background: style.color, borderRadius: '50%', boxShadow: `0 0 8px ${style.color}` }} />
                      <span style={{ fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', fontSize: '0.8125rem', letterSpacing: '0.05em' }}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <MagneticButton className="sf-btn sf-btn-danger sf-btn-lg sf-btn-block" onClick={startInterview}>
                INITIALIZE INTERVIEW SESSION →
              </MagneticButton>
              {interview?.completed && (
                <button className="sf-btn sf-btn-ghost" style={{ marginTop: 16, width: '100%', color: '#B0B0CC', borderColor: '#3A3A4E' }} onClick={() => setStage('results')}>
                  ACCESS PREVIOUS INTERROGATION LOGS
                </button>
              )}
            </div>
          </CardTilt3D>
        </div>
      </div>
    );
  }

  // 02 — Interview Active Stage
  if (stage === 'interview') {
    const q = questions[current];
    const catStyle = catColors[q?.category] || catColors.technical;

    return (
      <div className="sf-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A14' }}>
        <div className="sf-container" style={{ maxWidth: 840, width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#8888AA', textTransform: 'uppercase' }}>QUERY {current + 1} / {questions.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: catStyle.color, textTransform: 'uppercase' }}>VECTOR: {q?.category.toUpperCase()}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5277', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: 28, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: '#FFE135', boxShadow: '0 0 12px rgba(255,225,53,0.4)', borderRadius: 2 }}
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
              style={{
                padding: 40,
                background: '#111122',
                border: '3px solid #1A1A2E',
                borderRadius: 16,
                boxShadow: '6px 6px 0px #1A1A2E',
              }}
            >
              {/* Header with 3D Orb Feedback */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                <InterviewOrb3D state={orbState} size={84} />
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#FF5277',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                  }}>
                    {orbState === 'thinking' ? 'AI SYNTHESIZING...' : orbState === 'listening' ? 'AI LISTENING' : 'INTERROGATING'}
                  </span>
                  <p style={{ marginTop: 4, color: '#8888AA', fontSize: '0.85rem' }}>
                    Type your comprehensive response below.
                  </p>
                </div>
              </div>
              
              {/* Question terminal display */}
              <div style={{ minHeight: 100, marginBottom: 28, padding: '16px 20px', background: '#0A0A18', borderRadius: 12, border: '2px solid #2A2A3E' }}>
                <h2 style={{ lineHeight: 1.5, color: '#FFFFFF', fontFamily: '"JetBrains Mono", "Space Grotesk", monospace', fontSize: '1.05rem', fontWeight: 700 }}>
                  <span style={{ color: '#FFE135' }}>&gt;</span> {displayedQuestion}
                  <span style={{ color: '#FFE135', animation: 'blink 1s step-end infinite' }}>_</span>
                </h2>
              </div>
              
              {/* Answer textarea */}
              <textarea
                rows={7}
                style={{
                  width: '100%',
                  fontFamily: '"JetBrains Mono", "Space Grotesk", monospace',
                  fontSize: '0.95rem',
                  background: '#0A0A18',
                  color: '#FFFFFF',
                  padding: 18,
                  border: '2px solid #2A2A3E',
                  borderRadius: 12,
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="Transmit technical response or architectural proof..."
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
              />
                
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                <span style={{ color: '#6666AA', fontSize: '0.75rem' }}>
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

  // 03 — Results Stage
  if (stage === 'results' && results) {
    return (
      <div className="sf-page" style={{ background: '#0A0A14' }}>
        <div className="sf-container" style={{ maxWidth: 920 }}>
          <div className="sf-animate-slide">
            
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 44, filter: 'drop-shadow(0 0 16px rgba(255,82,119,0.5))', marginBottom: 12 }}>📋</div>
              <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2rem', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>INTERROGATION LOGS</h1>
              <p style={{ marginTop: 6, letterSpacing: '0.1em', color: '#FFE135', fontSize: '0.85rem', fontWeight: 700 }}>EVALUATION MATRIX COMPLETE</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
              {/* Overall Score */}
              <CardTilt3D maxRotation={4}>
                <div style={{ textAlign: 'center', padding: 36, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#111122', border: '3px solid #1A1A2E', borderRadius: 16, boxShadow: '6px 6px 0px #1A1A2E' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#FF5277', marginBottom: 14, textTransform: 'uppercase' }}>OVERALL CONFIDENCE</p>
                  <p style={{ fontSize: '4.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}>
                    <AnimatedCounter value={results.overall} duration={1300} suffix="%" />
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#FF5277',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    borderRadius: 6,
                    alignSelf: 'center',
                    marginTop: 14,
                    textTransform: 'uppercase',
                  }}>VERIFIED BENCHMARK</span>
                </div>
              </CardTilt3D>

              {/* Score Breakdown */}
              <div style={{ padding: 32, background: '#111122', border: '3px solid #1A1A2E', borderRadius: 16, boxShadow: '6px 6px 0px #1A1A2E' }}>
                <h3 style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#FFE135', marginBottom: 20, textTransform: 'uppercase' }}>VECTOR BREAKDOWN</h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  {Object.entries(results.scores).map(([key, score]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ textTransform: 'uppercase', width: 140, fontSize: '0.8125rem', color: '#B0B0CC', fontWeight: 700 }}>{key}</span>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            height: '100%',
                            borderRadius: 3,
                            background: score >= 80 ? '#FF5277' : '#FFE135',
                            boxShadow: score >= 80 ? '0 0 10px rgba(255,82,119,0.4)' : 'none',
                          }}
                        />
                      </div>
                      <span style={{ color: score >= 80 ? '#FF5277' : '#FFFFFF', fontWeight: 800, fontSize: '0.85rem', minWidth: 44, textAlign: 'right' }}>
                        <AnimatedCounter value={score} duration={1100} suffix="%" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>
              <div style={{ padding: 28, background: '#111122', border: '3px solid #1A1A2E', borderRadius: 16, boxShadow: '6px 6px 0px #1A1A2E', borderTop: '4px solid #00F5A0' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#FFFFFF', marginBottom: 14, textTransform: 'uppercase' }}>OBSERVED STRENGTHS</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {results.feedback?.strengths?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#00F5A0', marginTop: 2 }}>✓</span>
                      <p style={{ fontSize: '0.875rem', color: '#B0B0CC', lineHeight: 1.5 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: 28, background: '#111122', border: '3px solid #1A1A2E', borderRadius: 16, boxShadow: '6px 6px 0px #1A1A2E', borderTop: '4px solid #FF5277' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#FF5277', marginBottom: 14, textTransform: 'uppercase' }}>SYSTEMIC IMPROVEMENTS</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {results.feedback?.improvements?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFE135', marginTop: 2 }}>⚠</span>
                      <p style={{ fontSize: '0.875rem', color: '#B0B0CC', lineHeight: 1.5 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <MagneticButton className="sf-btn sf-btn-ghost" style={{ color: '#B0B0CC', borderColor: '#3A3A4E' }} onClick={() => setStage('intro')}>
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