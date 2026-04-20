import React, { useState, useEffect, useRef } from "react";
import { uploadSignature } from "../../services/signatureService";
import { configService } from "../../services/configService";

/**
 * COMPONENT: AccountSettings
 * DESCRIPTION: Handles account settings including password management for admin users.
 */
const AccountSettings = ({
  isAdmin,
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Signature state ---
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  const [signatureSuccess, setSignatureSuccess] = useState('');
  const signatureInputRef = useRef(null);

  // --- Principal Name state ---
  const [principalName, setPrincipalName] = useState('');
  const [isSavingPrincipalName, setIsSavingPrincipalName] = useState(false);
  const [principalNameSuccess, setPrincipalNameSuccess] = useState('');

  useEffect(() => {
    configService.getPrincipalSignatureUrl().then((url) => {
      if (url) setSignatureUrl(url);
    });
    configService.getPrincipalName().then((name) => {
      if (name) setPrincipalName(name);
    });
  }, []);

  const handleSignatureFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSignatureError('Please select a valid image file (PNG recommended).');
      return;
    }
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
    setSignatureError('');
    setSignatureSuccess('');
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) return;
    setIsUploadingSignature(true);
    setSignatureError('');
    setSignatureSuccess('');
    try {
      const url = await uploadSignature(signatureFile);
      await configService.savePrincipalSignatureUrl(url);
      setSignatureUrl(url);
      setSignaturePreview(null);
      setSignatureFile(null);
      setSignatureSuccess('Signature uploaded successfully!');
    } catch (err) {
      setSignatureError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingSignature(false);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
    }
  };

  const handleSavePrincipalName = async () => {
    if (!principalName.trim()) return;
    setIsSavingPrincipalName(true);
    setPrincipalNameSuccess('');
    try {
      await configService.savePrincipalName(principalName.trim());
      setPrincipalNameSuccess('Principal name saved! All report cards will now show this name.');
      setTimeout(() => setPrincipalNameSuccess(''), 4000);
    } catch (err) {
      // silently fail
    } finally {
      setIsSavingPrincipalName(false);
    }
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      await handleSubmitPassword(e);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2 transition-colors">
          Account Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 transition-colors">
          Manage your account and security settings.
        </p>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl transition-colors">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300">Admin Only</p>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                You need administrator privileges to access account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2 transition-colors">
        Account Settings
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 transition-colors">
        Manage your account and security settings.
      </p>

      <div className="max-w-md">
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl transition-colors">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-400 mt-1 transition-colors">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 transition-colors">
              Current Admin Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                placeholder="Enter your current admin password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 transition-colors"
              >
                {showPasswords.current ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l22 22"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 transition-colors">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                placeholder="Enter a new strong password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 transition-colors"
              >
                {showPasswords.new ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l22 22"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 transition-colors">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                placeholder="Confirm the new password"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 transition-colors"
              >
                {showPasswords.confirm ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l22 22"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg transition-colors">
              <p className="text-sm text-red-800 dark:text-red-400 font-medium">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800/30 rounded-lg transition-colors">
              <p className="text-sm text-green-800 dark:text-emerald-400 font-medium">{passwordSuccess}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {isChangingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Password Requirements
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-500 mt-2 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Principal Name Setting --- */}
      <div className="mt-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1 transition-colors">Principal's Name</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Set the name that appears under the Principal's Signature on all report cards.</p>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={principalName}
            onChange={(e) => setPrincipalName(e.target.value)}
            placeholder="e.g. Dr. Chan Sopheap"
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={handleSavePrincipalName}
            disabled={isSavingPrincipalName || !principalName.trim()}
            className="px-5 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200 dark:shadow-none whitespace-nowrap"
          >
            {isSavingPrincipalName ? 'Saving...' : 'Save Name'}
          </button>
        </div>
        {principalNameSuccess && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {principalNameSuccess}
          </p>
        )}
      </div>

      {/* --- Principal Signature Upload --- */}
      <div className="mt-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1 transition-colors">Principal's Signature</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Upload a PNG of the principal's scanned signature. It will automatically appear on all report cards.</p>

        {/* Current signature preview */}
        {signatureUrl && !signaturePreview && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4">
            <img
              src={signatureUrl}
              alt="Current principal signature"
              className="h-16 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Signature</p>
              <p className="text-xs text-slate-400 mt-0.5">Upload a new file below to replace it.</p>
            </div>
          </div>
        )}

        {/* New file preview */}
        {signaturePreview && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl flex items-center gap-4">
            <img
              src={signaturePreview}
              alt="Signature preview"
              className="h-16 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Preview</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{signatureFile?.name}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 items-center">
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/png,image/*"
            onChange={handleSignatureFileChange}
            className="hidden"
            id="signature-upload-input"
          />
          <label
            htmlFor="signature-upload-input"
            className="cursor-pointer px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Choose PNG
          </label>
          <button
            type="button"
            onClick={handleSignatureUpload}
            disabled={!signatureFile || isUploadingSignature}
            className="px-4 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200 dark:shadow-none flex items-center gap-2"
          >
            {isUploadingSignature ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Upload Signature</>
            )}
          </button>
        </div>

        {signatureError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">{signatureError}</p>
        )}
        {signatureSuccess && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{signatureSuccess}</p>
        )}

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-600">Tip: Use a PNG with a white or transparent background for best results on report cards.</p>
      </div>
    </div>
  );
};

export default AccountSettings;
