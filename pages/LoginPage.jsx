import React, { useState, useEffect } from 'react';

import { useData } from '../context/DataContext';

import { UserRole } from '../types';

/**
 * PAGE: LoginPage
 * DESCRIPTION: Handles user authentication for all roles.
 */
const LoginPage = ({ onLogin }) => {
  // --- Global State & Data ---
  const { adminPassword, staff, setCurrentUser } = useData();

  // --- Local UI State ---
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(UserRole.Admin);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Side Effects ---
  // Handle PWA installation prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- Action Handlers ---
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const processLogin = async () => {
    try {
      // Simulate a brief network delay for premium UI feel
      await new Promise(resolve => setTimeout(resolve, 800));

      const inputPassword = password.trim();
      const inputIdentifier = identifier.trim().toLowerCase();
      
      if (selectedRole === UserRole.Admin) {
        // Use adminPassword from DataContext (defaults to admin123)
        if (inputPassword === adminPassword) {
           const adminUser = {
            id: 'admin_1',
            name: 'Administrator',
            role: UserRole.Admin,
          };
          
          // Set a dummy token to satisfy token checks in other parts of the app
          localStorage.setItem('school_admin_token', 'local_admin_token');
          
          setCurrentUser(adminUser);
          onLogin(UserRole.Admin);
          return;
        } else {
          throw new Error('Incorrect admin password');
        }
      }

      // Staff Login - check against local staff array from DataContext
      const matchedStaff = staff.find(s => 
        (s.name?.toLowerCase() === inputIdentifier || s.contact === inputIdentifier)
      );

      if (!matchedStaff) {
        throw new Error('Staff member not found with that name or contact.');
      }

      // Check password (matches plain text in local data)
      if (matchedStaff.password === inputPassword) {
        const staffUser = {
          id: matchedStaff.id,
          name: matchedStaff.name,
          role: matchedStaff.role || selectedRole,
        };
        
        localStorage.setItem('school_admin_token', `local_token_${matchedStaff.id}`);
        
        setCurrentUser(staffUser);
        onLogin(staffUser.role);
      } else {
        throw new Error('Incorrect password for this staff member.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Incorrect credentials or network error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    await processLogin();
  };

  // --- Render Logic ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans text-slate-100 selection:bg-sky-500/30 relative overflow-hidden p-4">
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-lg font-bold shadow-2xl"
      >
        Skip to login form
      </a>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .mesh-bg {
          background: radial-gradient(at 0% 0%, rgba(99,102,241,0.12) 0px, transparent 50%),
                      radial-gradient(at 100% 0%, rgba(14,165,233,0.12) 0px, transparent 50%),
                      radial-gradient(at 100% 100%, rgba(139,92,246,0.12) 0px, transparent 50%),
                      radial-gradient(at 0% 100%, rgba(14,165,233,0.12) 0px, transparent 50%);
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .glass-panel {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .premium-input {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-input:focus {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
          outline: none;
        }
        .btn-glow {
          background: linear-gradient(135deg, #0ea5e9, #4f46e5);
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
          transition: all 0.3s ease;
        }
        .btn-glow:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6);
          transform: translateY(-2px);
        }
        .btn-glow:active:not(:disabled) {
          transform: translateY(1px);
        }
        .hero-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Global Background Elements */}
      <div className="absolute inset-0 mesh-bg -z-10 pointer-events-none"></div>
      <div className="absolute inset-0 hero-pattern opacity-60 mix-blend-overlay -z-10 pointer-events-none"></div>
      
      {/* Dynamic Abstract Shapes */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-sky-500/15 rounded-full blur-[80px] pointer-events-none mix-blend-screen -z-10" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
      <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10" style={{ animation: 'float 12s ease-in-out infinite reverse' }}></div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 relative z-20 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top gradient accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 rounded-t-3xl opacity-80" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30 mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">School Admin</h2>
          <p className="mt-1.5 text-slate-400 text-sm font-medium">Management Information System</p>
        </div>

        {/* Form */}
        <form id="login-form" onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sign in as
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setError('');
                }}
                className="premium-input w-full px-12 py-3.5 rounded-xl text-sm appearance-none cursor-pointer text-center"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role} className="bg-slate-800 text-white">
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {selectedRole !== UserRole.Admin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="identifier" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Staff Name or Contact
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-sky-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  className="premium-input w-full px-12 py-3.5 rounded-xl text-sm text-center"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {selectedRole === UserRole.Admin ? 'Admin Password' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="premium-input w-full px-12 py-3.5 rounded-xl text-sm text-center"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in zoom-in-95 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-glow w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide mt-4"
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Install PWA Prompt */}
        {!isInstalled && deferredPrompt && (
          <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Install App</h3>
                <p className="text-xs text-emerald-500/80">Get the desktop experience</p>
              </div>
            </div>
            <button onClick={handleInstall} className="px-4 py-2 text-xs font-bold text-white bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors">
              Install
            </button>
          </div>
        )}



      </div>
    </div>
  );
};

export default LoginPage;
