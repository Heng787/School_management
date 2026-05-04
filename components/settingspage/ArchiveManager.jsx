import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import ConfirmModal from '../ConfirmModal';

const ArchiveManager = () => {
  const { 
    classes, unarchiveClass, deleteClass,
    students, unarchiveStudent, deleteStudent,
    staff, unarchiveStaff, deleteStaff
  } = useData();

  const [activeTab, setActiveTab] = useState('classes');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Filter archived items
  const archivedClasses = classes.filter((cls) => cls.isArchived === true);
  const archivedStudents = students.filter((stu) => stu.isArchived === true);
  const archivedStaff = staff.filter((s) => s.isArchived === true);

  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'class') {
        await deleteClass(itemToDelete.id);
      } else if (itemToDelete.type === 'student') {
        await deleteStudent(itemToDelete.id);
      } else if (itemToDelete.type === 'staff') {
        await deleteStaff(itemToDelete.id);
      }
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
    } catch (err) {
      alert('Failed to delete permanently: ' + err.message);
    }
  };

  const renderArchiveList = (items, type) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            No {type}s are currently archived.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-slate-200 dark:hover:border-slate-600 transition-colors gap-4"
          >
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                {item.name}
              </h3>
              <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-xs font-semibold">
                  ID: {item.id}
                </span>
                {item.level && (
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-xs font-semibold">
                    {item.level}
                  </span>
                )}
                {item.role && (
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-xs font-semibold">
                    {item.role}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (type === 'class') unarchiveClass(item.id);
                  if (type === 'student') unarchiveStudent(item.id);
                  if (type === 'staff') unarchiveStaff(item.id);
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl font-bold text-sm transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => handleDeleteClick(item, type)}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-bold text-sm transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
          System Archive
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          View and restore archived records. Permanently deleting here is irreversible.
        </p>
      </div>

      {/* Internal Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 w-fit">
        {[
          { id: 'classes', label: 'Classes', count: archivedClasses.length },
          { id: 'students', label: 'Students', count: archivedStudents.length },
          { id: 'staff', label: 'Staff', count: archivedStaff.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'classes' && renderArchiveList(archivedClasses, 'class')}
        {activeTab === 'students' && renderArchiveList(archivedStudents, 'student')}
        {activeTab === 'staff' && renderArchiveList(archivedStaff, 'staff')}
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Permanently"
        message={`Are you sure you want to permanently delete this ${itemToDelete?.type}: ${itemToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ArchiveManager;
