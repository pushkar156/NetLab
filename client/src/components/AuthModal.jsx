import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Flame, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginAsGuest,
    isFirebaseConfigured
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Display name is required.');
        }
        await signupWithEmail(email, password, displayName);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginAsGuest();
      onClose();
    } catch (err) {
      setError(err.message || 'Guest sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel border border-[#BEDEFF]/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#BEDEFF]/15 flex items-center justify-between bg-[#070a12]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30">
              <Lock className="w-5 h-5 text-[#FFA500]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{mode === 'login' ? 'Sign In to NetLab' : 'Create NetLab Account'}</span>
                {isFirebaseConfigured && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30 font-mono flex items-center gap-1 font-semibold">
                    <Flame className="w-3 h-3 text-[#FFA500]" />
                    Firebase
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#BEDEFF]/70">Save network designs & sync simulations to Firestore.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#111728] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="px-6 pt-3.5">
          {isFirebaseConfigured ? (
            <div className="p-2.5 rounded-xl bg-[#FFA500]/10 border border-[#FFA500]/25 text-[#FFF2A7] text-[11px] font-mono flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#FFA500] shrink-0" />
              <span>Connected to Live Firebase Auth & Cloud Firestore.</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#BEDEFF]/10 border border-[#BEDEFF]/25 text-[#BEDEFF] text-[11px] font-mono flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#BEDEFF] shrink-0" />
              <span>Running in Demo Auth Mode (Add Firebase keys to .env anytime).</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex gap-3 border-b border-[#BEDEFF]/15">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2.5 text-xs font-semibold transition-all border-b-2 font-mono ${
              mode === 'login' ? 'border-[#FFA500] text-[#FFF2A7]' : 'border-transparent text-[#BEDEFF]/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`pb-2.5 text-xs font-semibold transition-all border-b-2 font-mono ${
              mode === 'signup' ? 'border-[#FFA500] text-[#FFF2A7]' : 'border-transparent text-[#BEDEFF]/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#930031]/25 border border-[#930031]/50 text-[#FFF2A7] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FFA500]" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#BEDEFF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Pushkar Sharma"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#BEDEFF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@domain.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#BEDEFF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs font-mono transition-all shadow-md shadow-[#FFA500]/25 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register Account'}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-[#BEDEFF]/15 w-full"></div>
            <span className="bg-[#0c101d] px-3 text-[10px] text-[#BEDEFF]/60 font-mono uppercase tracking-wider relative font-semibold">
              Or Connect With
            </span>
          </div>

          {/* Social / Alternative Sign In Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="py-2.5 px-3 rounded-xl bg-[#070a12] hover:bg-[#111728] border border-[#BEDEFF]/20 text-xs font-mono text-[#BEDEFF] hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <span>Google Login</span>
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={submitting}
              className="py-2.5 px-3 rounded-xl bg-[#070a12] hover:bg-[#111728] border border-[#BEDEFF]/20 text-xs font-mono text-[#FFF2A7] hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <span>Demo / Guest</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
