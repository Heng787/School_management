import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import ConfirmModal from "../ConfirmModal";
import {
  Archive,
  GraduationCap,
  UserRound,
  RefreshCw,
  Trash2,
  Inbox,
  Search,
  AlertCircle,
  CheckSquare,
  Square,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ArchiveManager = () => {
  const {
    classes,
    unarchiveClass,
    deleteClass,
    students,
    unarchiveStudent,
    deleteStudent,
    staff,
    unarchiveStaff,
    deleteStaff,
  } = useData();

  const [activeTab, setActiveTab] = useState("classes");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name

  // Bulk selection state (keyed by tab)
  const [selectedIds, setSelectedIds] = useState({ classes: new Set(), students: new Set(), staff: new Set() });

  // Filter archived items
  const archivedClasses  = useMemo(() => classes.filter((c) => c.isArchived === true),  [classes]);
  const archivedStudents = useMemo(() => students.filter((s) => s.isArchived === true), [students]);
  const archivedStaff    = useMemo(() => staff.filter((s) => s.isArchived === true),    [staff]);

  const currentItems = activeTab === "classes" ? archivedClasses : activeTab === "students" ? archivedStudents : archivedStaff;
  const currentType  = activeTab === "classes" ? "class"          : activeTab === "students" ? "student"         : "staff";

  const getFilteredItems = (items) => {
    let result = items;
    if (searchQuery) {
      result = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id?.toString().includes(searchQuery),
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0);
      if (sortBy === "oldest") return new Date(a.archivedAt || 0) - new Date(b.archivedAt || 0);
      if (sortBy === "name")   return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  };

  // --- Single item actions ---
  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "class")   await deleteClass(itemToDelete.id);
      if (itemToDelete.type === "student") await deleteStudent(itemToDelete.id);
      if (itemToDelete.type === "staff")   await deleteStaff(itemToDelete.id);
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
    } catch (err) {
      alert("Failed to delete permanently: " + err.message);
    }
  };

  const handleRestore = (item, type) => {
    if (type === "class")   unarchiveClass(item.id);
    if (type === "student") unarchiveStudent(item.id);
    if (type === "staff")   unarchiveStaff(item.id);
    // Remove from selection if it was selected
    setSelectedIds((prev) => {
      const next = new Set(prev[activeTab]);
      next.delete(item.id);
      return { ...prev, [activeTab]: next };
    });
  };

  // --- Bulk selection ---
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev[activeTab]);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, [activeTab]: next };
    });
  };

  const filteredItems = getFilteredItems(currentItems);
  const currentSelected = selectedIds[activeTab];
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((i) => currentSelected.has(i.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = allFilteredSelected
        ? new Set()
        : new Set(filteredItems.map((i) => i.id));
      return { ...prev, [activeTab]: next };
    });
  };

  const clearSelection = () =>
    setSelectedIds((prev) => ({ ...prev, [activeTab]: new Set() }));

  // Bulk restore
  const handleBulkRestore = async () => {
    const ids = Array.from(currentSelected);
    for (const id of ids) {
      if (activeTab === "classes")  unarchiveClass(id);
      if (activeTab === "students") unarchiveStudent(id);
      if (activeTab === "staff")    unarchiveStaff(id);
    }
    clearSelection();
  };

  // Bulk delete
  const confirmBulkDelete = async () => {
    const ids = Array.from(currentSelected);
    try {
      for (const id of ids) {
        if (activeTab === "classes")  await deleteClass(id);
        if (activeTab === "students") await deleteStudent(id);
        if (activeTab === "staff")    await deleteStaff(id);
      }
    } catch (err) {
      alert("Some items failed to delete: " + err.message);
    }
    clearSelection();
    setIsBulkDeleteOpen(false);
  };

  const getTypeIcon = (type) => {
    if (type === "class")   return <Archive className="w-5 h-5" />;
    if (type === "student") return <GraduationCap className="w-5 h-5" />;
    if (type === "staff")   return <UserRound className="w-5 h-5" />;
    return <Inbox className="w-5 h-5" />;
  };

  const renderArchiveList = (items, type) => {
    const filtered = getFilteredItems(items);

    if (items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700/50"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 capitalize">
            No Archived {type}s
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-xs">
            Any {type} you archive will appear here for restoration or permanent deletion.
          </p>
        </motion.div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <p className="font-medium">No results matching "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Bulk Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 pb-3 gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {allFilteredSelected
                ? <CheckSquare className="w-4 h-4 text-primary-500" />
                : <Square className="w-4 h-4" />}
              {allFilteredSelected ? "Deselect All" : "Select All"} ({filtered.length})
            </button>
            {currentSelected.size > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                  {currentSelected.size} selected
                </span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {currentSelected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handleBulkRestore}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl font-bold text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Selected
                </button>
                <button
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all rounded-xl font-bold text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const isSelected = currentSelected.has(item.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-2xl hover:shadow-xl transition-all gap-4 cursor-pointer select-none
                    ${isSelected
                      ? "bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 shadow-md shadow-primary-500/10"
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-primary-500/5"
                    }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Checkbox */}
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}>
                      {isSelected
                        ? <CheckSquare className="w-5 h-5 text-primary-500" />
                        : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />}
                    </div>
                    {/* Icon */}
                    <div className={`p-3 rounded-xl shrink-0 ${
                      type === "class"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : type === "student"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    }`}>
                      {getTypeIcon(type)}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold tracking-wider uppercase">
                          ID: {item.id}
                        </span>
                        {item.level && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            {item.level}
                          </span>
                        )}
                        {item.role && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            {item.role}
                          </span>
                        )}
                        {item.archivedAt && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            <Clock className="w-2.5 h-2.5" />
                            Archived {new Date(item.archivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Single-row actions */}
                  <div
                    className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleRestore(item, type)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all rounded-xl font-bold text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item, type)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all rounded-xl font-bold text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-12 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-500/20 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              Administrative Control Center
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white tracking-tight mb-4 flex items-center gap-4 whitespace-nowrap">
              System Archive
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800 hidden sm:block" />
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg sm:text-xl leading-relaxed max-w-4xl">
              Maintain complete control over your data. Restore archived records to their 
              original context or perform <span className="text-red-500 dark:text-red-400 font-bold">permanent deletions</span> to clear system space.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search archived items..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); clearSelection(); }}
                className="w-full px-12 py-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:border-primary-500/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-center"
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-transparent w-fit">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-black text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 w-fit border border-slate-200 dark:border-slate-700/30">
          {[
            { id: "classes",  label: "Classes",  count: archivedClasses.length,  icon: <Archive className="w-4 h-4" /> },
            { id: "students", label: "Students", count: archivedStudents.length, icon: <GraduationCap className="w-4 h-4" /> },
            { id: "staff",    label: "Staff",    count: archivedStaff.length,    icon: <UserRound className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); clearSelection(); }}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 relative ${
                activeTab === tab.id
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {tab.count > 0 && (
                <span className={`relative z-10 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  activeTab === tab.id
                    ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "classes"  && renderArchiveList(archivedClasses,  "class")}
              {activeTab === "students" && renderArchiveList(archivedStudents, "student")}
              {activeTab === "staff"    && renderArchiveList(archivedStaff,    "staff")}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>



      {/* Single delete confirm */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Permanently"
        message={`Are you sure you want to permanently delete ${itemToDelete?.name}? This action is irreversible and will remove all related academic history.`}
        confirmText="Yes, Delete Forever"
      />

      {/* Bulk delete confirm */}
      <ConfirmModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${currentSelected.size} Items Permanently`}
        message={`Are you sure you want to permanently delete all ${currentSelected.size} selected ${activeTab}? This action is irreversible and cannot be undone.`}
        confirmText={`Delete ${currentSelected.size} Items Forever`}
      />
    </div>
  );
};

export default ArchiveManager;
