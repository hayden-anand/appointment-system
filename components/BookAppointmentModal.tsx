
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { Doctor, AppointmentStatus, Priority, UserRole } from '../types';
import { MedCoreAPI } from '../services/api';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: string;
  patientName: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, onSuccess, patientId, patientName }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const data = await MedCoreAPI.staff.getDoctors();
          setDoctors(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
      // Reset form
      setIsSuccess(false);
      setSelectedSpecialization('');
      setSelectedDoctorId('');
      setSelectedSlot('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));
  const filteredDoctors = selectedSpecialization 
    ? doctors.filter(d => d.specialization === selectedSpecialization)
    : doctors;
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    
    setSubmitting(true);
    try {
      await MedCoreAPI.appointments.create({
        patientName,
        patientId,
        doctorName: selectedDoctor.name,
        doctorId: selectedDoctor.id,
        time: selectedSlot,
        status: AppointmentStatus.SCHEDULED,
        priority: Priority.ROUTINE,
        riskScore: 0
      }, patientName);
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl border border-zinc-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Book New Appointment</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Appointment Confirmed</h4>
                <p className="text-zinc-500 text-sm mt-1">Your record has been successfully established in the system.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Specialization */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Clinical Department</label>
                <select 
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
                  value={selectedSpecialization}
                  onChange={(e) => {
                    setSelectedSpecialization(e.target.value);
                    setSelectedDoctorId('');
                    setSelectedSlot('');
                  }}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Step 2: Doctor */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Attending Physician</label>
                <select 
                  disabled={!selectedSpecialization}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm disabled:opacity-50"
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setSelectedSlot('');
                  }}
                >
                  <option value="">Select Physician</option>
                  {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              {/* Step 3: Slots */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDoctor ? selectedDoctor.availabilitySlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all ${
                        selectedSlot === slot 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-zinc-600 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {slot}
                    </button>
                  )) : (
                    <div className="col-span-3 py-8 border border-dashed border-zinc-200 rounded-sm text-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Select Physician to view slots</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 border border-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={!selectedSlot || submitting}
                  onClick={handleBook}
                  className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
