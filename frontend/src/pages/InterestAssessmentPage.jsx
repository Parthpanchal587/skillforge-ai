import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { INTEREST_QUESTIONS } from '../data/domainsData';

const InterestAssessmentPage = () => {
  const navigate = useNavigate();
  const { completeInterestAssessment } = useStore();
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState(null);

  const options = [
    { value: 1, label: 'Strongly Disagree', emoji: '😐' },
    { value: 2, label: 'Disagree', emoji: '🤔' },
    { value: 3, label: 'Neutral', emoji: '😊' },
    { value: 4, label: 'Agree', emoji: '👍' },
    { value: 5, label: 'Strongly Agree', emoji: '🔥' },
  ];

  const handleAnswer = (value) => {
    const q = INTEREST_QUESTIONS[current];
    const newResponses = { ...responses, [q.id]: { dimension: q.dimension, value } };
    setResponses(newResponses);

    if (current < INTEREST_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      calculateProfile(newResponses);
    }
  };

  const calculateProfile = (resp) => {
    const dimensions = {};
    Object.values(resp).forEach(({ dimension, value }) => {
      if (!dimensions[dimension]) dimensions[dimension] = { total: 0, count: 0 };
      dimensions[dimension].total += value;
      dimensions[dimension].count += 1;
    });
    const result = {};
    Object.entries(dimensions).forEach(([dim, { total, count }]) => {
      result[dim] = Math.round((total / (count * 5)) * 100);
    });
    setProfile(result);
    setCompleted(true);
  };

  const handleContinue = () => {
    completeInterestAssessment(profile);
    navigate('/skill-assessment');
  };

  const progress = ((current + 1) / INTEREST_QUESTIONS.length) * 100;

  const dimensionLabels = {
    problemSolving: '🧩 Problem Solving',
    coding: '💻 Coding',
    design: '🎨 Design',
    data: '📊 Data',
    ai: '🤖 AI / ML',
    security: '🔒 Security',
    cloud: '☁️ Cloud',
    appBuilding: '📱 App Building',
  };

  if (completed && profile) {
    return (
      <div className="sf-page sf-ambient-bg">
        <div className="sf-container" style={{ maxWidth: 640 }}>
          <div className="sf-card sf-animate-in" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h1 className="sf-heading sf-heading-lg" style={{ marginBottom: 8 }}>Your Interest Profile</h1>
            <p className="sf-text" style={{ marginBottom: 32 }}>Here's what we discovered about your interests</p>
            <div style={{ display: 'grid', gap: 12, textAlign: 'left', marginBottom: 32 }}>
              {Object.entries(profile).sort((a, b) => b[1] - a[1]).map(([dim, score]) => (
                <div key={dim} className="sf-skill-bar">
                  <span className="sf-skill-name">{dimensionLabels[dim] || dim}</span>
                  <div className="sf-skill-track">
                    <div className="sf-skill-fill" style={{
                      width: `${score}%`,
                      background: score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444',
                    }} />
                  </div>
                  <span className="sf-skill-score" style={{ color: score >= 80 ? '#10b981' : score >= 60 ? '#818cf8' : score >= 40 ? '#fbbf24' : '#f87171' }}>{score}%</span>
                </div>
              ))}
            </div>
            <button className="sf-btn sf-btn-primary sf-btn-lg" onClick={handleContinue}>Continue to Skill Assessment →</button>
          </div>
        </div>
      </div>
    );
  }

  const q = INTEREST_QUESTIONS[current];

  return (
    <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sf-container" style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="sf-text-sm">Question {current + 1} of {INTEREST_QUESTIONS.length}</span>
            <span className="sf-text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="sf-progress-bar">
            <div className="sf-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="sf-card sf-animate-in" key={current} style={{ padding: 40 }}>
          <p className="sf-label" style={{ marginBottom: 16 }}>Interest Assessment</p>
          <h2 className="sf-heading sf-heading-md" style={{ marginBottom: 32, lineHeight: 1.4 }}>{q.text}</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {options.map(opt => (
              <button key={opt.value}
                className={`sf-option${responses[q.id]?.value === opt.value ? ' selected' : ''}`}
                onClick={() => handleAnswer(opt.value)}>
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <span style={{ fontWeight: 500 }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestAssessmentPage;
