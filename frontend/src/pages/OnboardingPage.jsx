import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { HandwritingSvg } from '@/components/ui/handwriting-svg';

const STEPS = [
  { key: 'welcome', title: 'Welcome' },
  { key: 'basics', title: 'About You' },
  { key: 'experience', title: 'Experience' },
  { key: 'goals', title: 'Goals' },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', education: '', year: '', experience: 'beginner',
    knownLanguages: [], interests: [], learningTime: '1 hour/day',
    careerGoal: '', preferredDomain: '',
  });

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'HTML/CSS', 'SQL', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby'];
  const interests = ['Web Development', 'App Development', 'AI / Machine Learning', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'Full Stack', 'Problem Solving', 'Open Source'];

  const toggleItem = (field, item) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item],
    }));
  };

  const handleComplete = () => {
    completeOnboarding(data);
    navigate('/interest-assessment');
  };

  const canProceed = () => {
    if (step === 1) return data.name.trim() && data.education;
    return true;
  };

  return (
    <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sf-container" style={{ maxWidth: 640, width: '100%' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 999,
                background: i <= step ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
                transition: 'all 0.5s',
              }} />
              <p style={{ fontSize: '0.6875rem', color: i <= step ? '#818cf8' : '#64748b', marginTop: 6, textAlign: 'center' }}>{s.title}</p>
            </div>
          ))}
        </div>

        <div className="sf-card sf-animate-in" style={{ padding: 40 }}>
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h1 className="sf-heading sf-heading-xl" style={{ marginBottom: 12 }}>Welcome to SkillForge AI</h1>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
                <HandwritingSvg
                  text="Prove You're Ready"
                  width={340}
                  height={90}
                  fontSize={44}
                  strokeWidth={2}
                  duration={2.5}
                  className="text-indigo-400"
                />
              </div>
              <p className="sf-text" style={{ marginBottom: 32 }}>Let's understand your background and goals to create a personalized learning journey.</p>
              <button className="sf-btn sf-btn-primary sf-btn-lg" onClick={() => setStep(1)}>Let's Begin →</button>
            </div>
          )}

          {step === 1 && (
            <div className="sf-stagger">
              <h2 className="sf-heading sf-heading-lg" style={{ marginBottom: 24 }}>Tell us about yourself</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 6 }}>Your Name *</label>
                  <input className="sf-input" placeholder="e.g., Prem" value={data.name} onChange={e => setData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 6 }}>Education Level *</label>
                  <select className="sf-input" value={data.education} onChange={e => setData(prev => ({ ...prev, education: e.target.value }))}>
                    <option value="">Select...</option>
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="BSc CS">BSc CS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 6 }}>Current Year</label>
                  <select className="sf-input" value={data.year} onChange={e => setData(prev => ({ ...prev, year: e.target.value }))}>
                    <option value="">Select...</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="sf-stagger">
              <h2 className="sf-heading sf-heading-lg" style={{ marginBottom: 24 }}>Your Experience</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 8 }}>Programming Experience</label>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <label key={level} className={`sf-option${data.experience === level ? ' selected' : ''}`}>
                        <input type="radio" name="experience" checked={data.experience === level} onChange={() => setData(prev => ({ ...prev, experience: level }))} />
                        <div>
                          <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{level}</p>
                          <p className="sf-text-sm">{level === 'beginner' ? 'Just starting out' : level === 'intermediate' ? 'Built some projects' : 'Comfortable with complex projects'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 8 }}>Languages You Know (select all that apply)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {languages.map(lang => (
                      <button key={lang} onClick={() => toggleItem('knownLanguages', lang)}
                        className={`sf-btn sf-btn-sm ${data.knownLanguages.includes(lang) ? 'sf-btn-primary' : 'sf-btn-secondary'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="sf-stagger">
              <h2 className="sf-heading sf-heading-lg" style={{ marginBottom: 24 }}>Your Goals</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 8 }}>What interests you? (select all)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {interests.map(item => (
                      <button key={item} onClick={() => toggleItem('interests', item)}
                        className={`sf-btn sf-btn-sm ${data.interests.includes(item) ? 'sf-btn-primary' : 'sf-btn-secondary'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 6 }}>Career Goal (optional)</label>
                  <input className="sf-input" placeholder="e.g., Full Stack Developer, AI Engineer..." value={data.careerGoal} onChange={e => setData(prev => ({ ...prev, careerGoal: e.target.value }))} />
                </div>
                <div>
                  <label className="sf-label" style={{ display: 'block', marginBottom: 6 }}>Preferred Learning Time</label>
                  <select className="sf-input" value={data.learningTime} onChange={e => setData(prev => ({ ...prev, learningTime: e.target.value }))}>
                    <option value="30 min/day">30 minutes/day</option>
                    <option value="1 hour/day">1 hour/day</option>
                    <option value="2 hours/day">2 hours/day</option>
                    <option value="3+ hours/day">3+ hours/day</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button className="sf-btn sf-btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
              {step < STEPS.length - 1 ? (
                <button className="sf-btn sf-btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>Continue →</button>
              ) : (
                <button className="sf-btn sf-btn-primary sf-btn-lg" onClick={handleComplete}>Start My Journey 🚀</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
