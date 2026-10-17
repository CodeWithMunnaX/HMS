import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, Stethoscope, UserCheck, HeartPulse } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchDemoRole } = useAuth();
  const toast = useToast();

  const roles = [
    { name: 'Admin', label: 'Admin (Munna)', icon: Shield },
    { name: 'Doctor', label: 'Doctor (Dr. Sarah)', icon: Stethoscope },
    { name: 'Receptionist', label: 'Reception (Emma, RN)', icon: UserCheck },
    { name: 'Patient', label: 'Patient (Alex Johnson)', icon: HeartPulse },
  ];

  const handleRoleSwitch = async (roleName) => {
    try {
      await switchDemoRole(roleName);
      toast.success(`Switched role to ${roleName}`);
    } catch (err) {
      toast.error('Failed to switch demo account');
    }
  };

  return (
    <div className="demo-role-banner" role="region" aria-label="Demo role switcher">
      <div className="demo-role-label">
        <span>Demo mode — switch role:</span>
        <span className="demo-role-current">
          viewing as <strong>{user?.name || 'Guest'}</strong> ({user?.role || 'Guest'})
        </span>
      </div>
      <div className="demo-role-buttons">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = user?.role === r.name;
          return (
            <button
              key={r.name}
              type="button"
              className={`demo-role-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(r.name)}
              title={r.label}
              aria-pressed={isActive}
            >
              <Icon size={12} />
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
