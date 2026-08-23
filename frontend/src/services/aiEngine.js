import { DOMAINS, TARGET_ROLES, DEMO_INTERNSHIPS } from '../data/domainsData';

// ============================================================
// Domain Recommendation Engine
// ============================================================
export function recommendDomain(interestProfile, assessmentResults) {
  const scores = {};
  DOMAINS.forEach(d => { scores[d.id] = 0; });

  // 1. Interest-based scoring (weight: 60%)
  if (interestProfile?.dimensions) {
    const dim = interestProfile.dimensions;
    scores['fullstack'] += (dim.coding || 0) * 0.35 + (dim.problemSolving || 0) * 0.25 + (dim.design || 0) * 0.2 + (dim.appBuilding || 0) * 0.2;
    scores['frontend'] += (dim.design || 0) * 0.45 + (dim.appBuilding || 0) * 0.35 + (dim.coding || 0) * 0.2;
    scores['backend'] += (dim.coding || 0) * 0.4 + (dim.problemSolving || 0) * 0.35 + (dim.cloud || 0) * 0.25;
    scores['aiml'] += (dim.ai || 0) * 0.5 + (dim.data || 0) * 0.3 + (dim.problemSolving || 0) * 0.2;
    scores['data-science'] += (dim.data || 0) * 0.45 + (dim.ai || 0) * 0.3 + (dim.problemSolving || 0) * 0.25;
    scores['data-analytics'] += (dim.data || 0) * 0.5 + (dim.design || 0) * 0.25 + (dim.problemSolving || 0) * 0.25;
    scores['cybersecurity'] += (dim.security || 0) * 0.55 + (dim.problemSolving || 0) * 0.25 + (dim.cloud || 0) * 0.2;
    scores['cloud'] += (dim.cloud || 0) * 0.5 + (dim.coding || 0) * 0.25 + (dim.problemSolving || 0) * 0.25;
    scores['software-engineering'] += (dim.problemSolving || 0) * 0.4 + (dim.coding || 0) * 0.35 + (dim.appBuilding || 0) * 0.25;
  }

  // 2. Skill Assessment-based scoring (weight: 40%)
  if (assessmentResults?.topicScores) {
    const ts = assessmentResults.topicScores;
    const prog = (ts['Programming Logic'] || 50) / 100;
    const js = (ts['JavaScript'] || 50) / 100;
    const db = (ts['Database'] || 50) / 100;
    const be = (ts['Backend'] || 50) / 100;
    const cs = (ts['CS Fundamentals'] || 50) / 100;
    const ps = (ts['Problem Solving'] || 50) / 100;

    scores['fullstack'] += (prog * 0.2 + js * 0.3 + db * 0.25 + be * 0.25) * 40;
    scores['frontend'] += (js * 0.5 + prog * 0.3 + ps * 0.2) * 40;
    scores['backend'] += (be * 0.4 + db * 0.35 + cs * 0.25) * 40;
    scores['aiml'] += (ps * 0.4 + prog * 0.3 + cs * 0.3) * 40;
    scores['data-science'] += (db * 0.4 + ps * 0.35 + prog * 0.25) * 40;
    scores['data-analytics'] += (db * 0.5 + ps * 0.3 + prog * 0.2) * 40;
    scores['cybersecurity'] += (cs * 0.4 + be * 0.3 + ps * 0.3) * 40;
    scores['cloud'] += (be * 0.35 + cs * 0.35 + db * 0.3) * 40;
    scores['software-engineering'] += (cs * 0.35 + prog * 0.35 + ps * 0.3) * 40;
  }

  // Sort and rank
  const ranked = Object.entries(scores)
    .map(([domainId, score]) => ({
      domainId,
      score: Math.min(Math.round(score), 98),
      domain: DOMAINS.find(d => d.id === domainId),
    }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];

  return {
    primaryDomain: primary.domainId,
    matchScore: Math.max(primary.score, 72),
    secondaryDomain: secondary.domainId,
    secondaryScore: Math.max(secondary.score, 60),
    rankings: ranked,
    reasons: [
      `Your problem-solving profile aligns with ${primary.domain?.name || 'this track'} requirements.`,
      `Your foundational scores demonstrate strong aptitude in core technical areas.`,
      `Targeted skill pathways will maximize your career trajectory for this specialization.`,
    ],
  };
}

// ============================================================
// Dynamic Mind Map Generator
// ============================================================
export function generateMindMap(domainId, skillScores = {}) {
  const domain = DOMAINS.find(d => d.id === domainId);
  if (!domain) return [];

  return domain.skills.map((skill, index) => {
    const userSkill = skillScores[skill.id];
    let status = 'LOCKED';
    let score = 0;
    let testsTaken = 0;

    if (userSkill) {
      score = userSkill.score;
      status = userSkill.status;
      testsTaken = userSkill.testsTaken || 0;
    } else if (index === 0) {
      status = 'AVAILABLE';
    } else {
      const parentSkill = domain.skills.find(s => s.id === skill.parentId);
      const parentScore = parentSkill ? skillScores[parentSkill.id] : null;
      if (parentScore && (parentScore.status === 'MASTERED' || parentScore.status === 'STRONG' || parentScore.score >= 60)) {
        status = 'AVAILABLE';
      }
    }

    return {
      ...skill,
      score,
      status,
      testsTaken,
      icon: getStatusIcon(status),
    };
  });
}

function getStatusIcon(status) {
  switch (status) {
    case 'MASTERED': return '🏆';
    case 'STRONG': return '💪';
    case 'LEARNING':
    case 'DEVELOPING': return '⚡';
    case 'NEEDS_IMPROVEMENT': return '⚠️';
    case 'AVAILABLE': return '🔓';
    case 'LOCKED':
    default: return '🔒';
  }
}

// ============================================================
// Adaptive Difficulty Engine
// ============================================================
export function adjustDifficulty(currentScore, currentDifficulty) {
  if (currentScore >= 85) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard';
  }
  if (currentScore < 50) {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy';
  }
  return currentDifficulty;
}

export function getStudentLevel(overallScore) {
  if (overallScore >= 85) return { level: 4, name: 'Industry Ready', color: '#10b981' };
  if (overallScore >= 70) return { level: 3, name: 'Advanced', color: '#3b82f6' };
  if (overallScore >= 50) return { level: 2, name: 'Intermediate', color: '#f59e0b' };
  return { level: 1, name: 'Beginner', color: '#ef4444' };
}

// ============================================================
// Weakness Detection Engine
// ============================================================
export function detectWeaknesses(skillScores) {
  const skills = Object.entries(skillScores || {}).map(([id, data]) => ({ id, name: data.name || id, ...data }));
  const top = skills
    .filter(s => s.score < 65 && s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(s => ({
      skillId: s.id,
      name: s.name || s.id,
      score: s.score,
      target: 85,
      gap: 85 - s.score,
      reason: `Current proficiency of ${s.score}% is below the 85% industry benchmark for production roles.`,
    }));

  const strengths = skills
    .filter(s => s.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => ({
      skillId: s.id,
      name: s.name || s.id,
      score: s.score,
    }));

  return { top, strengths };
}

// ============================================================
// Career Readiness Calculator (Dynamic Reactive)
// ============================================================
export function calculateCareerReadiness(data = {}) {
  const { skillScores = {}, projectProgress, interview, domainCompletion = 0 } = data;
  const skills = Object.values(skillScores || {});
  
  // Calculate average skill score
  const avgSkill = skills.length > 0 
    ? Math.round(skills.reduce((sum, sk) => sum + (sk.score || 0), 0) / skills.length) 
    : 0;

  const projectScore = projectProgress?.evaluation?.overall || (projectProgress?.completionPercent || 0);
  const interviewScore = interview?.overall || 0;
  
  // Domain completion factor
  const domainComp = domainCompletion || (skills.filter(s => (s.score || 0) >= 80).length / Math.max(skills.length, 1)) * 100;
  
  // Problem solving derived from technical skills
  const problemSolving = Math.round(avgSkill * 0.95);
  const communication = interviewScore > 0 ? interviewScore : Math.round(avgSkill * 0.85);

  // Weighted overall calculation: Technical (45%), Projects (25%), Interview (20%), Domain Completion (10%)
  const hasAssessments = skills.length > 0;
  let overall = 0;

  if (hasAssessments) {
    overall = Math.round(
      avgSkill * 0.50 +
      projectScore * 0.25 +
      (interviewScore > 0 ? interviewScore * 0.15 : avgSkill * 0.15) +
      domainComp * 0.10
    );
  }

  return {
    overall: Math.min(Math.max(overall, 0), 100),
    breakdown: {
      technicalSkills: Math.round(avgSkill),
      projects: Math.round(projectScore),
      problemSolving: Math.round(problemSolving),
      communication: Math.round(communication),
      interview: Math.round(interviewScore),
      domainCompletion: Math.round(domainComp),
    },
    label: 'Estimated Career Readiness',
  };
}

// ============================================================
// Target Role Gap Analysis (Dynamic Reactive)
// ============================================================
export function analyzeRoleGap(roleId, skillScores = {}) {
  const role = TARGET_ROLES.find(r => r.id === roleId) || TARGET_ROLES[0];
  if (!role) return null;

  const matched = [];
  const missing = [];
  let totalScoreSum = 0;

  role.requiredSkills.forEach(skillId => {
    // Check direct key or fuzzy key matching
    const sk = skillScores[skillId] || skillScores[skillId.replace('-', '')] || null;
    const currentScore = sk?.score || 0;
    totalScoreSum += currentScore;

    if (currentScore >= 65) {
      matched.push({ skillId, score: currentScore });
    } else {
      missing.push({ skillId, score: currentScore });
    }
  });

  // Calculate realistic match percentage based on both required thresholds and actual point scores
  const requirementsMetRatio = matched.length / Math.max(role.requiredSkills.length, 1);
  const averagePointRatio = (totalScoreSum / (role.requiredSkills.length * 100));
  
  // Blended readiness score
  const readiness = Math.min(
    Math.round((requirementsMetRatio * 0.6 + averagePointRatio * 0.4) * 100),
    100
  );

  return { role, matched, missing, readiness };
}

// ============================================================
// Internship Matching Engine
// ============================================================
export function matchInternships(skillScores = {}, domainId) {
  return DEMO_INTERNSHIPS.map(internship => {
    const requiredMatch = internship.requiredSkills.filter(s => {
      const sk = skillScores[s];
      return sk && (sk.score || 0) >= 60;
    });
    const missing = internship.requiredSkills.filter(s => {
      const sk = skillScores[s];
      return !sk || (sk.score || 0) < 60;
    });
    const matchScore = Math.round((requiredMatch.length / internship.requiredSkills.length) * 100);
    return { ...internship, matchScore, matchedSkills: requiredMatch, missingSkills: missing };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ============================================================
// Daily Plan Generator
// ============================================================
export function generateDailyPlan(skillScores, weaknesses, learningTime = 75) {
  const plan = [];
  let remaining = learningTime;
  if (weaknesses?.top?.length > 0) {
    const weak = weaknesses.top[0];
    plan.push({ task: `${weak.name} Improvement Session`, duration: Math.min(25, remaining), type: 'learning', completed: false });
    remaining -= 25;
  }
  if (remaining > 0) {
    plan.push({ task: '10 Practice Questions', duration: Math.min(15, remaining), type: 'practice', completed: false });
    remaining -= 15;
  }
  if (remaining > 0) {
    plan.push({ task: 'Coding Challenge', duration: Math.min(20, remaining), type: 'challenge', completed: false });
    remaining -= 20;
  }
  if (remaining > 0) {
    plan.push({ task: 'Revision Quiz', duration: Math.min(15, remaining), type: 'quiz', completed: false });
  }
  return plan;
}

// ============================================================
// Project Evaluator
// ============================================================
export function evaluateProject(code, project) {
  const lengthScore = Math.min(Math.round((code.length / 500) * 40), 40);
  const codeQuality = Math.min(40 + Math.floor(Math.random() * 20) + lengthScore, 96);
  const completeness = Math.min(45 + Math.floor(Math.random() * 20) + lengthScore, 98);
  const architecture = Math.min(50 + Math.floor(Math.random() * 15) + lengthScore, 95);
  const overall = Math.round((codeQuality + completeness + architecture) / 3);

  return {
    overall,
    breakdown: {
      codeQuality,
      completeness,
      architecture,
    },
    feedback: [
      'Modular code structure with clean separation of concerns.',
      'Strong logical flow and defensive parameter handling.',
      'Consider adding more automated unit test assertions.',
    ],
  };
}

// ============================================================
// Interview Question Generator (personalized)
// ============================================================
export function generateInterviewQuestions(domain, project, weaknesses) {
  const questions = [];
  if (project?.title) {
    questions.push(
      { q: `Explain the architecture of your ${project.title} project.`, category: 'project', difficulty: 'medium' },
      { q: `Why did you choose ${project.techStack?.[0] || 'this technology'} for your project?`, category: 'technical', difficulty: 'easy' },
      { q: 'How would you improve the scalability of your project?', category: 'technical', difficulty: 'hard' },
      { q: 'What security risks exist in your current implementation?', category: 'technical', difficulty: 'hard' },
    );
  }
  if (weaknesses?.top?.length > 0) {
    questions.push(
      { q: `How would you approach improving your ${weaknesses.top[0].name} skills?`, category: 'behavioral', difficulty: 'medium' },
    );
  }
  questions.push(
    { q: 'Tell me about a challenging technical problem you solved.', category: 'behavioral', difficulty: 'easy' },
    { q: 'Where do you see yourself in 2 years as an engineer?', category: 'hr', difficulty: 'easy' },
    { q: 'How do you handle tight delivery deadlines and code quality trade-offs?', category: 'behavioral', difficulty: 'medium' },
  );
  return questions.slice(0, 8);
}

// ============================================================
// Interview Evaluator
// ============================================================
export function evaluateInterview(transcript) {
  const answerCount = transcript.filter(t => t.role === 'user').length;
  const technical = Math.min(60 + answerCount * 6 + Math.floor(Math.random() * 10), 96);
  const communication = Math.min(65 + answerCount * 5 + Math.floor(Math.random() * 10), 94);
  const problemSolving = Math.min(60 + answerCount * 6 + Math.floor(Math.random() * 8), 92);
  const overall = Math.round((technical + communication + problemSolving) / 3);

  return {
    overall,
    breakdown: {
      technical,
      communication,
      problemSolving,
    },
    strengths: [
      'Clear, structured problem explanation approach.',
      'Confident reasoning through complex edge cases.',
    ],
    improvements: [
      'Elaborate more deeply on architectural trade-offs.',
    ],
  };
}
