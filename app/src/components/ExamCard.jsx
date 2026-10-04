import React, { useState } from 'react';
import { getDaysUntil, formatDate, toggleTopic, deleteExam } from '../utils/storage';
import { Calendar, Clock, BookOpen, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ExamCard({ exam, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = getDaysUntil(exam.examDate);

  const getUrgencyBadge = () => {
    if (daysLeft < 0) {
      return { text: 'Exam Concluded', bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
    }
    if (daysLeft === 0) {
      return { text: 'Today! 🎯', bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
    }
    if (daysLeft <= 2) {
      return { text: `${daysLeft}d left (Urgent!)`, bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
    }
    if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
    }
    return { text: `${daysLeft} days left`, bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
  };

  const urgency = getUrgencyBadge();

  const handleTopicToggle = (index) => {
    toggleTopic(exam.id, index);
    if (onUpdate) onUpdate();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Remove ${exam.subject} exam?`)) {
      deleteExam(exam.id);
      if (onUpdate) onUpdate();
    }
  };

  const difficultyColors = {
    easy: { text: 'Easy', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    medium: { text: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    hard: { text: 'Difficult', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  };

  const diffBadge = difficultyColors[exam.difficulty] || difficultyColors.medium;
  const completedTopicsCount = (exam.topics || []).filter(t => t.completed).length;
  const totalTopics = (exam.topics || []).length;

  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {exam.subject}
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: diffBadge.bg,
                color: diffBadge.color,
              }}
            >
              {diffBadge.text}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatDate(exam.examDate)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              background: urgency.bg,
              color: urgency.color,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={12} />
            {urgency.text}
          </span>
          <button
            onClick={handleDelete}
            title="Delete exam"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Preparation Progress */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Preparation Status</span>
          <span style={{ fontWeight: 700, color: exam.preparationPct >= 75 ? 'var(--color-success)' : 'var(--text-accent)' }}>
            {exam.preparationPct || 0}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar__fill ${exam.preparationPct >= 75 ? 'progress-bar__fill--success' : exam.preparationPct < 40 ? 'progress-bar__fill--danger' : ''}`}
            style={{ width: `${exam.preparationPct || 0}%` }}
          />
        </div>
      </div>

      {/* Topics Summary & Expand Toggle */}
      {totalTopics > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} />
              {completedTopicsCount} / {totalTopics} Topics Revised
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {exam.topics.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTopicToggle(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: t.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-input)',
                    border: '1px solid',
                    borderColor: t.completed ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <CheckCircle2
                    size={16}
                    color={t.completed ? 'var(--color-success)' : 'var(--text-muted)'}
                  />
                  <span
                    style={{
                      textDecoration: t.completed ? 'line-through' : 'none',
                      color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      flex: 1,
                    }}
                  >
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
