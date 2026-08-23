import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { ASSESSMENT_QUESTIONS } from '../data/domainsData';
import { recommendDomain } from '../services/aiEngine';
import { sounds } from '../services/soundEffects';

const SkillAssessmentPage = () => {
  const navigate = useNavigate();
  const { completeAssessment, setDomainRecommendation, interestProfile } = useStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (option) => {
    sounds.playClick();
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected) return;
    sounds.playClick();
    const q = ASSESSMENT_QUESTIONS[current];
    const newAnswers = { ...answers, [q.id]: { selected, correct: q.correct, topic: q.topic, difficulty: q.difficulty } };
    setAnswers(newAnswers);
    setSelected(null);

    if (current < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      sounds.playSuccess();
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (ans) => {
    const topicScores = {};
    const topicCounts = {};
    let correct = 0;

    Object.values(ans).forEach(a => {
      if (!topicScores[a.topic]) { topicScores[a.topic] = 0; topicCounts[a.topic] = 0; }
      topicCounts[a.topic]++;
      if (a.selected === a.correct) { correct++; topicScores[a.topic]++; }
    });

    Object.keys(topicScores).forEach(t => {
      topicScores[t] = Math.round((topicScores[t] / topicCounts[t]) * 100);
    });

    const diffScores = { easy: 0, medium: 0, hard: 0 };
    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    Object.values(ans).forEach(a => {
      diffCounts[a.difficulty]++;
      if (a.selected === a.correct) diffScores[a.difficulty]++;
    });
    Object.keys(diffScores).forEach(d => {
      diffScores[d] = diffCounts[d] > 0 ? Math.round((diffScores[d] / diffCounts[d]) * 100) : 0;
    });

    const r = {
      overall: Math.round((correct / ASSESSMENT_QUESTIONS.length) * 100),
      topicScores, totalQuestions: ASSESSMENT_QUESTIONS.length,
      correctAnswers: correct, timeSpent: timer, difficulty: diffScores,
    };
    setResults(r);
    setShowResults(true);
    completeAssessment(r);

    const rec = recommendDomain(interestProfile || {}, r);
    setDomainRecommendation(rec);
  };

  const progress = ((current + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (showResults && results) {
    return (
      <div className="sf-page sf-ambient-bg">
        <div className="sf-container" style={{ maxWidth: 700 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
            className="sf-card" style={{ padding: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} style={{ fontSize: 56, marginBottom: 12 }}>
                📊
              </motion.div>
              <h1 className="sf-heading sf-heading-lg">Assessment Complete</h1>
              <p className="sf-text" style={{ marginTop: 8 }}>Here's your skill profile</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sf-card-flat" style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: results.overall >= 70 ? '#10b981' : results.overall >= 50 ? '#f59e0b' : '#ef4444' }}>{results.overall}%</p>
                <p className="sf-text-sm">Overall Score</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sf-card-flat" style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#818cf8' }}>{results.correctAnswers}/{results.totalQuestions}</p>
                <p className="sf-text-sm">Correct</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sf-card-flat" style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#22d3ee' }}>{formatTime(results.timeSpent)}</p>
                <p className="sf-text-sm">Time</p>
              </motion.div>
            </div>

            <h3 className="sf-heading sf-heading-sm" style={{ marginBottom: 16 }}>Topic Performance</h3>
            <div style={{ display: 'grid', gap: 8, marginBottom: 32 }}>
              {Object.entries(results.topicScores).sort((a, b) => b[1] - a[1]).map(([topic, score], idx) => (
                <motion.div key={topic} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="sf-skill-bar">
                  <span className="sf-skill-name">{topic}</span>
                  <div className="sf-skill-track">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      className="sf-skill-fill" style={{ background: score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="sf-skill-score" style={{ color: score >= 80 ? '#10b981' : score >= 60 ? '#818cf8' : score >= 40 ? '#fbbf24' : '#f87171' }}>{score}%</span>
                </motion.div>
              ))}
            </div>

            <h3 className="sf-heading sf-heading-sm" style={{ marginBottom: 12 }}>Difficulty Performance</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              {Object.entries(results.difficulty).map(([d, score]) => (
                <div key={d} className="sf-card-flat" style={{ flex: 1, textAlign: 'center', padding: 16 }}>
                  <span className={`sf-badge ${d === 'easy' ? 'sf-badge-green' : d === 'medium' ? 'sf-badge-amber' : 'sf-badge-red'}`} style={{ marginBottom: 8, textTransform: 'capitalize' }}>{d}</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{score}%</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="sf-btn sf-btn-primary sf-btn-lg" onClick={() => { sounds.playClick(); navigate('/domain-recommendation'); }}>
                View AI Domain Recommendation →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = ASSESSMENT_QUESTIONS[current];

  return (
    <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sf-container" style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="sf-text-sm">Question {current + 1} of {ASSESSMENT_QUESTIONS.length}</span>
          <span className="sf-text-sm">⏱ {formatTime(timer)}</span>
        </div>
        <div className="sf-progress-bar" style={{ marginBottom: 24 }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ ease: 'easeInOut', duration: 0.4 }} className="sf-progress-fill" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
            className="sf-card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className={`sf-badge ${q.difficulty === 'easy' ? 'sf-badge-green' : q.difficulty === 'medium' ? 'sf-badge-amber' : 'sf-badge-red'}`}>{q.difficulty}</span>
              <span className="sf-badge sf-badge-indigo">{q.topic}</span>
            </div>
            <h2 className="sf-heading sf-heading-md" style={{ marginBottom: 24, lineHeight: 1.5 }}>{q.question}</h2>
            <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
              {q.options.map(opt => (
                <motion.button key={opt} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className={`sf-option${selected === opt ? ' selected' : ''}`} onClick={() => handleSelect(opt)}>
                  <span style={{ fontWeight: 500 }}>{opt}</span>
                </motion.button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="sf-btn sf-btn-primary" onClick={handleNext} disabled={!selected}>
                {current < ASSESSMENT_QUESTIONS.length - 1 ? 'Next →' : 'Finish Assessment'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkillAssessmentPage;