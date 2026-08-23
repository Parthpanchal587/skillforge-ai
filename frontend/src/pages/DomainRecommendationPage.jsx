import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import { recommendDomain } from '../services/aiEngine';
import { sounds } from '../services/soundEffects';
import GelatinousButton from '../components/playful/GelatinousButton';

const DomainRecommendationPage = () => {
  const navigate = useNavigate();
  const { domainRecommendation, selectDomain, interestProfile, assessmentResults } = useStore();
  const [showWhy, setShowWhy] = useState(false);

  // Compute recommendation dynamically if not already saved in state
  const rec = domainRecommendation || recommendDomain(interestProfile, assessmentResults);

  const primary = DOMAINS.find(d => d.id === rec?.primaryDomain) || DOMAINS[0];
  const alternatives = rec?.alternatives && rec.alternatives.length > 0
    ? rec.alternatives
    : (rec?.rankings?.slice(1, 4)?.map(r => ({ id: r.domainId, score: r.score })) || [
        { id: 'web-dev', score: 80 },
        { id: 'app-dev', score: 75 },
        { id: 'software-eng', score: 70 },
      ]);

  const reasons = rec?.reasons || [
    `Your diagnostic starting assessment shows strong aptitude for ${primary?.name || 'this track'}.`,
    'Demonstrated capability across foundational problem-solving and domain logic.',
    'Fastest learning curve to achieve industry-ready engineering projects.',
  ];

  const handleSelect = (domainId) => {
    try { sounds.playSuccess(); } catch (e) {}
    selectDomain(domainId);
    navigate('/dashboard');
  };

  return (
    <div className="sf-page sf-ambient-bg">
      <div className="sf-container" style={{ maxWidth: 740 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }} className="animate-bounce">🎯</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">AI Domain Recommendation</h1>
            <p className="sf-text font-bold text-sm text-[#424264]" style={{ marginTop: 6 }}>
              Calibrated from your diagnostic scores and technical preferences
            </p>
          </div>

          {/* Primary Recommendation Card */}
          <div className="sf-card p-8 mb-6 bg-white border-3 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E]">
            <span className="sf-badge sf-badge-pink font-black text-xs mb-3 inline-block">
              🏆 TOP RECOMMENDED DOMAIN
            </span>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-5 pb-5 border-b-2 border-[#1A1A2E]/10">
              <div className="w-18 h-18 text-4xl p-3 bg-[#FFE135] rounded-2xl border-2 border-[#1A1A2E] shadow-[3px_3px_0px_#1A1A2E] flex items-center justify-center flex-shrink-0">
                {primary?.icon || '🚀'}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="sf-heading sf-heading-lg text-[#1A1A2E]">{primary?.name || 'Full Stack Development'}</h2>
                <p className="sf-text-sm font-bold text-[#5B5B7E] mt-1">{primary?.description}</p>
              </div>
              <div className="text-center p-3 px-5 bg-[#F0FFF8] rounded-2xl border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] flex-shrink-0">
                <p className="text-3xl font-black text-[#00D084] leading-none">{rec?.matchScore || 88}%</p>
                <p className="text-[10px] font-black uppercase text-[#7E7E9A] mt-1">Match Fit</p>
              </div>
            </div>

            {/* Why Section Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="sf-btn sf-btn-secondary sf-btn-sm font-black"
                style={{ borderRadius: 10 }}
              >
                {showWhy ? '▼ Hide AI Reasoning' : '▶ Why this recommendation?'}
              </button>

              {showWhy && (
                <div className="p-4 mt-3 rounded-xl bg-[#FAF7F2] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]">
                  <div style={{ display: 'grid', gap: 8 }}>
                    {reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-bold text-[#1A1A2E]">
                        <span className="text-[#00D084] font-black">✓</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <GelatinousButton
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => handleSelect(primary?.id || 'full-stack')}
              >
                Lock In {primary?.name} & Start 🚀
              </GelatinousButton>
            </div>
          </div>

          {/* Alternatives */}
          <div className="mb-8">
            <h3 className="sf-heading sf-heading-sm text-[#1A1A2E] mb-3">
              OTHER STRONG ALTERNATIVES TO EXPLORE
            </h3>
            <div className="grid gap-3">
              {alternatives.map((alt) => {
                const domain = DOMAINS.find(d => d.id === alt.id);
                if (!domain) return null;
                return (
                  <div
                    key={alt.id}
                    className="sf-card p-4 flex flex-col sm:flex-row items-center gap-4 bg-white border-2 border-[#1A1A2E] shadow-[3px_3px_0px_#1A1A2E]"
                  >
                    <span className="text-3xl p-2 bg-[#FAF7F2] rounded-xl border border-[#1A1A2E]">{domain.icon}</span>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-extrabold text-sm text-[#1A1A2E]">{domain.name}</h4>
                      <p className="text-xs font-bold text-[#7E7E9A] line-clamp-1">{domain.description}</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="text-base font-black text-[#1A1A2E]">{alt.score}%</p>
                      <p className="text-[10px] font-black text-[#7E7E9A]">Match</p>
                    </div>
                    <button
                      className="sf-btn sf-btn-secondary sf-btn-sm"
                      style={{ borderRadius: 8, padding: '4px 14px' }}
                      onClick={() => handleSelect(alt.id)}
                    >
                      Choose
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <GelatinousButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/career-paths')}
            >
              Open Full Career Map 🗺️
            </GelatinousButton>
            <GelatinousButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Go to Playground 🎪
            </GelatinousButton>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DomainRecommendationPage;
