import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { DOMAINS } from '../data/domainsData';
import GelatinousButton from '../components/playful/GelatinousButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { sounds } from '../services/soundEffects';

const PRACTICE_BANKS = {
  'html-css': [
    { q: 'What does the "alt" attribute in an <img> tag provide?', opts: ['Image source URL', 'Alternative text for accessibility', 'Image border style', 'Animation trigger'], correct: 'Alternative text for accessibility' },
    { q: 'Which CSS property controls the space outside an element\'s border?', opts: ['padding', 'margin', 'outline', 'spacing'], correct: 'margin' },
    { q: 'What is the default display value of a <div> element?', opts: ['inline', 'block', 'flex', 'inline-block'], correct: 'block' },
    { q: 'Which CSS unit is relative to 1% of the viewport width?', opts: ['px', 'em', 'vw', 'rem'], correct: 'vw' },
    { q: 'What does Flexbox primarily manage?', opts: ['3D transforms', 'One-dimensional layout axis', 'Two-dimensional grid', 'Canvas shaders'], correct: 'One-dimensional layout axis' },
  ],
  'javascript': [
    { q: 'What is "hoisting" in JavaScript?', opts: ['Variable garbage collection', 'Moving declarations to top during compilation', 'Runtime error handling', 'Type conversion'], correct: 'Moving declarations to top during compilation' },
    { q: 'What does Promise.all() do?', opts: ['Runs promises sequentially', 'Resolves when all promises resolve successfully', 'Cancels remaining promises', 'Returns first rejected only'], correct: 'Resolves when all promises resolve successfully' },
    { q: 'Which keywords create block-scoped variables in modern ES6+?', opts: ['var', 'let', 'const', 'Both let and const'], correct: 'Both let and const' },
    { q: 'What is a closure in JavaScript?', opts: ['A function with its own scope', 'An IIFE', 'A function that retains lexical scope access to outer variables', 'A destructor'], correct: 'A function that retains lexical scope access to outer variables' },
    { q: 'What does Array.prototype.reduce() accomplish?', opts: ['Filters items', 'Accumulates array items into a single computed value', 'Removes duplicates', 'Reverses array'], correct: 'Accumulates array items into a single computed value' },
  ],
  'react': [
    { q: 'What hook manages side effects and lifecycle in functional React components?', opts: ['useState', 'useEffect', 'useRef', 'useMemo'], correct: 'useEffect' },
    { q: 'What is the Virtual DOM in React architecture?', opts: ['A real DOM clone', 'A lightweight in-memory JavaScript tree representation', 'A WebGL canvas', 'A compiler plugin'], correct: 'A lightweight in-memory JavaScript tree representation' },
    { q: 'Why is a stable "key" prop critical in lists?', opts: ['Styling selector', 'Performance & element reconciliation diffing', 'State hydration', 'Routing parameter'], correct: 'Performance & element reconciliation diffing' },
    { q: 'Which hook persists a mutable reference across renders without triggering re-render?', opts: ['useState', 'useRef', 'useEffect', 'useContext'], correct: 'useRef' },
    { q: 'What does React.memo() optimize for?', opts: ['Memory allocation', 'Skipping re-renders when props are shallowly equal', 'Lazy loading', 'Error boundaries'], correct: 'Skipping re-renders when props are shallowly equal' },
  ],
};

const getQuestionsForSkill = (skillId) => {
  if (PRACTICE_BANKS[skillId]) return PRACTICE_BANKS[skillId];
  return [
    { q: `What is the fundamental architectural principle behind ${skillId}?`, opts: ['Modularity & Separation of Concerns', 'Single Shared Global Mutable State', 'Direct Hardware Bypass', 'Synchronous Thread Blocking'], correct: 'Modularity & Separation of Concerns' },
    { q: `Which best practice is universally recommended when designing ${skillId} solutions?`, opts: ['Thorough Unit & Integration Testing', 'Hardcoding Credentials in Source', 'Ignoring Scalability Thresholds', 'Omitting Error Boundaries'], correct: 'Thorough Unit & Integration Testing' },
    { q: `How do high-performance systems optimize ${skillId} throughput?`, opts: ['Non-blocking asynchronous pipelines and caching', 'Sequential execution with thread locks', 'Excessive polling', 'Unindexed table lookups'], correct: 'Non-blocking asynchronous pipelines and caching' },
  ];
};

const PracticeTestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDomain, skillScores, updateSkillScore, addXP } = useStore();
  const domain = DOMAINS.find((d) => d.id === selectedDomain);
  const initialSkill = location.state?.skillId;

  const [activeSkill, setActiveSkill] = useState(initialSkill || null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);

  const skills = domain?.skills || [
    { id: 'javascript', name: 'JavaScript Engine & Async' },
    { id: 'react', name: 'React Component Architecture' },
    { id: 'html-css', name: 'Semantic HTML & Modern CSS' },
  ];
  const questions = activeSkill ? getQuestionsForSkill(activeSkill) : [];

  const handleSelectOption = (opt) => {
    if (showCorrect) return;
    try { sounds.playClick(); } catch (e) {}
    setSelected(opt);
  };

  const handleAnswer = () => {
    if (selected === null || showCorrect) return;
    const q = questions[current];
    const isCorrect = selected === q.correct;
    const newAnswers = { ...answers, [current]: { selected, correct: q.correct, isCorrect } };
    setAnswers(newAnswers);
    setShowCorrect(true);

    if (isCorrect) {
      try { sounds.playSuccess(); } catch (e) {}
    }

    setTimeout(() => {
      setShowCorrect(false);
      setSelected(null);
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        const correctCount = Object.values(newAnswers).filter((a) => a.isCorrect).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const status = score >= 85 ? 'MASTERED' : score >= 50 ? 'LEARNING' : 'NEEDS_IMPROVEMENT';
        
        if (updateSkillScore) updateSkillScore(activeSkill, score, status);
        if (addXP) addXP(score >= 80 ? 100 : 50);

        setResult({ score, correctCount, total: questions.length, status });
        setShowResult(true);
      }
    }, 1000);
  };

  const resetTest = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setShowCorrect(false);
  };

  // Skill Selector View
  if (!activeSkill) {
    return (
      <div className="sf-page">
        <div className="sf-container" style={{ maxWidth: 780 }}>
          <div className="sf-animate-slide">
            
            <div className="text-center mb-8">
              <div className="text-5xl mb-2 animate-bounce">⚡</div>
              <h1 className="sf-heading sf-heading-xl text-[#1A1A2E]">
                POP QUIZZES & SPEED DRILLS
              </h1>
              <p className="sf-text font-bold text-sm mt-1 text-[#424264]">
                Pick a skill bubble to test your knowledge and upgrade its physical mastery!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {skills.map((skill) => {
                const existing = skillScores[skill.id];
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      try { sounds.playClick(); } catch (e) {}
                      setActiveSkill(skill.id);
                      resetTest();
                    }}
                    className="sf-card p-4 flex items-center justify-between cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFE135] border-2 border-[#1A1A2E] flex items-center justify-center text-xl shadow-[2px_2px_0px_#1A1A2E]">
                        ⚡
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#1A1A2E]">{skill.name || skill.id}</h3>
                        <p className="text-xs font-bold text-[#7E7E9A]">5 Speed Questions</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {existing && (
                        <div className="text-right">
                          <p className="text-base font-black text-[#1A1A2E]">{existing.score}%</p>
                          <span className="sf-badge sf-badge-amber text-[10px]">{existing.status || 'SCORED'}</span>
                        </div>
                      )}
                      <span className="text-xl font-black text-[#1A1A2E] px-2">→</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Test Results View
  if (showResult && result) {
    return (
      <div className="sf-page flex items-center justify-center min-h-[75vh] p-4">
        <div className="sf-container max-w-lg w-full">
          <div className="sf-card p-10 text-center bg-white">
            <span className="text-6xl mb-3 block animate-bounce">🏆</span>
            <h1 className="sf-heading sf-heading-xl text-[#1A1A2E] mb-1">DRILL COMPLETE!</h1>
            <p className="sf-label text-xs text-[#00F5A0]">PHYSICAL SKILL SCORE UPDATED</p>

            <div className="my-6 p-6 bg-[#FAF7F2] rounded-2xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]">
              <p className="sf-label text-xs mb-1 text-[#7E7E9A]">FINAL DRILL SCORE</p>
              <p className="text-6xl font-black text-[#1A1A2E] leading-none my-2 font-['Space_Grotesk']">
                <AnimatedCounter value={result.score} duration={1200} suffix="%" />
              </p>
              <p className="text-sm font-bold text-[#424264]">
                {result.correctCount} of {result.total} questions answered correctly 🎉
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <GelatinousButton variant="secondary" size="lg" className="flex-1" onClick={resetTest}>
                Retry Drill 🔄
              </GelatinousButton>
              <GelatinousButton variant="primary" size="lg" className="flex-1" onClick={() => setActiveSkill(null)}>
                Back to All Quizzes ⚡
              </GelatinousButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Question View
  const q = questions[current];

  return (
    <div className="sf-page flex items-center justify-center p-4">
      <div className="sf-container max-w-2xl w-full">
        
        <div className="flex justify-between items-center mb-4">
          <button
            className="text-xs font-black uppercase text-[#1A1A2E] hover:underline cursor-pointer"
            onClick={() => setActiveSkill(null)}
          >
            ← Exit Drill
          </button>
          <span className="sf-badge sf-badge-yellow">
            QUESTION {current + 1} OF {questions.length}
          </span>
        </div>

        <div className="sf-progress-bar mb-6" style={{ height: 12 }}>
          <div
            className="sf-progress-fill"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="sf-card p-8 bg-white"
          >
            <span className="sf-badge sf-badge-cyan mb-4">{activeSkill.toUpperCase()}</span>
            <h2 className="sf-heading sf-heading-md mb-6 text-[#1A1A2E]">
              {q.q}
            </h2>

            <div className="flex flex-col gap-3">
              {q.opts.map((opt, i) => {
                const isSelected = selected === opt;
                let bg = '#FFFFFF';
                let borderColor = '#1A1A2E';
                let textColor = '#1A1A2E';

                if (showCorrect) {
                  if (opt === q.correct) {
                    bg = '#00F5A0';
                  } else if (isSelected) {
                    bg = '#FF6B9D';
                    textColor = '#FFFFFF';
                  }
                } else if (isSelected) {
                  bg = '#FFE135';
                }

                return (
                  <motion.div
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border-3 border-[#1A1A2E] cursor-pointer flex items-center gap-3 transition-colors shadow-[3px_3px_0px_#1A1A2E]"
                    style={{ backgroundColor: bg, borderColor, color: textColor }}
                  >
                    <span className="w-7 h-7 rounded-lg border-2 border-[#1A1A2E] flex items-center justify-center text-xs font-black bg-white text-[#1A1A2E]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-extrabold text-sm">{opt}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <GelatinousButton
                variant="primary"
                size="md"
                onClick={handleAnswer}
                disabled={selected === null || showCorrect}
              >
                {current < questions.length - 1 ? 'Lock In & Next Question →' : 'Finish Quiz →'}
              </GelatinousButton>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PracticeTestPage;
