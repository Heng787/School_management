
import React, { useState, useEffect } from 'react';

import { useData } from '../context/DataContext';

import { DashboardIcon, StudentsIcon, TeachersIcon, ClassesIcon, ReportsIcon, SettingsIcon, ScheduleIcon } from './icons/SidebarIcons';

import { fetchUnreadCount, ADMIN_KEY } from '../services/messageService';
import { Page, UserRole } from '../types';

const NavItem = ({ icon, label, isActive, onClick, badge }) => (
  <li
    onClick={onClick}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
    tabIndex="0"
    role="button"
    aria-current={isActive ? 'page' : undefined}
    aria-label={badge != null && badge > 0 ? `${label}, ${badge} unread items` : label}
    className={`group flex items-center px-3 py-2.5 mb-1 rounded-xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${isActive
      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500 pl-2.5 shadow-premium'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent pl-2.5'
    }`}
  >
    <span className={`relative transition-colors duration-300 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-100'}`}>
      {icon}
      {/* Tiny dot on icon when there's an unread badge */}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" aria-hidden="true" />
      )}
    </span>
    <span className={`mx-3 text-sm flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    {badge != null && badge > 0 ? (
      <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-rose-500/30 animate-pulse" aria-hidden="true">
        {badge > 9 ? '9+' : badge}
      </span>
    ) : isActive ? (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" aria-hidden="true" />
    ) : null}
  </li>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
 );

/**
 * COMPONENT: Sidebar
 * DESCRIPTION: Vertical navigation bar with role-based links.
 */
const Sidebar = ({ navigate, currentPage, userRole, isOpen, onClose }) => {
  // --- 1. STATE & PERMISSIONS ---
  const isAdmin = userRole === UserRole.Admin;
  const isTeacher = userRole === UserRole.Teacher;
  const isOffice = userRole === UserRole.OfficeWorker;

  const { currentUser } = useData();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReportsOpen, setIsReportsOpen] = useState(currentPage === Page.Reports);

  const handleReportTabClick = (tab) => {
    if (currentPage === Page.Reports) {
      window.history.replaceState({}, '', `/reports/${tab}`);
      window.dispatchEvent(new CustomEvent('reportsTabChange', { detail: tab }));
    } else {
      sessionStorage.setItem('reports_initial_tab', tab);
      navigate(Page.Reports);
    }
  };

  const [reportsTab, setReportsTab] = useState(window.location.pathname.split('/')[2] || 'marks');
  
  useEffect(() => {
    if (currentPage === Page.Reports) {
      setIsReportsOpen(true);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleUpdate = (e) => setReportsTab(e.detail);
    window.addEventListener('reportsTabChange', handleUpdate);
    return () => window.removeEventListener('reportsTabChange', handleUpdate);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const dbId = isAdmin ? ADMIN_KEY : currentUser.id;
    const check = async () => {
      const count = await fetchUnreadCount(dbId, isAdmin);
      setUnreadCount(count);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [currentUser, isAdmin]);

  // --- 2. RENDER ---
  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/20 dark:bg-slate-900/50 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside aria-label="Application Sidebar" className={`fixed left-0 top-0 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800 shadow-xl z-40 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-300 dark:border-slate-800/50 bg-white dark:bg-slate-900">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold shadow-premium">
              S
            </div>
            <h2 className="ml-3 text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display">School<span className="text-primary-500">Admin</span></h2>
          </div>
          <button onClick={onClose} aria-label="Close sidebar" className="lg:hidden text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-lg p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3" aria-label="Main Navigation">
          <div className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</div>
          <ul>
            <NavItem icon={<DashboardIcon />} label={Page.Dashboard} isActive={currentPage === Page.Dashboard} onClick={() => navigate(Page.Dashboard)} />
            {(isAdmin || isTeacher || isOffice) && (
              <NavItem icon={<StudentsIcon />} label={Page.Students} isActive={currentPage === Page.Students} onClick={() => navigate(Page.Students)} />
            )}
            {(isAdmin || isOffice) && (
              <NavItem icon={<TeachersIcon />} label={Page.Staff} isActive={currentPage === Page.Staff} onClick={() => navigate(Page.Staff)} />
            )}
            {(isAdmin || isTeacher || isOffice) && (
              <NavItem icon={<ClassesIcon />} label={Page.Classes} isActive={currentPage === Page.Classes} onClick={() => navigate(Page.Classes)} />
            )}
            {(isAdmin || isTeacher || isOffice) && (
              <NavItem icon={<ScheduleIcon />} label={Page.Schedule} isActive={currentPage === Page.Schedule} onClick={() => navigate(Page.Schedule)} />
            )}
            <NavItem
              icon={<ChatIcon />}
              label="Messages"
              isActive={currentPage === Page.Messages}
              onClick={() => navigate(Page.Messages)}
              badge={unreadCount}
            />
          </ul>

          {(isAdmin || isOffice || isTeacher) && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Analytics</div>
              <ul>
                <li className="mb-1">
                  <button
                    onClick={() => {
                      if (currentPage === Page.Reports) {
                        setIsReportsOpen(!isReportsOpen);
                      } else {
                        setIsReportsOpen(true);
                        navigate(Page.Reports);
                      }
                    }}
                    aria-expanded={isReportsOpen}
                    aria-current={currentPage === Page.Reports ? 'page' : undefined}
                    className={`group flex w-full items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${currentPage === Page.Reports
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`relative transition-colors duration-300 ${currentPage === Page.Reports ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-100'}`}>
                        <ReportsIcon />
                      </span>
                      <span className="mx-3 text-sm font-medium">{Page.Reports}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isReportsOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isReportsOpen && (
                    <ul className="ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-200 animate-in slide-in-from-top-2 opacity-100" role="group">
                      <li>
                        <button 
                          onClick={() => handleReportTabClick('marks')} 
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleReportTabClick('marks'))}
                          aria-current={currentPage === Page.Reports && reportsTab === 'marks' ? 'page' : undefined}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${currentPage === Page.Reports && reportsTab === 'marks' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          Marks Entry
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => handleReportTabClick('attendance')} 
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleReportTabClick('attendance'))}
                          aria-current={currentPage === Page.Reports && reportsTab === 'attendance' ? 'page' : undefined}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${currentPage === Page.Reports && reportsTab === 'attendance' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          Attendance
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => handleReportTabClick('export')} 
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleReportTabClick('export'))}
                          aria-current={currentPage === Page.Reports && reportsTab === 'export' ? 'page' : undefined}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${currentPage === Page.Reports && reportsTab === 'export' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          Export Data
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-300 dark:border-slate-800/50 bg-white dark:bg-slate-900">
          <div 
            onClick={() => navigate(Page.Settings)} 
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(Page.Settings))}
            tabIndex="0"
            role="button"
            aria-current={currentPage === Page.Settings ? 'page' : undefined}
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${currentPage === Page.Settings ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <SettingsIcon />
            <div className="ml-3">
              <p className="text-sm font-medium">Settings</p>
              <p className="text-xs text-slate-500">{isAdmin ? 'System config' : 'Account & Help'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
