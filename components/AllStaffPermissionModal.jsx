import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { LeaveType } from '../types';

const leaveColor = (type) => {
    switch (type) {
        case LeaveType.Annual: return 'bg-blue-100 text-blue-700 border-blue-200';
        case LeaveType.Personal: return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-purple-100 text-purple-700 border-purple-200';
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Permission History</h2>
                        <p className="text-sm text-slate-500 mt-1">{groupedByStaff.length} staff with records</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-grow p-5 space-y-3 bg-slate-50/50">
                    {groupedByStaff.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center space-y-3 text-slate-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-base font-medium">No permission records yet</p>
                        </div>
                    ) : (
                        groupedByStaff.map(({ staffId, staffName, permissions }) => {
                            const isExpanded = expandedStaffId === staffId;
                            // Get unique leave types for this staff
                            const uniqueTypes = [...new Set(permissions.map(p => p.type))];

                            return (
                                <div key={staffId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    {/* Compact row — tap to expand */}
                                    <button
                                        onClick={() => toggleExpand(staffId)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center space-x-4 min-w-0">
                                            <div className="h-11 w-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base shrink-0">
                                                {staffName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-bold text-slate-800 text-base">{staffName}</span>
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
                                            <span className="text-sm text-slate-400 font-medium">{permissions.length} record{permissions.length !== 1 ? 's' : ''}</span>
                                            <svg
                                                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded history */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 divide-y divide-slate-100 animate-in slide-in-from-top-1 duration-200">
                                            {permissions.map(p => (
                                                <div key={p.id} className="px-5 py-4 flex items-start justify-between bg-slate-50/70">
                                                    <div className="space-y-2 flex-1 min-w-0 pr-3">
                                                        <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${leaveColor(p.type)}`}>
                                                                {p.type}
                                                            </span>
                                                            <span className="text-sm text-slate-500 font-semibold flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                {new Date(p.startDate).toLocaleDateString()}
                                                                {p.startDate !== p.endDate && (
                                                                    <span className="ml-1 text-slate-400">→ {new Date(p.endDate).toLocaleDateString()}</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 leading-relaxed">
                                                            {p.reason || <span className="italic text-slate-400">No reason provided.</span>}
                                                        </p>
                                                    </div>

                                                    {/* Inline delete */}
                                                    {deletingPermissionId === p.id ? (
                                                        <div className="flex items-center space-x-1.5 shrink-0">
                                                            <span className="text-xs font-bold text-red-600 uppercase">Sure?</span>
                                                            <button onClick={() => setDeletingPermissionId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors">No</button>
                                                            <button onClick={() => { deleteStaffPermission(p.id); setDeletingPermissionId(null); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">Yes</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeletingPermissionId(p.id)}
                                                            className="shrink-0 p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            </div>
        </div>
    );
};

export default AllStaffPermissionModal;
