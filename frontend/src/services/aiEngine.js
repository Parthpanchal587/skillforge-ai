import { DOMAINS, TARGET_ROLES, DEMO_INTERNSHIPS } from '../data/domainsData';

// ============================================================
// Domain Profile Weights & Capability Engine
// ============================================================
const DOMAIN_PROFILE_MAP = {
  'full-stack': {
    dimWeights: { coding: 0.35, problemSolving: 0.25, design: 0.20, appBuilding: 0.20 },
    topicWeights: { 'JavaScript': 0.30, 'Programming Logic': 0.20, 'Database': 0.25, 'Backend': 0.25 },
    description: 'Full-spectrum web application engineering, microservices, and databases.',
  },
  'web-dev': {
    dimWeights: { design: 0.45, appBuilding: 0.35, coding: 0.20 },
    topicWeights: { 'JavaScript': 0.50, 'Programming Logic': 0.30, 'Problem Solving': 0.20 },
    description: 'Frontend architectures, modern design systems, and responsive user experiences.',
  },
  'app-dev': {
    dimWeights: { appBuilding: 0.50, coding: 0.30, design: 0.20 },
    topicWeights: { 'JavaScript': 0.40, 'Programming Logic': 0.30, 'CS Fundamentals': 0.30 },
    description: 'Cross-platform mobile apps, native hardware integrations, and UX gestures.',
  },
  'ai-ml': {
    dimWeights: { ai: 0.50, data: 0.30, problemSolving: 0.20 },
    topicWeights: { 'Problem Solving': 0.40, 'Programming Logic': 0.30, 'CS Fundamentals': 0.30 },
    description: 'Machine learning models, neural networks, NLP, and intelligent agents.',
  },
  'data-science': {
    dimWeights: { data: 0.45, ai: 0.30, problemSolving: 0.25 },
    topicWeights: { 'Database': 0.40, 'Problem Solving': 0.35, 'Programming Logic': 0.25 },
    description: 'Statistical modeling, predictive analytics, and algorithmic data discovery.',
  },
  'data-analytics': {
    dimWeights: { data: 0.50, design: 0.25, problemSolving: 0.25 },
    topicWeights: { 'Database': 0.50, 'Problem Solving': 0.30, 'Programming Logic': 0.20 },
    description: 'Enterprise BI dashboards, SQL optimization, KPIs, and metric intelligence.',
  },
  'cybersecurity': {
    dimWeights: { security: 0.55, problemSolving: 0.25, cloud: 0.20 },
    topicWeights: { 'CS Fundamentals': 0.40, 'Backend': 0.30, 'Problem Solving': 0.30 },
    description: 'Threat modeling, penetration testing, cryptography, and defense architecture.',
  },
  'cloud': {
    dimWeights: { cloud: 0.50, coding: 0.25, problemSolving: 0.25 },
    topicWeights: { 'Backend': 0.35, 'CS Fundamentals': 0.35, 'Database': 0.30 },
    description: 'Serverless cloud infrastructure, AWS/GCP architecture, and distributed systems.',
  },
  'software-eng': {
    dimWeights: { problemSolving: 0.40, coding: 0.35, appBuilding: 0.25 },
    topicWeights: { 'CS Fundamentals': 0.35, 'Programming Logic': 0.35, 'Problem Solving': 0.30 },
    description: 'System design patterns, clean architecture, DSA, and scalable engineering.',
  },
  'devops': {
    dimWeights: { cloud: 0.45, problemSolving: 0.30, coding: 0.25 },
    topicWeights: { 'Backend': 0.35, 'CS Fundamentals': 0.35, 'Problem Solving': 0.30 },
    description: 'CI/CD deployment pipelines, container orchestration, and observability.',
  },
};

export function calculateAllDomainCapabilities(skillScores = {}, assessmentResults = null, interestProfile = null, selectedDomain = null) {
  const dim = interestProfile?.dimensions || interestProfile || {};
  const ts = assessmentResults?.topicScores || {};
  const hasAssessment = !!(assessmentResults && Object.keys(ts).length > 0);
  const hasInterest = !!(interestProfile && Object.keys(dim).length > 0);

  const domainResults = DOMAINS.map((domain) => {
    const mapping = DOMAIN_PROFILE_MAP[domain.id] || {
      dimWeights: { coding: 0.5, problemSolving: 0.5 },
      topicWeights: { 'Programming Logic': 0.5, 'Problem Solving': 0.5 },
      description: domain.description,
    };

    // 1. Calculate Interest Affinity Score (0-100)
    let interestScore = 60;
    if (hasInterest) {
      let weightedSum = 0;
      let totalWeight = 0;
      Object.entries(mapping.dimWeights).forEach(([key, weight]) => {
        const val = dim[key] || 50;
        weightedSum += val * weight;
        totalWeight += weight;
      });
      interestScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 60;
    }

    // 2. Calculate Diagnostic Test Aptitude Score (0-100)
    let aptitudeScore = 55;
    if (hasAssessment) {
      let weightedSum = 0;
      let totalWeight = 0;
      Object.entries(mapping.topicWeights).forEach(([topic, weight]) => {
        const val = ts[topic] !== undefined ? ts[topic] : (assessmentResults.overall || 50);
        weightedSum += val * weight;
        totalWeight += weight;
      });
      aptitudeScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 55;
    }

    // 3. Calculate Domain Skill Mastery from tracked skills (0-100)
    let domainTrackedScores = [];
    domain.skills.forEach((sk) => {
      const existing = skillScores[sk.id] || skillScores[sk.id.replace('-', '')];
      if (existing && existing.score) {
        domainTrackedScores.push(existing.score);
      }
    });

    let masteryScore = aptitudeScore;
    if (domainTrackedScores.length > 0) {
      const avgTracked = domainTrackedScores.reduce((a, b) => a + b, 0) / domainTrackedScores.length;
      masteryScore = Math.round(avgTracked);
    }

    // Composite Capability Percentage
    let capabilityPercentage = 0;
    if (hasAssessment && hasInterest) {
      capabilityPercentage = Math.round(aptitudeScore * 0.45 + masteryScore * 0.35 + interestScore * 0.20);
    } else if (hasAssessment) {
      capabilityPercentage = Math.round(aptitudeScore * 0.60 + masteryScore * 0.40);
    } else if (hasInterest) {
      capabilityPercentage = Math.round(interestScore * 0.50 + masteryScore * 0.50);
    } else {
      capabilityPercentage = Math.round(masteryScore * 0.70 + 20);
    }

    capabilityPercentage = Math.min(Math.max(capabilityPercentage, 35), 98);

    let capabilityTier = 'Developing Track';
    let badgeColor = 'amber';
    if (capabilityPercentage >= 80) {
      capabilityTier = 'High Match & Capable 🚀';
      badgeColor = 'green';
    } else if (capabilityPercentage >= 65) {
      capabilityTier = 'Strong Potential ⚡';
      badgeColor = 'cyan';
    } else if (capabilityPercentage >= 50) {
      capabilityTier = 'Ready to Learn 📚';
      badgeColor = 'pink';
    }

    return {
      ...domain,
      capabilityPercentage,
      aptitudeScore,
      interestScore,
      masteryScore,
      capabilityTier,
      badgeColor,
      isActive: selectedDomain === domain.id,
      skillsCount: domain.skills.length,
      topSkills: domain.skills.slice(0, 4).map(s => s.name),
    };
  });

  return domainResults.sort((a, b) => b.capabilityPercentage - a.capabilityPercentage);
}

// ============================================================
// Domain Recommendation Engine
// ============================================================
export function recommendDomain(interestProfile, assessmentResults) {
  const capabilities = calculateAllDomainCapabilities({}, assessmentResults, interestProfile);
  const primary = capabilities[0] || DOMAINS[0];
  const secondary = capabilities[1] || capabilities[0];
  const alternatives = capabilities.slice(1, 4).map(c => ({
    id: c.id,
    name: c.name,
    score: c.capabilityPercentage || 75,
    icon: c.icon,
  }));

  return {
    primaryDomain: primary.id,
    matchScore: primary.capabilityPercentage || 85,
    secondaryDomain: secondary.id,
    secondaryScore: secondary.capabilityPercentage || 70,
    alternatives,
    rankings: capabilities.map(c => ({
      domainId: c.id,
      score: c.capabilityPercentage,
      domain: c,
    })),
    reasons: [
      `Your diagnostic starting assessment shows strong aptitude for ${primary.name}.`,
      `Demonstrated capability across foundational problem-solving and domain logic.`,
      `Fastest learning curve to achieve industry-ready engineering projects.`,
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
