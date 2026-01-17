
import { Appointment, Doctor, User, UserRole } from '../types';
import { MOCK_APPOINTMENTS, MOCK_DOCTORS } from '../constants';

const DB_KEYS = {
  APPOINTMENTS: 'medcore_v3_appointments',
  DOCTORS: 'medcore_v3_doctors',
  USERS: 'medcore_v3_users',
  AUDIT_LOGS: 'medcore_v3_audit_logs'
};

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

class VirtualDB {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      const initialUsers = [
        { id: 'u1', name: 'Admin Root', email: 'admin@medcore.com', role: UserRole.ADMIN, password: 'password123', createdAt: new Date().toISOString() },
        ...MOCK_DOCTORS.map(d => ({ ...d, password: 'password123', createdAt: new Date().toISOString() }))
      ];
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(DB_KEYS.APPOINTMENTS)) {
      localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
    }
    if (!localStorage.getItem(DB_KEYS.DOCTORS)) {
      localStorage.setItem(DB_KEYS.DOCTORS, JSON.stringify(MOCK_DOCTORS));
    }
    if (!localStorage.getItem(DB_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(DB_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
  }

  getCollection<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  saveCollection<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = this.getCollection<AuditLog>(DB_KEYS.AUDIT_LOGS);
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() };
    logs.unshift(newLog);
    this.saveCollection(DB_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  }
}

export const db = new VirtualDB();
export { DB_KEYS };
