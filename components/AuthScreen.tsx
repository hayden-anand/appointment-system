
import React, { useState } from 'react';
import { UserRole, AuthResponse } from '../types';
import { MedCoreAPI } from '../services/api';
import { Activity, Loader2, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (auth: AuthResponse) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: UserRole.PATIENT
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await MedCoreAPI.auth.login(formData.email, formData.password);
      } else {
        result = await MedCoreAPI.auth.signup(formData.name, formData.email, formData.password, formData.role);
      }
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">MedCore Nexus</h1>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p className="text-zinc-500 text-sm">Enterprise healthcare management for the next generation.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-4 mb-6 rounded-sm border border-red-100 uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
                  placeholder="Dr. John Doe / Jane Patient"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Role</label>
                <select 
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.PATIENT}>Patient</option>
                  <option value={UserRole.DOCTOR}>Physician</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Enterprise Email</label>
            <input 
              required
              type="email" 
              className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
              placeholder="name@organization.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Secure Password</label>
            <input 
              required
              type="password" 
              className="w-full p-4 bg-zinc-50 border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Authenticate' : 'Establish Record'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-zinc-400 font-medium hover:text-black transition-colors"
          >
            {isLogin ? "New to the system? Create an account" : "Already have access? Sign in here"}
          </button>
        </div>
      </div>
      
      <div className="mt-20 flex gap-8">
        <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">HL7 Compliant</div>
        <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">SOC2 Type II</div>
        <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">HIPAA Secure</div>
      </div>
    </div>
  );
};

export default AuthScreen;
