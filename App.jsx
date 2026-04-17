/**
 * COMPONENT: App
 * DESCRIPTION: The main entry point for the application.
 * Handles routing, authentication state, and overall page layout.
 */
import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassesPage from './pages/ClassesPage';
import ReportsPage from './pages/ReportsPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { Page, UserRole } from './types';
import { useData } from './context/DataContext';

// Maps URL path → Page constant
const pathToPage = {
  'dashboard': Page.Dashboard,
  'students': Page.Students,
  'staff': Page.Staff,
  'classes': Page.Classes,
  'reports': Page.Reports,
  'schedule': Page.Schedule,
  'settings': Page.Settings,
  'messages': Page.Messages,
};

// Maps Page constant → URL path
const pageToPath = {
  [Page.Dashboard]: 'dashboard',
  [Page.Students]: 'students',
  [Page.Staff]: 'staff',
  [Page.Classes]: 'classes',
  [Page.Reports]: 'reports',
  [Page.Schedule]: 'schedule',
  [Page.Settings]: 'settings',
  [Page.Messages]: 'messages',
};

/** Read the current URL to determine the starting page. */
function getInitialPage() {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const segment = path.split('/')[0];
  return pathToPage[segment] || Page.Dashboard;
}

function App() {
  // --- 1. STATE & CONTEXT ---
  const { currentUser, setCurrentUser } = useData();
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  // --- 2. AUTHENTICATION HANDLERS ---
  const handleLogin = (role) => {
    setCurrentPage(Page.Dashboard);
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.history.replaceState({}, '', '/');
  };

  // --- 3. URL & NAVIGATION SYNC ---
  // Keep URL in sync whenever currentPage changes
  useEffect(() => {
    const path = '/' + pageToPath[currentPage];
    if (window.location.pathname !== path) {
      window.history.pushState({ page: currentPage }, '', path);
    }
    document.title = `${currentPage} | SchoolAdmin`;
  }, [currentPage]);

  // Browser back / forward button support
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const segment = path.split('/')[0];
      const page = pathToPage[segment] || Page.Dashboard;
      setCurrentPage(page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation Handler: updates state + URL, closes sidebar on mobile
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // --- 4. PAGE RENDERING (ROUTER) ---
  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard: return <DashboardPage navigate={navigate} />;
      case Page.Students: return <StudentsPage />;
      case Page.Staff: return <TeachersPage />;
      case Page.Classes: return <ClassesPage />;
      case Page.Reports: return <ReportsPage />;
      case Page.Schedule: return <SchedulePage />;
      case Page.Settings: return <SettingsPage onLogout={handleLogout} userRole={currentUser.role} />;
      case Page.Messages: return <MessagesPage />;
      default: return <DashboardPage navigate={navigate} />;
    }
  };

  // Redirect to Login if not logged in
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // --- 5. MAIN LAYOUT RENDER ---
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Sidebar
        navigate={navigate}
        currentPage={currentPage}
        userRole={currentUser.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        <Navbar
          userRole={currentUser.role}
          onLogout={handleLogout}
          navigate={navigate}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          currentPage={currentPage}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 lg:p-10 relative transition-colors duration-300">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
