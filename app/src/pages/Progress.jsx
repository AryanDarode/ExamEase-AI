import React, { useState } from 'react';
import {
  getExams,
  getStressLogs,
  getStudyStats,
} from '../utils/storage';
import AnimatedCounter from '../components/AnimatedCounter';
import {
  BarChart3,
  TrendingUp,
  Moon,
  Clock,
  CheckCircle2,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './Progress.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Progress() {
  const [exams] = useState(() => getExams());
  const [stressLogs] = useState(() => getStressLogs().slice(-7));
  const [stats] = useState(() => getStudyStats());

  // Prepare chart labels (days of the week)
  const chartLabels = stressLogs.map((l) =>
    new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' })
  );

  const stressChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Stress Score (1-10)',
        data: stressLogs.length > 0 ? stressLogs.map((l) => l.stressScore) : [4, 5, 7, 6, 5, 4, 5],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 5,
      },
    ],
  };

  const sleepChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sleep Hours',
        data: stressLogs.length > 0 ? stressLogs.map((l) => l.sleepHours) : [7, 6.5, 5, 6, 7.5, 8, 7],
        backgroundColor: 'rgba(6, 182, 212, 0.65)',
        borderRadius: 8,
      },
      {
        label: 'Study Hours',
        data: stressLogs.length > 0 ? stressLogs.map((l) => l.studyHours) : [4, 5, 7, 6, 4, 3, 5],
        backgroundColor: 'rgba(20, 184, 166, 0.75)',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  return (
    <div className="progress-page animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="progress-icon-badge">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="page-title">Progress & Consistency Dashboard</h1>
            <p className="page-subtitle">
              Unified view of subject completion percentages, study volume, and biological stress/sleep dynamics.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid-4 stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <Clock size={22} />
          </div>
          <div>
            <span className="stat-card__label">Total Study Time</span>
            <div className="stat-card__value">
              <AnimatedCounter value={stats.totalHours || 28} />
              <span className="stat-unit">hrs</span>
            </div>
            <span className="stat-card__sub">Logged across courses</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="stat-card__label">Tasks / Sessions</span>
            <div className="stat-card__value">
              <AnimatedCounter value={stats.totalTasksDone || 18} />
              <span className="stat-unit">done</span>
            </div>
            <span className="stat-card__sub">High-yield study units</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--orange">
            <Flame size={22} />
          </div>
          <div>
            <span className="stat-card__label">Study Consistency</span>
            <div className="stat-card__value">
              <AnimatedCounter value={stats.consistency || 82} />
              <span className="stat-unit">%</span>
            </div>
            <span className="stat-card__sub">Past 7 days adherence</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card__icon stat-card__icon--purple">
            <Award size={22} />
          </div>
          <div>
            <span className="stat-card__label">Active Subjects</span>
            <div className="stat-card__value">
              <AnimatedCounter value={exams.length || 3} />
              <span className="stat-unit">exams</span>
            </div>
            <span className="stat-card__sub">In active preparation</span>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress Bars */}
      <div className="glass-card subject-progress-card">
        <div className="box-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--accent-primary)" />
            <h2 className="box-title">Subject-Wise Preparation Percentages</h2>
          </div>
          <span className="badge badge--info">Current Term</span>
        </div>

        <div className="subjects-bars-list">
          {exams.map((exam) => (
            <div key={exam.id} className="subject-bar-row">
              <div className="subject-bar-meta">
                <span className="subject-bar-title">{exam.subject}</span>
                <span className="subject-bar-pct">{exam.preparationPct || 0}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill ${exam.preparationPct >= 75 ? 'progress-bar__fill--success' : exam.preparationPct < 50 ? 'progress-bar__fill--warning' : ''}`}
                  style={{ width: `${exam.preparationPct || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 charts-grid">
        <div className="glass-card chart-box">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#f43f5e" />
              <h2 className="box-title">7-Day Stress Level Trend</h2>
            </div>
            <span className="badge badge--danger">Self-reported (1-10)</span>
          </div>
          <div className="chart-wrapper">
            <Line data={stressChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card chart-box">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={18} color="var(--accent-primary)" />
              <h2 className="box-title">Sleep vs. Study Balance (Hours)</h2>
            </div>
            <span className="badge badge--info">Daily Hours</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={sleepChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
