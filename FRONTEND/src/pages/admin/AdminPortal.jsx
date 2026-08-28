import React from 'react';
import { Dashboard } from '../Dashboard';
import { Appointments } from '../Appointments';
import { Patients } from '../Patients';
import { Doctors } from '../Doctors';
import { WardsAndBeds } from '../WardsAndBeds';
import { Billing } from '../Billing';
import { MedicalFiles } from '../MedicalFiles';
import { Prescriptions } from '../Prescriptions';

export const AdminPortal = ({ activeTab, setActiveTab }) => {
  switch (activeTab) {
    case 'admin-appointments':
      return <Appointments />;
    case 'admin-patients':
      return <Patients />;
    case 'admin-doctors':
      return <Doctors setActiveTab={setActiveTab} />;
    case 'admin-wards':
      return <WardsAndBeds />;
    case 'admin-prescriptions':
      return <Prescriptions />;
    case 'admin-billing':
      return <Billing />;
    case 'admin-vault':
      return <MedicalFiles />;
    case 'admin-dashboard':
    default:
      return <Dashboard setActiveTab={setActiveTab} />;
  }
};
