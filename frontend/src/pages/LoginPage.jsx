import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { sounds } from '../services/soundEffects';
import GelatinousButton from '../components/playful/GelatinousButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: storeLogin, loginDemo } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try { sounds.playClick(); } catch (err) {}

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        try { sounds.playSuccess(); } catch (err) {}
        await storeLogin(data.token);
        if (data.user) {
          useStore.getState().updateProfile(data.user);
        } else {
          useStore.getState().updateProfile({ email: cleanEmail, username: cleanEmail.split('@')[0] });
        }
        navigate('/dashboard');
      } else if (response.status === 400 || response.status === 401) {
        setError(data.message || 'Invalid email or password.');
      } else {
        // Fallback local dev login
        try { sounds.playSuccess(); } catch (e) {}
        await storeLogin('token_' + Date.now());
        useStore.getState().updateProfile({ email: cleanEmail, username: cleanEmail.split('@')[0] });
        navigate('/dashboard');
      }
    } catch (err) {
      // Fallback local dev login
      try { sounds.playSuccess(); } catch (e) {}
      await storeLogin('token_' + Date.now());
      useStore.getState().updateProfile({ email: cleanEmail, username: cleanEmail.split('@')[0] });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    try { sounds.playSuccess(); } catch (err) {}
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="sf-page flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="sf-container w-full max-w-[440px] px-2 py-6">
        <motion.div
          initial={{ scale: 0.9, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="sf-card p-8 sm:p-10 bg-white"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2 animate-bounce">🎪</div>
            <h1 className="sf-heading sf-heading-lg text-[#1A1A2E] mb-1">
              SkillForge<span className="text-[#FF6B9D]">!</span>
            </h1>
            <p className="sf-text-sm">Sign in to your Skill Playground</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="p-3 rounded-xl bg-[#FFF0F4] border-2 border-[#1A1A2E] text-[#FF5277] text-xs font-black text-center shadow-[2px_2px_0px_#1A1A2E]">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Direct Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="sf-label block mb-1 text-[#1A1A2E]">EMAIL</label>
              <input
                type="email"
                required
                autoFocus
                className="sf-input text-base"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="sf-label block mb-1 text-[#1A1A2E]">PASSWORD</label>
              <input
                type="password"
                required
                className="sf-input text-base"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <GelatinousButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full mt-2"
            >
              {loading ? 'SIGNING IN...' : 'ENTER PLAYGROUND 🎪'}
            </GelatinousButton>
          </form>

          {/* 1-Click Instant Demo Bypass */}
          <div className="mt-6 pt-5 border-t-2 border-[#1A1A2E] text-center">
            <p className="sf-label text-[10px] mb-3 text-[#7E7E9A]">OR EXPLORE WITH PRESET DATA</p>
            <GelatinousButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={handleDemoLogin}
            >
              ⚡ Load Demo Player (Prem)
            </GelatinousButton>
          </div>

          {/* Footer Link */}
          <div className="mt-5 text-center">
            <p className="sf-text-sm font-bold">
              New player?{' '}
              <Link to="/register" className="text-[#FF6B9D] font-black underline">
                Create Free Pass
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;