
import { UserRole, AppointmentStatus, Priority, Doctor, Appointment, DepartmentHeatmap } from './types';

export const COLORS = {
  white: '#FFFFFF',
  black: '#0B0B0B',
  blue: '#1F6AE1',
  gray: '#6B7280',
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Mitchell',
    role: UserRole.DOCTOR,
    email: 'sarah.m@medcore.com',
    specialization: 'Cardiology',
    workloadScore: 78,
    department: 'Cardiovascular Services',
    availabilitySlots: ['09:00', '10:00', '11:00', '14:00'],
    // Fix: Added missing createdAt property required by Doctor (User) type
    createdAt: '2023-10-01T08:00:00Z'
  },
  {
    id: 'd2',
    name: 'Dr. James Chen',
    role: UserRole.DOCTOR,
    email: 'james.c@medcore.com',
    specialization: 'Neurology',
    workloadScore: 45,
    department: 'Neuroscience Center',
    availabilitySlots: ['09:30', '11:30', '13:00', '15:00'],
    // Fix: Added missing createdAt property required by Doctor (User) type
    createdAt: '2023-10-02T09:00:00Z'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientName: 'Robert Wilson',
    // Fix: Added missing patientId property required by Appointment type
    patientId: 'p101',
    doctorName: 'Dr. Sarah Mitchell',
    doctorId: 'd1',
    time: '10:30 AM',
    status: AppointmentStatus.SCHEDULED,
    priority: Priority.URGENT,
    riskScore: 12
  },
  {
    id: 'a2',
    patientName: 'Emma Thompson',
    // Fix: Added missing patientId property required by Appointment type
    patientId: 'p102',
    doctorName: 'Dr. James Chen',
    doctorId: 'd2',
    time: '11:15 AM',
    status: AppointmentStatus.IN_PROGRESS,
    priority: Priority.ROUTINE,
    riskScore: 5
  },
  {
    id: 'a3',
    patientName: 'Michael Brown',
    // Fix: Added missing patientId property required by Appointment type
    patientId: 'p103',
    doctorName: 'Dr. Sarah Mitchell',
    doctorId: 'd1',
    time: '01:00 PM',
    status: AppointmentStatus.SCHEDULED,
    priority: Priority.FOLLOW_UP,
    riskScore: 85 // High risk of no-show
  }
];

export const MOCK_HEATMAP: DepartmentHeatmap[] = [
  { name: 'Emergency', congestion: 0.9, currentQueue: 24 },
  { name: 'Cardiology', congestion: 0.6, currentQueue: 12 },
  { name: 'Neurology', congestion: 0.3, currentQueue: 4 },
  { name: 'Pediatrics', congestion: 0.75, currentQueue: 18 },
  { name: 'Radiology', congestion: 0.5, currentQueue: 8 }
];
