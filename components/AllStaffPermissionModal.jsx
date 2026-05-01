import React, { useMemo, useState } from 'react';

import { useData } from '../context/DataContext';

import { LeaveType } from '../types';
import Modal from './ui/Modal';

const leaveColor = (type) => {
  switch (type) {
    case LeaveType.Annual:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case LeaveType.Personal:
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-purple-100 text-purple-700 border-purple-200';
  }
};

const AllStaffPermissionModal = ({ onClose }) => {
  const { staffPermissions, staff, deleteStaffPermission } = useData();
  const [expandedStaffId, setExpandedStaffId] = useState(null);
  const [deletingPermissionId, setDeletingPermissionId] = useState(null);

  // Group permissions by staff, only show staff who HAVE permissions
  const groupedByStaff = useMemo(() => {
    const map = new Map();
    staffPermissions.forEach(p => {
      if (!map.has(p.staffId)) {
        const staffMember = staff.find(s => s.id === p.staffId);
        map.set(p.staffId, {
          staffId: p.staffId,
          staffName: staffMember?.name || 'Unknown Staff',
          permissions: []
        });
      }
      map.get(p.staffId).permissions.push(p);
    });

    // Sort each staff's permissions by date descending
    map.forEach(entry => {
      entry.permissions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    });

    return Array.from(map.values()).sort((a, b) => a.staffName.localeCompare(b.staffName));
  }, [staffPermissions, staff]);

  const toggleExpand = (staffId) => {
    setExpandedStaffId(prev => prev === staffId ? null : staffId);
    setDeletingPermissionId(null);
  };

  return (
    <Modal
            onClose={onClose}
            title="Permission History"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-1 mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {groupedByStaff.length} staff with records
                </p>
            </div>

            <div className="overflow-y-auto grow space-y-3 max-h-[60vh] pr-1">
                {groupedByStaff.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center space-y-3 text-slate-500">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-base font-medium">No permission records yet</p>
                    </div>
                ) : (
                    groupedByStaff.map(({ staffId, staffName, permissions }) => {
                        const isExpanded = expandedStaffId === staffId;
                        // Get unique leave types for this staff
                        const uniqueTypes = [...new Set(permissions.map(p => p.type))];

                        return (
                            <div key={staffId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                {/* Compact row — tap to expand */}
                                <button
                                    onClick={() => toggleExpand(staffId)}
                                    aria-expanded={isExpanded}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <div className="h-11 w-11 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-base shrink-0">
                                            {staffName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-bold text-slate-800 dark:text-white text-base">{staffName}</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {uniqueTypes.map(type => (
                                                    <span key={type} className={`px-3 py-1 rounded-full text-xs font-bold border ${leaveColor(type)}`}>
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{permissions.length} record{permissions.length !== 1 ? 's' : ''}</span>
                                        <svg
                                            className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Expanded history */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 animate-in slide-in-from-top-1 duration-200">
                                        {permissions.map(p => (
                                            <div key={p.id} className="px-5 py-4 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/30">
                                                <div className="space-y-2 flex-1 min-w-0 pr-3">
                                                    <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${leaveColor(p.type)}`}>
                                                            {p.type}
                                                        </span>
                                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold flex items-center">
                                                            <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(p.startDate).toLocaleDateString()}
                                                            {p.startDate !== p.endDate && (
                                                                <span className="ml-1 text-slate-500">→ {new Date(p.endDate).toLocaleDateString()}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {p.reason || <span className="italic text-slate-500">No reason provided.</span>}
                                                    </p>
                                                </div>

                                                {/* Inline delete */}
                                                {deletingPermissionId === p.id ? (
                                                    <div className="flex items-center space-x-1.5 shrink-0">
                                                        <span className="text-xs font-bold text-red-600 uppercase">Sure?</span>
                                                        <button onClick={() => setDeletingPermissionId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-md transition-colors">No</button>
                                                        <button onClick={() => { deleteStaffPermission(p.id); setDeletingPermissionId(null); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">Yes</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeletingPermissionId(p.id)}
                                                        className="shrink-0 p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
    </Modal>
  );
};

export default AllStaffPermissionModal;
