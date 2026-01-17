
import React from 'react';
import { UserRole, Appointment, AppointmentStatus } from '../types';

interface RoleAwareProps {
  role: UserRole;
  appointment: Appointment;
  onAction: (action: string) => void;
}

const AppointmentAction: React.FC<RoleAwareProps> = ({ role, appointment, onAction }) => {
  switch (role) {
    case UserRole.DOCTOR:
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => onAction('START_CONSULTATION')}
            className="px-3 py-1 bg-[#1F6AE1] text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            Start Consult
          </button>
          <button 
            onClick={() => onAction('VIEW_HISTORY')}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            History
          </button>
        </div>
      );
    case UserRole.RECEPTIONIST:
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => onAction('CHECK_IN')}
            className="px-3 py-1 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors"
          >
            Check In
          </button>
          <button 
            onClick={() => onAction('RESCHEDULE')}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            Reschedule
          </button>
        </div>
      );
    case UserRole.ADMIN:
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => onAction('AUDIT_LOGS')}
            className="px-3 py-1 bg-zinc-100 text-zinc-900 text-xs font-semibold rounded hover:bg-zinc-200 transition-colors"
          >
            Audit Logs
          </button>
        </div>
      );
    default:
      return (
        <span className="text-xs text-gray-500 font-medium italic">Viewing as {role}</span>
      );
  }
};

export default AppointmentAction;
