import React, { useState } from 'react';
import {
  getStressLogs,
  saveStressLog,
  getLatestStressLog,
  isHighStressAlert,
} from '../utils/storage';
import MoodPicker from '../components/MoodPicker';
import StressIndicator from '../components/StressIndicator';
import {
  HeartPulse,
  Sparkles,
  Moon,
  Clock,
  Coffee,
  AlertOctagon,
  CheckCircle,
  TrendingUp,
  LifeBuoy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StressTracker.css';

function getOrSeedStressLogs() {
  let logs = getStressLogs();
  // Pre-seed sample past 6 days if empty so student sees rich trends immediately
  if (logs.length === 0) {
    const today = new Date();
    const sample = [
      { d: 6, m: 'calm', s: 4, sl: 7.5, st: 4, b: 3 },
      { d: 5, m: 'neutral', s: 5, sl: 7, st: 5, b: 2 },
      { d: 4, m: 'happy', s: 3, sl: 8, st: 4.5, b: 4 },
      { d: 3, m: 'stressed', s: 7, sl: 6, st: 6, b: 2 },
      { d: 2, m: 'stressed', s: 6, sl: 6.5, st: 5, b: 3 },
      { d: 1, m: 'calm', s: 4, sl: 7, st: 4, b: 3 },
    ];
    sample.forEach((item) => {
      const d = new Date();
      d.setDate(today.getDate() - item.d);
      saveStressLog({
        date: d.toISOString().split('T')[0],
        mood: item.m,
        stressScore: item.s,
        sleepHours: item.sl,
        studyHours: item.st,
        breaksCount: item.b,
      });
    });
    logs = getStressLogs();
  }
  return logs;
}

export default function StressTracker() {
  const navigate = useNavigate();

  const [initialState] = useState(() => {
    const logs = getOrSeedStressLogs();
    const latest = getLatestStressLog();
    const todayStr = new Date().toISOString().split('T')[0];
    const savedToday = Boolean(latest && latest.date === todayStr);
    return {
      mood: savedToday ? latest.mood || 'calm' : 'calm',
      stressScore: savedToday ? latest.stressScore || 5 : 5,
      sleepHours: savedToday ? latest.sleepHours || 7 : 7,
      studyHours: savedToday ? latest.studyHours || 4 : 4,
      breaksCount: savedToday ? latest.breaksCount || 3 : 3,
      recentLogs: logs.slice(-7).reverse(),
      hasSavedToday: savedToday,
      highStressWarning: isHighStressAlert(),
    };
  });

  const [mood, setMood] = useState(initialState.mood);
  const [stressScore, setStressScore] = useState(initialState.stressScore);
  const [sleepHours, setSleepHours] = useState(initialState.sleepHours);
  const [studyHours, setStudyHours] = useState(initialState.studyHours);
  const [breaksCount, setBreaksCount] = useState(initialState.breaksCount);
  const [recentLogs, setRecentLogs] = useState(initialState.recentLogs);
  const [hasSavedToday, setHasSavedToday] = useState(initialState.hasSavedToday);
  const [highStressWarning, setHighStressWarning] = useState(initialState.highStressWarning);

  const loadLogs = () => {
    const logs = getStressLogs();
    setRecentLogs(logs.slice(-7).reverse());
    const latest = getLatestStressLog();
    const todayStr = new Date().toISOString().split('T')[0];
    if (latest && latest.date === todayStr) {
      setHasSavedToday(true);
      setMood(latest.mood || 'calm');
      setStressScore(latest.stressScore || 5);
      setSleepHours(latest.sleepHours || 7);
      setStudyHours(latest.studyHours || 4);
      setBreaksCount(latest.breaksCount || 3);
    }
    setHighStressWarning(isHighStressAlert());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveStressLog({
      mood,
      stressScore: Number(stressScore),
      sleepHours: Number(sleepHours),
      studyHours: Number(studyHours),
      breaksCount: Number(breaksCount),
    });
    setHasSavedToday(true);
    loadLogs();
  };

  const getStressRatingDesc = (val) => {
    if (val <= 3) return { text: 'Relaxed & Grounded', color: '#10b981' };
    if (val <= 6) return { text: 'Moderate Academic Pressure', color: '#f59e0b' };
    if (val <= 8) return { text: 'Elevated Exam Stress', color: '#f97316' };
    return { text: 'High Strain / Need Support', color: '#ef4444' };
  };

  const ratingDesc = getStressRatingDesc(stressScore);

  return (
    <div className="stress-page animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="stress-icon-badge">
            <HeartPulse size={28} />
          </div>
          <div>
            <h1 className="page-title">Stress & Wellbeing Tracker</h1>
            <p className="page-subtitle">
              Daily emotional check-ins to prevent academic burnout and monitor your physiological balance.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Alert if high stress >= 8 for consecutive days */}
      {highStressWarning && (
        <div className="safety-alert-banner glass-card animate-fade-in">
          <div className="safety-icon-wrapper">
            <AlertOctagon size={28} />
          </div>
          <div className="safety-content">
            <h3>You are not alone — We noticed elevated stress recently</h3>
            <p>
              Your logs show consecutive days with elevated stress. Remember that exams do not define your worth. Please prioritize sleep, reach out to your college counsellor, or use our relaxation module.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate('/support')}
              >
                <LifeBuoy size={14} /> View Counsellor & Support Contacts
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => navigate('/relaxation')}
              >
                Start 5-min Guided Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 stress-grid">
        {/* Check-in Form */}
        <div className="glass-card checkin-form-card">
          <div className="box-header">
            <h2 className="box-title">Today's Self Check-in</h2>
            {hasSavedToday && (
              <span className="badge badge--success">
                <CheckCircle size={12} /> Logged for Today
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="checkin-form">
            {/* Mood selector */}
            <div className="form-group">
              <label className="form-label">How are you feeling emotionally right now?</label>
              <MoodPicker selectedMood={mood} onChange={setMood} />
            </div>

            {/* Stress level slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Exam Stress Level (1 — 10)</label>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: ratingDesc.color,
                  }}
                >
                  {stressScore} / 10 • {ratingDesc.text}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressScore}
                onChange={(e) => setStressScore(e.target.value)}
                className="stress-slider"
                style={{
                  accentColor: ratingDesc.color,
                }}
              />
              <div className="slider-labels">
                <span>1 (Completely Relaxed)</span>
                <span>5 (Manageable)</span>
                <span>10 (Overwhelmed)</span>
              </div>
            </div>

            {/* Sleep, study, and breaks inputs */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">
                  <Moon size={14} /> Sleep (hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="16"
                  className="form-input"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Study (hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="16"
                  className="form-input"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Coffee size={14} /> Breaks Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  className="form-input"
                  value={breaksCount}
                  onChange={(e) => setBreaksCount(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              {hasSavedToday ? 'Update Today\'s Entry' : 'Save Check-in Log'}
            </button>
          </form>
        </div>

        {/* Recent History & Trend Summary */}
        <div className="glass-card stress-history-card">
          <div className="box-header">
            <h2 className="box-title">
              <TrendingUp size={18} color="var(--accent-secondary)" />
              Recent 7-Day History
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/progress')}
            >
              Full Analytics
            </button>
          </div>

          <div className="history-logs-list">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="history-log-row">
                <div className="history-date-col">
                  <strong>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                </div>

                <div className="history-details-col">
                  <StressIndicator score={log.stressScore} />
                  <div className="history-sub-stats">
                    <span>😴 {log.sleepHours}h sleep</span>
                    <span>📚 {log.studyHours}h study</span>
                    <span>☕ {log.breaksCount} breaks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="stress-safety-disclaimer">
            <Sparkles size={14} color="var(--text-accent)" />
            <span>
              <strong>Note:</strong> ExamEase AI is a study & wellbeing tool, not a medical diagnostic service. If you experience severe distress, please consult your university health center.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
