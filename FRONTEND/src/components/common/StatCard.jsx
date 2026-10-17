import React from 'react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'teal',
}) => {
  const colorStyles = {
    teal: { bg: 'var(--primary-50)', text: 'var(--primary-700)' },
    emerald: { bg: 'var(--success-50)', text: 'var(--success-600)' },
    amber: { bg: 'var(--warning-50)', text: 'var(--warning-600)' },
    rose: { bg: 'var(--danger-50)', text: 'var(--danger-600)' },
    blue: { bg: 'var(--info-50)', text: 'var(--info-600)' },
    indigo: { bg: 'var(--violet-50)', text: 'var(--violet-600)' },
  };

  const style = colorStyles[color] || colorStyles.teal;

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};
