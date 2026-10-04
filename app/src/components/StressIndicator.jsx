import React from 'react';

export default function StressIndicator({ score, level, showDetails = false }) {
  let computedLevel = level;
  if (!computedLevel && score !== undefined) {
    if (score >= 8) computedLevel = 'ELEVATED';
    else if (score >= 5) computedLevel = 'MODERATE';
    else computedLevel = 'LOW';
  }

  const config = {
    LOW: {
      label: 'Low Stress',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      desc: 'Optimal state for deep learning',
      emoji: '😌',
    },
    MODERATE: {
      label: 'Moderate Stress',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      desc: 'Maintain balance with breaks',
      emoji: '⚡',
    },
    ELEVATED: {
      label: 'Elevated Stress',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      desc: 'Prioritize rest and quick reset',
      emoji: '⚠️',
    },
    UNKNOWN: {
      label: 'No Data Yet',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      border: 'rgba(148, 163, 184, 0.2)',
      desc: 'Log your first daily check-in',
      emoji: '📊',
    }
  };

  const current = config[computedLevel] || config.UNKNOWN;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: showDetails ? 'column' : 'row',
        alignItems: showDetails ? 'flex-start' : 'center',
        gap: '6px',
        padding: showDetails ? '12px 16px' : '6px 12px',
        background: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: '12px',
        color: current.color,
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: `0 0 12px ${current.bg}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{current.emoji}</span>
        <span>{current.label}</span>
        {score !== undefined && (
          <span style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: 500 }}>
            ({score}/10)
          </span>
        )}
      </div>
      {showDetails && (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
          {current.desc}
        </span>
      )}
    </div>
  );
}
