import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';

const DomainRecommendationPage = () => {
  const navigate = useNavigate();
  const { domainRecommendation, selectDomain } = useStore();
  const rec = domainRecommendation;

  if (!rec) {
    return (
      <div className="sf-page sf-ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sf-card" style={{ textAlign: 'center', padding: 40 }}>
          <p className="sf-text">Complete your assessments first.</p>
          <button className="sf-btn sf-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/interest-assessment')}>Take Assessment</button>
        </div>
      </div>
    );
  }

  const primary = DOMAINS.find(d => d.id === rec.primaryDomain);
  const [showWhy, setShowWhy] = React.useState(false);

  const handleSelect = (domainId) => {
    selectDomain(domainId);
    navigate('/dashboard');
  };

  return (
    <div className="sf-page sf-ambient-bg">
      <div className="sf-container" style={{ maxWidth: 700 }}>
        <div className="sf-animate-slide">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
            <h1 className="sf-heading sf-heading-xl">AI Domain Recommendation</h1>
            <p className="sf-text" style={{ marginTop: 8 }}>Based on your interests and skills assessment</p>
          </div>

          {/* Primary Recommendation */}
          <div className="sf-card sf-glow-indigo" style={{ padding: 36, marginBottom: 24 }}>
            <p className="sf-label" style={{ marginBottom: 12 }}>🏆 Recommended Domain</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 40 }}>{primary?.icon}</div>
              <div style={{ flex: 1 }}>
                <h2 className="sf-heading sf-heading-lg">{primary?.name}</h2>
                <p className="sf-text" style={{ marginTop: 4 }}>{primary?.description}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{rec.matchScore}%</p>
                <p className="sf-text-sm">Match</p>
              </div>
            </div>

            {/* Why Section */}
            <button onClick={() => setShowWhy(!showWhy)} className="sf-btn sf-btn-secondary sf-btn-sm" style={{ marginBottom: showWhy ? 16 : 0 }}>
              {showWhy ? '▼' : '▶'} Why this recommendation?
            </button>
            {showWhy && (
              <div className="sf-card-flat sf-animate-in" style={{ padding: 20, marginTop: 8 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  {rec.reasons.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span className="sf-text">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="sf-btn sf-btn-primary sf-btn-lg" style={{ flex: 1 }} onClick={() => handleSelect(rec.primaryDomain)}>
                Choose {primary?.name} →
              </button>
            </div>
          </div>

          {/* Alternatives */}
          <p className="sf-label" style={{ marginBottom: 12 }}>Also Consider</p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
            {rec.alternatives.map(alt => {
              const domain = DOMAINS.find(d => d.id === alt.id);
              if (!domain) return null;
              return (
                <div key={alt.id} className="sf-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 28 }}>{domain.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600 }}>{domain.name}</h3>
                    <p className="sf-text-sm">{domain.description?.substring(0, 80)}...</p>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8' }}>{alt.score}%</p>
                    <p className="sf-text-sm">Match</p>
                  </div>
                  <button className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => handleSelect(alt.id)}>Choose</button>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="sf-btn sf-btn-ghost" onClick={() => navigate('/dashboard')}>Explore All Domains →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainRecommendationPage;
