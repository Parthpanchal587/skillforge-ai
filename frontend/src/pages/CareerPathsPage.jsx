import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS, TARGET_ROLES } from '../data/domainsData';
import { analyzeRoleGap } from '../services/aiEngine';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const CareerPathsPage = () => {
  const navigate = useNavigate();
  const { selectedDomain, skillScores } = useStore();
  const domain = DOMAINS.find((d) => d.id === selectedDomain);
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]?.id || 'frontend-dev');

  const gapAnalysis = analyzeRoleGap(selectedRole, skillScores);

  const handleRoleSelect = (roleId) => {
    try { sounds.playClick(); } catch (e) {}
    setSelectedRole(roleId);
  };

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 980 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-2 animate-bounce">🗺️</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              CAREER MAP & BOSS ROLES
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Pick your dream role & see which skills are anchoring you down!
            </p>
          </div>

          {/* Interactive Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {TARGET_ROLES.map((role) => {
              const analysis = analyzeRoleGap(role.id, skillScores);
              const isSelected = selectedRole === role.id;

              return (
                <motion.div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`sf-card p-5 cursor-pointer flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#FFE135] shadow-[6px_6px_0px_#1A1A2E] transform -translate-y-1'
                      : 'bg-white shadow-[3px_3px_0px_#1A1A2E]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">{role.icon}</span>
                      {isSelected && <span className="sf-badge sf-badge-pink">LOCKED IN</span>}
                    </div>
                    <h3 className="font-extrabold mt-3 text-base text-[#1A1A2E]">{role.name}</h3>
                  </div>

                  {analysis && (
                    <div className="mt-4">
                      <div className="sf-progress-bar" style={{ height: 10 }}>
                        <div
                          className="sf-progress-fill"
                          style={{
                            width: `${analysis.readiness}%`,
                            background: analysis.readiness >= 80 ? '#00F5A0' : '#00D4FF',
                          }}
                        />
                      </div>
                      <p className="text-xs font-black mt-2 text-[#1A1A2E]">
                        <AnimatedCounter value={analysis.readiness} duration={800} suffix="% Match" />
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Focused Career Blueprint Card */}
          {gapAnalysis && (
            <AnimatePresence mode="wait">
              <motion.div
                key={gapAnalysis.role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="sf-card p-8 bg-white mb-8"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b-2 border-[#1A1A2E]">
                  <div className="w-16 h-16 rounded-2xl bg-[#DDF9FF] border-3 border-[#1A1A2E] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1A1A2E] flex-shrink-0">
                    {gapAnalysis.role.icon}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <h2 className="sf-heading sf-heading-lg text-[#1A1A2E]">{gapAnalysis.role.name}</h2>
                      <span className="sf-badge sf-badge-green">TIER 1 BENCHMARK</span>
                    </div>
                    <p className="sf-text-sm font-bold text-[#7E7E9A] mt-1">
                      Path: <strong className="text-[#1A1A2E]">{gapAnalysis.role.progression?.join(' → ') || 'Intern → Junior → Senior → Staff'}</strong>
                    </p>
                  </div>
                  <div className="text-center p-3 px-6 bg-[#FAF7F2] rounded-xl border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                    <p className="text-3xl font-black text-[#1A1A2E] leading-none">
                      <AnimatedCounter value={gapAnalysis.readiness} suffix="%" />
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#7E7E9A] mt-1">READINESS</p>
                  </div>
                </div>

                {/* Skills Match Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Verified Skills */}
                  <div>
                    <p className="sf-label mb-3 text-[#00F5A0] text-xs">
                      ✓ UNLOCKED SKILLS ({gapAnalysis.matched.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {gapAnalysis.matched.length > 0 ? (
                        gapAnalysis.matched.map((s) => (
                          <div
                            key={s.skillId}
                            className="p-3 rounded-xl bg-[#F0FFF8] border-2 border-[#1A1A2E] flex justify-between items-center shadow-[2px_2px_0px_#1A1A2E]"
                          >
                            <span className="font-extrabold text-sm text-[#1A1A2E]">{s.skillId}</span>
                            <span className="font-black text-sm text-[#00F5A0]">{s.score}%</span>
                          </div>
                        ))
                      ) : (
                        <p className="sf-text-sm text-[#7E7E9A]">No matched skills yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Gaps */}
                  <div>
                    <p className="sf-label mb-3 text-[#FF5277] text-xs">
                      ⚠️ HEAVY GAPS TO BRIDGE ({gapAnalysis.missing.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {gapAnalysis.missing.length > 0 ? (
                        gapAnalysis.missing.map((s) => (
                          <div
                            key={s.skillId}
                            className="p-3 rounded-xl bg-[#FFF0F4] border-2 border-[#1A1A2E] flex justify-between items-center shadow-[2px_2px_0px_#1A1A2E]"
                          >
                            <span className="font-extrabold text-sm text-[#FF5277]">{s.skillId}</span>
                            <span className="font-black text-xs text-[#7E7E9A]">{s.score}% current</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-[#F0FFF8] border-2 border-[#1A1A2E] rounded-xl text-[#00F5A0] font-black text-sm shadow-[2px_2px_0px_#1A1A2E]">
                          🎉 100% READY! You meet all baseline role requirements.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t-2 border-[#1A1A2E]">
                  <GelatinousButton variant="secondary" size="md" onClick={() => navigate('/mind-map')}>
                    Inspect in Toybox 🎈
                  </GelatinousButton>
                  <GelatinousButton variant="primary" size="md" onClick={() => navigate('/weakness-improvement')}>
                    Crush These Gaps ⚡
                  </GelatinousButton>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </div>
    </div>
  );
};

export default CareerPathsPage;
