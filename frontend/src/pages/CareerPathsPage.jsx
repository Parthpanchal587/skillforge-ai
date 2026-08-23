import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS, TARGET_ROLES } from '../data/domainsData';
import { analyzeRoleGap, calculateAllDomainCapabilities } from '../services/aiEngine';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const CareerPathsPage = () => {
  const navigate = useNavigate();
  const { selectedDomain, skillScores, assessmentResults, interestProfile, selectDomain } = useStore();
  const [activeTab, setActiveTab] = useState('domains'); // 'domains' | 'roles'
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]?.id || 'frontend-dev');
  const [highlightedDomainId, setHighlightedDomainId] = useState(selectedDomain || DOMAINS[0]?.id);

  // Compute all domain capabilities based on starting assessment + tracked skills + interest profile
  const domainCapabilities = calculateAllDomainCapabilities(
    skillScores,
    assessmentResults,
    interestProfile,
    selectedDomain
  );

  const activeDomainInfo = domainCapabilities.find((d) => d.id === (selectedDomain || 'full-stack')) || domainCapabilities[0];
  const highlightedDomain = domainCapabilities.find((d) => d.id === highlightedDomainId) || activeDomainInfo;
  const topRecommendedDomain = domainCapabilities[0];

  const gapAnalysis = analyzeRoleGap(selectedRole, skillScores);

  const handleDomainSelect = (domainId) => {
    try { sounds.playClick(); } catch (e) {}
    setHighlightedDomainId(domainId);
  };

  const handleActivateDomain = (domainId) => {
    try { sounds.playSuccess(); } catch (e) {}
    selectDomain(domainId);
    setHighlightedDomainId(domainId);
  };

  const handleRoleSelect = (roleId) => {
    try { sounds.playClick(); } catch (e) {}
    setSelectedRole(roleId);
  };

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 1040 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2 animate-bounce">🗺️</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              CAREER MAP & DOMAIN INTELLIGENCE
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Calibrated by your diagnostic starting tests to pinpoint your exact capability percentage!
            </p>
          </div>

          {/* Diagnostic Test Calibration Status Card */}
          <div className="sf-card p-5 mb-8 bg-[#FAF7F2] border-3 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE135] border-2 border-[#1A1A2E] flex items-center justify-center text-3xl shadow-[2px_2px_0px_#1A1A2E] flex-shrink-0">
                  {assessmentResults ? '🎯' : '⚡'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="font-black text-[#1A1A2E] text-base">
                      {assessmentResults ? 'Diagnostic Starting Test: Active & Calibrated' : 'Starting Assessment: Not Yet Calibrated'}
                    </span>
                    {assessmentResults && (
                      <span className="sf-badge sf-badge-green font-extrabold text-xs">
                        {assessmentResults.overall}% Overall Aptitude
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#7E7E9A] mt-1">
                    {assessmentResults ? (
                      <>
                        Mapped across {Object.keys(assessmentResults.topicScores || {}).length} skill dimensions • Real-time syncing with all 10 engineering domains.
                      </>
                    ) : (
                      'Take a quick 5-minute diagnostic test to personalize capability metrics across all career tracks.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <GelatinousButton
                  variant={assessmentResults ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    try { sounds.playClick(); } catch (e) {}
                    navigate('/skill-assessment');
                  }}
                >
                  {assessmentResults ? '🔄 Retake Diagnostic Test' : '🚀 Take Diagnostic Test'}
                </GelatinousButton>
                {interestProfile && !assessmentResults && (
                  <GelatinousButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/interest-assessment')}
                  >
                    🎯 Interests
                  </GelatinousButton>
                )}
              </div>
            </div>

            {/* Topic Scores Breakdown Strip if Assessment is completed */}
            {assessmentResults?.topicScores && (
              <div className="mt-4 pt-4 border-t-2 border-[#1A1A2E]/10 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-black uppercase text-[#7E7E9A] mr-2">Tested Aptitudes:</span>
                {Object.entries(assessmentResults.topicScores).map(([topic, score]) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border-2 border-[#1A1A2E] bg-white shadow-[1.5px_1.5px_0px_#1A1A2E]"
                  >
                    <span>{topic}</span>
                    <span style={{ color: score >= 75 ? '#00D084' : score >= 50 ? '#FFB800' : '#FF5277' }}>
                      {score}%
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 bg-[#E8E4DF] rounded-2xl border-3 border-[#1A1A2E] shadow-[3px_3px_0px_#1A1A2E] gap-2">
              <button
                onClick={() => {
                  try { sounds.playClick(); } catch (e) {}
                  setActiveTab('domains');
                }}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
                  activeTab === 'domains'
                    ? 'bg-[#FFE135] text-[#1A1A2E] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] transform -translate-y-0.5'
                    : 'text-[#5B5B7E] hover:text-[#1A1A2E]'
                }`}
              >
                🎪 Domain Capability & Selection
              </button>
              <button
                onClick={() => {
                  try { sounds.playClick(); } catch (e) {}
                  setActiveTab('roles');
                }}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
                  activeTab === 'roles'
                    ? 'bg-[#00D4FF] text-[#1A1A2E] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] transform -translate-y-0.5'
                    : 'text-[#5B5B7E] hover:text-[#1A1A2E]'
                }`}
              >
                🎯 Target Career Roles & Gaps
              </button>
            </div>
          </div>

          {/* TAB 1: DOMAIN CAPABILITY & SELECTION */}
          {activeTab === 'domains' && (
            <div>
              {/* AI Top Recommendation Spotlight */}
              {topRecommendedDomain && (
                <div className="sf-card p-6 mb-8 bg-gradient-to-r from-[#FFF5F8] to-[#F0FFF8] border-3 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-16 h-16 rounded-2xl bg-[#00F5A0] border-3 border-[#1A1A2E] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1A1A2E] flex-shrink-0">
                        {topRecommendedDomain.icon}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="sf-badge sf-badge-pink font-black text-xs">🏆 AI TOP MATCH</span>
                          <span className="sf-badge sf-badge-green font-black text-xs">{topRecommendedDomain.capabilityTier}</span>
                        </div>
                        <h2 className="sf-heading sf-heading-md text-[#1A1A2E] mt-1">
                          {topRecommendedDomain.name}
                        </h2>
                        <p className="sf-text-sm text-[#424264] font-bold">
                          {topRecommendedDomain.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
                      <div className="text-center sm:text-right">
                        <div className="text-3xl font-black text-[#1A1A2E] leading-none">
                          <AnimatedCounter value={topRecommendedDomain.capabilityPercentage} suffix="% Capable" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-[#7E7E9A] mt-1">Calculated Fit</p>
                      </div>
                      {selectedDomain === topRecommendedDomain.id ? (
                        <span className="sf-badge sf-badge-green font-black">✓ YOUR CURRENT DOMAIN</span>
                      ) : (
                        <GelatinousButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleActivateDomain(topRecommendedDomain.id)}
                        >
                          Lock In This Domain 🚀
                        </GelatinousButton>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of All 10 Engineering Domains */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="sf-heading sf-heading-sm text-[#1A1A2E]">
                  ALL 10 ENGINEERING DOMAIN TRACKS ({domainCapabilities.length})
                </h3>
                <span className="text-xs font-bold text-[#7E7E9A]">Click any track to inspect blueprint & switch</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {domainCapabilities.map((dom) => {
                  const isHighlighted = highlightedDomainId === dom.id;
                  const isActiveDomain = selectedDomain === dom.id;

                  return (
                    <motion.div
                      key={dom.id}
                      onClick={() => handleDomainSelect(dom.id)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`sf-card p-5 cursor-pointer flex flex-col justify-between transition-all border-3 ${
                        isHighlighted
                          ? 'border-[#1A1A2E] bg-white shadow-[6px_6px_0px_#1A1A2E] ring-4 ring-[#FFE135]/60'
                          : isActiveDomain
                          ? 'border-[#1A1A2E] bg-[#F0FFF8] shadow-[4px_4px_0px_#1A1A2E]'
                          : 'border-[#1A1A2E] bg-white shadow-[3px_3px_0px_#1A1A2E]'
                      }`}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] shadow-[1.5px_1.5px_0px_#1A1A2E]">
                              {dom.icon}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-base text-[#1A1A2E]">{dom.name}</h4>
                              <p className="text-[11px] font-bold text-[#7E7E9A]">{dom.skillsCount} Core Milestones</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {isActiveDomain && (
                              <span className="sf-badge sf-badge-green text-[10px] font-black">
                                ACTIVE DOMAIN
                              </span>
                            )}
                            <span className="text-xs font-black text-[#1A1A2E]">
                              <AnimatedCounter value={dom.capabilityPercentage} suffix="%" />
                            </span>
                          </div>
                        </div>

                        {/* Capability Progress Bar */}
                        <div className="my-3">
                          <div className="sf-progress-bar" style={{ height: 10 }}>
                            <div
                              className="sf-progress-fill"
                              style={{
                                width: `${dom.capabilityPercentage}%`,
                                background:
                                  dom.capabilityPercentage >= 80
                                    ? '#00F5A0'
                                    : dom.capabilityPercentage >= 65
                                    ? '#00D4FF'
                                    : '#FFB800',
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black text-[#7E7E9A] mt-1.5">
                            <span>{dom.capabilityTier}</span>
                            <span>Aptitude: {dom.aptitudeScore}% • Match: {dom.capabilityPercentage}%</span>
                          </div>
                        </div>

                        {/* Top Skills Preview */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {dom.topSkills.map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-[#FAF7F2] border border-[#1A1A2E]/30 text-[#1A1A2E]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="mt-4 pt-3 border-t border-[#1A1A2E]/10 flex items-center justify-between">
                        <span className="text-xs font-black text-[#7E7E9A]">
                          {isHighlighted ? '👉 Selected for Blueprint' : 'Click to inspect'}
                        </span>
                        {isActiveDomain ? (
                          <span className="text-xs font-black text-[#00D084] flex items-center gap-1">
                            ✓ Currently Active
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateDomain(dom.id);
                            }}
                            className="sf-btn sf-btn-secondary sf-btn-sm"
                            style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 8 }}
                          >
                            Set Active Track 🎯
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* In-Depth Domain Blueprint Card */}
              {highlightedDomain && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={highlightedDomain.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="sf-card p-8 bg-white mb-8 border-3 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E]"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b-2 border-[#1A1A2E]">
                      <div className="w-16 h-16 rounded-2xl bg-[#FFE135] border-3 border-[#1A1A2E] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1A1A2E] flex-shrink-0">
                        {highlightedDomain.icon}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <h2 className="sf-heading sf-heading-lg text-[#1A1A2E]">{highlightedDomain.name}</h2>
                          <span className="sf-badge sf-badge-green font-black">{highlightedDomain.capabilityTier}</span>
                          {selectedDomain === highlightedDomain.id && (
                            <span className="sf-badge sf-badge-pink font-black">YOUR ACTIVE DOMAIN</span>
                          )}
                        </div>
                        <p className="sf-text-sm font-bold text-[#424264] mt-2">
                          {highlightedDomain.description}
                        </p>
                      </div>
                      <div className="text-center p-4 px-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                        <p className="text-3xl font-black text-[#1A1A2E] leading-none">
                          <AnimatedCounter value={highlightedDomain.capabilityPercentage} suffix="%" />
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#7E7E9A] mt-1">CAPABILITY SCORE</p>
                      </div>
                    </div>

                    {/* 3 Metric Breakdown Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                        <p className="text-xs font-black text-[#7E7E9A] uppercase">1. Diagnostic Aptitude</p>
                        <p className="text-2xl font-black text-[#1A1A2E] mt-1">{highlightedDomain.aptitudeScore}%</p>
                        <p className="text-[11px] font-bold text-[#424264] mt-1">From baseline topic quizzes</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                        <p className="text-xs font-black text-[#7E7E9A] uppercase">2. Practical Skill Mastery</p>
                        <p className="text-2xl font-black text-[#1A1A2E] mt-1">{highlightedDomain.masteryScore}%</p>
                        <p className="text-[11px] font-bold text-[#424264] mt-1">Tracked hands-on skill node scores</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                        <p className="text-xs font-black text-[#7E7E9A] uppercase">3. Interest & Affinity</p>
                        <p className="text-2xl font-black text-[#1A1A2E] mt-1">{highlightedDomain.interestScore}%</p>
                        <p className="text-[11px] font-bold text-[#424264] mt-1">Personality & problem preference</p>
                      </div>
                    </div>

                    {/* Domain Skills Roadmap */}
                    <div className="mb-6">
                      <p className="sf-label mb-3 text-[#1A1A2E] text-xs">
                        🚀 CURATED SKILL PROGRESSION IN THIS TRACK
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {highlightedDomain.skills.map((skill, index) => {
                          const existing = skillScores[skill.id] || skillScores[skill.id.replace('-', '')];
                          const score = existing?.score || 0;
                          return (
                            <div
                              key={skill.id}
                              className="p-3 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] flex flex-col justify-between shadow-[2px_2px_0px_#1A1A2E]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-[#7E7E9A]">#{index + 1}</span>
                                {score >= 70 ? (
                                  <span className="text-[10px] font-black text-[#00D084]">✓ {score}%</span>
                                ) : (
                                  <span className="text-[10px] font-black text-[#7E7E9A]">{score > 0 ? `${score}%` : 'Pending'}</span>
                                )}
                              </div>
                              <span className="font-extrabold text-xs text-[#1A1A2E]">{skill.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t-2 border-[#1A1A2E]">
                      <div className="flex flex-wrap gap-2">
                        <GelatinousButton
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            selectDomain(highlightedDomain.id);
                            navigate('/mind-map');
                          }}
                        >
                          Explore in Toybox 🎈
                        </GelatinousButton>
                        <GelatinousButton
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            selectDomain(highlightedDomain.id);
                            navigate('/practice-tests');
                          }}
                        >
                          Take Pop Quizzes ⚡
                        </GelatinousButton>
                      </div>

                      {selectedDomain !== highlightedDomain.id ? (
                        <GelatinousButton
                          variant="primary"
                          size="md"
                          onClick={() => handleActivateDomain(highlightedDomain.id)}
                        >
                          Set {highlightedDomain.name} as Active Track 🎯
                        </GelatinousButton>
                      ) : (
                        <span className="sf-badge sf-badge-green font-black text-sm px-4 py-2">
                          ✓ ACTIVE LEARNING TRACK
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* TAB 2: TARGET CAREER ROLES & GAP ANALYSIS */}
          {activeTab === 'roles' && (
            <div>
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
                      className={`sf-card p-5 cursor-pointer flex flex-col justify-between transition-all border-3 ${
                        isSelected
                          ? 'border-[#1A1A2E] bg-[#FFE135] shadow-[6px_6px_0px_#1A1A2E] transform -translate-y-1'
                          : 'border-[#1A1A2E] bg-white shadow-[3px_3px_0px_#1A1A2E]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{role.icon}</span>
                          {isSelected && <span className="sf-badge sf-badge-pink font-black">LOCKED IN</span>}
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
                    className="sf-card p-8 bg-white mb-8 border-3 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E]"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b-2 border-[#1A1A2E]">
                      <div className="w-16 h-16 rounded-2xl bg-[#DDF9FF] border-3 border-[#1A1A2E] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1A1A2E] flex-shrink-0">
                        {gapAnalysis.role.icon}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <h2 className="sf-heading sf-heading-lg text-[#1A1A2E]">{gapAnalysis.role.name}</h2>
                          <span className="sf-badge sf-badge-green font-black">TIER 1 BENCHMARK</span>
                        </div>
                        <p className="sf-text-sm font-bold text-[#7E7E9A] mt-1">
                          Progression: <strong className="text-[#1A1A2E]">{gapAnalysis.role.progression?.join(' → ') || 'Intern → Junior → Senior → Staff'}</strong>
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
                        <p className="sf-label mb-3 text-[#00F5A0] text-xs font-black">
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
                        <p className="sf-label mb-3 text-[#FF5277] text-xs font-black">
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
          )}

        </div>
      </div>
    </div>
  );
};

export default CareerPathsPage;
