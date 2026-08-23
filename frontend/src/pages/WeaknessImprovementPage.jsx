import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import GelatinousButton from '../components/playful/GelatinousButton';
import XpGainToast from '../components/motion/XpGainToast';
import { sounds } from '../services/soundEffects';

const WeaknessImprovementPage = () => {
  const navigate = useNavigate();
  const { weaknesses, updateSkillScore, addXP } = useStore();
  const [activeSkill, setActiveSkill] = useState(null);
  const [completedTopics, setCompletedTopics] = useState({});
  const [xpToast, setXpToast] = useState({ visible: false, amount: 50 });

  const topWeaknesses = weaknesses?.top || [];
  const strengths = weaknesses?.strengths || [];

  const improvementTopics = {
    'rest-apis': [
      { id: 't1', title: 'HTTP Methods & Status Code Playground', content: 'GET retrieves, POST creates, PUT replaces, PATCH updates, DELETE removes. Learn when to use 200, 201, 400, 401, 404, 500 status codes.' },
      { id: 't2', title: 'Request/Response Contract Validation', content: 'Implement schema validation (Zod/Joi), centralized error middleware, and consistent RFC 7807 problem payloads.' },
      { id: 't3', title: 'Rate Limiting & Token Bucket Algorithms', content: 'Protect endpoints using Redis token bucket rate limiting and IP/bearer token throttling.' },
    ],
    'sql': [
      { id: 't4', title: 'Indexing Strategies (B-Tree vs Hash)', content: 'Analyze query execution plans with EXPLAIN ANALYZE. Build composite indexes and eliminate sequential table scans.' },
      { id: 't5', title: 'ACID Transactions & Isolation Levels', content: 'Understand Read Committed, Repeatable Read, and Serializable levels to prevent dirty reads and phantom reads.' },
    ],
    'auth': [
      { id: 't6', title: 'JWT Cryptographic Security & Refresh Rotation', content: 'Structure JWTs (header.payload.signature), implement short-lived access tokens + rotating refresh token cookies.' },
      { id: 't7', title: 'OAuth 2.0 PKCE Flow Implementation', content: 'Implement authorization code flow with Proof Key for Code Exchange to prevent client-side interception.' },
    ],
  };

  const handleCompleteTopic = (skillId, topicId) => {
    try { sounds.playSuccess(); } catch (e) {}
    setCompletedTopics((prev) => ({ ...prev, [topicId]: true }));
    if (addXP) addXP(50);
    setXpToast({ visible: true, amount: 50 });
    setTimeout(() => setXpToast({ visible: false, amount: 50 }), 1200);

    if (updateSkillScore) {
      updateSkillScore(skillId, 15);
    }
  };

  if (topWeaknesses.length === 0) {
    return (
      <div className="sf-page flex items-center justify-center min-h-[80vh] p-4">
        <div className="sf-container max-w-md text-center">
          <div className="sf-card p-10 bg-white">
            <span className="text-6xl mb-4 block animate-bounce">🛡️</span>
            <h2 className="sf-heading sf-heading-lg mb-3">ZERO SKILL GAPS DETECTED!</h2>
            <p className="sf-text mb-6">All benchmarks met. You're physically untouchable in this track.</p>
            <GelatinousButton variant="primary" size="lg" className="w-full" onClick={() => navigate('/practice-tests')}>
              Practice Quizzes →
            </GelatinousButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-page">
      <XpGainToast xp={xpToast.amount} isVisible={xpToast.visible} />

      <div className="sf-container" style={{ maxWidth: 880 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-2 animate-bounce">🎯</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              WEAKNESS CRUSHER & DRILLS
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Targeted quick injections to pop critical hiring bottlenecks!
            </p>
          </div>

          {/* Strengths Row */}
          {strengths.length > 0 && (
            <div className="sf-card p-5 mb-6 bg-white">
              <p className="sf-label mb-2 text-[#00F5A0]">✓ VERIFIED CORE STRENGTHS</p>
              <div className="flex gap-2.5 flex-wrap">
                {strengths.map((s) => (
                  <span
                    key={s.skillId}
                    className="px-3.5 py-1.5 rounded-full bg-[#F0FFF8] border-2 border-[#1A1A2E] text-xs font-black text-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]"
                  >
                    {s.name} • {s.score}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weakness Drills List */}
          <div className="flex flex-col gap-5">
            {topWeaknesses.map((w, idx) => {
              const isActive = activeSkill === w.skillId || idx === 0;
              const topics = improvementTopics[w.skillId] || [
                { id: `${w.skillId}-1`, title: `${w.name} Architecture Fundamentals`, content: `Review structural core principles of ${w.name} to establish baseline competency.` },
                { id: `${w.skillId}-2`, title: `${w.name} Production Failure Modes`, content: `Identify edge cases and debugging strategies for ${w.name} in scalable systems.` },
              ];

              return (
                <div
                  key={w.skillId}
                  className="sf-card p-6 bg-white"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      try { sounds.playClick(); } catch (e) {}
                      setActiveSkill(isActive ? null : w.skillId);
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FFE0EB] border-2 border-[#1A1A2E] flex items-center justify-center font-black text-lg text-[#FF5277] shadow-[2px_2px_0px_#1A1A2E] flex-shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-[#1A1A2E]">{w.name}</h3>
                        <span className="sf-badge sf-badge-red">CRITICAL GAP</span>
                      </div>
                      <p className="text-xs font-bold text-[#7E7E9A] mt-1 line-clamp-1">{w.reason}</p>
                    </div>

                    <div className="flex gap-4 text-right items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#7E7E9A]">CURRENT</p>
                        <p className="text-base font-black text-[#1A1A2E]">{w.score}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#00F5A0]">TARGET</p>
                        <p className="text-base font-black text-[#00F5A0]">{w.target}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Remediation Drill Accordion */}
                  {isActive && (
                    <div className="mt-6 pt-5 border-t-2 border-[#1A1A2E]">
                      <p className="sf-label mb-3 text-[#1A1A2E] text-xs">
                        QUICK REMEDIATION DRILLS:
                      </p>
                      
                      <div className="flex flex-col gap-3">
                        {topics.map((topic) => {
                          const isDone = completedTopics[topic.id];

                          return (
                            <div
                              key={topic.id}
                              className={`p-4 rounded-xl border-2 border-[#1A1A2E] ${
                                isDone ? 'bg-[#EFE9DF] opacity-75 shadow-none' : 'bg-[#FAF7F2] shadow-[3px_3px_0px_#1A1A2E]'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-extrabold text-sm text-[#1A1A2E]">
                                  {isDone ? `✓ ${topic.title}` : topic.title}
                                </h4>
                                <span className="text-xs font-black text-[#FF6B9D]">+50 XP</span>
                              </div>
                              <p className="text-xs font-semibold text-[#424264] mb-3 leading-relaxed">
                                {topic.content}
                              </p>
                              <GelatinousButton
                                variant={isDone ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={() => handleCompleteTopic(w.skillId, topic.id)}
                                disabled={isDone}
                              >
                                {isDone ? 'COMPLETED & BOOSTED ✓' : 'COMPLETE DRILL (+15% BOOST) ⚡'}
                              </GelatinousButton>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeaknessImprovementPage;
