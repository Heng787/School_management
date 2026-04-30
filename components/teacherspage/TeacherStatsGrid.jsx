import React from "react";

/**
 * COMPONENT: TeacherStatsGrid
 * DESCRIPTION: Displays quick statistics cards for staff overview.
 *              Supports both light and dark mode via Tailwind classes.
 */
const TeacherStatsGrid = ({ stats }) => {
  const statCards = [
    {
      title: "Total Staff",
      value: stats.total,
      label: "All roles combined",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      // Light mode
      borderTop: "#3b82f6",
      iconBgLight: "bg-blue-100",
      iconColorLight: "text-blue-600",
      // Dark mode
      iconBgDark: "dark:bg-blue-900/30",
      iconColorDark: "dark:text-blue-400",
    },
    {
      title: "Teaching Staff",
      value: stats.teaching,
      label: "Teachers & Assistants",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      borderTop: "#6366f1",
      iconBgLight: "bg-indigo-100",
      iconColorLight: "text-indigo-600",
      iconBgDark: "dark:bg-indigo-900/30",
      iconColorDark: "dark:text-indigo-400",
    },
    {
      title: "Support Staff",
      value: stats.support,
      label: "Office, Guard & Cleaner",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      borderTop: "#10b981",
      iconBgLight: "bg-emerald-100",
      iconColorLight: "text-emerald-600",
      iconBgDark: "dark:bg-emerald-900/30",
      iconColorDark: "dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`
            relative rounded-xl p-5 flex items-center gap-4
            bg-white dark:bg-slate-800/70
            border border-slate-200 dark:border-slate-700/60
            shadow-sm hover:shadow-md
            transition-all duration-200 hover:-translate-y-0.5
          `}
          style={{ borderTop: `3px solid ${card.borderTop}` }}
        >
          {/* Icon bubble */}
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${card.iconBgLight} ${card.iconColorLight}
              ${card.iconBgDark} ${card.iconColorDark}
            `}
          >
            {card.icon}
          </div>

          {/* Stats text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-1">
              {card.title}
            </p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
              {card.value}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStatsGrid;
