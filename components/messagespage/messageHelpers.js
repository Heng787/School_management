/**
 * MESSAGE HELPER UTILITIES
 * Formats and constants for message display
 */

export const formatTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

export const daysBetween = (start, end) => {
  const a = new Date(start),
    b = new Date(end);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40",
};

export const statusIcon = {
  pending: "⏳",
  approved: "✅",
  rejected: "❌",
};
