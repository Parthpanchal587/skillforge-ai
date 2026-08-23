import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { calculateCareerReadiness } from '../services/aiEngine';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const SkillPassportPage = () => {
  const store = useStore();
  const {
    user,
    onboarding,
    selectedDomain,
    skillScores,
    projectProgress,
    interview,
    careerReadiness,
    achievements,
    xp,
    streak,
    assessmentResults,
  } = store;
  const domain = DOMAINS.find((d) => d.id === selectedDomain);
  const cr = careerReadiness || calculateCareerReadiness({ skillScores, projectProgress, interview, domainCompletion: 0 });
  const [tab, setTab] = useState('overview');

  const skills = Object.entries(skillScores || {});
  const earnedAch = (achievements || []).filter((a) => a.earned);

  const circumference = 2 * Math.PI * 70;
  const crScore = cr?.overall || 0;
  const offset = circumference - (crScore / 100) * circumference;

  const tabs = [
    { id: 'overview', label: 'IDENTITY 🪪' },
    { id: 'skills', label: 'SKILL BLOCKS 🎈' },
    { id: 'evidence', label: 'EVIDENCE 💻' },
    { id: 'achievements', label: 'TROPHIES 🏆' },
  ];

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 940 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-2 animate-bounce">🎫</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              SECRET SKILL PASSPORT
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Verified cryptographic proof of your physical mastery & built projects!
            </p>
          </div>

          {/* Big Neo-Brutalist Passport Badge Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="sf-card p-8 sm:p-10 mb-8 bg-[#FFE135] border-4 border-[#1A1A2E] shadow-[8px_8px_0px_#1A1A2E] relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Circular Gauge */}
              <div className="sf-gauge flex-shrink-0 bg-white rounded-full p-2 border-3 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]" style={{ width: 170, height: 170 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="66" className="sf-gauge-track" style={{ stroke: '#EFE9DF' }} />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="66"
                    className="sf-gauge-fill"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ stroke: '#00F5A0' }}
                  />
                </svg>
                <div className="text-center z-10">
                  <p className="sf-gauge-value" style={{ fontSize: '2.5rem' }}>
                    <AnimatedCounter value={crScore} duration={1300} suffix="%" />
                  </p>
                  <p className="sf-gauge-label">READINESS</p>
                </div>
              </div>

              {/* Player Metadata */}
              <div className="flex-1 w-full text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-white border-2 border-[#1A1A2E] rounded-full text-xs font-black uppercase mb-2 shadow-[2px_2px_0px_#1A1A2E]">
                  PASSPORT ID #{user?.id || '2026-DEV'}
                </div>
                <h2 className="sf-heading sf-heading-xl text-[#1A1A2E] mb-2">
                  {onboarding?.name || user?.username || 'PLAYER 1'}
                </h2>
                <p className="font-extrabold text-sm text-[#424264] mb-4">
                  {onboarding?.education || 'Computer Science'} • {onboarding?.year || 'Batch 2026'}
                </p>

                {domain && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-[#1A1A2E] rounded-full mb-6 shadow-[2px_2px_0px_#1A1A2E]">
                    <span className="text-lg">{domain.icon}</span>
                    <span className="font-black text-xs uppercase text-[#1A1A2E]">
                      {domain.name} SPECIALIST
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 p-3.5 bg-white border-2 border-[#1A1A2E] rounded-2xl shadow-[3px_3px_0px_#1A1A2E] text-center">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#7E7E9A]">TOTAL XP</span>
                    <p className="font-black text-base text-[#1A1A2E] mt-0.5">
                      <AnimatedCounter value={xp} duration={1000} />
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#7E7E9A]">STREAK</span>
                    <p className="font-black text-base text-[#1A1A2E] mt-0.5">
                      <AnimatedCounter value={streak} duration={900} suffix="d" />
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#7E7E9A]">TROPHIES</span>
                    <p className="font-black text-base text-[#1A1A2E] mt-0.5">
                      <AnimatedCounter value={earnedAch.length} duration={800} />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="sf-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`sf-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => {
                  try { sounds.playClick(); } catch (e) {}
                  setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab 1: Overview */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="sf-card p-6 bg-white">
                    <span className="sf-badge sf-badge-cyan mb-4">READINESS REPORT</span>
                    <div className="flex flex-col gap-3">
                      {Object.entries(cr?.breakdown || {}).map(([key, score]) => (
                        <div key={key} className="sf-skill-bar">
                          <span className="sf-skill-name text-xs font-black uppercase">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="sf-skill-track">
                            <motion.div
                              className="sf-skill-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.8 }}
                              style={{ background: '#FFE135' }}
                            />
                          </div>
                          <span className="sf-skill-score">{score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sf-card p-6 bg-white flex flex-col justify-between">
                    <div>
                      <span className="sf-badge sf-badge-pink mb-4">VERIFICATION AUDIT</span>
                      <div className="flex flex-col gap-4 mt-2">
                        <div className="flex gap-3 items-center">
                          <span className="text-2xl">🛡️</span>
                          <div>
                            <p className="font-extrabold text-sm text-[#1A1A2E]">Cryptographic Proof</p>
                            <p className="text-xs text-[#7E7E9A]">Skills signed by SkillForge engine</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="text-2xl">💻</span>
                          <div>
                            <p className="font-extrabold text-sm text-[#1A1A2E]">Code Artifacts Validated</p>
                            <p className="text-xs text-[#7E7E9A]">Clean architecture and test suites checked</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="font-extrabold text-sm text-[#1A1A2E]">Adaptive Benchmark</p>
                            <p className="text-xs text-[#7E7E9A]">Matched against Tier 1 engineering bars</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-[#1A1A2E]">
                      <GelatinousButton
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => { try { sounds.playSuccess(); } catch (e) {} }}
                      >
                        Download PDF Passport 📥
                      </GelatinousButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Skills */}
              {tab === 'skills' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.map(([id, data]) => (
                    <div key={id} className="sf-card p-4 flex items-center justify-between bg-white">
                      <div>
                        <p className="font-extrabold text-sm text-[#1A1A2E]">{id}</p>
                        <span className="text-[10px] font-black uppercase text-[#7E7E9A]">
                          STATUS: {data.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="sf-progress-bar w-24 sf-progress-thin">
                          <div className="sf-progress-fill" style={{ width: `${data.score}%`, background: '#00F5A0' }} />
                        </div>
                        <span className="font-black text-sm text-[#1A1A2E] w-10 text-right">
                          {data.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Evidence */}
              {tab === 'evidence' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="sf-card p-6 text-center bg-[#DDF9FF]">
                    <span className="text-4xl mb-2 block animate-bounce">⚡</span>
                    <h4 className="sf-label text-xs mb-2 text-[#1A1A2E]">QUIZ SCORE</h4>
                    <p className="text-4xl font-black text-[#1A1A2E] font-['Space_Grotesk']">
                      <AnimatedCounter value={assessmentResults?.overall || 88} suffix="%" />
                    </p>
                  </div>
                  <div className="sf-card p-6 text-center bg-[#FFF8D6]">
                    <span className="text-4xl mb-2 block animate-bounce">💻</span>
                    <h4 className="sf-label text-xs mb-2 text-[#1A1A2E]">PROJECT SCORE</h4>
                    <p className="text-4xl font-black text-[#1A1A2E] font-['Space_Grotesk']">
                      <AnimatedCounter value={projectProgress?.evaluation?.overall || 92} suffix="%" />
                    </p>
                  </div>
                  <div className="sf-card p-6 text-center bg-[#FFE0EB]">
                    <span className="text-4xl mb-2 block animate-bounce">🎤</span>
                    <h4 className="sf-label text-xs mb-2 text-[#1A1A2E]">INTERVIEW SCORE</h4>
                    <p className="text-4xl font-black text-[#1A1A2E] font-['Space_Grotesk']">
                      <AnimatedCounter value={interview?.overall || 84} suffix="%" />
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Achievements */}
              {tab === 'achievements' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(achievements || []).map((a) => (
                    <div
                      key={a.id}
                      className={`sf-card p-6 text-center flex flex-col items-center justify-center ${
                        a.earned ? 'bg-[#F0FFF8]' : 'bg-[#EFE9DF] opacity-60'
                      }`}
                    >
                      <span className="text-5xl mb-2 block">
                        {a.icon}
                      </span>
                      <p className="font-black text-sm text-[#1A1A2E]">
                        {a.title}
                      </p>
                      <p className="text-xs font-bold text-[#7E7E9A] mt-1">
                        {a.earned ? 'Unlocked 🎉' : 'Locked 🔒'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default SkillPassportPage;
