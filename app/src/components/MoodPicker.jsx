import React from 'react';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Energized', color: '#10b981' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#06b6d4' },
  { id: 'neutral', emoji: '😐', label: 'Okay', color: '#f59e0b' },
  { id: 'stressed', emoji: '😟', label: 'Stressed', color: '#f97316' },
  { id: 'overwhelmed', emoji: '😰', label: 'Overwhelmed', color: '#ef4444' },
];

export default function MoodPicker({ selectedMood, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {MOODS.map(m => {
        const isSelected = selectedMood === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            style={{
              flex: '1 1 80px',
              minWidth: '70px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: '12px',
              border: isSelected ? `2px solid ${m.color}` : '1px solid var(--border-color)',
              background: isSelected ? 'var(--bg-glass-hover)' : 'var(--bg-card)',
              boxShadow: isSelected ? `0 0 16px ${m.color}33` : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '1.8rem', filter: isSelected ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' : 'grayscale(20%)' }}>
              {m.emoji}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isSelected ? m.color : 'var(--text-secondary)',
              }}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
