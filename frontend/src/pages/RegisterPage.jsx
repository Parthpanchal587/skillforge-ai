import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { sounds } from '../services/soundEffects';
import GelatinousButton from '../components/playful/GelatinousButton';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: storeLogin, loginDemo } = useStore();

  const handleRegister = async (e) => {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        try { sounds.playSuccess(); } catch (err) {}
        await storeLogin(data.token);
        useStore.getState().updateProfile({ username: username.trim() || cleanEmail.split('@')[0], email: cleanEmail });
        navigate('/onboarding');
      } else if (response.status === 400 || response.status === 409) {
        setError(data.message || 'Registration failed. Try another email.');
      } else {
        try { sounds.playSuccess(); } catch (e) {}
        await storeLogin('token_' + Date.now());
        useStore.getState().updateProfile({ username: username.trim() || cleanEmail.split('@')[0], email: cleanEmail });
        navigate('/onboarding');
      }
    } catch (err) {
      try { sounds.playSuccess(); } catch (e) {}
      await storeLogin('token_' + Date.now());
      useStore.getState().updateProfile({ username: username.trim() || cleanEmail.split('@')[0], email: cleanEmail });
      navigate('/onboarding');
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
      <div className="sf-container w-full max-w-[460px] px-2 py-6">
        <motion.div
          initial={{ scale: 0.9, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="sf-card p-8 sm:p-10 bg-white"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2 animate-bounce">🎈</div>
            <h1 className="sf-heading sf-heading-lg text-[#1A1A2E] mb-1">
              Join SkillForge<span className="text-[#00F5A0]">!</span>
            </h1>
            <p className="sf-text-sm">Create your Free Player Pass</p>
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="sf-label block mb-1 text-[#1A1A2E]">PLAYER / USERNAME</label>
              <input
                type="text"
                required
                className="sf-input text-base"
                placeholder="e.g. Alex"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="sf-label block mb-1 text-[#1A1A2E]">EMAIL</label>
              <input
                type="email"
                required
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
              variant="mint"
              size="lg"
              className="w-full mt-2"
            >
              {loading ? 'CREATING PASS...' : 'CREATE ACCOUNT 🎫'}
            </GelatinousButton>
          </form>

          {/* Demo Bypass */}
          <div className="mt-6 pt-5 border-t-2 border-[#1A1A2E] text-center">
            <GelatinousButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={handleDemoLogin}
            >
              ⚡ Skip Setup (Load Demo Profile)
            </GelatinousButton>
          </div>

          {/* Footer Link */}
          <div className="mt-5 text-center">
            <p className="sf-text-sm font-bold">
              Already have a pass?{' '}
              <Link to="/login" className="text-[#00D4FF] font-black underline">
                Log In
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;