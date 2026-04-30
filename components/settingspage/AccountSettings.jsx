import React, { useState, useEffect, useRef } from "react";
import { uploadSignature } from "../../services/signatureService";
import { configService } from "../../services/configService";

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

const SettingCard = ({ title, description, children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md ${className}`}>
    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">{description}</p>}
    {children}
  </div>
);

const PasswordInput = ({ label, value, onChange, placeholder, disabled }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-5 py-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-medium"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
        >
          {show ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M1 1l22 22" /></svg>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── SETTINGS SECTIONS ────────────────────────────────────────────────────────

const PasswordSection = ({
  handleSubmitPassword,
  currentPasswordInput,
  setCurrentPasswordInput,
  newPasswordInput,
  setNewPasswordInput,
  confirmPasswordInput,
  setConfirmPasswordInput,
  passwordError,
  passwordSuccess,
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsChanging(true);
    try { await handleSubmitPassword(e); } 
    finally { setIsChanging(false); }
  };

  return (
    <SettingCard title="Security & Authentication" description="Update your administrator password and manage security preferences.">
      <div className="flex flex-col lg:flex-row gap-12">
        <form onSubmit={onSubmit} className="flex-1 space-y-6 max-w-md">
          <PasswordInput
            label="Current Admin Password"
            value={currentPasswordInput}
            onChange={setCurrentPasswordInput}
            placeholder="Enter current password"
            disabled={isChanging}
          />
          <PasswordInput
            label="New Password"
            value={newPasswordInput}
            onChange={setNewPasswordInput}
            placeholder="Enter strong new password"
            disabled={isChanging}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPasswordInput}
            onChange={setConfirmPasswordInput}
            placeholder="Repeat new password"
            disabled={isChanging}
          />

          {passwordError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-2xl flex items-start gap-3">
              <span className="text-rose-500 mt-0.5">⚠️</span>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center gap-3">
              <span className="text-emerald-500 text-lg">✓</span>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{passwordSuccess}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChanging}
            className="w-full py-4 bg-slate-900 dark:bg-primary-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary-500/20"
          >
            {isChanging ? "Updating Security..." : "Update Password"}
          </button>
        </form>

        <div className="flex-1">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">🛡️</span>
              Requirements
            </h4>
            <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> At least 8 characters long</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Uppercase & lowercase letters</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> At least one numeric digit</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Special character (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      </div>
    </SettingCard>
  );
};

const PrincipalConfigSection = () => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [signatureUrl, setSignatureUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    configService.getPrincipalName().then(n => n && setName(n));
    configService.getPrincipalSignatureUrl().then(u => u && setSignatureUrl(u));
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await configService.savePrincipalName(name.trim());
      setSuccess('Name saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } finally { setIsSaving(false); }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadSignature(file);
      await configService.savePrincipalSignatureUrl(url);
      setSignatureUrl(url);
      setPreview(null);
      setFile(null);
      setSuccess('Signature uploaded successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <SettingCard title="Report Card Configuration" description="Set the Principal's name and signature that will appear on official student report cards.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Name Config */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Official Principal Name</label>
          <div className="flex flex-col gap-3">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Jane Smith"
              className="w-full px-5 py-3.5 border-2 border-white dark:border-slate-800 rounded-2xl focus:border-primary-500 bg-white dark:bg-slate-900 shadow-sm font-bold outline-none"
            />
            <button
              onClick={handleSaveName} disabled={isSaving || !name.trim()}
              className="py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </div>

        {/* Signature Config */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Official Signature (PNG)</label>
            
            <div className="h-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 mb-4">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
              ) : signatureUrl ? (
                <img src={signatureUrl} alt="Current" className="h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
              ) : (
                <span className="text-xs font-bold text-slate-500">No signature set</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input ref={inputRef} type="file" accept="image/png,image/*" onChange={handleFileChange} className="hidden" id="sig-upload" />
            <label htmlFor="sig-upload" className="flex-1 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-center text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 transition-colors">
              Choose File
            </label>
            <button onClick={handleUpload} disabled={!file || isUploading} className="flex-1 py-3 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 hover:bg-primary-700 transition-colors shadow-lg">
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

      </div>
      
      {success && (
        <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-xl">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}
    </SettingCard>
  );
};

const NonAdminView = () => (
  <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center max-w-2xl mx-auto mt-12">
    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-3xl">🛡️</span>
    </div>
    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Restricted Access</h2>
    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">You need Administrator privileges to access and modify system configurations, security protocols, and official report card signatures.</p>
    <div className="inline-flex px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-500">Read-Only Mode</div>
  </div>
);

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

const AccountSettings = (props) => {
  if (!props.isAdmin) return <NonAdminView />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage security credentials and official school configurations.</p>
      </div>
      
      <PasswordSection {...props} />
      <PrincipalConfigSection />
    </div>
  );
};

export default AccountSettings;
