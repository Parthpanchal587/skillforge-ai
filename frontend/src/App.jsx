import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AICopilotWidget from './components/AICopilotWidget';
import PageTransition from './components/motion/PageTransition';
import PhysicsProvider from './physics/PhysicsProvider';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Core Journey Pages
import OnboardingPage from './pages/OnboardingPage';
import InterestAssessmentPage from './pages/InterestAssessmentPage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import DomainRecommendationPage from './pages/DomainRecommendationPage';
import DashboardPage from './pages/DashboardPage';
import MindMapPage from './pages/MindMapPage';
import PracticeTestPage from './pages/PracticeTestPage';
import SkillHealthPage from './pages/SkillHealthPage';
import ProjectChallengePage from './pages/ProjectChallengePage';
import SkillPassportPage from './pages/SkillPassportPage';
import WeaknessImprovementPage from './pages/WeaknessImprovementPage';
import InterviewSimulatorPage from './pages/InterviewSimulatorPage';
import CareerPathsPage from './pages/CareerPathsPage';
import InternshipMatchingPage from './pages/InternshipMatchingPage';
import PricingPage from './pages/PricingPage';

// Legacy Pages
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<PageTransition locationKey={location.pathname}><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition locationKey={location.pathname}><RegisterPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition locationKey={location.pathname}><PricingPage /></PageTransition>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<PageTransition locationKey={location.pathname}><DashboardPage /></PageTransition>} />

        {/* Journey routes */}
        <Route path="/onboarding" element={<PageTransition locationKey={location.pathname}><OnboardingPage /></PageTransition>} />
        <Route path="/interest-assessment" element={<PageTransition locationKey={location.pathname}><InterestAssessmentPage /></PageTransition>} />
        <Route path="/skill-assessment" element={<PageTransition locationKey={location.pathname}><SkillAssessmentPage /></PageTransition>} />
        <Route path="/domain-recommendation" element={<PageTransition locationKey={location.pathname}><DomainRecommendationPage /></PageTransition>} />
        <Route path="/mind-map" element={<PageTransition locationKey={location.pathname}><MindMapPage /></PageTransition>} />
        <Route path="/practice-tests" element={<PageTransition locationKey={location.pathname}><PracticeTestPage /></PageTransition>} />
        <Route path="/skill-health" element={<PageTransition locationKey={location.pathname}><SkillHealthPage /></PageTransition>} />
        <Route path="/project-challenge" element={<PageTransition locationKey={location.pathname}><ProjectChallengePage /></PageTransition>} />
        <Route path="/skill-passport" element={<PageTransition locationKey={location.pathname}><SkillPassportPage /></PageTransition>} />
        <Route path="/weakness-improvement" element={<PageTransition locationKey={location.pathname}><WeaknessImprovementPage /></PageTransition>} />
        <Route path="/interview-simulator" element={<PageTransition locationKey={location.pathname}><InterviewSimulatorPage /></PageTransition>} />
        <Route path="/career-paths" element={<PageTransition locationKey={location.pathname}><CareerPathsPage /></PageTransition>} />
        <Route path="/internships" element={<PageTransition locationKey={location.pathname}><InternshipMatchingPage /></PageTransition>} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<PageTransition locationKey={location.pathname}><ProfilePage /></PageTransition>} />
        </Route>

        {/* Root → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Legacy redirects */}
        <Route path="/assessment" element={<Navigate to="/skill-assessment" replace />} />
        <Route path="/jobs" element={<Navigate to="/internships" replace />} />

        {/* 404 */}
        <Route path="*" element={
          <PageTransition locationKey="404">
            <div className="sf-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="sf-card" style={{ textAlign: 'center', padding: 48, maxWidth: 480 }}>
                <p style={{ fontSize: 64, marginBottom: 16 }}>🪟</p>
                <h2 className="sf-heading sf-heading-lg">We threw this page out the window.</h2>
                <p className="sf-text" style={{ marginTop: 8, marginBottom: 24 }}>It's gone. Ricocheted into deep space.</p>
                <a href="/dashboard" className="sf-btn sf-btn-primary">Back to Safety 🎪</a>
              </div>
            </div>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--sf-bg-primary)', color: 'var(--sf-text-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: 'sf-bounce-soft 1.5s ease-in-out infinite' }}>🎪</div>
          <p style={{ fontWeight: 800, letterSpacing: '0.05em', fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem' }}>
            WINDING UP THE GRAVITY MACHINE... 🎈
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--sf-text-muted)', marginTop: 6, fontWeight: 700 }}>
            Inflating your skills and balancing the universe
          </p>
        </div>
      </div>
    );
  }

  return (
    <PhysicsProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--sf-bg-primary)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <AnimatedRoutes />
          </main>
          <AICopilotWidget />
          <Footer />
        </div>
      </BrowserRouter>
    </PhysicsProvider>
  );
}

export default App;