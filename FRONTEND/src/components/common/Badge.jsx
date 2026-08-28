import React from 'react';

export const Badge = ({ variant = 'slate', children, className = '' }) => {
  const variantMap = {
    teal: 'badge-teal',
    success: 'badge-emerald',
    warning: 'badge-amber',
    danger: 'badge-rose',
    slate: 'badge-slate',
    blue: 'badge-blue',
  };

  const badgeClass = variantMap[variant] || 'badge-slate';

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let variant = 'slate';

  switch (status) {
    case 'Scheduled':
    case 'General Checkup':
      variant = 'blue';
      break;
    case 'Confirmed':
    case 'Active':
    case 'Paid':
    case 'Available':
      variant = 'success';
      break;
    case 'In Consultation':
    case 'Partially Paid':
    case 'Pending':
    case 'Sanitizing / Maintenance':
      variant = 'warning';
      break;
    case 'Cancelled':
    case 'Occupied':
    case 'Unpaid':
    case 'Emergency':
      variant = 'danger';
      break;
    case 'Completed':
    case 'Discharged':
      variant = 'teal';
      break;
    default:
      variant = 'slate';
  }

  return <Badge variant={variant}>{status}</Badge>;
};
