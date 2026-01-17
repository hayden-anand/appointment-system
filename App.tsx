import React, { useState, useEffect } from 'react';
import { UserRole, Appointment, Doctor, AuthResponse, AppointmentStatus, Priority } from './types';
import { MOCK_HEATMAP } from './constants';
import { StatsCard, QueueHeatmap } from './components/DashboardWidgets';
import AppointmentAction from './components/RoleAwareUI';
import AuthScreen from './components/AuthScreen';
import BookAppointmentModal from './components/BookAppointmentModal';
import { predictNoShow, optimizeSchedule } from './services/geminiService';
import { MedCoreAPI } from './services/api';
import { AuditLog } from './services/database';
import { 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut,
  Bell,
  Search,
  Zap,
  Loader2,
  Plus
} from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Session check on mount
  useEffect(() => {
    const saved = localStorage.getItem('medcore_session');
    if (saved) {
      setAuth(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  // Sync data when auth or tab changes
  useEffect(() => {
    if (auth) {
      fetchSystemData();
    }
  }, [auth, activeTab]);

  const fetchSystemData = async () => {
    try {
      const [apps, docs, logs] = await Promise.all([
        MedCoreAPI.appointments.getAll(),
        MedCoreAPI.staff.getDoctors(),
        MedCoreAPI.admin.getLogs()
      ]);
      setAppointments(apps);
      setDoctors(docs);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Backend Error:", err);
    }
  };

  const handleAuthSuccess = (response: AuthResponse) => {
    localStorage.setItem('medcore_session', JSON.stringify(response));
    setAuth(response);
  };

  const handleLogout = () => {
    localStorage.removeItem('medcore_session');
    setAuth(null);
    setActiveTab('dashboard');
  };

  const triggerOptimization = async () => {
    setIsProcessing(true);
    const result = await optimizeSchedule(appointments, doctors);
    setAiInsight(result);
    setIsProcessing(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-200" size={40} /></div>;

  if (!auth) return <AuthScreen onSuccess={handleAuthSuccess} />;

  // Filter appointments for patients to only show theirs
  const visibleAppointments = auth.user.role === UserRole.PATIENT 
    ? appointments.filter(a => a.patientId === auth.user.id)
    : appointments;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-zinc-100 flex flex-col">
        <div className="p-8 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">MedCore <span className="text-zinc-400">Nexus</span></h1>
        </div>

        <nav className="flex-1 p-6 space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-4">Main Environment</div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          
          {(auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.DOCTOR) && (
            <button 
              onClick={() => setActiveTab('audits')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${activeTab === 'audits' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              <ShieldCheck size={18} /> Governance Logs
            </button>
          )}

          <button 
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${activeTab === 'staff' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <Users size={18} /> Resource Directory
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-100">
           <div className="flex items-center gap-3 mb-6 p-2 rounded-sm bg-zinc-50">
              <div className="w-10 h-10 rounded-sm bg-zinc-200 overflow-hidden border border-zinc-300">
                 <img src={`https://picsum.photos/seed/${auth.user.id}/40/40`} alt="Profile" />
              </div>
              <div className="overflow-hidden">
                 <p className="text-xs font-bold truncate">{auth.user.name}</p>
                 <p className="text-[9px] text-[#1F6AE1] font-bold uppercase tracking-wider">{auth.user.role}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-500 hover:text-red-600 transition-colors font-semibold"
           >
             <LogOut size={18} /> Terminate Session
           </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto bg-white">
        <header className="h-20 border-b border-zinc-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-sm border border-zinc-100 w-96">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Query system registry..." 
              className="bg-transparent border-none text-xs focus:ring-0 w-full font-medium"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end border-r border-zinc-100 pr-6">
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 Server Operational
               </span>
               <span className="text-[9px] text-zinc-400">Response: 42ms</span>
            </div>
            <button className="relative p-2 hover:bg-zinc-50 rounded-sm transition-colors">
              <Bell size={18} className="text-zinc-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1F6AE1] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {auth.user.role === UserRole.PATIENT ? 'Patient Wellness Portal' : 'System Workspace'}
                  </h2>
                  <p className="text-zinc-500 text-sm">Welcome back, {auth.user.name}. View and manage your clinical records below.</p>
                </div>
                <div className="flex gap-4">
                  {auth.user.role === UserRole.PATIENT ? (
                    <button 
                      onClick={() => setIsBookingModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1F6AE1] text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                    >
                      <Plus size={14} /> Book Appointment
                    </button>
                  ) : (
                    <button 
                      onClick={triggerOptimization}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                      {isProcessing ? 'Processing Model' : 'Load Balancer'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard 
                  label={auth.user.role === UserRole.PATIENT ? "Pending Visits" : "Patient Traffic"} 
                  value={visibleAppointments.length} 
                  trend={auth.user.role === UserRole.PATIENT ? undefined : "12.4%"} 
                />
                <StatsCard label="System Latency" value="1.2ms" trend="Optimal" />
                <StatsCard label="Queue Load" value="High" trend="Critical" />
                <StatsCard label="Data Integrity" value="100%" trend="Verified" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white border border-zinc-100 rounded-sm shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {auth.user.role === UserRole.PATIENT ? 'Your Upcoming Consultations' : 'Live Appointment Transactions'}
                      </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-50">
                          <th className="px-6 py-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            {auth.user.role === UserRole.PATIENT ? 'Patient Profile' : 'Patient Identity'}
                          </th>
                          <th className="px-6 py-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Attending Provider</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Schedule</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {visibleAppointments.length > 0 ? visibleAppointments.map((app) => (
                          <tr key={app.id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold">{app.patientName}</p>
                              <p className="text-[10px] text-zinc-400 font-medium">EMR: #{app.id.split('-')[1] || '9902'}</p>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-zinc-600">{app.doctorName}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                <Clock size={12} className="text-zinc-400" />
                                {app.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <AppointmentAction 
                                 role={auth.user.role} 
                                 appointment={app} 
                                 onAction={(a) => console.log("System Action:", a, app.id)} 
                               />
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                              No records found for current session.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-8">
                  <QueueHeatmap data={MOCK_HEATMAP} />
                  
                  <div className="bg-zinc-900 p-8 text-white rounded-sm shadow-2xl border border-zinc-800">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-[#1F6AE1] rounded-full"></div>
                       {auth.user.role === UserRole.PATIENT ? 'Patient Wellness Insight' : 'Neural Logic Summary'}
                    </h4>
                    {aiInsight ? (
                       <p className="text-xs leading-relaxed text-zinc-400 italic font-medium">"{aiInsight}"</p>
                    ) : (
                       <p className="text-xs leading-relaxed text-zinc-500">
                         {auth.user.role === UserRole.PATIENT 
                           ? 'MedCore Agent is ready to assist with your clinical schedule and health record management.'
                           : 'Operations agent is currently analyzing department flows. Manual override available.'}
                       </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">System Governance Logs</h2>
              <div className="bg-white border border-zinc-100 rounded-sm">
                <div className="divide-y divide-zinc-50">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-6 flex items-start justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-sm bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{log.action}</p>
                          <p className="text-xs text-zinc-500 mt-1">{log.details}</p>
                          <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-[0.1em] font-bold">Authenticated ID: {log.actor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono font-bold text-zinc-400">{new Date(log.timestamp).toLocaleString()}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Resource Directory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-white border border-zinc-100 p-6 rounded-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={`https://picsum.photos/seed/${doc.id}/60/60`} className="w-12 h-12 rounded-sm grayscale" alt="" />
                      <div>
                        <h4 className="text-sm font-bold">{doc.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          <span>Cognitive Workload</span>
                          <span>{doc.workloadScore}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                          <div className={`h-full ${doc.workloadScore > 75 ? 'bg-red-500' : 'bg-[#1F6AE1]'}`} style={{width: `${doc.workloadScore}%`}}></div>
                       </div>
                    </div>
                    <button className="w-full mt-6 py-3 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                       View Calendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal Integration */}
      {auth.user.role === UserRole.PATIENT && (
        <BookAppointmentModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          onSuccess={fetchSystemData} 
          patientId={auth.user.id} 
          patientName={auth.user.name} 
        />
      )}
    </div>
  );
};

export default App;