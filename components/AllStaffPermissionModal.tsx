import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { LeaveType } from '../types';

interface AllStaffPermissionModalProps {
    onClose: () => void;
}

const AllStaffPermissionModal: React.FC<AllStaffPermissionModalProps> = ({ onClose }) => {
    const { staffPermissions, staff, deleteStaffPermission } = useData();
    const [deletingPermissionId, setDeletingPermissionId] = useState<string | null>(null);
    const [filterName, setFilterName] = useState('');

    const permissionsWithStaff = useMemo(() => {
        return staffPermissions.map(p => {
            const staffMember = staff.find(s => s.id === p.staffId);
            return {
                ...p,
                staffName: staffMember?.name || 'Unknown Staff'
            };
        }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [staffPermissions, staff]);

    const filteredPermissions = useMemo(() => {
        if (!filterName.trim()) return permissionsWithStaff;
        return permissionsWithStaff.filter(p => p.staffName.toLowerCase().includes(filterName.toLowerCase()));
    }, [permissionsWithStaff, filterName]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">All Staff Permissions</h2>
                        <p className="text-sm text-slate-500 mt-1">Viewing leave history across all staff members</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-8 py-4 border-b border-slate-100 bg-white shrink-0">
                    <input
                        type="text"
                        placeholder="Filter by staff name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-slate-700"
                    />
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50">
                    {filteredPermissions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700">No History Found</h4>
                            <p className="text-slate-500 max-w-sm text-center">There are no permission records matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPermissions.map(p => (
                                <div key={p.id} className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex justify-between items-start cursor-default">
                                    <div className="space-y-3 w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                                                    {p.staffName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-800">{p.staffName}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${p.type === LeaveType.Annual ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    p.type === LeaveType.Personal ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        'bg-purple-100 text-purple-700 border border-purple-200'
                                                    }`}>
                                                    {p.type}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-500 flex items-center shrink-0">
                                                <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(p.startDate).toLocaleDateString()}
                                                {p.startDate !== p.endDate && <span className="ml-1 text-slate-400">to {new Date(p.endDate).toLocaleDateString()}</span>}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl text-sm leading-relaxed border border-slate-100 flex justify-between items-start">
                                            <span>{p.reason || <span className="italic text-slate-400">No specific reason provided.</span>}</span>

                                            <div className="ml-4 shrink-0">
                                                {deletingPermissionId === p.id ? (
                                                    <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
                                                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Sure?</span>
                                                        <button onClick={() => setDeletingPermissionId(null)} className="px-2 py-1 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">Cancel</button>
                                                        <button onClick={() => { deleteStaffPermission(p.id); setDeletingPermissionId(null); }} className="px-2 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-colors">Delete</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeletingPermissionId(p.id)}
                                                        className="text-red-400 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors opacity-100 sm:opacity-50 sm:hover:opacity-100 sm:group-hover:opacity-100"
                                                        title="Delete Record"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllStaffPermissionModal;
