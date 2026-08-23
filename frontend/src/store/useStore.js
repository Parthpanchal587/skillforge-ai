import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { DEMO_PROFILE } from '../data/demoProfile.js';
import { DOMAINS } from '../data/domainsData.js';
import { calculateCareerReadiness, detectWeaknesses, generateDailyPlan } from '../services/aiEngine.js';
import firebaseSync from '../services/firebaseSync.js';

const useStore = create(
  persist(
    (set, get) => ({
      // ===== Auth State =====
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      // ===== Platform State =====
      demoMode: false,
      onboarding: null,
      interestProfile: null,
      assessmentResults: null,
      selectedDomain: null,
      domainRecommendation: null,
      skillScores: {},
      skillHistory: {},
      projectProgress: null,
      weaknesses: null,
      improvementSessions: {},
      interview: null,
      careerReadiness: null,
      achievements: [],
      xp: 0,
      streak: 0,
      dailyPlan: [],
      currentLevel: 'Beginner',

      // ===== Auth Actions =====
      login: async (token) => {
        set({ token });
        try {
          const decoded = jwtDecode(token);
          const user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
          };
          set({
            user,
            isAuthenticated: true,
          });

          // Attempt to hydrate user profile & skills from Firestore
          try {
            const remoteSkills = await firebaseSync.fetchUserSkills(user.id);
            if (remoteSkills && remoteSkills.skillScores && Object.keys(remoteSkills.skillScores).length > 0) {
              const readiness = calculateCareerReadiness({
                skillScores: remoteSkills.skillScores,
                projectProgress: get().projectProgress,
                interview: get().interview,
              });
              set({
                skillScores: remoteSkills.skillScores,
                selectedDomain: remoteSkills.domainId || get().selectedDomain || 'fullstack',
                careerReadiness: readiness,
                weaknesses: detectWeaknesses(remoteSkills.skillScores),
              });
            }
          } catch (e) {}
        } catch (error) {
          console.error('Failed to decode token:', error);
          set({ user: null, isAuthenticated: false });
        }
      },

      loginDemo: () => {
        set({
          user: { id: 'demo_user', username: DEMO_PROFILE.onboarding.name, email: 'prem@skillforge.ai', role: 'student' },
          isAuthenticated: true,
          demoMode: true,
          onboarding: DEMO_PROFILE.onboarding,
          interestProfile: DEMO_PROFILE.interestProfile,
          assessmentResults: DEMO_PROFILE.assessmentResults,
          selectedDomain: DEMO_PROFILE.selectedDomain,
          domainRecommendation: DEMO_PROFILE.domainRecommendation,
          skillScores: DEMO_PROFILE.skillScores,
          skillHistory: DEMO_PROFILE.skillHistory,
          projectProgress: DEMO_PROFILE.projectProgress,
          weaknesses: DEMO_PROFILE.weaknesses,
          improvementSessions: DEMO_PROFILE.improvementSessions,
          interview: DEMO_PROFILE.interview,
          careerReadiness: DEMO_PROFILE.careerReadiness,
          achievements: DEMO_PROFILE.achievements,
          xp: DEMO_PROFILE.xp,
          streak: DEMO_PROFILE.streak,
          dailyPlan: DEMO_PROFILE.dailyPlan,
          currentLevel: DEMO_PROFILE.level,
        });
      },

      logout: () => {
        set({
          user: null, token: null, isAuthenticated: false, demoMode: false,
          onboarding: null, interestProfile: null, assessmentResults: null,
          selectedDomain: null, domainRecommendation: null, skillScores: {},
          skillHistory: {}, projectProgress: null, weaknesses: null,
          improvementSessions: {}, interview: null, careerReadiness: null,
          achievements: [], xp: 0, streak: 0, dailyPlan: [], currentLevel: 'Beginner',
        });
      },

      setLoading: (loading) => set({ loading }),
      updateProfile: (profileData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profileData } : null,
        }));
      },

      // ===== Onboarding =====
      completeOnboarding: (data) => set({ onboarding: { ...data, completed: true } }),

      // ===== Interest Assessment =====
      completeInterestAssessment: (profile) => set({ interestProfile: { ...profile, completed: true } }),

      // ===== Knowledge Assessment =====
      completeAssessment: (results) => {
        const currentDomainId = get().selectedDomain || 'full-stack';
        const domain = DOMAINS.find(d => d.id === currentDomainId) || DOMAINS[0];
        
        // Map topic scores to domain skills
        const initialSkills = {};
        const topicScores = results.topicScores || {};
        const overall = results.overall || 50;

        domain.skills.forEach(skill => {
          let score = Math.max(overall - Math.floor(Math.random() * 15), 35);
          if (skill.id === 'javascript' || skill.id === 'programming' || skill.id === 'js-fundamentals' || skill.id === 'python' || skill.id === 'ds-python') {
            score = topicScores['JavaScript'] || topicScores['Programming Logic'] || score;
          }
          if (skill.id === 'databases' || skill.id === 'sql') score = topicScores['Database'] || score;
          if (skill.id === 'rest-api' || skill.id === 'backend' || skill.id === 'nodejs') score = topicScores['Backend'] || score;
          if (skill.id === 'dsa' || skill.id === 'math-stats') score = topicScores['Problem Solving'] || topicScores['CS Fundamentals'] || score;

          const status = score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : 'NEEDS_IMPROVEMENT';
          initialSkills[skill.id] = {
            id: skill.id,
            name: skill.name,
            score,
            status,
            testsTaken: 1,
            lastTestDate: new Date().toISOString().split('T')[0],
          };
        });

        const readiness = calculateCareerReadiness({
          skillScores: initialSkills,
          projectProgress: get().projectProgress,
          interview: get().interview,
        });

        const weaknesses = detectWeaknesses(initialSkills);
        const dailyPlan = generateDailyPlan(initialSkills, weaknesses);

        set({
          assessmentResults: { ...results, completed: true },
          skillScores: initialSkills,
          careerReadiness: readiness,
          weaknesses,
          dailyPlan,
        });

        // Sync to backend if authenticated
        const user = get().user;
        if (user?.id) {
          firebaseSync.saveUserSkills(user.id, initialSkills, currentDomainId, get().token);
        }
      },

      // ===== Domain Selection =====
      setDomainRecommendation: (rec) => set({ domainRecommendation: { ...rec, completed: true } }),
      selectDomain: (domainId) => {
        const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[0];
        const currentSkills = { ...get().skillScores };
        const assessment = get().assessmentResults;
        const topicScores = assessment?.topicScores || {};
        const overall = assessment?.overall || 65;

        // Ensure all skills in the newly selected domain are populated with scores
        domain.skills.forEach(skill => {
          if (!currentSkills[skill.id]) {
            let score = Math.max(overall - Math.floor(Math.random() * 12), 40);
            if (skill.id === 'javascript' || skill.id === 'js-fundamentals' || skill.id === 'programming' || skill.id === 'ds-python' || skill.id === 'python') {
              score = topicScores['JavaScript'] || topicScores['Programming Logic'] || score;
            }
            if (skill.id === 'databases' || skill.id === 'sql') {
              score = topicScores['Database'] || score;
            }
            if (skill.id === 'rest-api' || skill.id === 'backend' || skill.id === 'nodejs') {
              score = topicScores['Backend'] || score;
            }
            if (skill.id === 'dsa' || skill.id === 'math-stats' || skill.id === 'statistics') {
              score = topicScores['Problem Solving'] || topicScores['CS Fundamentals'] || score;
            }

            const status = score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : 'NEEDS_IMPROVEMENT';
            currentSkills[skill.id] = {
              id: skill.id,
              name: skill.name,
              score,
              status,
              testsTaken: assessment ? 1 : 0,
              lastTestDate: new Date().toISOString().split('T')[0],
            };
          }
        });

        const readiness = calculateCareerReadiness({
          skillScores: currentSkills,
          projectProgress: get().projectProgress,
          interview: get().interview,
        });

        const weaknesses = detectWeaknesses(currentSkills);
        const dailyPlan = generateDailyPlan(currentSkills, weaknesses);

        set({
          selectedDomain: domainId,
          skillScores: currentSkills,
          careerReadiness: readiness,
          weaknesses,
          dailyPlan,
        });

        const user = get().user;
        if (user?.id) {
          firebaseSync.saveUserSkills(user.id, currentSkills, domainId, get().token);
        }
      },

      // ===== Skill Scores with Dynamic Career Recalculation =====
      updateSkillScore: (skillId, score, status) => {
        const state = get();
        const currentSkills = { ...state.skillScores };
        const calculatedStatus = status || (score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : 'NEEDS_IMPROVEMENT');

        currentSkills[skillId] = {
          ...(currentSkills[skillId] || { id: skillId, name: skillId }),
          score,
          status: calculatedStatus,
          testsTaken: ((currentSkills[skillId]?.testsTaken || 0) + 1),
          lastTestDate: new Date().toISOString().split('T')[0],
        };

        // Recalculate Career Readiness in real-time
        const updatedReadiness = calculateCareerReadiness({
          skillScores: currentSkills,
          projectProgress: state.projectProgress,
          interview: state.interview,
        });

        // Recalculate Weaknesses and Daily Plan
        const updatedWeaknesses = detectWeaknesses(currentSkills);
        const updatedDailyPlan = generateDailyPlan(currentSkills, updatedWeaknesses);

        set({
          skillScores: currentSkills,
          careerReadiness: updatedReadiness,
          weaknesses: updatedWeaknesses,
          dailyPlan: updatedDailyPlan,
        });

        // Async sync to Firebase database
        const user = state.user;
        if (user?.id) {
          firebaseSync.saveUserSkills(user.id, currentSkills, state.selectedDomain, state.token);
        }
      },

      // ===== Project =====
      startProject: (domainId) => set({
        projectProgress: {
          started: true,
          projectId: domainId,
          milestones: {},
          completionPercent: 0,
          evaluation: null,
        },
      }),

      toggleMilestone: (milestoneId) => {
        set((state) => {
          if (!state.projectProgress) return {};
          const milestones = { ...state.projectProgress.milestones };
          milestones[milestoneId] = {
            completed: !milestones[milestoneId]?.completed,
            date: !milestones[milestoneId]?.completed ? new Date().toISOString().split('T')[0] : null,
          };
          const total = Object.keys(milestones).length;
          const completed = Object.values(milestones).filter(m => m.completed).length;
          const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          const updatedProgress = {
            ...state.projectProgress,
            milestones,
            completionPercent,
          };

          const updatedReadiness = calculateCareerReadiness({
            skillScores: state.skillScores,
            projectProgress: updatedProgress,
            interview: state.interview,
          });

          return {
            projectProgress: updatedProgress,
            careerReadiness: updatedReadiness,
          };
        });
      },

      setProjectEvaluation: (evaluation) => {
        set((state) => {
          const updatedProgress = state.projectProgress ? { ...state.projectProgress, evaluation } : null;
          const updatedReadiness = calculateCareerReadiness({
            skillScores: state.skillScores,
            projectProgress: updatedProgress,
            interview: state.interview,
          });
          return {
            projectProgress: updatedProgress,
            careerReadiness: updatedReadiness,
          };
        });
      },

      // ===== Weaknesses =====
      setWeaknesses: (weaknesses) => set({ weaknesses }),

      // ===== Improvement Sessions =====
      completeImprovementSession: (skillId, sessionId) => {
        set((state) => {
          const sessions = { ...state.improvementSessions };
          if (!sessions[skillId]) sessions[skillId] = { sessions: [], beforeScore: 0, afterScore: null };
          sessions[skillId].sessions = sessions[skillId].sessions.map(s =>
            s.id === sessionId ? { ...s, completed: true } : s
          );
          return { improvementSessions: sessions };
        });
      },

      // ===== Interview =====
      setInterviewResults: (results) => {
        set((state) => {
          const updatedInterview = { ...results, completed: true };
          const updatedReadiness = calculateCareerReadiness({
            skillScores: state.skillScores,
            projectProgress: state.projectProgress,
            interview: updatedInterview,
          });
          return {
            interview: updatedInterview,
            careerReadiness: updatedReadiness,
          };
        });
      },

      // ===== Career Readiness =====
      setCareerReadiness: (readiness) => set({ careerReadiness: readiness }),

      // ===== Gamification =====
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      earnAchievement: (achievementId) => {
        set((state) => ({
          achievements: state.achievements.map(a =>
            a.id === achievementId ? { ...a, earned: true, date: new Date().toISOString().split('T')[0] } : a
          ),
        }));
      },
      setDailyPlan: (plan) => set({ dailyPlan: plan }),
      toggleDailyTask: (index) => {
        set((state) => ({
          dailyPlan: state.dailyPlan.map((t, i) =>
            i === index ? { ...t, completed: !t.completed } : t
          ),
        }));
      },
      setCurrentLevel: (level) => set({ currentLevel: level }),
    }),
    {
      name: 'skillforge-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

export { useStore };
export default useStore;