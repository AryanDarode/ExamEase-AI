import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getUser,
  saveUser,
  getExams,
  saveStudyPlan,
  getActivePlan,
  togglePlanTask,
  getDefaultSubjectsForStudent,
} from '../utils/storage';
import { generateStudyPlan } from '../utils/aiEngine';
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  Coffee,
  BookOpen,
  ArrowRight,
  Download,
  FastForward,
  Check,
  Zap,
  Flame,
  Layers,
} from 'lucide-react';
import './StudyPlanner.css';

// Pre-defined popular institutions & school boards
const POPULAR_COLLEGES = [
  'IIT Bombay',
  'IIT Delhi',
  'Stanford University',
  'MIT',
  'Harvard University',
  'Oxford University',
  'Delhi University',
  'BITS Pilani',
  'National University of Singapore',
];

const POPULAR_SCHOOL_BOARDS = [
  'CBSE Board',
  'ICSE / ISC Board',
  'State Board',
  'IB World School',
  'Cambridge IGCSE',
];

// 3D Tilt Card Component for Square Timetable Slot
function TiltSquareCard({ task, index, isActive, onToggle, autoTickSeconds }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // max 12 deg
    const rotateY = ((x - centerX) / centerX) * 12;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.03, 1.03, 1.03)`,
    });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const isBreak = task.type === 'break';

  return (
    <div
      ref={cardRef}
      className={`timetable-square-card ${isBreak ? 'card--break' : 'card--study'} ${
        task.completed ? 'card--completed' : ''
      } ${isActive ? 'card--active-timer' : ''}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onToggle(index)}
      role="button"
      tabIndex={0}
      title="Click to toggle completed"
    >
      {/* Dynamic Specular 3D Glare */}
      <div
        className="card-glare"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)`,
          opacity: glarePos.opacity,
        }}
      />

      {/* Top Header inside square */}
      <div className="square-card__header">
        <div className="square-card__time">
          <Clock size={13} className="square-card__time-icon" />
          <span>{task.time}</span>
        </div>

        <div className="square-card__badge-wrap">
          {isBreak ? (
            <span className="square-badge square-badge--break">
              <Coffee size={11} /> 15m Rest
            </span>
          ) : (
            <span className={`square-badge square-badge--${task.difficulty || 'medium'}`}>
              <Flame size={11} />
              {(task.difficulty || 'medium').toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Middle Body */}
      <div className="square-card__body">
        <div className="square-card__icon-wrap">
          {isBreak ? (
            <Coffee size={24} className="icon--break" />
          ) : (
            <BookOpen size={24} className="icon--study" />
          )}
        </div>
        <h3 className="square-card__title">
          {isBreak ? 'Scheduled Break' : task.subject}
        </h3>
        <p className="square-card__activity">{task.activity}</p>
      </div>

      {/* Active Session Countdown Badge (if this task is currently ticking) */}
      {isActive && !task.completed && (
        <div className="square-card__auto-timer-pill">
          <span className="pulse-dot" />
          <span>
            Auto-ticks in:{' '}
            <strong>
              {Math.floor(autoTickSeconds / 60)}:
              {String(autoTickSeconds % 60).padStart(2, '0')}
            </strong>
          </span>
        </div>
      )}

      {/* Bottom Footer & Checkbox */}
      <div className="square-card__footer">
        <div className="square-card__status-text">
          {task.completed ? (
            <span className="status-label status-label--done">
              <Check size={12} /> Completed
            </span>
          ) : isActive ? (
            <span className="status-label status-label--active">
              <Zap size={12} /> In Progress
            </span>
          ) : (
            <span className="status-label status-label--pending">Pending</span>
          )}
        </div>

        <button
          type="button"
          className={`square-card__check-btn ${task.completed ? 'check-btn--checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(index);
          }}
          aria-label={task.completed ? 'Mark pending' : 'Mark done'}
        >
          <CheckCircle2 size={22} />
        </button>
      </div>
    </div>
  );
}

export default function StudyPlanner() {
  const [activePlanId, setActivePlanId] = useState(() => getActivePlan()?.id || null);
  const [generatedPlan, setGeneratedPlan] = useState(() => getActivePlan()?.tasks || null);
  const [currentStage, setCurrentStage] = useState(() => {
    const current = getActivePlan();
    return current && current.tasks && current.tasks.length > 0 ? 'timetable' : 'setup';
  });
  const [availableHours, setAvailableHours] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);

  // College details
  const [user, setUser] = useState(() => getUser() || { fullName: 'Student', college: 'IIT Bombay' });
  const [collegeInput, _setCollegeInput] = useState(() => (getUser()?.college || 'IIT Bombay'));

  // Subjects list
  const [subjectsList, setSubjectsList] = useState(() => {
    const exams = getExams();
    if (exams.length > 0) {
      return exams.map((e) => ({
        name: e.subject,
        difficulty: e.difficulty || 'medium',
        preparationPct: e.preparationPct || 50,
        selected: true,
      }));
    }
    const defaultSubs = getDefaultSubjectsForStudent(getUser());
    return defaultSubs.map((s) => ({
      name: s.subject,
      difficulty: s.difficulty || 'medium',
      preparationPct: s.preparationPct || 50,
      selected: true,
    }));
  });

  // Filter state for timetable view
  const [filterType, setFilterType] = useState('all'); // 'all' | 'study' | 'break'

  // 5-minute Auto-Tick Engine
  // 5 minutes = 300 seconds
  const AUTO_TICK_DURATION = 300;
  const autoTickEnabled = true;
  const [autoTickSeconds, setAutoTickSeconds] = useState(AUTO_TICK_DURATION);
  const [autoTickNotification, setAutoTickNotification] = useState(null);
  const timerIntervalRef = useRef(null);

  // Find index of first uncompleted task
  const activeTaskIndex = generatedPlan
    ? generatedPlan.findIndex((t) => !t.completed)
    : -1;

  const handleToggleTask = useCallback((taskIndex) => {
    if (activePlanId) {
      togglePlanTask(activePlanId, taskIndex);
      const current = getActivePlan();
      if (current) setGeneratedPlan(current.tasks);
    } else if (generatedPlan) {
      const updated = [...generatedPlan];
      updated[taskIndex].completed = !updated[taskIndex].completed;
      setGeneratedPlan(updated);
    }
    setAutoTickSeconds(AUTO_TICK_DURATION);
  }, [activePlanId, generatedPlan]);

  const handleAutoTickTask = useCallback((idx) => {
    if (!generatedPlan || idx < 0 || idx >= generatedPlan.length) return;
    const task = generatedPlan[idx];

    // Trigger toggle
    handleToggleTask(idx);

    // Show celebratory banner
    const name = task.type === 'break' ? 'Scheduled Break' : task.subject;
    setAutoTickNotification(`⚡ Auto-Completed: "${name}" ticked after 5 minutes!`);
    setTimeout(() => setAutoTickNotification(null), 5000);
    setAutoTickSeconds(AUTO_TICK_DURATION);
  }, [generatedPlan, handleToggleTask]);

  // 5-Minute Auto-Tick Countdown Engine
  useEffect(() => {
    if (
      !autoTickEnabled ||
      currentStage !== 'timetable' ||
      !generatedPlan ||
      activeTaskIndex === -1
    ) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    // Start 1-second countdown
    timerIntervalRef.current = setInterval(() => {
      setAutoTickSeconds((prev) => {
        if (prev <= 1) {
          // Time's up! Auto tick the task
          handleAutoTickTask(activeTaskIndex);
          return AUTO_TICK_DURATION; // reset for next task
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [autoTickEnabled, currentStage, generatedPlan, activeTaskIndex, handleAutoTickTask]);

  // Instant simulate fast-forward 5 minutes (for testing / demo)
  const handleFastForwardDemo = () => {
    if (activeTaskIndex !== -1) {
      handleAutoTickTask(activeTaskIndex);
    }
  };

  const handleSaveCollege = (newCollege) => {
    const val = newCollege || collegeInput;
    const updated = { ...user, college: val };
    setUser(updated);
    saveUser(updated);
  };

  const handleToggleSubject = (index) => {
    const updated = [...subjectsList];
    updated[index].selected = !updated[index].selected;
    setSubjectsList(updated);
  };

  const handleDifficultyChange = (index, val) => {
    const updated = [...subjectsList];
    updated[index].difficulty = val;
    setSubjectsList(updated);
  };

  const handleRemoveSubject = (index) => {
    if (subjectsList.length <= 1) {
      alert('You must have at least one subject in your list.');
      return;
    }
    const updated = subjectsList.filter((_, i) => i !== index);
    setSubjectsList(updated);
  };

  const handleAddCustomSubject = () => {
    const name = prompt('Enter new subject name (e.g. Artificial Intelligence, Digital Circuits):');
    if (name && name.trim()) {
      setSubjectsList([
        ...subjectsList,
        {
          name: name.trim(),
          difficulty: 'medium',
          preparationPct: 50,
          selected: true,
        },
      ]);
    }
  };

  const handleGenerate = (e) => {
    e?.preventDefault();
    const activeSubs = subjectsList.filter((s) => s.selected);
    if (activeSubs.length === 0) {
      alert('Please select at least one subject to study today.');
      return;
    }

    const hoursNum = parseFloat(availableHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Please enter a valid number of study hours (e.g. 2, 4, 6.5).');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const planTasks = generateStudyPlan(activeSubs, hoursNum);
      setGeneratedPlan(planTasks);
      const saved = saveStudyPlan({ tasks: planTasks });
      setActivePlanId(saved.id);
      setIsGenerating(false);
      setCurrentStage('timetable'); // Smooth transition to the dedicated timetable stage!
      setAutoTickSeconds(AUTO_TICK_DURATION);
    }, 700);
  };

  // High-Resolution 1080x1080 Square Timetable Download Engine
  const downloadSquareTimetable = () => {
    if (!generatedPlan || generatedPlan.length === 0) return;

    const canvas = document.createElement('canvas');
    const size = 1200; // 1200x1200 high-dpi square
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Background gradient (Obsidian modern dark)
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0, '#0a0e1c');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#060a14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Ambient glow circles in canvas
    ctx.save();
    const glow1 = ctx.createRadialGradient(200, 200, 50, 200, 200, 400);
    glow1.addColorStop(0, 'rgba(20, 184, 166, 0.25)');
    glow1.addColorStop(1, 'rgba(20, 184, 166, 0)');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(200, 200, 400, 0, Math.PI * 2);
    ctx.fill();

    const glow2 = ctx.createRadialGradient(1000, 1000, 50, 1000, 1000, 450);
    glow2.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
    glow2.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(1000, 1000, 450, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, size - 60, size - 60);

    // Top Header Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('EXAMEASE AI • ADAPTIVE STUDY TIMETABLE', 60, 95);

    // College/School & Date Subtitle
    ctx.fillStyle = '#14B8A6';
    ctx.font = '600 22px Inter, sans-serif';
    const isSchoolUser = user?.student_type === 'school';
    const institutionLabel = isSchoolUser
      ? `🏫 ${user?.school || user?.college || 'School'} (Class ${user?.grade || '10'} ${user?.board || 'CBSE'})`
      : `🏛️ ${user?.college || 'Institution of Higher Education'}`;
    const studentName = user?.fullName || 'Student';
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    ctx.fillText(`${institutionLabel}  •  👤 ${studentName}  •  📅 ${today}`, 60, 135);

    // Stats bar inside download
    const compCount = generatedPlan.filter((t) => t.completed).length;
    const totCount = generatedPlan.length;
    const pct = Math.round((compCount / totCount) * 100);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.roundRect(60, 160, size - 120, 50, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`Daily Target: ${availableHours} Hours`, 85, 192);
    ctx.fillText(`Completion: ${compCount}/${totCount} Sessions (${pct}%)`, 400, 192);
    ctx.fillText(`Status: ${pct === 100 ? '🎉 All Goals Achieved!' : 'In Progress'}`, 800, 192);

    // Render Square Grid of Tasks (e.g. 3 or 4 columns)
    const startY = 240;
    const availableW = size - 120;
    const availableH = size - startY - 80;

    // Up to 12 sessions displayed in a crisp square matrix
    const displayTasks = generatedPlan.slice(0, 12);
    const cols = displayTasks.length <= 4 ? 2 : displayTasks.length <= 9 ? 3 : 4;
    const rows = Math.ceil(displayTasks.length / cols);
    const gap = 16;
    const cellW = (availableW - (cols - 1) * gap) / cols;
    const cellH = Math.min((availableH - (rows - 1) * gap) / rows, cellW); // square proportions

    displayTasks.forEach((task, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = 60 + col * (cellW + gap);
      const y = startY + row * (cellH + gap);

      // Card background
      const isBreak = task.type === 'break';
      ctx.fillStyle = task.completed
        ? 'rgba(16, 185, 129, 0.18)'
        : isBreak
        ? 'rgba(6, 182, 212, 0.12)'
        : 'rgba(30, 41, 59, 0.7)';

      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 14);
      ctx.fill();

      // Card border
      ctx.strokeStyle = task.completed
        ? 'rgba(16, 185, 129, 0.6)'
        : isBreak
        ? 'rgba(6, 182, 212, 0.4)'
        : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Time tag
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText(`🕒 ${task.time}`, x + 16, y + 32);

      // Status mark
      if (task.completed) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText('✓ DONE', x + cellW - 80, y + 32);
      }

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, sans-serif';
      const title = isBreak ? '☕ 15m Scheduled Break' : `📚 ${task.subject}`;
      ctx.fillText(title.length > 22 ? title.slice(0, 20) + '...' : title, x + 16, y + 70);

      // Activity
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px Inter, sans-serif';
      const act = task.activity || (isBreak ? 'Relax & Hydrate' : 'Concept review');
      ctx.fillText(act.length > 26 ? act.slice(0, 24) + '...' : act, x + 16, y + 100);

      // Difficulty or break tag
      ctx.fillStyle = isBreak ? '#22d3ee' : '#f59e0b';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        isBreak ? 'REST INTERVAL' : `INTENSITY: ${(task.difficulty || 'MEDIUM').toUpperCase()}`,
        x + 16,
        y + cellH - 18
      );
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Generated with ExamEase AI • High-Yield Timetable with Smart 5-Minute Auto-Tick', 60, size - 35);

    // Convert to PNG and download
    const link = document.createElement('a');
    link.download = `ExamEase_Timetable_${user?.college ? user.college.replace(/\s+/g, '_') : 'Schedule'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const completedCount = generatedPlan ? generatedPlan.filter((t) => t.completed).length : 0;
  const totalCount = generatedPlan ? generatedPlan.length : 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks for square grid
  const displayedTasks = generatedPlan
    ? generatedPlan.filter((t) => {
        if (filterType === 'study') return t.type !== 'break';
        if (filterType === 'break') return t.type === 'break';
        return true;
      })
    : [];

  return (
    <div className="planner-page animate-fade-in">
      {/* Top Header & College Customizer */}
      <div className="planner-header-panel">
        <div className="planner-header-left">
          <div className="planner-icon-badge">
            <CalendarClock size={28} />
          </div>
          <div>
            <div className="planner-title-row">
              <h1 className="page-title">AI Adaptive Study Planner</h1>
            </div>
            <p className="page-subtitle">
              Generates high-yield study sessions with mandatory stress-reduction breaks and automatic task tracking.
            </p>
          </div>
        </div>


      </div>

      {/* Stage Navigation Stepper (Session 1 vs Session 2) */}
      <div className="planner-stepper-bar">
        <button
          type="button"
          className={`stage-tab ${currentStage === 'setup' ? 'stage-tab--active' : ''}`}
          onClick={() => setCurrentStage('setup')}
        >
          <span className="stage-num">1</span>
          <span className="stage-title">Configure Subjects & Hours</span>
        </button>

        <div className="stage-arrow">
          <ArrowRight size={18} />
        </div>

        <button
          type="button"
          className={`stage-tab ${currentStage === 'timetable' ? 'stage-tab--active' : ''}`}
          onClick={() => {
            if (!generatedPlan) {
              handleGenerate();
            } else {
              setCurrentStage('timetable');
            }
          }}
        >
          <span className="stage-num">2</span>
          <span className="stage-title">AI Square Timetable & Live Hub</span>
          {generatedPlan && <span className="stage-pill">{progressPct}% Done</span>}
        </button>
      </div>

      {/* AUTO-TICK NOTIFICATION BANNER */}
      {autoTickNotification && (
        <div className="auto-tick-banner animate-fade-in-up">
          <Zap size={20} className="banner-icon" />
          <span>{autoTickNotification}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAGE 1: CONFIGURE SUBJECTS & TIMING                     */}
      {/* ======================================================== */}
      {currentStage === 'setup' && (
        <div className="planner-stage-setup animate-fade-in">
          <div className="glass-card setup-main-card">
            <div className="setup-card-header">
              <div>
                <h2 className="setup-card-title">
                  <Sparkles size={20} color="var(--accent-primary)" />
                  Customize Your Study Parameters
                </h2>
                <p className="setup-card-desc">
                  Tell the AI your available hours and subjects. The AI will distribute time based on difficulty weights and inject mandatory 15-minute relaxation breaks.
                </p>
              </div>


            </div>

            {/* Step 1: Available Hours */}
            <div className="hours-selector-box">
              <div className="hours-header">
                <label className="form-label" style={{ margin: 0 }}>
                  <Clock size={16} /> Available Study Hours Today:
                </label>
                <div className="hours-editable-wrapper">
                  <input
                    type="number"
                    min="0.5"
                    max="18"
                    step="0.5"
                    className="hours-number-input"
                    value={availableHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setAvailableHours('');
                      } else {
                        const parsed = parseFloat(val);
                        setAvailableHours(isNaN(parsed) ? '' : parsed);
                      }
                    }}
                    placeholder="e.g. 4"
                  />
                  <span className="hours-input-unit">Hours</span>
                </div>
              </div>

              <div className="hours-pills">
                {[2, 3, 4, 5, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`hour-pill ${Number(availableHours) === h ? 'hour-pill--active' : ''}`}
                    onClick={() => setAvailableHours(h)}
                  >
                    {h} hrs
                  </button>
                ))}
              </div>
              <span className="input-hint">
                💡 Type any custom number of study hours above or click a quick preset. Generates high-yield Pomodoro blocks with automated 15-minute stress-reduction intervals.
              </span>
            </div>

            {/* Step 2: Target Subjects */}
            <div className="subjects-selection-section">
              <div className="subjects-header-row">
                <div>
                  <label className="form-label" style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                    Select Subjects & Difficulty Weights
                  </label>
                  <p className="subjects-subtext">
                    Harder topics are assigned higher priority and longer dedicated revision blocks.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm add-subject-btn"
                  onClick={handleAddCustomSubject}
                >
                  <Plus size={15} /> Add Custom Subject
                </button>
              </div>

              <div className="subjects-table">
                {subjectsList.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`subject-row ${sub.selected ? 'subject-row--selected' : ''}`}
                  >
                    <label className="subject-check-label">
                      <input
                        type="checkbox"
                        checked={sub.selected}
                        onChange={() => handleToggleSubject(idx)}
                        className="custom-checkbox"
                      />
                      <span className="subject-name">{sub.name}</span>
                    </label>

                    <div className="subject-controls">
                      <select
                        className="form-select difficulty-select"
                        value={sub.difficulty}
                        onChange={(e) => handleDifficultyChange(idx, e.target.value)}
                        disabled={!sub.selected}
                      >
                        <option value="easy">🟢 Easy (1x Weight)</option>
                        <option value="medium">🟡 Medium (2x Weight)</option>
                        <option value="hard">🔴 Difficult (3x Weight)</option>
                      </select>

                      <button
                        type="button"
                        className="subject-delete-btn"
                        onClick={() => handleRemoveSubject(idx)}
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Suggestion Bar */}
            <div className="college-preset-bar">
              <span className="preset-label">
                {user?.student_type === 'school' ? 'Quick Select Board / Category:' : 'Quick Select Institution:'}
              </span>
              <div className="preset-tags">
                {(user?.student_type === 'school' ? POPULAR_SCHOOL_BOARDS : POPULAR_COLLEGES.slice(0, 5)).map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`preset-chip ${(user?.college === col || user?.board === col) ? 'preset-chip--active' : ''}`}
                    onClick={() => handleSaveCollege(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="setup-submit-box">
              <button
                type="button"
                className="btn btn-primary btn-xl w-full generate-glow-btn"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={20} className="spin" />
                    Synthesizing Adaptive Schedule...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate AI Square Timetable
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAGE 2: DEDICATED SQUARE TIMETABLE & INTERACTIVE HUB   */}
      {/* ======================================================== */}
      {currentStage === 'timetable' && (
        <div className="planner-stage-timetable animate-fade-in">


          {/* Progress Overview & Live Timer Summary */}
          <div className="timetable-stats-card glass-card">
            <div className="stats-row">
              <div className="stats-metric">
                <span className="stats-label">Completed Sessions</span>
                <span className="stats-val">
                  {completedCount} <span className="stats-total">/ {totalCount}</span>
                </span>
              </div>

              <div className="stats-metric">
                <span className="stats-label">Daily Goal Progress</span>
                <span className="stats-val stats-val--accent">{progressPct}%</span>
              </div>

              <div className="stats-metric">
                <span className="stats-label">Target Study Time</span>
                <span className="stats-val">{availableHours} Hours</span>
              </div>

              <div className="stats-actions" style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={downloadSquareTimetable}
                  title="Download square schedule image"
                >
                  <Download size={15} />
                  Download PNG
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleFastForwardDemo}
                  disabled={activeTaskIndex === -1}
                  title="Fast-forward current active task (demo mode)"
                >
                  <FastForward size={15} />
                  Fast Forward Task
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentStage('setup')}
                >
                  <RefreshCw size={15} />
                  Reconfigure
                </button>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="timetable-progress-bar-wrap">
              <div className="timetable-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="timetable-filter-bar">
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${filterType === 'all' ? 'filter-pill--active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                <Layers size={14} /> All Sessions ({totalCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterType === 'study' ? 'filter-pill--active' : ''}`}
                onClick={() => setFilterType('study')}
              >
                <BookOpen size={14} /> Study Only ({generatedPlan?.filter((t) => t.type !== 'break').length || 0})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterType === 'break' ? 'filter-pill--active' : ''}`}
                onClick={() => setFilterType('break')}
              >
                <Coffee size={14} /> Relaxation Breaks ({generatedPlan?.filter((t) => t.type === 'break').length || 0})
              </button>
            </div>
          </div>

          {/* SQUARE SHAPED TIMETABLE GRID WITH 3D TILT */}
          <div className="timetable-square-grid">
            {displayedTasks.map((task, idx) => {
              // Find original index in generatedPlan
              const origIdx = generatedPlan.findIndex((t) => t.id === task.id || t === task);
              const isActive = origIdx === activeTaskIndex;

              return (
                <TiltSquareCard
                  key={task.id || idx}
                  task={task}
                  index={origIdx !== -1 ? origIdx : idx}
                  isActive={isActive}
                  onToggle={handleToggleTask}
                  autoTickSeconds={autoTickSeconds}
                />
              );
            })}
          </div>

          {/* Bottom Download Reminder Callout */}

        </div>
      )}
    </div>
  );
}

