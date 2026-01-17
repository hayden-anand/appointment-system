
import { db, DB_KEYS, AuditLog } from './database';
import { Appointment, Doctor, User, UserRole, AppointmentStatus, AuthResponse } from '../types';

const simulateLatency = () => new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

export const MedCoreAPI = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await simulateLatency();
      const users = db.getCollection<any>(DB_KEYS.USERS);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) throw new Error("Invalid credentials");
      
      const { password: _, ...userSafe } = user;
      db.addAuditLog({ actor: userSafe.name, action: 'AUTH_LOGIN', details: 'Successful authentication' });
      return { user: userSafe, token: `v_jwt_${Math.random().toString(36).substr(2)}` };
    },
    signup: async (name: string, email: string, password: string, role: UserRole): Promise<AuthResponse> => {
      await simulateLatency();
      const users = db.getCollection<any>(DB_KEYS.USERS);
      if (users.some(u => u.email === email)) throw new Error("User already exists");

      const newUser = { id: `u-${Date.now()}`, name, email, password, role, createdAt: new Date().toISOString() };
      users.push(newUser);
      db.saveCollection(DB_KEYS.USERS, users);
      
      const { password: _, ...userSafe } = newUser;
      db.addAuditLog({ actor: name, action: 'AUTH_SIGNUP', details: `New ${role} account created` });
      return { user: userSafe, token: `v_jwt_${Math.random().toString(36).substr(2)}` };
    }
  },

  appointments: {
    getAll: async (): Promise<Appointment[]> => {
      await simulateLatency();
      return db.getCollection<Appointment>(DB_KEYS.APPOINTMENTS);
    },
    create: async (appointment: Omit<Appointment, 'id'>, actor: string): Promise<Appointment> => {
      await simulateLatency();
      const newApp = { ...appointment, id: `a-${Date.now()}` };
      const all = db.getCollection<Appointment>(DB_KEYS.APPOINTMENTS);
      all.unshift(newApp);
      db.saveCollection(DB_KEYS.APPOINTMENTS, all);
      db.addAuditLog({ actor, action: 'APPOINTMENT_CREATE', details: `Booked for ${newApp.patientName}` });
      return newApp;
    },
    cancel: async (id: string, actor: string): Promise<void> => {
      await simulateLatency();
      const all = db.getCollection<Appointment>(DB_KEYS.APPOINTMENTS);
      const filtered = all.filter(a => a.id !== id);
      db.saveCollection(DB_KEYS.APPOINTMENTS, filtered);
      db.addAuditLog({ actor, action: 'APPOINTMENT_CANCEL', details: `Appointment ${id} removed` });
    }
  },

  staff: {
    getDoctors: async (): Promise<Doctor[]> => {
      await simulateLatency();
      return db.getCollection<Doctor>(DB_KEYS.DOCTORS);
    }
  },

  admin: {
    getLogs: async (): Promise<AuditLog[]> => {
      await simulateLatency();
      return db.getCollection<AuditLog>(DB_KEYS.AUDIT_LOGS);
    }
  }
};
