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
    case 'appointments':
      return <Appointments />;
    case 'patients':
      return <Patients />;
    case 'doctors':
      return <Doctors setActiveTab={setActiveTab} />;
    case 'wards':
      return <WardsAndBeds />;
    case 'prescriptions':
      return <Prescriptions />;
    case 'billing':
      return <Billing />;
    case 'vault':
      return <MedicalFiles />;
    case 'dashboard':
    default:
      return <Dashboard setActiveTab={setActiveTab} />;
  }
};
