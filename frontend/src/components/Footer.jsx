import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="sf-footer">
      <div className="sf-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🎪</span>
          <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#1A1A2E', fontFamily: "'Space Grotesk', sans-serif" }}>
            SkillForge<span style={{ color: '#FF6B9D' }}>!</span>
          </span>
          <span style={{ color: '#7E7E9A' }}>•</span>
          <span style={{ color: '#7E7E9A', fontSize: '0.85rem' }}>Made with 🧪 & questionable amounts of caffeine &copy; {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/pricing" style={{ color: '#1A1A2E', fontWeight: 800, textDecoration: 'underline', fontSize: '0.85rem' }}>Tickets / Pricing</Link>
          <a href="#" style={{ color: '#7E7E9A', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>House Rules</a>
          <a href="#" style={{ color: '#7E7E9A', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>No Secrets</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;