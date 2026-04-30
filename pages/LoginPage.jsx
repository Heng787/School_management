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

  const processLogin = () => {
    if (selectedRole === UserRole.Admin) {
      if (password === adminPassword) {
        setCurrentUser({
          id: 'admin_1',
          name: 'Administrator',
          role: selectedRole,
        });
        onLogin(UserRole.Admin);
      } else {
        setError('Incorrect admin password.');
        setIsLoggingIn(false);
      }
    } else {
      const searchId = identifier.trim().toLowerCase();
      const foundStaff = staff.find(
        (s) =>
          ((s.name || '').toLowerCase() === searchId ||
            (s.contact || '').toLowerCase() === searchId) &&
          s.role === selectedRole,
      );

      if (foundStaff) {
        if (foundStaff.password) {
          if (foundStaff.password === password) {
            setCurrentUser({
              id: foundStaff.id,
              name: foundStaff.name,
              role: selectedRole,
            });
            onLogin(selectedRole);
          } else {
            setError('Incorrect password for this staff account.');
            setIsLoggingIn(false);
          }
        } else {
          setCurrentUser({
            id: foundStaff.id,
            name: foundStaff.name,
            role: selectedRole,
          });
          onLogin(selectedRole);
        }
      } else {
        if (staff.some((s) => s.role === selectedRole)) {
          setError(
            `No account found for "${identifier}" under the role: ${selectedRole}. Please check spelling or contact number.`,
          );
        } else {
          setCurrentUser({
            id: 'demo_1',
            name: `Demo ${selectedRole}`,
            role: selectedRole,
          });
          onLogin(selectedRole);
        }
        setIsLoggingIn(false);
      }
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    setTimeout(() => {
      processLogin();
    }, 1200);
  };

  // --- Render Logic ---
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0c1a2e 100%)',
      }}
    >
      {/* Animated background orbs */}
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -40px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes float-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-35px, 30px) scale(1.08); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(14,165,233,0); }
        }
        .login-card-enter { animation: slide-up-fade 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f1f5f9;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .input-field::placeholder { color: rgba(148,163,184,0.5); }
        .input-field:focus {
          outline: none;
          border-color: rgba(14,165,233,0.6);
          background: rgba(14,165,233,0.06);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .role-select option { background: #1e293b; color: #f1f5f9; }
        .login-btn {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          box-shadow: 0 4px 24px rgba(14,165,233,0.35);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(14,165,233,0.5);
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98) !important;
          box-shadow: 0 2px 12px rgba(14,165,233,0.3);
        }
        .logo-ring { animation: pulse-ring 2.5s ease-in-out infinite; }
        .label-text {
          color: rgba(148,163,184,0.8);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .glass-card {
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
        }
      `}</style>

      {/* Orb 1 – top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '-120px',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float-orb 12s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Orb 2 – bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float-orb2 16s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Orb 3 – center subtle */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '55%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float-orb 20s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Main card */}
      <div
        className="login-card-enter glass-card w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Top gradient accent strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #0ea5e9)',
            backgroundSize: '200% auto',
            animation: 'shimmer 3s linear infinite',
          }}
        />

        {/* Logo & title */}
        <div className="text-center mb-8">
          <div
            className="logo-ring w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              boxShadow: '0 8px 32px rgba(14,165,233,0.4)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}
          >
            School Admin
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'rgba(148,163,184,0.7)' }}
          >
            Management Information System
          </p>
        </div>

        {/* PWA Install Banner */}
        {!isInstalled && deferredPrompt && (
          <div
            className="mb-6 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                💻
              </div>
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: '#34d399' }}
                >
                  Desktop App Available
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: 'rgba(52,211,153,0.7)' }}
                >
                  Install for a standalone experience
                </p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              INSTALL
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="label-text ml-1">
              Sign in as
            </label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(14,165,233,0.7)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setError('');
                }}
                className="input-field role-select w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(148,163,184,0.5)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="divider-line" />
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(100,116,139,0.6)', whiteSpace: 'nowrap' }}
            >
              credentials
            </span>
            <div className="divider-line" />
          </div>

          {/* Identifier (non-admin) */}
          {selectedRole !== UserRole.Admin && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label htmlFor="identifier" className="label-text ml-1">
                Staff Name or Contact
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(14,165,233,0.7)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"
                    />
                  </svg>
                </span>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. Teacher name"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="label-text ml-1">
              {selectedRole === UserRole.Admin
                ? 'Admin Password'
                : 'Staff Password'}
            </label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(14,165,233,0.7)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required={
                  selectedRole === UserRole.Admin ||
                  staff.some(
                    (s) =>
                      ((s.name || '').toLowerCase() ===
                        identifier.trim().toLowerCase() ||
                        (s.contact || '').toLowerCase() ===
                          identifier.trim().toLowerCase()) &&
                      s.password,
                  )
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                aria-describedby={error ? 'login-error' : undefined}
                className="input-field w-full pl-10 pr-12 py-3 rounded-xl text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md"
                style={{
                  color: 'rgba(100,116,139,0.7)',
                  background: 'transparent',
                  boxShadow: 'none',
                }}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 p-3.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: '#f87171' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p
                className="text-xs font-medium leading-snug"
                style={{ color: '#f87171' }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="login-btn w-full py-3.5 rounded-xl font-bold text-sm text-white relative overflow-hidden"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent border-white/30"
                    style={{
                      borderTopColor: 'white',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  <span>Authenticating…</span>
                </div>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p
          className="text-center mt-6 text-[10px] tracking-wide"
          style={{ color: 'rgba(100,116,139,0.5)' }}
        >
          SECURED · SCHOOL MANAGEMENT SYSTEM
        </p>
      </div>

      {/* Bottom version tag */}
      <p className="mt-6 text-[11px]" style={{ color: 'rgba(71,85,105,0.5)' }}>
        v2.0 · &copy; {new Date().getFullYear()} School Admin
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoginPage;
