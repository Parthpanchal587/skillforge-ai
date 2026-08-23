import React, { useState } from 'react';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { evaluateProject } from '../services/aiEngine';

const ProjectChallengePage = () => {
  const { selectedDomain, projectProgress, startProject, toggleMilestone, setProjectEvaluation } = useStore();
  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const project = domain?.project;
  const [showEval, setShowEval] = useState(false);

  if (!domain || !project) {
    return (
      <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sf-card" style={{ textAlign: 'center', padding: 40, border: '1px solid var(--sf-border-glow)' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>💻</p>
          <h2 className="sf-heading sf-heading-lg" style={{ textTransform: 'uppercase' }}>NO MISSION ASSIGNED</h2>
          <p className="sf-text" style={{ marginTop: 8, marginBottom: 24 }}>Select a domain first to unlock your project challenge.</p>
        </div>
      </div>
    );
  }

  const isStarted = projectProgress?.started && projectProgress?.projectId === selectedDomain;

  const handleStart = () => {
    startProject(selectedDomain);
  };

  const handleEvaluate = () => {
    if (!projectProgress?.milestones) return;
    const evaluation = evaluateProject(projectProgress.milestones);
    setProjectEvaluation(evaluation);
    setShowEval(true);
  };

  const completedMilestones = isStarted ? Object.values(projectProgress.milestones || {}).filter(m => m.completed).length : 0;
  const progressPercent = projectProgress?.completionPercent || 0;

  return (
    <div className="sf-page sf-ambient-bg">
      <div className="sf-container" style={{ maxWidth: 1000 }}>
        <div className="sf-animate-slide">
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 className="sf-heading sf-heading-xl" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>MISSION CONTROL</h1>
            <p className="sf-text" style={{ marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>APPLY SKILLS • BUILD EVIDENCE</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isStarted ? '1fr 360px' : '1fr', gap: 24 }}>
            
            {/* Primary Project/Mission Card */}
            <div className="sf-card sf-glow-red" style={{ padding: 40, border: '1px solid var(--sf-border-glow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 32 }}>{domain.icon}</span>
                <span className="sf-label" style={{ color: 'var(--sf-accent)' }}>ACTIVE MISSION</span>
              </div>
              
              <h2 className="sf-heading sf-heading-xl" style={{ textTransform: 'uppercase', marginBottom: 16, lineHeight: 1.1 }}>{project.title}</h2>
              <p className="sf-text" style={{ marginBottom: 32, fontSize: '1.1rem', maxWidth: 600 }}>{project.description}</p>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                <span className="sf-badge sf-badge-red" style={{ letterSpacing: '0.1em' }}>DIFFICULTY: {project.difficulty.toUpperCase()}</span>
                <span className="sf-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--sf-text-primary)' }}>⏱ {project.estimatedWeeks} WEEKS</span>
                {project.techStack.map(tech => (
                  <span key={tech} className="sf-badge" style={{ border: '1px solid var(--sf-border-light)', color: 'var(--sf-text-muted)' }}>{tech.toUpperCase()}</span>
                ))}
              </div>

              {!isStarted && (
                <button className="sf-btn sf-btn-primary sf-btn-lg" style={{ width: '100%' }} onClick={handleStart}>
                  INITIALIZE MISSION →
                </button>
              )}

              {isStarted && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="sf-label">MISSION PROGRESS</span>
                    <span style={{ fontWeight: 800, color: 'var(--sf-text-primary)' }}>{progressPercent}%</span>
                  </div>
                  <div className="sf-progress-bar" style={{ height: 8, background: 'rgba(255,255,255,0.05)' }}>
                    <div className="sf-progress-fill" style={{ width: `${progressPercent}%`, background: 'var(--sf-accent)', boxShadow: '0 0 12px var(--sf-accent-glow)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Milestones Panel */}
            {isStarted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="sf-card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 className="sf-label">MILESTONES</h3>
                    <span className="sf-text-sm" style={{ color: 'var(--sf-accent)' }}>{completedMilestones}/{project.milestones.length} COMPLETE</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {project.milestones.map((ms, idx) => {
                      const done = projectProgress.milestones[ms.id]?.completed;
                      return (
                        <div key={ms.id} onClick={() => toggleMilestone(ms.id)} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px',
                          borderRadius: 'var(--sf-radius-sm)', cursor: 'pointer', transition: 'all 0.2s',
                          background: done ? 'rgba(255,255,255,0.02)' : 'var(--sf-bg-secondary)',
                          border: `1px solid ${done ? 'rgba(255,255,255,0.05)' : 'var(--sf-border)'}`,
                        }}>
                          <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, border: `2px solid ${done ? 'var(--sf-text-dim)' : 'var(--sf-accent)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {done && <span style={{ color: 'var(--sf-text-dim)', fontSize: 14 }}>✓</span>}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: done ? 'var(--sf-text-dim)' : 'var(--sf-text-primary)' }}>
                              0{ms.order}: {ms.title}
                            </p>
                            {done && projectProgress.milestones[ms.id]?.date && (
                              <p className="sf-text-sm" style={{ color: 'var(--sf-text-muted)', marginTop: 4 }}>VERIFIED: {projectProgress.milestones[ms.id].date}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {completedMilestones >= Math.floor(project.milestones.length / 2) && (
                    <button className="sf-btn sf-btn-danger sf-btn-block" style={{ marginTop: 24 }} onClick={handleEvaluate}>
                      EXECUTE AI EVALUATION
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Evaluation Report */}
          {showEval && projectProgress?.evaluation && (
            <div className="sf-card sf-animate-slide" style={{ padding: 40, marginTop: 24, border: '1px solid var(--sf-border-glow)', background: '#050505' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <span style={{ fontSize: 32, filter: 'drop-shadow(0 0 10px rgba(239,35,60,0.5))' }}>🤖</span>
                <h3 className="sf-heading sf-heading-lg" style={{ textTransform: 'uppercase' }}>AI PROJECT EVALUATION REPORT</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  {Object.entries(projectProgress.evaluation).filter(([k]) => k !== 'overall' && k !== 'label').map(([key, score]) => (
                    <div key={key} className="sf-skill-bar" style={{ padding: '4px 0' }}>
                      <span className="sf-skill-name" style={{ textTransform: 'uppercase', width: 200, fontSize: '0.8125rem' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="sf-skill-track" style={{ height: 4 }}>
                        <div className="sf-skill-fill" style={{ width: `${score}%`, background: score >= 80 ? 'var(--sf-accent)' : 'var(--sf-text-primary)' }} />
                      </div>
                      <span className="sf-skill-score" style={{ color: score >= 80 ? 'var(--sf-accent)' : 'var(--sf-text-primary)' }}>{score}%</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(239,35,60,0.05)', borderRadius: 'var(--sf-radius)', border: '1px solid rgba(239,35,60,0.2)', padding: 24 }}>
                  <p className="sf-label" style={{ marginBottom: 8, color: 'var(--sf-accent)' }}>OVERALL SCORE</p>
                  <p style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--sf-text-primary)', lineHeight: 1 }}>{projectProgress.evaluation.overall}%</p>
                  <p className="sf-text-sm" style={{ marginTop: 16, textAlign: 'center' }}>Evaluation based on architectural integrity and milestone completion.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProjectChallengePage;
