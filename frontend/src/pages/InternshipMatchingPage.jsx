import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { matchInternships } from '../services/aiEngine';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const InternshipMatchingPage = () => {
  const { skillScores, selectedDomain } = useStore();
  const internships = matchInternships(skillScores, selectedDomain);
  const [applied, setApplied] = useState({});

  const handleApply = (id) => {
    try { sounds.playSuccess(); } catch (e) {}
    setApplied((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 940 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-2 animate-bounce">🏢</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              INTERNSHIP & JOB MATCHES
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Real industry gigs matched against your live physical skill inventory!
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {internships.map((intern) => {
              const isApplied = applied[intern.id];

              return (
                <div
                  key={intern.id}
                  className="sf-card p-6 sm:p-8 bg-white"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="sf-heading sf-heading-md text-[#1A1A2E]">{intern.title}</h3>
                        <span className="sf-badge sf-badge-pink">{intern.label}</span>
                      </div>
                      <p className="sf-text text-sm font-bold">
                        <strong className="text-[#1A1A2E]">{intern.company}</strong> • {intern.location}
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="text-center min-w-[90px] p-3 bg-[#FAF7F2] rounded-2xl border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] self-start sm:self-auto">
                      <p className="text-2xl font-black text-[#1A1A2E] leading-none font-['Space_Grotesk']">
                        <AnimatedCounter value={intern.matchScore} suffix="%" />
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#7E7E9A] mt-1">MATCH SCORE</p>
                    </div>
                  </div>

                  <p className="sf-text text-sm mb-5 leading-relaxed">
                    {intern.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAF7F2] rounded-xl border-2 border-[#1A1A2E] mb-5 text-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#7E7E9A]">STIPEND</p>
                      <p className="font-black text-sm text-[#1A1A2E] mt-0.5">{intern.stipend}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#7E7E9A]">TIMELINE</p>
                      <p className="font-black text-sm text-[#1A1A2E] mt-0.5">{intern.duration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#7E7E9A]">TYPE</p>
                      <p className="font-black text-sm text-[#1A1A2E] mt-0.5">{intern.type}</p>
                    </div>
                  </div>

                  {/* Matched & Missing Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="sf-label mb-2 text-[#00F5A0] text-xs">
                        ✓ MATCHED SKILLS ({intern.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {intern.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-md bg-[#F0FFF8] border border-[#1A1A2E] text-xs font-black text-[#1A1A2E]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {intern.missingSkills.length > 0 && (
                      <div>
                        <p className="sf-label mb-2 text-[#FF5277] text-xs">
                          ⚠️ MISSING SKILLS ({intern.missingSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {intern.missingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-md bg-[#FFF0F4] border border-[#1A1A2E] text-xs font-bold text-[#FF5277]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t-2 border-[#1A1A2E]">
                    <div className="sf-progress-bar w-36" style={{ height: 10 }}>
                      <motion.div
                        className="sf-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${intern.matchScore}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ background: '#FFE135' }}
                      />
                    </div>

                    <GelatinousButton
                      variant={isApplied ? 'secondary' : 'primary'}
                      size="md"
                      onClick={() => handleApply(intern.id)}
                      disabled={isApplied}
                    >
                      {isApplied ? '✓ Application Sent!' : 'Apply with Skill Passport →'}
                    </GelatinousButton>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InternshipMatchingPage;
