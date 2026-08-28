import React from 'react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'teal',
}) => {
  const colorStyles = {
    teal: { bg: '#ecfeff', text: '#0e7490' },
    emerald: { bg: '#ecfdf5', text: '#059669' },
    amber: { bg: '#fffbeb', text: '#d97706' },
    rose: { bg: '#fef2f2', text: '#dc2626' },
    blue: { bg: '#eff6ff', text: '#2563eb' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
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
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};
