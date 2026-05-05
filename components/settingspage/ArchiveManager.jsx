import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import ConfirmModal from "../ConfirmModal";
import { 
  Archive, 
  Users, 
  GraduationCap, 
  UserRound, 
  RefreshCw, 
  Trash2, 
  Inbox,
  Search,
  AlertCircle
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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter archived items
  const archivedClasses = classes.filter((cls) => cls.isArchived === true);
  const archivedStudents = students.filter((stu) => stu.isArchived === true);
  const archivedStaff = staff.filter((s) => s.isArchived === true);

  const getFilteredItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toString().includes(searchQuery)
    );
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "class") {
        await deleteClass(itemToDelete.id);
      } else if (itemToDelete.type === "student") {
        await deleteStudent(itemToDelete.id);
      } else if (itemToDelete.type === "staff") {
        await deleteStaff(itemToDelete.id);
      }
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
    } catch (err) {
      alert("Failed to delete permanently: " + err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "class": return <Archive className="w-5 h-5" />;
      case "student": return <GraduationCap className="w-5 h-5" />;
      case "staff": return <UserRound className="w-5 h-5" />;
      default: return <Inbox className="w-5 h-5" />;
    }
  };

  const renderArchiveList = (items, type) => {
    const filteredItems = getFilteredItems(items);

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
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Archived {type}s</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-xs">
            Any {type} you archive will appear here for restoration or permanent deletion.
          </p>
        </motion.div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <p className="font-medium">No results matching "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  type === 'class' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  type === 'student' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                  'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                }`}>
                  {getTypeIcon(type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
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
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    if (type === "class") unarchiveClass(item.id);
                    if (type === "student") unarchiveStudent(item.id);
                    if (type === "staff") unarchiveStaff(item.id);
                  }}
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
                  Permanent Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold mb-4">
              <AlertCircle className="w-3 h-3" />
              Administrative Tool
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
              System Archive
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">
              Manage non-destructive deletions. Restore items to their original place or permanently remove them from the system.
            </p>
          </div>

          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search archived items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 w-fit border border-slate-200 dark:border-slate-700/30">
          {[
            { id: "classes", label: "Classes", count: archivedClasses.length, icon: <Archive className="w-4 h-4" /> },
            { id: "students", label: "Students", count: archivedStudents.length, icon: <GraduationCap className="w-4 h-4" /> },
            { id: "staff", label: "Staff", count: archivedStaff.length, icon: <UserRound className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                <span
                  className={`relative z-10 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    activeTab === tab.id
                      ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-500"
                  }`}
                >
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
              {activeTab === "classes" && renderArchiveList(archivedClasses, "class")}
              {activeTab === "students" &&
                renderArchiveList(archivedStudents, "student")}
              {activeTab === "staff" && renderArchiveList(archivedStaff, "staff")}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Permanently"
        message={`Are you sure you want to permanently delete this ${itemToDelete?.type}: ${itemToDelete?.name}? This action is irreversible and will remove all related academic history.`}
        confirmText="Yes, Delete Forever"
      />
    </div>
  );
};

export default ArchiveManager;

