import React, { useState, useEffect } from 'react';

import AccountSettings from '../components/settingspage/AccountSettings';
import CloudSyncStatus from '../components/settingspage/CloudSyncStatus';
import DataManager from '../components/settingspage/DataManager';
import OfflineGuide from '../components/settingspage/OfflineGuide';
import { useData } from '../context/DataContext';

import { UserRole } from '../types';

/**
 * PAGE: SettingsPage
 * DESCRIPTION: Central hub for system configuration, security, and data recovery.
 * LOCATION: /settings
 */
const SettingsPage = ({ onLogout, userRole }) => {
  // --- Context & Data ---
  const {
    triggerSync,
    lastSyncedAt,
    isSyncing,
    adminPassword,
    setAdminPassword
  } = useData();

  const isAdmin = userRole === UserRole.Admin;
  const isOffice = userRole === UserRole.OfficeWorker;

  // Read sub-tab from URL on mount (e.g. /settings/account → 'account')
  const getInitialSettingsTab = () => {
    const parts = window.location.pathname.split('/');
    const sub = parts[2]?.toLowerCase();
    const valid = ['account', 'data', 'sync', 'offline'];
    return valid.includes(sub) ? sub : 'account';
  };

  const [activeTab, setActiveTab] = useState(getInitialSettingsTab);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --- Password Submission Handler ---
  const handleSubmitPassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (currentPasswordInput !== adminPassword) {
      setPasswordError('Current password is not correct.');
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setAdminPassword(newPasswordInput);
    setPasswordSuccess('Password updated successfully!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  // --- Tab Configuration & Filtering ---
  const allTabs = [
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      adminOnly: true,
    },
    {
      id: 'data',
      label: 'Database',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM4 7l8 4 8-4"
          />
        </svg>
      ),
      adminOnly: true,
    },
    {
      id: 'sync',
      label: 'Cloud Sync',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      adminOnly: true,
    },
    {
      id: 'offline',
      label: 'Offline Help',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      adminOnly: false,
    },
  ];

  const tabs = allTabs.filter((tab) => {
    if (!tab.adminOnly) return true;
    if (isAdmin) return true;
    // Office Workers can access Data and Sync tabs
    if (isOffice && (tab.id === 'data' || tab.id === 'sync')) return true;
    return false;
  });

  // --- Access Control ---
  useEffect(() => {
    const hasAccess =
      isAdmin ||
      (isOffice &&
        (activeTab === 'data' ||
          activeTab === 'sync' ||
          activeTab === 'offline'));
    if (!hasAccess && !isAdmin && activeTab !== 'offline') {
      setActiveTab('offline');
    }
  }, [isAdmin, isOffice, activeTab]);

  // --- Render ---
  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-8 tracking-tight transition-colors">
        Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-wrap md:flex-col gap-2 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.history.replaceState({}, '', `/settings/${tab.id}`);
                document.title = `Settings / ${tab.label} | SchoolAdmin`;
              }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 shrink-0 md:w-full ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none translate-x-0 md:translate-x-1'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent border-b-slate-100 dark:border-b-slate-800'
              }`}
            >
              {tab.icon}
              <span className="font-semibold whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-grow w-full">
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <AccountSettings
                isAdmin={isAdmin}
                handleSubmitPassword={handleSubmitPassword}
                currentPasswordInput={currentPasswordInput}
                setCurrentPasswordInput={setCurrentPasswordInput}
                newPasswordInput={newPasswordInput}
                setNewPasswordInput={setNewPasswordInput}
                confirmPasswordInput={confirmPasswordInput}
                setConfirmPasswordInput={setConfirmPasswordInput}
                passwordError={passwordError}
                passwordSuccess={passwordSuccess}
              />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="space-y-8">
                <DataManager />
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <CloudSyncStatus
                triggerSync={triggerSync}
                lastSyncedAt={lastSyncedAt}
                isSyncing={isSyncing}
                isOnline={navigator.onLine}
              />
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <OfflineGuide />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
