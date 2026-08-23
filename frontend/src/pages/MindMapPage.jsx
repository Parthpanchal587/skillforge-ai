import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { generateMindMap } from '../services/aiEngine';
import GravityPlayground from '../components/playful/GravityPlayground';
import ZeroGToggle from '../components/playful/ZeroGToggle';
import GelatinousButton from '../components/playful/GelatinousButton';

const STATUS_CONFIG = {
  MASTERED: { color: '#00F5A0', bg: '#F0FFF8', badge: '🏆 Mastered' },
  LEARNING: { color: '#FFE135', bg: '#FFFDF0', badge: '⚡ Learning' },
  DEVELOPING: { color: '#00D4FF', bg: '#F0FBFF', badge: '💪 Developing' },
  NEEDS_IMPROVEMENT: { color: '#FF6B9D', bg: '#FFF0F5', badge: '⚠️ Needs Focus' },
  AVAILABLE: { color: '#7E7E9A', bg: '#FAF7F2', badge: '🔓 Available' },
  LOCKED: { color: '#A8A8C0', bg: '#F2EDE4', badge: '🔒 Locked' },
};

const MindMapPage = () => {
  const navigate = useNavigate();
  const { selectedDomain, skillScores } = useStore();
  const domain = DOMAINS.find((d) => d.id === selectedDomain);

  if (!domain) {
    return (
      <div className="sf-page flex items-center justify-center min-h-[80vh] p-4">
        <div className="sf-card max-w-md text-center p-10 bg-white">
          <p className="text-6xl mb-4 animate-bounce">🎈</p>
          <h2 className="sf-heading sf-heading-lg mb-3">SELECT A SKILL TRACK</h2>
          <p className="sf-text mb-6">Complete your quick interest assessment to inflate your physical skill toybox!</p>
          <GelatinousButton variant="primary" size="lg" className="w-full" onClick={() => navigate('/interest-assessment')}>
            Let's see what you're made of →
          </GelatinousButton>
        </div>
      </div>
    );
  }

  const nodes = generateMindMap(domain.id, skillScores);
  const mastered = nodes.filter((n) => n.status === 'MASTERED').length;
  const total = nodes.length;
  const progress = Math.round((mastered / total) * 100);

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 980 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE135] border-2 border-[#1A1A2E] rounded-full text-xs font-black uppercase mb-3 shadow-[2px_2px_0px_#1A1A2E]">
                <span>🎈</span> PHYSICAL SKILL TOYBOX
              </div>
              <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
                {domain.name}
              </h1>
              <p className="sf-text font-bold text-sm mt-1">
                {mastered} OF {total} SKILLS MASTERED ({progress}% COMPLETE)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ZeroGToggle />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="sf-progress-bar mb-8" style={{ height: 16 }}>
            <div className="sf-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Full Interactive 2D Physics Gravity Toybox */}
          <div className="mb-8">
            <GravityPlayground
              skills={domain.skills}
              skillScores={skillScores}
              height={440}
              onSelectSkill={(skillId) => navigate('/practice-tests', { state: { skillId } })}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <span
                key={key}
                className="sf-badge"
                style={{ backgroundColor: config.bg, color: '#1A1A2E' }}
              >
                {config.badge}
              </span>
            ))}
          </div>

          {/* Skills Breakdown List */}
          <div className="flex flex-col gap-4">
            <h3 className="sf-heading sf-heading-sm text-[#1A1A2E]">
              ALL SKILL BLOCKS ({nodes.length})
            </h3>

            {nodes.map((node) => {
              const cfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.LOCKED;
              const isLocked = node.status === 'LOCKED';

              return (
                <div
                  key={node.id}
                  className={`sf-node ${isLocked ? 'sf-node-locked' : ''} flex items-center justify-between gap-4`}
                  onClick={() => !isLocked && navigate('/practice-tests', { state: { skillId: node.id } })}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl border-2 border-[#1A1A2E] flex items-center justify-center text-xl flex-shrink-0 shadow-[2px_2px_0px_#1A1A2E]"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {isLocked ? '🔒' : node.score >= 85 ? '🏆' : node.score >= 60 ? '⚡' : '🎈'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-[#1A1A2E]">{node.name}</span>
                        <span className="text-xs font-black text-[#7E7E9A] bg-[#FAF7F2] px-2 py-0.5 border border-[#1A1A2E] rounded-md">
                          ~{node.estimatedHours}H
                        </span>
                      </div>

                      {node.score > 0 && (
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="sf-progress-bar w-32 sm:w-48 sf-progress-thin">
                            <div className="sf-progress-fill" style={{ width: `${node.score}%`, background: cfg.color }} />
                          </div>
                          <span className="text-xs font-black text-[#1A1A2E]">{node.score}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {node.testsTaken > 0 && (
                      <span className="text-xs font-black uppercase text-[#7E7E9A] hidden sm:inline-block">
                        {node.testsTaken} Quizzes
                      </span>
                    )}
                    {!isLocked && (
                      <span className="text-lg font-black text-[#1A1A2E] px-2">→</span>
                    )}
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

export default MindMapPage;
