import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import PitchDeckModal from './PitchDeckModal';
import { sounds } from '../services/soundEffects';

const Navbar = () => {
  const { user, logout, demoMode, onboarding, loginDemo } = useStore();
  const navigate = useNavigate();
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Playground', icon: '🎪' },
    { to: '/mind-map', label: 'Skill Toybox', icon: '🎈' },
    { to: '/practice-tests', label: 'Pop Quizzes', icon: '⚡' },
    { to: '/skill-health', label: 'Skill Checkup', icon: '🩺' },
    { to: '/project-challenge', label: 'Boss Fights', icon: '👾' },
    { to: '/interview-simulator', label: 'AI Mock Grill', icon: '🎤' },
    { to: '/skill-passport', label: 'Secret Passport', icon: '🎫' },
    { to: '/career-paths', label: 'Career Map', icon: '🗺️' },
  ];

  const handleLogout = () => {
    try { sounds.playClick(); } catch (e) {}
    logout();
    navigate('/dashboard');
  };

  const handleDemoClick = () => {
    try { sounds.playSuccess(); } catch (e) {}
    loginDemo();
  };

  return (
    <>
      <nav className="sf-sidebar">
        {/* Brand Header */}
        <div className="sf-sidebar-header">
          <Link
            to="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            onClick={() => { try { sounds.playClick(); } catch (e) {} }}
          >
            <span style={{ fontSize: 28, transform: 'rotate(-8deg)', display: 'inline-block' }}>🎪</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#1A1A2E', letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}>
                SkillForge<span style={{ color: '#FF6B9D' }}>!</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7E7E9A', letterSpacing: '0.08em', fontWeight: 800, textTransform: 'uppercase' }}>
                Generative Gravity OS
              </div>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="sf-sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { try { sounds.playClick(); } catch (e) {} }}
              className={({ isActive }) => `sf-sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sf-sidebar-icon">{link.icon}</span>
              <span className="sf-sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer Actions & Profile */}
        <div className="sf-sidebar-footer">
          <button
            onClick={() => { try { sounds.playClick(); } catch (e) {} setPitchDeckOpen(true); }}
            className="sf-btn sf-btn-secondary sf-btn-block sf-btn-sm"
            style={{ marginBottom: 12, borderRadius: '12px' }}
          >
            📊 Pitch Deck
          </button>

          {user ? (
            <div className="sf-user-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#FFE135',
                  border: '2px solid #1A1A2E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  color: '#1A1A2E',
                  boxShadow: '2px 2px 0px #1A1A2E',
                }}>
                  {(onboarding?.name || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1A1A2E', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {onboarding?.name || user.username}
                  </div>
                  {demoMode && <span className="sf-badge sf-badge-amber" style={{ fontSize: '0.6rem', padding: '1px 8px', marginTop: 2 }}>DEMO PRO</span>}
                </div>
              </div>
              <button onClick={handleLogout} className="sf-btn sf-btn-danger sf-btn-block sf-btn-sm" style={{ borderRadius: '10px' }}>
                Escape / Logout 🏃
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleDemoClick} className="sf-btn sf-btn-primary sf-btn-block sf-btn-sm">
                🎮 Skip the boring part
              </button>
              <Link to="/login" className="sf-btn sf-btn-secondary sf-btn-block sf-btn-sm">
                Log In
              </Link>
            </div>
          )}
        </div>

        <style>{`
          /* Desktop Neo-Brutalist Sidebar */
          @media (min-width: 901px) {
            .sf-sidebar {
              position: fixed; 
              top: 20px; 
              left: 20px; 
              bottom: 20px; 
              width: 270px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border-radius: 24px;
              padding: 24px 18px;
              z-index: 100;
              background: #FFFFFF;
              border: 3px solid #1A1A2E;
              box-shadow: 6px 6px 0px #1A1A2E;
            }
            .sf-sidebar-header { margin-bottom: 20px; padding: 0 6px; }
            .sf-sidebar-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; padding-right: 4px; }
            .sf-sidebar-link {
              display: flex; 
              align-items: center; 
              gap: 12px;
              padding: 10px 14px; 
              border-radius: 14px;
              color: #424264; 
              text-decoration: none; 
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700; 
              font-size: 0.9rem;
              border: 2px solid transparent;
              transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .sf-sidebar-link:hover { 
              color: #1A1A2E; 
              background: #FAF7F2; 
              border-color: #1A1A2E;
              transform: translate(-2px, -2px);
              box-shadow: 3px 3px 0px #1A1A2E;
            }
            .sf-sidebar-link.active {
              color: #1A1A2E;
              background: #FFE135;
              border-color: #1A1A2E;
              font-weight: 800;
              transform: translate(-2px, -2px);
              box-shadow: 3px 3px 0px #1A1A2E;
            }
            .sf-sidebar-icon { font-size: 1.25rem; flex-shrink: 0; }
            .sf-sidebar-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .sf-sidebar-footer { margin-top: 16px; }
            
            /* Global layout offset */
            body { padding-left: 310px !important; }
          }

          /* Mobile Soft-Pop Bottom Nav */
          @media (max-width: 900px) {
            .sf-sidebar {
              position: fixed; 
              bottom: 12px; 
              left: 12px; 
              right: 12px;
              height: 68px; 
              padding: 0 8px;
              display: flex; 
              align-items: center; 
              justify-content: space-around;
              background: #FFFFFF;
              border: 3px solid #1A1A2E;
              border-radius: 20px;
              box-shadow: 4px 4px 0px #1A1A2E;
              z-index: 100;
            }
            .sf-sidebar-header, .sf-sidebar-footer { display: none; }
            .sf-sidebar-nav { display: flex; align-items: center; justify-content: space-around; width: 100%; }
            .sf-sidebar-link {
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              gap: 2px;
              padding: 6px 8px; 
              color: #7E7E9A; 
              text-decoration: none;
              border-radius: 10px;
            }
            .sf-sidebar-link.active { 
              color: #1A1A2E; 
              background: #FFE135;
              border: 2px solid #1A1A2E;
              box-shadow: 2px 2px 0px #1A1A2E;
            }
            .sf-sidebar-icon { font-size: 1.3rem; }
            .sf-sidebar-label { font-size: 0.62rem; font-weight: 800; }
            
            body { padding-bottom: 95px !important; }
          }
          
          .sf-user-card {
            background: #FAF7F2;
            border: 2.5px solid #1A1A2E;
            border-radius: 16px;
            padding: 12px;
            box-shadow: 3px 3px 0px #1A1A2E;
          }
        `}</style>
      </nav>

      <PitchDeckModal isOpen={pitchDeckOpen} onClose={() => setPitchDeckOpen(false)} />
    </>
  );
};

export default Navbar;