import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GelatinousButton from '../components/playful/GelatinousButton';
import { sounds } from '../services/soundEffects';

const plans = [
  {
    name: 'COMMUNITY PASS',
    priceMonthly: '₹0',
    priceAnnual: '₹0',
    period: 'forever free',
    features: [
      'Foundational Skill Assessment',
      'Interactive 2D Physics Toybox',
      '5 Practice Quizzes / month',
      'Basic Skill Passport Card',
      'Public Student Community Access',
    ],
    cta: 'GRAB FREE PASS 🎟️',
    popular: false,
    color: '#FAF7F2',
    buttonVariant: 'secondary',
  },
  {
    name: 'PLAYGROUND PRO',
    priceMonthly: '₹499',
    priceAnnual: '₹399',
    period: '/month',
    features: [
      'Everything in Community',
      'Unlimited Physics Drills & Quizzes',
      'Adaptive AI Weakness Elimination',
      'Real-World Projects & Code Reviews',
      'Secret Passport Cryptographic Export',
      '10 AI Mock Interview Grill Sessions / mo',
      'Real-Time Internship Match Score',
    ],
    cta: 'UNLEASH PRO PASS ⚡',
    popular: true,
    badge: 'MOST POPULAR 🎪',
    color: '#FFE135',
    buttonVariant: 'primary',
  },
  {
    name: 'VIP ARCHITECT',
    priceMonthly: '₹999',
    priceAnnual: '₹799',
    period: '/month',
    features: [
      'Everything in Playground Pro',
      'Unlimited AI Mock Interviews',
      '1-on-1 Senior Staff Architect Pairing',
      'FAANG Production Portfolio Review',
      'Dedicated Internship Placement Agent',
      'Priority Compute & Zero-Latency AI Mentor',
      'Verified Gold Skill Certificate',
    ],
    cta: 'JOIN VIP ARCHITECTS 👑',
    popular: false,
    color: '#FAF7F2',
    buttonVariant: 'cyan',
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);

  return (
    <div className="sf-page">
      <div className="sf-container" style={{ maxWidth: 1080 }}>
        <div className="sf-animate-slide">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-2 animate-bounce">🎟️</div>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
              PLAYGROUND TICKETS & PASSES
            </h1>
            <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
              Supercharge your career speed with unlimited drills & AI grilling!
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 mt-6 p-2 px-5 bg-white border-3 border-[#1A1A2E] rounded-full shadow-[3px_3px_0px_#1A1A2E]">
              <span className={`text-xs font-black uppercase ${!annual ? 'text-[#1A1A2E]' : 'text-[#7E7E9A]'}`}>
                MONTHLY
              </span>
              <button
                type="button"
                onClick={() => {
                  try { sounds.playClick(); } catch (e) {}
                  setAnnual(!annual);
                }}
                className="w-12 h-6 rounded-full border-2 border-[#1A1A2E] relative cursor-pointer transition-colors"
                style={{ background: annual ? '#00F5A0' : '#EFE9DF' }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-[#1A1A2E] absolute top-0.5 transition-all"
                  style={{ left: annual ? 26 : 2 }}
                />
              </button>
              <span className={`text-xs font-black uppercase ${annual ? 'text-[#1A1A2E]' : 'text-[#7E7E9A]'}`}>
                ANNUAL (SAVE 20% 🎉)
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ scale: 1.02, y: -3 }}
                className={`sf-card p-8 flex flex-col justify-between relative ${
                  plan.popular ? 'border-4 shadow-[8px_8px_0px_#1A1A2E]' : 'shadow-[4px_4px_0px_#1A1A2E]'
                }`}
                style={{ backgroundColor: plan.color }}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black bg-[#FF6B9D] text-white border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="text-center mb-6">
                    <p className="sf-label text-xs text-[#1A1A2E] mb-2">{plan.name}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-[#1A1A2E] font-['Space_Grotesk']">
                        {annual ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span className="text-xs font-extrabold text-[#7E7E9A]">{plan.period}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mb-8">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex gap-2.5 items-start text-xs font-bold text-[#1A1A2E]">
                        <span className="font-black text-[#1A1A2E] text-sm">✓</span>
                        <span className="leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <GelatinousButton
                  variant={plan.buttonVariant}
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    try { sounds.playSuccess(); } catch (e) {}
                    navigate('/dashboard');
                  }}
                >
                  {plan.cta}
                </GelatinousButton>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="sf-text-sm text-[#7E7E9A] font-bold">
              🔒 256-Bit Cryptographic Checkout • Instant Pass Activation • Cancel Anytime With 0 Hassle
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PricingPage;
