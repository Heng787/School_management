
import React from 'react';
import { Page, UserRole } from '../types';
import { DashboardIcon, StudentsIcon, TeachersIcon, ClassesIcon, ReportsIcon, SettingsIcon, ScheduleIcon } from './icons/SidebarIcons';

interface SidebarProps {
    navigate: (page: Page) => void;
    currentPage: Page;
    userRole: UserRole;
    isOpen: boolean;
    onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li
        onClick={onClick}
        className={`group flex items-center px-3 py-2.5 mb-1 rounded-md cursor-pointer transition-all duration-200 ${
            isActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-l-2 border-transparent'
        }`}
    >
        <span className={`${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-100'}`}>
            {icon}
        </span>
        <span className="mx-3 text-sm font-medium">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ navigate, currentPage, userRole, isOpen, onClose }) => {
    const isAdmin = userRole === UserRole.Admin;
    const isTeacher = userRole === UserRole.Teacher;
    const isOffice = userRole === UserRole.OfficeWorker;
    const isGuard = userRole === UserRole.Guard;
    const isCleaner = userRole === UserRole.Cleaner;

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Content */}
            <aside className={`fixed left-0 top-0 w-64 h-screen bg-slate-900 border-r border-slate-800 shadow-xl z-40 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800/50 bg-slate-900">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                            S
                        </div>
                        <h2 className="ml-3 text-lg font-bold text-slate-100 tracking-tight">School<span className="text-emerald-500">Admin</span></h2>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</div>
                    <ul>
                        <NavItem icon={<DashboardIcon />} label={Page.Dashboard} isActive={currentPage === Page.Dashboard} onClick={() => navigate(Page.Dashboard)} />
                        
                        {(isAdmin || isTeacher || isOffice) && (
                            <NavItem icon={<StudentsIcon />} label={Page.Students} isActive={currentPage === Page.Students} onClick={() => navigate(Page.Students)} />
                        )}
                        
                        {isAdmin && (
                            <NavItem icon={<TeachersIcon />} label={Page.Staff} isActive={currentPage === Page.Staff} onClick={() => navigate(Page.Staff)} />
                        )}
                        
                        {(isAdmin || isTeacher) && (
                            <NavItem icon={<ClassesIcon />} label={Page.Classes} isActive={currentPage === Page.Classes} onClick={() => navigate(Page.Classes)} />
                        )}
                        
                        {(isAdmin || isTeacher) && (
                            <NavItem icon={<ScheduleIcon />} label={Page.Schedule} isActive={currentPage === Page.Schedule} onClick={() => navigate(Page.Schedule)} />
                        )}
                    </ul>
                    
                    {(isAdmin || isOffice) && (
                        <>
                            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analytics</div>
                            <ul>
                                <NavItem icon={<ReportsIcon />} label={Page.Reports} isActive={currentPage === Page.Reports} onClick={() => navigate(Page.Reports)} />
                            </ul>
                        </>
                    )}
                </nav>
                
                <div className="p-4 border-t border-slate-800/50 bg-slate-900">
                    <div onClick={() => navigate(Page.Settings)} className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${currentPage === Page.Settings ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
