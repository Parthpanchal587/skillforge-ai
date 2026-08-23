import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { calculateCareerReadiness } from '../services/aiEngine';
import GravityPlayground from '../components/playful/GravityPlayground';
import ZeroGToggle from '../components/playful/ZeroGToggle';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import XpGainToast from '../components/motion/XpGainToast';
import { sounds } from '../services/soundEffects';

const DashboardPage = () => {
  const navigate = useNavigate();
  const store = useStore();
  const {
    user,
    onboarding,
    selectedDomain,
    skillScores,
    projectProgress,
    interview,
    careerReadiness,
    weaknesses,
    dailyPlan,
    xp,
    streak,
    achievements,
    currentLevel,
    toggleDailyTask,
    demoMode,
  } = store;

  const [xpToast, setXpToast] = useState({ visible: false, amount: 25 });

  const domain = DOMAINS.find((d) => d.id === selectedDomain);
  const skills = Object.entries(skillScores || {});
  const avgSkill = skills.length > 0 ? Math.round(skills.reduce((s, [, sk]) => s + sk.score, 0) / skills.length) : 0;
  const cr = careerReadiness || (skills.length > 0 ? calculateCareerReadiness({
    skillScores, projectProgress, interview, domainCompletion: avgSkill,
  }) : null);

  const biggestGap = weaknesses?.top?.[0];
  const earnedAchievements = (achievements || []).filter((a) => a.earned);

  const handleTaskCheck = (index) => {
    try { sounds.playSuccess(); } catch (e) {}
    toggleDailyTask(index);
    setXpToast({ visible: true, amount: 35 });
    setTimeout(() => setXpToast({ visible: false, amount: 35 }), 1200);
  };

  // If no onboarding, show playful drop-in welcome card
  if (!onboarding?.completed && !demoMode) {
    return (
      <div className="sf-page flex items-center justify-center min-h-[85vh] p-4">
        <div className="sf-container max-w-lg text-center">
          <motion.div
            initial={{ scale: 0.8, y: -40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="sf-card p-10 bg-white"
          >
            <div className="text-6xl mb-4 animate-bounce">🎪</div>
            <h1 className="sf-heading sf-heading-xl mb-3 text-[#1A1A2E]">
              WELCOME TO THE SKILL TOYBOX!
            </h1>
            <p className="sf-text mb-8 text-base leading-relaxed">
              No boring dashboards here. SkillForge tests your skills, drops them into a real physics sandbox, finds what's breaking, and helps you master your craft!
            </p>
            <div className="flex flex-col gap-4">
              <GelatinousButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/onboarding')}
              >
                Drop me into the playground! 🎪
              </GelatinousButton>
              <GelatinousButton
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => store.loginDemo()}
              >
                🎮 Skip the boring part (Load Demo Profile)
              </GelatinousButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 60;
  const crScore = cr?.overall || 0;
  const offset = circumference - (crScore / 100) * circumference;

  return (
    <div className="sf-page">
      <div className="sf-container sf-stagger">
        {/* Header with Arcade Zero-G Switch */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <XpGainToast xp={xpToast.amount} isVisible={xpToast.visible} />
          <div>
            <h1 className="sf-heading sf-heading-xl flex items-center gap-2">
              Hey, {onboarding?.name || user?.username || 'Player 1'}! 👋
            </h1>
            <p className="sf-text text-sm font-bold text-[#424264] mt-1">
              Your career sandbox is fully loaded & physics-enabled.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ZeroGToggle />
            {streak > 0 && <span className="sf-badge sf-badge-amber">🔥 {streak} DAY STREAK</span>}
            <span className="sf-badge sf-badge-cyan">⚡ {xp} XP</span>
            {demoMode && <span className="sf-badge sf-badge-purple">DEMO HERO</span>}
          </div>
        </div>

        {/* 1. HERO SECTION: Interactive Generative Gravity Sandbox */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎪</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#1A1A2E]">
                PHYSICAL SKILL MATRIX • GRAB, DRAG & THROW SKILLS!
              </h2>
            </div>
            <Link
              to="/mind-map"
              className="text-xs font-black uppercase text-[#1A1A2E] hover:underline"
            >
              Open Full Toybox ↗
            </Link>
          </div>
          <GravityPlayground
            skills={domain?.skills || []}
            skillScores={skillScores}
            height={380}
            onSelectSkill={(skillId) => navigate('/practice-tests', { state: { skillId } })}
          />
        </div>

        {/* 2. CAREER READINESS CANDY GAUGE */}
        <div className="sf-card mb-8 bg-white" style={{ background: '#FFFFFF' }}>
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Gauge */}
            <div className="sf-gauge flex-shrink-0">
              <svg width="180" height="180" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" className="sf-gauge-track" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="60"
                  className="sf-gauge-fill"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </svg>
              <div className="text-center z-10">
                <p className="sf-gauge-value">
                  <AnimatedCounter value={crScore} duration={1400} suffix="%" />
                </p>
                <p className="sf-gauge-label">Readiness</p>
              </div>
            </div>

            {/* Content & Mini Bars */}
            <div className="flex-1 w-full">
              <span className="sf-badge sf-badge-green mb-2">LIVE CAREER POWER</span>
              <h2 className="sf-heading sf-heading-lg mb-2">ESTIMATED CAREER READINESS</h2>
              <p className="sf-text mb-6">
                Calculated in real-time from your test scores, battle-tested code projects, and AI interrogation logs for <strong className="text-[#1A1A2E] underline">{domain?.name || 'Full Stack Development'}</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#FAF7F2] border-2 border-[#1A1A2E] rounded-xl shadow-[2px_2px_0px_#1A1A2E]">
                  <p className="text-xs font-black flex justify-between mb-1.5 text-[#1A1A2E]">
                    <span>Technical</span>
                    <span>{avgSkill}%</span>
                  </p>
                  <div className="sf-progress-bar sf-progress-thin">
                    <div className="sf-progress-fill" style={{ width: `${avgSkill}%`, background: '#00F5A0' }} />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] border-2 border-[#1A1A2E] rounded-xl shadow-[2px_2px_0px_#1A1A2E]">
                  <p className="text-xs font-black flex justify-between mb-1.5 text-[#1A1A2E]">
                    <span>Projects</span>
                    <span>{projectProgress?.completionPercent || 0}%</span>
                  </p>
                  <div className="sf-progress-bar sf-progress-thin">
                    <div className="sf-progress-fill" style={{ width: `${projectProgress?.completionPercent || 0}%`, background: '#00D4FF' }} />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] border-2 border-[#1A1A2E] rounded-xl shadow-[2px_2px_0px_#1A1A2E]">
                  <p className="text-xs font-black flex justify-between mb-1.5 text-[#1A1A2E]">
                    <span>Interviews</span>
                    <span>{interview?.overall || 0}%</span>
                  </p>
                  <div className="sf-progress-bar sf-progress-thin">
                    <div className="sf-progress-fill" style={{ width: `${interview?.overall || 0}%`, background: '#FFE135' }} />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] border-2 border-[#1A1A2E] rounded-xl shadow-[2px_2px_0px_#1A1A2E]">
                  <p className="text-xs font-black flex justify-between mb-1.5 text-[#1A1A2E]">
                    <span>Mastery</span>
                    <span>{avgSkill}%</span>
                  </p>
                  <div className="sf-progress-bar sf-progress-thin">
                    <div className="sf-progress-fill" style={{ width: `${avgSkill}%`, background: '#FF6B9D' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CRITICAL BOTTLENECK & TARGET DOMAIN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 sf-card bg-[#FFFDF5] border-3 border-[#1A1A2E] p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="sf-badge sf-badge-red">⚠️ CRITICAL BOTTLENECK</span>
                <span className="text-xs font-black uppercase text-[#FF5277]">Requires Action</span>
              </div>

              {biggestGap ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-4 mb-4">
                    <h2 className="sf-heading sf-heading-xl text-[#1A1A2E]">{biggestGap.name}</h2>
                    <div className="flex gap-4 font-black text-sm">
                      <div><span className="text-xs text-[#7E7E9A] block">CURRENT</span> <span className="text-[#1A1A2E]">{biggestGap.score}%</span></div>
                      <div><span className="text-xs text-[#7E7E9A] block">TARGET</span> <span className="text-[#1A1A2E]">{biggestGap.target}%</span></div>
                      <div><span className="text-xs text-[#7E7E9A] block">GAP</span> <span className="text-[#FF5277]">+{biggestGap.gap}%</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-2 border-[#1A1A2E] rounded-xl shadow-[2px_2px_0px_#1A1A2E] mb-5">
                    <p className="text-xs font-black uppercase text-[#1A1A2E] mb-1">🤖 AI Diagnostics Report:</p>
                    <p className="text-sm font-semibold text-[#424264]">
                      "{biggestGap.name} is currently your primary bottleneck for {domain?.name} internship readiness. {biggestGap.reason}"
                    </p>
                  </div>
                </>
              ) : (
                <p className="sf-text">Play more skill challenges to reveal critical bottlenecks!</p>
              )}
            </div>

            <div>
              <GelatinousButton
                variant="danger"
                size="md"
                onClick={() => navigate('/weakness-improvement')}
              >
                Crush This Weakness →
              </GelatinousButton>
            </div>
          </div>

          <div className="sf-card p-6 flex flex-col justify-between bg-white">
            <div>
              <span className="sf-badge sf-badge-cyan mb-3">TARGET DOMAIN</span>
              {domain ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{domain.icon}</span>
                    <div>
                      <h3 className="sf-heading sf-heading-md">{domain.name}</h3>
                      <p className="text-xs font-extrabold text-[#7E7E9A]">Rank: {currentLevel}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1A1A2E] flex justify-between mb-1">
                      <span>Domain Completion</span>
                      <span>{avgSkill}%</span>
                    </p>
                    <div className="sf-progress-bar">
                      <div className="sf-progress-fill" style={{ width: `${avgSkill}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="sf-text text-sm">No track selected yet.</p>
              )}
            </div>

            <div className="mt-4">
              <GelatinousButton
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/mind-map')}
              >
                Inspect Domain Skills
              </GelatinousButton>
            </div>
          </div>
        </div>

        {/* 4. DAILY PLAN & VERIFIED ARTIFACTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Daily Plan */}
          <div className="sf-card p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="sf-badge sf-badge-yellow">🎯 DAILY DRILLS</span>
              <span className="text-xs font-black text-[#1A1A2E]">
                {dailyPlan.reduce((s, t) => s + t.duration, 0)} MIN TOTAL
              </span>
            </div>

            {dailyPlan.length > 0 ? (
              <div className="flex flex-col gap-3">
                {dailyPlan.map((task, i) => (
                  <motion.div
                    key={i}
                    onClick={() => handleTaskCheck(i)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-3 p-3.5 border-2 border-[#1A1A2E] rounded-xl cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-[#EFE9DF] text-[#7E7E9A] shadow-none line-through'
                        : 'bg-[#FAF7F2] shadow-[3px_3px_0px_#1A1A2E]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 border-[#1A1A2E] flex items-center justify-center text-xs font-black ${
                        task.completed ? 'bg-[#00F5A0]' : 'bg-white'
                      }`}
                    >
                      {task.completed && '✓'}
                    </div>
                    <span className="flex-1 font-bold text-sm text-[#1A1A2E]">
                      {task.task}
                    </span>
                    <span className="text-[11px] font-black uppercase text-[#7E7E9A]">
                      {task.duration}M
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="sf-text text-sm">Finish your assessment to spin up a custom daily drill set.</p>
            )}
          </div>

          {/* Quick Stats Cards */}
          <div className="sf-card p-6 bg-white">
            <span className="sf-badge sf-badge-purple mb-4">🏆 TROPHY ROOM & STATS</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Pop Quizzes', value: 'Ready', icon: '⚡', link: '/practice-tests', color: '#FFF8D6' },
                { label: 'Interview Readiness', value: interview?.overall ? `${interview.overall}%` : '—', icon: '🎤', link: '/interview-simulator', color: '#DDF9FF' },
                { label: 'Skills Mastered', value: skills.filter(([, s]) => s.score >= 85).length, icon: '🌟', link: '/skill-health', color: '#D9FFE7' },
                { label: 'Achievements', value: earnedAchievements.length, icon: '🏅', link: '/skill-passport', color: '#FFE0EB' },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="no-underline text-inherit"
                >
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="p-4 border-2 border-[#1A1A2E] rounded-xl flex flex-col justify-between h-full shadow-[3px_3px_0px_#1A1A2E]"
                    style={{ backgroundColor: stat.color }}
                  >
                    <span className="text-2xl mb-1">{stat.icon}</span>
                    <p className="text-2xl font-black text-[#1A1A2E] leading-none mb-1">{stat.value}</p>
                    <p className="text-xs font-extrabold text-[#424264]">{stat.label}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;