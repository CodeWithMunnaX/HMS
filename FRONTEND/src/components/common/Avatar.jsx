import React, { useState } from 'react';

// Generates 2-letter initials from full names, stripping honorifics like Dr., Mr., etc.
export const getInitials = (name = '') => {
  if (!name) return 'CP';
  // Strip common titles
  const cleanName = name.replace(/^(Dr\.|Dr|Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms|Prof\.|Prof)\s+/i, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CP';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Generates consistent, beautiful gradient palette based on name hash
const getGradientFromName = (name = '') => {
  const gradients = [
    'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', // Cyan / Teal
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue / Indigo
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
    'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald / Forest
    'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', // Rose
    'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Amber
    'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Violet
    'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Teal Deep
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Avatar = ({
  src,
  name = 'User',
  size = 40,
  shape = 'rounded', // 'circle' | 'rounded' | 'square'
  style = {},
  className = '',
  fontSize = null,
}) => {
  const [imgError, setImgError] = useState(false);

  const borderRadius =
    shape === 'circle'
      ? '50%'
      : shape === 'rounded'
      ? size >= 60
        ? '14px'
        : '10px'
      : '6px';

  const calculatedFontSize = fontSize || `${Math.max(11, Math.floor(size * 0.38))}px`;
  const initials = getInitials(name);
  const background = getGradientFromName(name);

  // If no source or image loading failed, render 2-letter stylish initials badge
  if (!src || imgError) {
    return (
      <div
        className={`user-avatar-initials ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius,
          background,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: calculatedFontSize,
          letterSpacing: '0.04em',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
          ...style,
        }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`user-avatar-img ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius,
        objectFit: 'cover',
        border: '1.5px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        ...style,
      }}
    />
  );
};
