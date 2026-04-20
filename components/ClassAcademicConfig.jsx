import React, { useState } from "react";
import { useData } from "../context/DataContext";

export const LevelManager = () => {
  const { levels, addLevel, updateLevel, deleteLevel } = useData();
  const [newLevel, setNewLevel] = useState("");
  const [program, setProgram] = useState("Kid");
  const [error, setError] = useState("");
  const [deletingLevel, setDeletingLevel] = useState(null);

  const formattedPreview = React.useMemo(() => {
    const val = newLevel.trim().toUpperCase();
    if (!val) return "";
    if (/^\d+$/.test(val)) {
      if (program === "Kid") return `K${val}`;
      if (program === "Junior") return `${val}A/${val}B`;
      return val;
    }
    return val;
  }, [newLevel, program]);

  const handleBlurLevel = () => {
    if (!newLevel.trim()) return;
    const val = newLevel.trim().toUpperCase();
    if (/^\d+$/.test(val)) {
      if (program === "Kid") setNewLevel(`K${val}`);
      if (program === "Junior") setNewLevel(`${val}A/${val}B`);
    } else {
      setNewLevel(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLevel();
    }
  };

  const handleAddLevel = () => {
    setError("");
    const finalLevel = formattedPreview;
    if (!finalLevel) {
      setError("Level name cannot be empty.");
      return;
    }
    if (levels.find((l) => l.toLowerCase() === finalLevel.toLowerCase())) {
      setError("This level already exists.");
      return;
    }
    addLevel(finalLevel);
    setNewLevel("");
  };

  const handleDeleteLevel = (level) => {
    deleteLevel(level);
    setDeletingLevel(null);
  };

  const groupedLevels = React.useMemo(() => {
    const groups = { Kid: [], Junior: [], Senior: [], Custom: [] };
    levels.forEach((level) => {
      const l = level.trim().toUpperCase();
      if (/^K\s*\d+/.test(l)) groups.Kid.push(level);
      else if (/^\d+$/.test(l)) groups.Senior.push(level);
      else if (/^\d+/.test(l)) groups.Junior.push(level);
      else groups.Custom.push(level);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      });
    });

    return groups;
  }, [levels]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Levels
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Manage academic grades
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex gap-2 relative">
          <select
            value={program}
            onChange={(e) => {
              setProgram(e.target.value);
              setNewLevel("");
              setError("");
            }}
            className="w-24 px-2 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-black dark:text-white transition-all shadow-sm"
          >
            <option value="Kid">Kid</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Custom">Custom</option>
          </select>
          <input
            type="text"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            onBlur={handleBlurLevel}
            onKeyDown={handleKeyDown}
            placeholder={
              program === "Kid"
                ? "e.g., 3 \u2192 K3"
                : program === "Junior"
                  ? "e.g., 3 \u2192 3A/3B"
                  : "Type level"
            }
            className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-medium uppercase"
          />
          <button
            onClick={handleAddLevel}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shrink-0 text-xs font-bold shadow-sm"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="text-[10px] text-rose-500 font-medium">{error}</p>
        )}
        {!error && newLevel && newLevel.toUpperCase() !== formattedPreview && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
            Will be saved as: <strong>{formattedPreview}</strong>
          </p>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-60 scrollbar-thin">
        {levels.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[10px] text-slate-400 font-medium italic">
              No levels defined
            </p>
          </div>
        ) : (
          Object.entries(groupedLevels).map(([groupName, groupLevels]) => {
            if (groupLevels.length === 0) return null;
            return (
              <div key={groupName} className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900 py-1 z-10">
                  {groupName} Levels
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {groupLevels.map((level) =>
                    deletingLevel === level ? (
                      <div
                        key={level}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-md animate-in zoom-in-95 duration-200"
                      >
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDeleteLevel(level)}
                          className="p-0.5 hover:bg-rose-200 dark:hover:bg-rose-800 rounded text-rose-700 dark:text-rose-300"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingLevel(null)}
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        key={level}
                        onClick={() => setDeletingLevel(level)}
                        className="group flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-900/30 dark:hover:border-rose-800/50 transition-colors cursor-pointer"
                        title="Click to delete"
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-400">
                          {level}
                        </span>
                        <svg
                          className="w-3 h-3 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    ),
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const SessionManager = () => {
  const { timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useData();
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState("weekday");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedTime, setEditedTime] = useState("");
  const [editedType, setEditedType] = useState("weekday");
  const [error, setError] = useState("");
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  const handleAdd = () => {
    setError("");
    if (!newTime.trim()) {
      setError("Time slot name cannot be empty.");
      return;
    }
    addTimeSlot({ time: newTime.trim(), type: newType });
    setNewTime("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleStartEdit = (slot) => {
    setEditingSessionId(slot.id);
    setEditedTime(slot.time);
    setEditedType(slot.type);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditedTime("");
    setEditedType("weekday");
  };

  const handleUpdate = () => {
    setError("");
    if (!editedTime.trim()) {
      setError("Time slot name cannot be empty.");
      return;
    }
    if (editingSessionId) {
      updateTimeSlot(editingSessionId, {
        time: editedTime.trim(),
        type: editedType,
      });
    }
    handleCancelEdit();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Sessions
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Define school time slots
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 8:00-10:00 AM"
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
          />
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-black dark:text-white transition-all"
            >
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
            </select>
            <button
              onClick={handleAdd}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shrink-0 text-xs font-bold"
            >
              Add Session
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[10px] text-rose-500 font-medium">{error}</p>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-60 scrollbar-thin">
        {timeSlots.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[10px] text-slate-400 font-medium italic">
              No sessions defined
            </p>
          </div>
        ) : (
          ["weekday", "weekend"].map((groupType) => {
            const groupSlots = timeSlots.filter((s) => s.type === groupType);
            if (groupSlots.length === 0) return null;
            return (
              <details
                key={groupType}
                className="group bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-lg overflow-hidden transition-all duration-200"
              >
                <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      {groupType}s
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {groupSlots.length}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="p-2 pt-0 space-y-1">
                  {groupSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 group transition-colors"
                    >
                      {editingSessionId === slot.id ? (
                        <div className="flex flex-col gap-1 w-full mr-2">
                          <input
                            type="text"
                            value={editedTime}
                            onChange={(e) => setEditedTime(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-950 border border-indigo-500 rounded-md text-black dark:text-white"
                            autoFocus
                          />
                          <select
                            value={editedType}
                            onChange={(e) => setEditedType(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-950 border border-indigo-500 rounded-md text-black dark:text-white"
                          >
                            <option value="weekday">Weekday</option>
                            <option value="weekend">Weekend</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">
                            {slot.time}
                          </span>
                          <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                            {slot.type}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {editingSessionId === slot.id ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(slot)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            {deletingSessionId === slot.id ? (
                              <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200">
                                <button
                                  onClick={() => {
                                    deleteTimeSlot(slot.id);
                                    setDeletingSessionId(null);
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeletingSessionId(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-200 rounded-md"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingSessionId(slot.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
};

export const SubjectManager = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } = useData();
  const [newSubject, setNewSubject] = useState("");
  const [category, setCategory] = useState("JuniorSenior");
  const [error, setError] = useState("");
  const [deletingSubject, setDeletingSubject] = useState(null);

  const activeSubjects = subjects[category] || [];

  const handleAddSubject = () => {
    setError("");
    if (!newSubject.trim()) {
      setError("Subject name cannot be empty.");
      return;
    }
    if (
      activeSubjects.find((s) => s.toLowerCase() === newSubject.trim().toLowerCase())
    ) {
      setError("This subject already exists in this category.");
      return;
    }
    addSubject(newSubject.trim(), category);
    setNewSubject("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubject();
    }
  };

  const handleDeleteSubject = (subject) => {
    deleteSubject(subject);
    setDeletingSubject(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Subjects
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Academic courses
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex flex-col gap-2 relative">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setError("");
            }}
            className="w-full px-2 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white transition-all shadow-sm"
          >
            <option value="Kid">Kid subjects</option>
            <option value="JuniorSenior">Junior/Senior subjects</option>
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. History"
              className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
            <button
              onClick={handleAddSubject}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shrink-0 text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[10px] text-rose-500 font-medium">{error}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 max-h-60 scrollbar-thin">
        {activeSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {activeSubjects.map((subject) =>
              deletingSubject === subject ? (
                <div
                  key={subject}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-md animate-in zoom-in-95 duration-200"
                >
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Delete?
                  </span>
                  <button
                    onClick={() => handleDeleteSubject(subject)}
                    className="p-0.5 hover:bg-rose-200 dark:hover:bg-rose-800 rounded text-rose-700 dark:text-rose-300"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingSubject(null)}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  key={subject}
                  onClick={() => setDeletingSubject(subject)}
                  className="group flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-900/30 dark:hover:border-rose-800/50 transition-colors cursor-pointer"
                  title="Click to delete"
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-400">
                    {subject}
                  </span>
                  <svg
                    className="w-3 h-3 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
              No subjects defined
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
