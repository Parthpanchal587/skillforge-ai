import React, { useState } from 'react';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';

const getRedNoirLevel = (score) => {
  if (score >= 85) return { label: 'MASTERED', color: 'var(--sf-accent)' };
  if (score >= 70) return { label: 'STRONG', color: 'var(--sf-text-primary)' };
  if (score >= 50) return { label: 'DEVELOPING', color: 'var(--sf-text-muted)' };
  return { label: 'NEEDS WORK', color: 'var(--sf-accent-light)' };
};

const SkillHealthPage = () => {
  const { selectedDomain, skillScores, skillHistory } = useStore();
  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const skills = domain
    ? domain.skills.map(s => ({ ...s, ...skillScores[s.id], skillId: s.id })).filter(s => s.score > 0)
    : Object.entries(skillScores).map(([id, data]) => ({ skillId: id, name: id, ...data }));

  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const avgScore = skills.length > 0 ? Math.round(skills.reduce((s, sk) => s + sk.score, 0) / skills.length) : 0;
  const mastered = skills.filter(s => s.score >= 85).length;
  const weak = skills.filter(s => s.score < 50).length;

  return (
    <div className="sf-page sf-ambient-bg">
      <div className="sf-container" style={{ maxWidth: 1000 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h1 className="sf-heading sf-heading-xl" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>DIAGNOSTICS & HEALTH</h1>
              <p className="sf-text" style={{ marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SKILL PROGRESSION ANALYSIS</p>
            </div>
            <div style={{ width: 64, height: 64, background: 'rgba(239, 35, 60, 0.05)', borderRadius: '50%', border: '1px solid rgba(239, 35, 60, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(239, 35, 60, 0.4))' }}>🔬</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'SYSTEM HEALTH', value: `${avgScore}%`, color: avgScore >= 70 ? 'var(--sf-text-primary)' : 'var(--sf-accent)' },
              { label: 'TRACKED SKILLS', value: skills.length, color: 'var(--sf-text-primary)' },
              { label: 'MASTERED', value: mastered, color: 'var(--sf-accent)' },
              { label: 'CRITICAL GAPS', value: weak, color: 'var(--sf-accent-light)' },
            ].map((s, i) => (
              <div key={s.label} className="sf-card sf-stagger" style={{ padding: 24, animationDelay: `${i * 0.1}s` }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8, filter: `drop-shadow(0 0 8px ${s.color}40)` }}>{s.value}</p>
                <p className="sf-label">{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedSkill ? '1fr 320px' : '1fr', gap: 24 }}>
            {/* Skills List */}
            <div className="sf-card" style={{ padding: 32 }}>
              <h3 className="sf-label" style={{ marginBottom: 24 }}>COMPONENT ANALYSIS</h3>
              {sorted.length === 0 ? (
                <p className="sf-text">Execute an assessment to initialize diagnostic data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sorted.map((skill) => {
                    const level = getRedNoirLevel(skill.score);
                    const isSelected = selectedSkill === skill.skillId;
                    
                    return (
                      <div key={skill.skillId} 
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                          background: isSelected ? 'rgba(255,255,255,0.05)' : 'var(--sf-bg-secondary)',
                          border: `1px solid ${isSelected ? 'rgba(255,255,255,0.1)' : 'var(--sf-border)'}`,
                          borderRadius: 'var(--sf-radius-sm)', cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 20px rgba(0,0,0,0.5)' : 'none'
                        }}
                        onClick={() => setSelectedSkill(isSelected ? null : skill.skillId)}>
                        
                        <div style={{ width: 180 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sf-text-primary)' }}>{skill.name}</span>
                        </div>
                        
                        {/* Custom Diagnostic Heatmap-style Bar */}
                        <div style={{ flex: 1, display: 'flex', gap: 4, height: 12 }}>
                          {[20, 40, 60, 80, 100].map(threshold => (
                            <div key={threshold} style={{
                              flex: 1, height: '100%', borderRadius: 2,
                              background: skill.score >= threshold ? level.color : 'rgba(255,255,255,0.05)',
                              boxShadow: skill.score >= threshold ? `0 0 8px ${level.color}40` : 'none',
                              opacity: skill.score >= threshold ? 1 : 0.5
                            }} />
                          ))}
                        </div>
                        
                        <div style={{ width: 60, textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: level.color }}>{skill.score}%</span>
                        </div>
                        
                        <div style={{ width: 120, textAlign: 'right' }}>
                          <span className="sf-label" style={{ color: level.color }}>
                            {level.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skill History / Detail */}
            {selectedSkill && skillHistory?.[selectedSkill] && (
              <div className="sf-card sf-animate-in" style={{ padding: 32, alignSelf: 'start', position: 'sticky', top: 100 }}>
                <h3 className="sf-label" style={{ marginBottom: 24 }}>PROGRESS VELOCITY</h3>
                <h4 className="sf-heading sf-heading-sm" style={{ marginBottom: 32, color: 'var(--sf-text-primary)' }}>{selectedSkill}</h4>
                
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160, borderBottom: '1px solid var(--sf-border-light)', paddingBottom: 16, marginBottom: 16 }}>
                  {skillHistory[selectedSkill].map((entry, i) => {
                    const level = getRedNoirLevel(entry.score);
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: level.color }}>{entry.score}</p>
                        <div style={{
                          width: '100%', maxWidth: 24, height: `${entry.score}%`, background: level.color,
                          borderRadius: '4px 4px 0 0', transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)', minHeight: 4,
                          boxShadow: `0 0 10px ${level.color}40`
                        }} />
                        <p className="sf-label" style={{ fontSize: '0.65rem' }}>{entry.month}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ background: 'var(--sf-bg-secondary)', padding: 16, borderRadius: 'var(--sf-radius-sm)', borderLeft: '2px solid var(--sf-accent)' }}>
                  <p className="sf-label" style={{ marginBottom: 4 }}>AI ANALYSIS</p>
                  <p className="sf-text-sm">
                    {skillHistory[selectedSkill].length > 1 && skillHistory[selectedSkill][skillHistory[selectedSkill].length-1].score > skillHistory[selectedSkill][0].score 
                      ? `Positive velocity detected. You've improved by ${skillHistory[selectedSkill][skillHistory[selectedSkill].length-1].score - skillHistory[selectedSkill][0].score}% recently.` 
                      : "Stabilized performance. Recommend targeted practice sessions to increase proficiency."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillHealthPage;
