import React from "react";

/**
 * COMPONENT: TeacherStatsGrid
 * DESCRIPTION: Displays quick statistics cards for staff overview.
 */
const TeacherStatsGrid = ({ stats }) => {
  const statCards = [
    {
      title: "Total Staff",
      value: stats.total,
      icon: "users",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Teaching Staff",
      value: stats.teaching,
      icon: "book",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Support Staff",
      value: stats.support,
      icon: "building",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
  ];

  const icons = {
    users: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    book: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    building: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4 transition-colors duration-300"
        >
          <div className={`p-3 ${card.bgColor} rounded-lg ${card.textColor}`}>
            {icons[card.icon]}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStatsGrid;
