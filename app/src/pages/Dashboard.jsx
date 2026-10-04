import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUser,
  getExams,
  saveExam,
  getLatestStressLog,
  getActivePlan,
  togglePlanTask,
  getDaysUntil,
  getStudyStats,
  isUnder18User,
  seedDefaultExamsForUser,
} from '../utils/storage';
import { generateRecommendation, estimateStressRisk } from '../utils/aiEngine';
import ExamCard from '../components/ExamCard';
import StressIndicator from '../components/StressIndicator';
import AnimatedCounter from '../components/AnimatedCounter';
import Floating3DElement from '../components/Floating3DElement';

import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  BookOpen,
  ArrowRight,
  Wind,
  MessageSquare,
  AlertTriangle,
  LifeBuoy,
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUser());
  const [exams, setExams] = useState(() => {
    const u = getUser();
    let currentExams = getExams();
    if (currentExams.length === 0) {
      currentExams = seedDefaultExamsForUser(u);
    }
    return currentExams;
  });
  const [latestStress, setLatestStress] = useState(() => getLatestStressLog());
  const [activePlan, setActivePlan] = useState(() => getActivePlan());
  const [recommendations, setRecommendations] = useState(() => generateRecommendation());
  const [stats, setStats] = useState(() => getStudyStats());
  const [stressRisk, setStressRisk] = useState(() => estimateStressRisk());
  const [showAddModal, setShowAddModal] = useState(false);

  // New exam form state
  const [newExam, setNewExam] = useState({
    subject: '',
    examDate: '',
    difficulty: 'medium',
    preparationPct: 30,
    topicsStr: '',
  });

  const loadData = () => {
    const u = getUser();
    setUser(u);
    setExams(getExams());
    setLatestStress(getLatestStressLog());
    setActivePlan(getActivePlan());
    setRecommendations(generateRecommendation());
    setStats(getStudyStats());
    setStressRisk(estimateStressRisk());
  };

  const handleToggleTask = (taskIndex) => {
    if (activePlan) {
      togglePlanTask(activePlan.id, taskIndex);
      setActivePlan(getActivePlan());
      setStats(getStudyStats());
    }
  };

  const handleAddExamSubmit = (e) => {
    e.preventDefault();
    if (!newExam.subject || !newExam.examDate) return;

    const topicsArray = newExam.topicsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({ name, completed: false }));

    saveExam({
      subject: newExam.subject,
      examDate: newExam.examDate,
      difficulty: newExam.difficulty,
      preparationPct: Number(newExam.preparationPct) || 0,
      topics: topicsArray.length > 0 ? topicsArray : [{ name: 'Syllabus Review', completed: false }],
    });

    setNewExam({
      subject: '',
      examDate: '',
      difficulty: 'medium',
      preparationPct: 30,
      topicsStr: '',
    });
    setShowAddModal(false);
    loadData();
  };

  // Find the nearest upcoming exam
  const sortedUpcoming = [...exams]
    .filter((e) => getDaysUntil(e.examDate) >= 0)
    .sort((a, b) => getDaysUntil(a.examDate) - getDaysUntil(b.examDate));

  const nearestExam = sortedUpcoming[0];
  const nearestDays = nearestExam ? getDaysUntil(nearestExam.examDate) : null;

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Welcome Banner with 3D Canvas Element */}
      <div className="dashboard-hero glass-card">
        <div className="hero-content">
          <span className="hero-tag">
            <Sparkles size={14} /> AI Personalized Hub
          </span>
          <h1 className="hero-title">
            Welcome back, {user?.fullName || 'Student'} 👋
          </h1>
          <p className="hero-subtitle">
            {user?.student_type === 'school'
              ? `${user?.school || 'School'} • Class ${user?.grade || '10'} (${user?.board || 'CBSE'})${user?.stream ? ` • ${user.stream}` : ''}`
              : `${user?.course ? `${user.course} • ` : ''}${user?.college ? `${user.college} • ` : ''}Year ${user?.year || '2'}`}
          </p>

          {nearestExam && (
            <div className="hero-urgent-highlight">
              <Calendar size={18} color="var(--accent-primary)" />
              <span>
                <strong>{nearestExam.subject}</strong> exam is in{' '}
                <span className="countdown-pill">
                  {nearestDays === 0 ? 'TODAY!' : `${nearestDays} day${nearestDays !== 1 ? 's' : ''}`}
                </span>{' '}
                — Preparation is at {nearestExam.preparationPct}%.
              </span>
            </div>
          )}

          <div className="hero-quick-actions">
            <button
              className="btn btn-primary btn-3d"
              onClick={() => navigate('/planner')}
            >
              <BookOpen size={16} />
              Generate Study Plan
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate('/relaxation')}
            >
              <Wind size={16} />
              Quick Reset
            </button>
          </div>
        </div>

        {/* Interactive Floating 3D Graduation Cap / Focus Element */}
        <div className="hero-3d-container">
          <Floating3DElement />
        </div>
      </div>

      {/* Prominent Under-18 / School Student Safety & Wellbeing Notice */}
      {isUnder18User(user) && (
        <div
          className="glass-card student-safety-callout animate-fade-in-up"
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(99, 102, 241, 0.08))',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: 'var(--radius-lg)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(20, 184, 166, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <LifeBuoy size={22} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Safe Study & Student Wellbeing Support
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Exam stress feeling heavy? Confidential support is always available with your <strong>parents/guardians</strong>, <strong>school counsellors</strong>, and 24/7 helplines.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/support')}
            style={{ whiteSpace: 'nowrap' }}
          >
            <LifeBuoy size={14} />
            Open Support Hub
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid-4 stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--teal">
            <Calendar size={22} />
          </div>
          <div>
            <span className="stat-card__label">Next Exam In</span>
            <div className="stat-card__value">
              {nearestDays !== null ? (
                <>
                  <AnimatedCounter value={nearestDays} />
                  <span className="stat-unit">days</span>
                </>
              ) : (
                'None'
              )}
            </div>
            <span className="stat-card__sub">
              {nearestExam ? nearestExam.subject : 'No exams logged'}
            </span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--cyan">
            <Clock size={22} />
          </div>
          <div>
            <span className="stat-card__label">Total Study Logged</span>
            <div className="stat-card__value">
              <AnimatedCounter value={stats.totalHours || 14} />
              <span className="stat-unit">hrs</span>
            </div>
            <span className="stat-card__sub">Across all courses</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--orange">
            <Flame size={22} />
          </div>
          <div>
            <span className="stat-card__label">Consistency Score</span>
            <div className="stat-card__value">
              <AnimatedCounter value={stats.consistency || 82} />
              <span className="stat-unit">%</span>
            </div>
            <span className="stat-card__sub">Past 7 days active</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="stat-card__label">Estimated Stress Risk</span>
            <div style={{ marginTop: '4px' }}>
              <StressIndicator
                score={latestStress?.stressScore}
                level={stressRisk?.level || 'LOW'}
              />
            </div>
            <span className="stat-card__sub">ML Estimation: {stressRisk?.level}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Recommendations & Today's Plan */}
      <div className="grid-2 dashboard-main-grid">
        {/* Left Column: Personalized AI Recommendations */}
        <div className="glass-card ai-recommendation-box glass-card--accent">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="ai-sparkle-icon">
                <Sparkles size={18} />
              </div>
              <h2 className="box-title">Today's Personalized AI Recommendation</h2>
            </div>
            <span className="badge badge--info">Real-time</span>
          </div>

          <div className="recommendations-list">
            {recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item">
                <p>{rec}</p>
              </div>
            ))}
          </div>

          <div className="recommendation-footer">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/assistant')}
            >
              <MessageSquare size={14} />
              Ask AI Assistant for help
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/relaxation')}
            >
              <Wind size={14} />
              Take a 2-min Break
            </button>
          </div>
        </div>

        {/* Right Column: Today's Study Tasks */}
        <div className="glass-card today-tasks-box">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--accent-secondary)" />
              <h2 className="box-title">Today's Active Schedule</h2>
            </div>
            {activePlan ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/planner')}
              >
                View Full Plan
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/planner')}
              >
                Generate Plan
              </button>
            )}
          </div>

          {activePlan && activePlan.tasks && activePlan.tasks.length > 0 ? (
            <div className="tasks-timeline">
              {activePlan.tasks.slice(0, 5).map((task, idx) => (
                <div
                  key={idx}
                  className={`timeline-task-card ${task.completed ? 'completed' : ''} ${task.type === 'break' ? 'break' : ''}`}
                  onClick={() => handleToggleTask(idx)}
                >
                  <div className="task-checkbox">
                    <CheckCircle2
                      size={18}
                      color={task.completed ? 'var(--color-success)' : 'var(--text-muted)'}
                    />
                  </div>
                  <div className="task-info">
                    <div className="task-time">{task.time}</div>
                    <div className="task-name">
                      <strong>{task.subject}:</strong> {task.activity}
                    </div>
                  </div>
                  <span className={`task-badge ${task.type === 'break' ? 'break-badge' : 'study-badge'}`}>
                    {task.type === 'break' ? 'Break' : `${task.duration}m`}
                  </span>
                </div>
              ))}
              {activePlan.tasks.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate('/planner')}
                  >
                    + {activePlan.tasks.length - 5} more sessions scheduled
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-tasks-placeholder">
              <BookOpen size={36} color="var(--text-muted)" />
              <p>No active schedule created for today yet.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/planner')}
              >
                Create with AI Planner
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Exams Section */}
      <div className="dashboard-exams-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Your Target Exams & Syllabi</h2>
            <p className="section-subtitle">
              Track progress, upcoming test dates, and syllabus topics
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Exam
          </button>
        </div>

        <div className="grid-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onUpdate={loadData} />
          ))}
        </div>
      </div>

      {/* Modal for Adding New Exam */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-card glass-card animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Add Target Exam</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExamSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Subject / Course Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operating Systems"
                  value={newExam.subject}
                  onChange={(e) =>
                    setNewExam({ ...newExam, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Exam Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newExam.examDate}
                    onChange={(e) =>
                      setNewExam({ ...newExam, examDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Difficulty</label>
                  <select
                    className="form-select"
                    value={newExam.difficulty}
                    onChange={(e) =>
                      setNewExam({ ...newExam, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Difficult / Heavy</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estimated Current Preparation: {newExam.preparationPct}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newExam.preparationPct}
                  onChange={(e) =>
                    setNewExam({ ...newExam, preparationPct: e.target.value })
                  }
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Topics (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Memory Management, CPU Scheduling, Deadlocks"
                  value={newExam.topicsStr}
                  onChange={(e) =>
                    setNewExam({ ...newExam, topicsStr: e.target.value })
                  }
                />
                <span className="input-hint">
                  Each topic will be trackable with a checkmark.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-3d">
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

