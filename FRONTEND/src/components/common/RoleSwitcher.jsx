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
    <div className="demo-role-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: '700' }}>⚡ Quick Demo Switcher:</span>
        <span style={{ opacity: 0.85, fontSize: '0.75rem' }}>
          Current Role: <strong>{user?.role || 'Guest'}</strong> ({user?.name || 'Not logged in'})
        </span>
      </div>
      <div className="demo-role-buttons">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = user?.role === r.name;
          return (
            <button
              key={r.name}
              className={`demo-role-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(r.name)}
              title={`Simulate ${r.name} workflow`}
            >
              <Icon size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
