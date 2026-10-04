/* ============================================
   LocalStorage CRUD Wrapper for ExamEase AI
   All user data persists across sessions
   ============================================ */

const KEYS = {
  USER: 'examease_user',
  EXAMS: 'examease_exams',
  STRESS_LOGS: 'examease_stress_logs',
  STUDY_LOGS: 'examease_study_logs',
  STUDY_PLANS: 'examease_study_plans',
  CHAT_HISTORY: 'examease_chat_history',
  RECOMMENDATIONS: 'examease_recommendations',
  RELAXATION_LOGS: 'examease_relaxation_logs',
};

// ============================================
// Generic helpers
// ============================================

function getItem(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
}

// ============================================
// User / Auth
// ============================================

export function getUser() {
  return getItem(KEYS.USER, null);
}

export function saveUser(user) {
  setItem(KEYS.USER, { ...user, updatedAt: new Date().toISOString() });
}

export function isLoggedIn() {
  const user = getUser();
  return user && user.email && user.verified;
}

export function isProfileComplete() {
  const user = getUser();
  if (!user || !user.fullName) return false;
  if (user.student_type === 'school') {
    return Boolean((user.school || user.college) && user.grade && user.board);
  }
  // Default to college student
  return Boolean(user.college && user.course);
}

export function isUnder18User(userObj) {
  const user = userObj || getUser();
  if (!user) return false;
  if (user.student_type === 'school') return true;
  // If grade is specified (6 to 12), it's under 18
  if (user.grade && ['6', '7', '8', '9', '10', '11', '12'].includes(String(user.grade))) {
    return true;
  }
  return false;
}

export function logout() {
  // We keep the data, just mark as logged out
  const user = getUser();
  if (user) {
    saveUser({ ...user, verified: false });
  }
}

export function clearAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// ============================================
// Exams
// ============================================

export function getExams() {
  return getItem(KEYS.EXAMS, []);
}

export function saveExam(exam) {
  const exams = getExams();
  const newExam = {
    id: exam.id || generateId(),
    ...exam,
    topics: exam.topics || [],
    preparationPct: exam.preparationPct || 0,
    createdAt: exam.createdAt || new Date().toISOString(),
  };
  const idx = exams.findIndex(e => e.id === newExam.id);
  if (idx >= 0) {
    exams[idx] = newExam;
  } else {
    exams.push(newExam);
  }
  setItem(KEYS.EXAMS, exams);
  return newExam;
}

export function deleteExam(examId) {
  const exams = getExams().filter(e => e.id !== examId);
  setItem(KEYS.EXAMS, exams);
}

export function updateExamPreparation(examId, pct) {
  const exams = getExams();
  const idx = exams.findIndex(e => e.id === examId);
  if (idx >= 0) {
    exams[idx].preparationPct = Math.min(100, Math.max(0, pct));
    setItem(KEYS.EXAMS, exams);
  }
}

export function toggleTopic(examId, topicIndex) {
  const exams = getExams();
  const exam = exams.find(e => e.id === examId);
  if (exam && exam.topics[topicIndex] !== undefined) {
    exam.topics[topicIndex].completed = !exam.topics[topicIndex].completed;
    // Recalculate preparation %
    const completed = exam.topics.filter(t => t.completed).length;
    exam.preparationPct = Math.round((completed / exam.topics.length) * 100);
    setItem(KEYS.EXAMS, exams);
  }
}

// ============================================
// Stress / Mood Logs
// ============================================

export function getStressLogs() {
  return getItem(KEYS.STRESS_LOGS, []);
}

export function saveStressLog(log) {
  const logs = getStressLogs();
  const today = new Date().toISOString().split('T')[0];
  const newLog = {
    id: generateId(),
    date: log.date || today,
    mood: log.mood,
    stressScore: log.stressScore,
    sleepHours: log.sleepHours,
    studyHours: log.studyHours,
    breaksCount: log.breaksCount,
    createdAt: new Date().toISOString(),
  };
  // Replace if same date exists
  const idx = logs.findIndex(l => l.date === newLog.date);
  if (idx >= 0) {
    logs[idx] = newLog;
  } else {
    logs.push(newLog);
  }
  setItem(KEYS.STRESS_LOGS, logs);
  return newLog;
}

export function getLatestStressLog() {
  const logs = getStressLogs();
  if (logs.length === 0) return null;
  return logs.sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getStressLogsLast7Days() {
  const logs = getStressLogs();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return logs
    .filter(l => new Date(l.date) >= sevenDaysAgo)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function isHighStressAlert() {
  const logs = getStressLogs()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  return logs.length >= 3 && logs.every(l => l.stressScore >= 8);
}

// ============================================
// Study Logs
// ============================================

export function getStudyLogs() {
  return getItem(KEYS.STUDY_LOGS, []);
}

export function saveStudyLog(log) {
  const logs = getStudyLogs();
  const today = new Date().toISOString().split('T')[0];
  const newLog = {
    id: generateId(),
    date: log.date || today,
    hoursStudied: log.hoursStudied,
    tasksCompleted: log.tasksCompleted || 0,
    tasksTotal: log.tasksTotal || 0,
    createdAt: new Date().toISOString(),
  };
  const idx = logs.findIndex(l => l.date === newLog.date);
  if (idx >= 0) {
    logs[idx] = { ...logs[idx], ...newLog };
  } else {
    logs.push(newLog);
  }
  setItem(KEYS.STUDY_LOGS, logs);
  return newLog;
}

// ============================================
// Study Plans
// ============================================

export function getStudyPlans() {
  return getItem(KEYS.STUDY_PLANS, []);
}

export function saveStudyPlan(plan) {
  const plans = getStudyPlans();
  const newPlan = {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    tasks: plan.tasks || [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  // Deactivate old plans
  plans.forEach(p => p.isActive = false);
  plans.push(newPlan);
  setItem(KEYS.STUDY_PLANS, plans);
  return newPlan;
}

export function getActivePlan() {
  const plans = getStudyPlans();
  return plans.find(p => p.isActive) || null;
}

export function togglePlanTask(planId, taskIndex) {
  const plans = getStudyPlans();
  const plan = plans.find(p => p.id === planId);
  if (plan && plan.tasks[taskIndex]) {
    plan.tasks[taskIndex].completed = !plan.tasks[taskIndex].completed;
    setItem(KEYS.STUDY_PLANS, plans);
  }
}

// ============================================
// Chat History
// ============================================

export function getChatHistory() {
  return getItem(KEYS.CHAT_HISTORY, []);
}

export function addChatMessage(role, content) {
  const history = getChatHistory();
  history.push({
    id: generateId(),
    role, // 'user' or 'assistant'
    content,
    createdAt: new Date().toISOString(),
  });
  setItem(KEYS.CHAT_HISTORY, history);
}

export function clearChatHistory() {
  setItem(KEYS.CHAT_HISTORY, []);
}

// ============================================
// Recommendations
// ============================================

export function getRecommendations() {
  return getItem(KEYS.RECOMMENDATIONS, []);
}

export function saveRecommendation(text, context) {
  const recs = getRecommendations();
  recs.push({
    id: generateId(),
    text,
    context,
    createdAt: new Date().toISOString(),
  });
  setItem(KEYS.RECOMMENDATIONS, recs);
}

// ============================================
// Relaxation Logs
// ============================================

export function getRelaxationLogs() {
  return getItem(KEYS.RELAXATION_LOGS, []);
}

export function saveRelaxationLog(type, durationSec) {
  const logs = getRelaxationLogs();
  logs.push({
    id: generateId(),
    type,
    durationSec,
    completedAt: new Date().toISOString(),
  });
  setItem(KEYS.RELAXATION_LOGS, logs);
}

// ============================================
// Stats / Aggregations
// ============================================

export function getStudyStats() {
  const studyLogs = getStudyLogs();
  const totalHours = studyLogs.reduce((sum, l) => sum + (l.hoursStudied || 0), 0);
  const totalTasksDone = studyLogs.reduce((sum, l) => sum + (l.tasksCompleted || 0), 0);
  const totalTasks = studyLogs.reduce((sum, l) => sum + (l.tasksTotal || 0), 0);

  // Consistency: days with logs in last 7 days
  const now = new Date();
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    last7.push(d.toISOString().split('T')[0]);
  }
  const daysStudied = last7.filter(date =>
    studyLogs.some(l => l.date === date && l.hoursStudied > 0)
  ).length;
  const consistency = Math.round((daysStudied / 7) * 100);

  return { totalHours, totalTasksDone, totalTasks, consistency };
}

// ============================================
// Helpers
// ============================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getDaysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getWeekday(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
}

// ============================================
// Default Subject List Generator based on Student Type & Grade
// ============================================

export function getDefaultSubjectsForStudent(userObj) {
  const user = userObj || getUser();
  const isSchool = user?.student_type === 'school';
  const gradeNum = parseInt(user?.grade, 10) || 10;
  const stream = (user?.stream || 'science').toLowerCase();
  const board = user?.board || 'CBSE';

  // 1. School Students
  if (isSchool) {
    if (gradeNum >= 6 && gradeNum <= 8) {
      return [
        {
          subject: 'Mathematics',
          difficulty: 'hard',
          preparationPct: 65,
          topics: [
            { name: 'Integers & Fractions', completed: true },
            { name: 'Algebraic Expressions', completed: true },
            { name: 'Mensuration & Geometry', completed: false },
            { name: 'Data Handling', completed: false },
          ],
        },
        {
          subject: 'General Science',
          difficulty: 'medium',
          preparationPct: 55,
          topics: [
            { name: 'Food & Nutrition', completed: true },
            { name: 'Motion & Measurement of Distances', completed: false },
            { name: 'Living Organisms & Surroundings', completed: false },
            { name: 'Light, Shadows & Reflections', completed: false },
          ],
        },
        {
          subject: 'Social Science',
          difficulty: 'medium',
          preparationPct: 70,
          topics: [
            { name: 'History: Our Pasts', completed: true },
            { name: 'Geography: The Earth Our Habitat', completed: true },
            { name: 'Civics: Social & Political Life', completed: false },
          ],
        },
        {
          subject: 'English Language & Literature',
          difficulty: 'easy',
          preparationPct: 80,
          topics: [
            { name: 'Reading Comprehension', completed: true },
            { name: 'Grammar & Tenses', completed: true },
            { name: 'Creative Letter & Story Writing', completed: false },
          ],
        },
        {
          subject: 'Second Language (Hindi / Regional)',
          difficulty: 'medium',
          preparationPct: 60,
          topics: [
            { name: 'Vyakaran / Grammar', completed: true },
            { name: 'Textbook Prose & Poetry', completed: false },
          ],
        },
      ];
    }

    if (gradeNum >= 9 && gradeNum <= 10) {
      return [
        {
          subject: `Mathematics (${board})`,
          difficulty: 'hard',
          preparationPct: 45,
          topics: [
            { name: 'Real Numbers & Polynomials', completed: true },
            { name: 'Quadratic Equations & AP', completed: true },
            { name: 'Trigonometry & Applications', completed: false },
            { name: 'Surface Areas & Volumes', completed: false },
            { name: 'Statistics & Probability', completed: false },
          ],
        },
        {
          subject: `Science (${board})`,
          difficulty: 'hard',
          preparationPct: 50,
          topics: [
            { name: 'Chemical Reactions & Acids/Bases', completed: true },
            { name: 'Life Processes & Control/Coordination', completed: false },
            { name: 'Light Reflection & Refraction', completed: true },
            { name: 'Electricity & Magnetic Effects', completed: false },
          ],
        },
        {
          subject: `Social Science (${board})`,
          difficulty: 'medium',
          preparationPct: 65,
          topics: [
            { name: 'History: Nationalism in India', completed: true },
            { name: 'Pol. Science: Power Sharing & Federalism', completed: true },
            { name: 'Geography: Resources & Agriculture', completed: false },
            { name: 'Economics: Sectors of Indian Economy', completed: false },
          ],
        },
        {
          subject: 'English Language & Literature',
          difficulty: 'easy',
          preparationPct: 85,
          topics: [
            { name: 'First Flight Prose & Poems', completed: true },
            { name: 'Footprints Without Feet', completed: true },
            { name: 'Formal Letter & Analytical Paragraph', completed: false },
          ],
        },
        {
          subject: 'Second Language / IT',
          difficulty: 'easy',
          preparationPct: 75,
          topics: [
            { name: 'Section A: Theory & Grammar', completed: true },
            { name: 'Section B: Writing & Practical Concepts', completed: false },
          ],
        },
      ];
    }

    // Grade 11 & 12
    if (gradeNum >= 11) {
      if (stream.includes('commerce')) {
        return [
          {
            subject: 'Accountancy',
            difficulty: 'hard',
            preparationPct: 40,
            topics: [
              { name: 'Accounting for Partnership Firms', completed: true },
              { name: 'Financial Statements Analysis', completed: false },
              { name: 'Cash Flow Statements', completed: false },
            ],
          },
          {
            subject: 'Business Studies',
            difficulty: 'medium',
            preparationPct: 60,
            topics: [
              { name: 'Principles & Functions of Management', completed: true },
              { name: 'Business Finance & Marketing', completed: false },
            ],
          },
          {
            subject: 'Economics (Micro & Macro / Indian Eco)',
            difficulty: 'medium',
            preparationPct: 55,
            topics: [
              { name: 'National Income & Money/Banking', completed: true },
              { name: 'Indian Economic Development', completed: false },
            ],
          },
          {
            subject: 'English Core',
            difficulty: 'easy',
            preparationPct: 80,
            topics: [
              { name: 'Flamingo & Vistas Textbooks', completed: true },
              { name: 'Notice, Report & Article Writing', completed: false },
            ],
          },
          {
            subject: 'Applied Mathematics / Informatics Practices',
            difficulty: 'hard',
            preparationPct: 50,
            topics: [
              { name: 'Matrices, Determinants & Calculus', completed: true },
              { name: 'Probability & Linear Programming', completed: false },
            ],
          },
        ];
      }

      if (stream.includes('art') || stream.includes('humanities')) {
        return [
          {
            subject: 'History',
            difficulty: 'hard',
            preparationPct: 45,
            topics: [
              { name: 'Themes in Indian History Part I & II', completed: true },
              { name: 'Modern India & Map Work', completed: false },
            ],
          },
          {
            subject: 'Political Science',
            difficulty: 'medium',
            preparationPct: 60,
            topics: [
              { name: 'Contemporary World Politics', completed: true },
              { name: 'Politics in India since Independence', completed: false },
            ],
          },
          {
            subject: 'Psychology / Sociology',
            difficulty: 'medium',
            preparationPct: 55,
            topics: [
              { name: 'Psychological Attributes & Self', completed: true },
              { name: 'Social Movements & Change', completed: false },
            ],
          },
          {
            subject: 'Economics',
            difficulty: 'medium',
            preparationPct: 50,
            topics: [
              { name: 'Introductory Macroeconomics', completed: true },
              { name: 'Development Experience of India', completed: false },
            ],
          },
          {
            subject: 'English Core',
            difficulty: 'easy',
            preparationPct: 80,
            topics: [
              { name: 'Flamingo & Vistas Literature', completed: true },
              { name: 'Creative & Formal Writing', completed: false },
            ],
          },
        ];
      }

      // Default Grade 11-12 Science
      return [
        {
          subject: 'Physics',
          difficulty: 'hard',
          preparationPct: 40,
          topics: [
            { name: 'Electrostatics & Current Electricity', completed: true },
            { name: 'Magnetism & Optics', completed: false },
            { name: 'Modern Physics & Semiconductor Devices', completed: false },
          ],
        },
        {
          subject: 'Chemistry',
          difficulty: 'hard',
          preparationPct: 50,
          topics: [
            { name: 'Solutions & Electrochemistry', completed: true },
            { name: 'Coordination Compounds & d-Block', completed: false },
            { name: 'Organic Chemistry: Aldehydes & Amines', completed: false },
          ],
        },
        {
          subject: 'Mathematics / Biology',
          difficulty: 'hard',
          preparationPct: 45,
          topics: [
            { name: 'Calculus: Derivatives & Integrals', completed: true },
            { name: 'Vectors & 3D Geometry / Genetics', completed: false },
          ],
        },
        {
          subject: 'English Core',
          difficulty: 'easy',
          preparationPct: 85,
          topics: [
            { name: 'Flamingo Prose & Poetry', completed: true },
            { name: 'Formal Letters & Comprehension', completed: false },
          ],
        },
        {
          subject: 'Computer Science / Physical Education',
          difficulty: 'easy',
          preparationPct: 75,
          topics: [
            { name: 'Python Programming / Data Structures', completed: true },
            { name: 'Database Management & SQL', completed: false },
          ],
        },
      ];
    }
  }

  // 2. College / University Defaults
  const course = (user?.course || 'Computer Science').toLowerCase();
  if (course.includes('commerce') || course.includes('b.com') || course.includes('bba')) {
    return [
      {
        subject: 'Financial Accounting & Reporting',
        difficulty: 'hard',
        preparationPct: 45,
        topics: [
          { name: 'Corporate Financial Statements', completed: true },
          { name: 'Cost Accounting & Budgetary Control', completed: false },
        ],
      },
      {
        subject: 'Business Economics & Statistics',
        difficulty: 'medium',
        preparationPct: 65,
        topics: [
          { name: 'Demand Forecasting & Production Theory', completed: true },
          { name: 'Hypothesis Testing & Regression', completed: false },
        ],
      },
      {
        subject: 'Corporate Law & Governance',
        difficulty: 'medium',
        preparationPct: 70,
        topics: [
          { name: 'Companies Act Provisions', completed: true },
          { name: 'Contracts & Dispute Resolution', completed: false },
        ],
      },
    ];
  }

  // Default College Engineering / Science
  return [
    {
      subject: 'Engineering Mathematics',
      difficulty: 'hard',
      preparationPct: 35,
      topics: [
        { name: 'Linear Algebra & Matrices', completed: true },
        { name: 'Differential Equations', completed: false },
        { name: 'Vector Calculus & Fourier Series', completed: false },
      ],
    },
    {
      subject: 'Applied Physics & Thermodynamics',
      difficulty: 'medium',
      preparationPct: 55,
      topics: [
        { name: 'Quantum Mechanics & Wave Optics', completed: true },
        { name: 'Laser & Fiber Optics', completed: false },
        { name: 'Electromagnetism', completed: false },
      ],
    },
    {
      subject: 'Data Structures & Algorithms',
      difficulty: 'easy',
      preparationPct: 80,
      topics: [
        { name: 'Arrays & Linked Lists', completed: true },
        { name: 'Binary Trees & Graph Traversals', completed: true },
        { name: 'Dynamic Programming & Recursion', completed: false },
      ],
    },
  ];
}

export function seedDefaultExamsForUser(userObj) {
  const defaults = getDefaultSubjectsForStudent(userObj);
  const now = new Date();
  const exams = defaults.map((item, idx) => {
    // Schedule exams spaced out 5 to 20 days apart
    const examDate = new Date(now.getTime() + (5 + idx * 4) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return {
      id: `seed-exam-${idx + 1}`,
      subject: item.subject,
      examDate,
      difficulty: item.difficulty,
      preparationPct: item.preparationPct,
      topics: item.topics,
      createdAt: new Date().toISOString(),
    };
  });

  exams.forEach(e => saveExam(e));
  return exams;
}

