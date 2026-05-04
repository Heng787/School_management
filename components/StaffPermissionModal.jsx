import React, { useState } from 'react';
import { LeaveType, UserRole } from '../types';
import { useData } from '../context/DataContext';
import Modal from './ui/Modal';

const StaffPermissionModal = ({ staff, onClose }) => {
    const { staffPermissions, addStaffPermission, deleteStaffPermission, currentUser } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState(LeaveType.Annual);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [deletingPermissionId, setDeletingPermissionId] = useState(null);
    
    // Filters
    const [filterType, setFilterType] = useState('All');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const rawPermissions = staffPermissions.filter(p => p.staffId === staff.id);
    
    const permissions = rawPermissions.filter(p => {
        if (filterType !== 'All' && p.type !== filterType) return false;
        if (filterDateStart && p.startDate < filterDateStart) return false;
        if (filterDateEnd && p.startDate > filterDateEnd) return false;
        return true;
    }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addStaffPermission({
            staffId: staff.id,
            type,
            startDate,
            endDate,
            reason,
            createdAt: new Date().toISOString()
        });
        setIsAdding(false);
        setReason('');
        setType(LeaveType.Annual);
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <Modal
            onClose={onClose}
            title="Staff Leave"
            maxWidth="max-w-xl"
        >
            <div className="space-y-1 mb-6">
                <p className="text-sm text-slate-500">
                    Managing permissions for <span className="font-semibold text-primary-600">{staff.name}</span>
                </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {!isAdding ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Permission History</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{permissions.length} total records</p>
                            </div>
                            {currentUser?.role !== UserRole.Admin && currentUser?.role !== UserRole.OfficeWorker && (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center space-x-2 shadow-md shadow-primary-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>New Request</span>
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Leave Type</label>
                                    <select 
                                        value={filterType} 
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                    >
                                        <option value="All">All Types</option>
                                        <option value={LeaveType.Annual}>Annual Leave</option>
                                        <option value={LeaveType.Personal}>Personal/Sick</option>
                                        <option value={LeaveType.NonPersonal}>Non-Personal</option>
                                    </select>
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">From</label>
                                        <input 
                                            type="date" 
                                            value={filterDateStart} 
                                            onChange={(e) => setFilterDateStart(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">To</label>
                                        <input 
                                            type="date" 
                                            value={filterDateEnd} 
                                            onChange={(e) => setFilterDateEnd(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button 
                                        onClick={() => { setFilterType('All'); setFilterDateStart(''); setFilterDateEnd(''); }}
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 underline px-2 py-1.5"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {permissions.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching records</h4>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {permissions.map(p => (
                                    <div key={p.id} className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50 hover:shadow-sm transition-all flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${p.type === LeaveType.Annual ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50' :
                                                    p.type === LeaveType.Personal ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50' :
                                                        'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50'
                                                    }`}>
                                                    {p.type}
                                                </span>
                                                <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    {formatDate(p.startDate)}
                                                    {p.startDate !== p.endDate && <span className="mx-1 text-slate-400">→</span>}
                                                    {p.startDate !== p.endDate && formatDate(p.endDate)}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 italic leading-relaxed">
                                                "{p.reason || 'No reason provided.'}"
                                            </p>
                                        </div>

                                        {deletingPermissionId === p.id ? (
                                            <div className="flex items-center space-x-2 animate-in slide-in-from-right-2 duration-200">
                                                <button
                                                    onClick={() => setDeletingPermissionId(null)}
                                                    className="p-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase"
                                                >
                                                    No
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        deleteStaffPermission(p.id);
                                                        setDeletingPermissionId(null);
                                                    }}
                                                    className="px-3 py-1.5 text-[10px] font-black text-white bg-rose-600 rounded-lg shadow-sm"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeletingPermissionId(p.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                title="Delete Record"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-2">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Submit New Request</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fill out the details for the upcoming leave.</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="leave-type" className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Type</label>
                                <div className="relative">
                                    <select
                                        id="leave-type"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 appearance-none transition-all cursor-pointer"
                                        required
                                    >
                                        <option value={LeaveType.Annual}>Annual Leave ✈️</option>
                                        <option value={LeaveType.Personal}>Personal Leave / Sick 🤒</option>
                                        <option value={LeaveType.NonPersonal}>Non-Personal Leave 📁</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="start-date" className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 transition-all cursor-pointer"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="end-date" className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 transition-all cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="leave-reason" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                                    <span>Reason / Medical Note</span>
                                    <span className="text-slate-500 font-normal text-xs uppercase tracking-wider">Required</span>
                                </label>
                                <textarea
                                    id="leave-reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide details about this leave request..."
                                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 transition-all min-h-[140px] resize-y"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200/50 transition-all active:scale-[0.98] text-center"
                                >
                                    Confirm Request
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default StaffPermissionModal;

