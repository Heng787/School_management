/**
 * context/DataContext.jsx
 * Global state provider using React Context API.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserRole } from '../types';
import { apiService } from '../services/apiService';
import { localStore } from '../services/core';

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
    // --- 1. CORE DATA STATE ---
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [classes, setClasses] = useState([]);
    const [events, setEvents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    // --- 2. FACILITY & OPERATIONS STATE ---
    const [staffPermissions, setStaffPermissions] = useState([]);
    const [dailyLogs, setDailyLogs] = useState([]);
    const [incidentReports, setIncidentReports] = useState([]);
    const [roomStatuses, setRoomStatuses] = useState([]);

    // --- 3. CONFIGURATION STATE ---
    const [subjects, setSubjects] = useState([]);
    const [levels, setLevels] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [adminPassword, setAdminPasswordState] = useState('admin123');

    // --- 4. SYSTEM & UI STATE ---
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [error, setErrorState] = useState(null);

    const setError = useCallback((err) => {
        let message = 'An unknown error occurred.';
        if (typeof err === 'string') {
            message = err;
        } else if (err instanceof Error) {
            message = err.message;
        } else if (err && typeof err === 'object' && err.message) {
            message = err.message;
        }
        setErrorState(message);
        // Optionally, clear the error after some time
        setTimeout(() => setErrorState(null), 7000);
    }, []);
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('school_admin_currentUser');
            if (saved) {
                const user = JSON.parse(saved);
                if (user.role === UserRole.Admin && (user.name === 'Demo User' || user.name === 'Demo Admin')) {
                    user.name = 'Administrator';
                }
                return user;
            }
            return null;
        } catch { return null; }
    });
    const [highlightedStudentId, setHighlightedStudentId] = useState(null);
    const [highlightedStaffId, setHighlightedStaffId] = useState(null);
    const [highlightedClassId, setHighlightedClassId] = useState(null);

    // --- 5. INITIAL DATA LOAD ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [s, st, c, e, g, att, enr, sub, pwd, slots, lvls, sp, logs, reports, rooms] = await Promise.all([
                    apiService.getStudents(),
                    apiService.getStaff(),
                    apiService.getClasses(),
                    apiService.getEvents(),
                    apiService.getGrades(),
                    apiService.getAttendance(),
                    apiService.getEnrollments(),
                    apiService.getSubjects(),
                    apiService.getAdminPassword(),
                    apiService.getTimeSlots(),
                    apiService.getLevels(),
                    apiService.getStaffPermissions(),
                    apiService.getDailyLogs(),
                    apiService.getIncidentReports(),
                    apiService.getRoomStatuses()
                ]);
                setStudents(s);
                setStaff(st);
                setClasses(c);
                setEvents(e);
                setGrades(g);
                setAttendance(att);
                setEnrollments(enr);
                setSubjects(sub);
                setAdminPasswordState(pwd);
                setTimeSlots(slots);
                setLevels(lvls);
                setStaffPermissions(sp);
                setDailyLogs(logs);
                setIncidentReports(reports);
                setRoomStatuses(rooms);

                if (navigator.onLine) setLastSyncedAt(new Date());
            } catch (err) {
                console.error('Initial load error:', err);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // --- 6. SYCHRONIZATION ENGINE ---
    const isSyncingRef = useRef(false);

    const triggerSync = useCallback(async () => {
        if (!navigator.onLine || isSyncingRef.current || loading) return;

        isSyncingRef.current = true;
        setIsSyncing(true);

        try {
            await apiService.syncAll({
                students,
                staff,
                staffPermissions,
                classes,
                events,
                grades,
                attendance,
                enrollments,
                dailyLogs,
                incidentReports,
                roomStatuses,
                config: [
                    { key: 'subjects', value: subjects },
                    { key: 'levels', value: levels },
                    { key: 'time_slots', value: timeSlots },
                    { key: 'admin_password', value: adminPassword }
                ]
            });

            setLastSyncedAt(new Date());
            setError(null);
        } catch (err) {
            console.error('Sync failed:', err);
            setError('Sync failed. Some data may not be backed up.');
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, [students, staff, classes, events, grades, attendance, enrollments, subjects, levels, timeSlots, adminPassword, loading, staffPermissions, dailyLogs, incidentReports, roomStatuses]);

    useEffect(() => {
        const handleOnline = () => triggerSync();
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [triggerSync]);

    const performUpdate = async (saveFn, setFn, updateFn) => {
        return new Promise((resolve, reject) => {
            setFn(prev => {
                const nextData = updateFn(prev);
                saveFn(nextData)
                    .then(resolve)
                    .catch(err => {
                        console.error('Background save failed:', err);
                        setError(`Save failed: ${err.message || err}. Changes kept locally.`);
                        reject(err);
                    });
                return nextData;
            });
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerSync();
        }, 500); 
        return () => clearTimeout(timer);
    }, [students, staff, staffPermissions, dailyLogs, incidentReports, roomStatuses, classes, events, grades, attendance, enrollments, subjects, levels, timeSlots, triggerSync]);

    // --- PERIODIC REMOTE REFRESH ---
    // Pull fresh data from Supabase periodically so that changes made in other
    // browser sessions (e.g. Brave vs Edge) are reflected without a page reload.
    useEffect(() => {
        if (loading) return;

        const refreshFromRemote = async () => {
            if (!navigator.onLine || isSyncingRef.current) return;
            
            try {
                const tablesToRefresh = [
                    { table: 'enrollments', setter: setEnrollments, fetcher: apiService.getEnrollments },
                    { table: 'classes', setter: setClasses, fetcher: apiService.getClasses },
                    { table: 'students', setter: setStudents, fetcher: apiService.getStudents },
                    { table: 'grades', setter: setGrades, fetcher: apiService.getGrades },
                    { table: 'attendance', setter: setAttendance, fetcher: apiService.getAttendance },
                ];

                for (const { table, setter, fetcher } of tablesToRefresh) {
                    if (!localStore.isDirty(table)) {
                        const freshData = await fetcher();
                        setter(prev => {
                            // Deep equality check to avoid redundant renders
                            if (JSON.stringify(prev) !== JSON.stringify(freshData)) {
                                console.log(`[Sync] Background update: ${table} (${freshData.length} records)`);
                                return freshData;
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {
                // Silent fail - this is a background refresh
                console.debug('Remote refresh skipped:', err.message);
            }
        };

        const intervalId = setInterval(refreshFromRemote, 15000); // every 15 seconds
        
        // --- INSTANT CROSS-TAB SYNC ---
        // When another tab saves to localStore, this tab gets a 'storage' event.
        // We trigger a remote refresh to ensure we're looking at the latest ground truth.
        const handleStorageChange = (e) => {
            if (e.key && e.key.startsWith('school_admin_')) {
                // If it's a dirty flag change or a data change, trigger background refresh
                refreshFromRemote();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loading]);

    // --- 7. STUDENT MANAGEMENT ---
    const addStudents = (newStudentsData) =>
        performUpdate((data) => apiService.saveStudents(data), setStudents, (current) => {
            let lastId = current.map(s => parseInt(s.id.substring(1), 10)).filter(id => !isNaN(id)).reduce((max, curr) => Math.max(max, curr), 0);
            const newOnes = newStudentsData.map(data => ({ ...data, id: `s${++lastId}` }));
            return [...current, ...newOnes];
        });

    const addStudent = (data) => addStudents([data]);
    const updateStudent = (updated) => performUpdate((data) => apiService.saveStudents(data), setStudents, (prev) => prev.map(s => s.id === updated.id ? updated : s));
    const updateStudentsBatch = (updatedList) =>
        performUpdate((data) => apiService.saveStudents(data), setStudents, (prev) => {
            const updatedMap = new Map(updatedList.map(s => [s.id, s]));
            return prev.map(s => updatedMap.has(s.id) ? updatedMap.get(s.id) : s);
        });
    const deleteStudent = async (id) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        try {
            await apiService.deleteRecord('students', id);
            if (navigator.onLine) setLastSyncedAt(new Date());
        } catch (err) {
            console.error('Failed to delete student from Supabase:', err);
            // Re-add the student to local state if Supabase deletion fails
            // This is a temporary measure, the real fix might be in core.js's deleted_queue handling
            // For now, re-throwing for better error propagation to UI
            throw err;
        }
    };

    // --- 8. STAFF MANAGEMENT ---
    const addStaffBatch = (newData) =>
        performUpdate((data) => apiService.saveStaff(data), setStaff, (current) => {
            const newItems = newData.map((data, idx) => {
                const shortName = data.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff';
                const suffix = Date.now().toString().slice(-3) + idx;
                return { ...data, id: `${shortName}_${suffix}` };
            });
            return [...current, ...newItems];
        });
    const addStaff = (data) => addStaffBatch([data]);
    const updateStaff = (updated) => performUpdate((data) => apiService.saveStaff(data), setStaff, (prev) => prev.map(s => s.id === updated.id ? updated : s));
    const deleteStaff = async (id) => {
        setStaff(prev => prev.filter(s => s.id !== id));
        try {
            await apiService.deleteRecord('staff', id);
            if (navigator.onLine) setLastSyncedAt(new Date());
        } catch (err) {}
    };

    // --- 9. CLASS & ENROLLMENT MANAGEMENT ---
    const addClass = (data) => performUpdate((d) => apiService.saveClasses(d), setClasses, (prev) => [...prev, { ...data, id: data.id || `class_${Date.now()}` }]);
    const addClasses = (data) => performUpdate((d) => apiService.saveClasses(d), setClasses, (prev) => [...prev, ...data.map((d, i) => ({ ...d, id: `class_${Date.now()}_${i}` }))]);
    const updateClass = (updated) => performUpdate((d) => apiService.saveClasses(d), setClasses, (prev) => prev.map(c => c.id === updated.id ? updated : c));
    const deleteClass = async (id) => {
        setClasses(prev => prev.filter(c => c.id !== id));
        try {
            await apiService.deleteRecord('classes', id);
            if (navigator.onLine) setLastSyncedAt(new Date());
        } catch (err) {}
    };

    const addEnrollment = (data) => performUpdate((d) => apiService.saveEnrollments(d), setEnrollments, (prev) => [...prev, { ...data, id: `enr_${Date.now()}` }]);
    const addEnrollments = (data) => performUpdate((d) => apiService.saveEnrollments(d), setEnrollments, (prev) => [...prev, ...data.map((enr, i) => ({ ...enr, id: `enr_${Date.now()}_${i}` }))]);
    const deleteEnrollment = (id) => {
        setEnrollments(prev => prev.filter(e => e.id !== id));
        apiService.deleteRecord('enrollments', id).catch(() => {});
    };

    const updateClassEnrollments = async (classId, studentIds) => {
        const academicYear = new Date().getFullYear().toString();
        
        try {
            // 1. Fetch the absolute latest enrollments from the cloud to avoid stale state issues
            const latestEnrollments = await apiService.getEnrollments();
            
            // 2. Identify enrollments for THIS class that are NOT in the new list
            const enrollmentsToDelete = latestEnrollments.filter(e => 
                e.classId === classId && !studentIds.includes(e.studentId)
            );
            
            // 3. Process deletions in parallel for efficiency
            if (enrollmentsToDelete.length > 0) {
                console.log(`Cleaning up ${enrollmentsToDelete.length} removed enrollments for class ${classId} in parallel...`);
                await Promise.all(enrollmentsToDelete.map(enr => apiService.deleteRecord('enrollments', enr.id)));
            }

            const newEnrollments = studentIds.map(sid => ({
                id: `enr_${classId}_${sid}`, // Deterministic ID
                classId,
                studentId: sid,
                academicYear
            }));

            // 4. Update local state and upsert to Supabase
            // performUpdate will take care of updating 'enrollments' state and pushing to DB
            return await performUpdate(
                (d) => apiService.saveEnrollments(d),
                setEnrollments,
                (prev) => {
                    // Filter out ALL old enrollments for this class from state
                    const otherEnrollments = prev.filter(e => e.classId !== classId);
                    return [...otherEnrollments, ...newEnrollments];
                }
            );
        } catch (err) {
            console.error('Safe enrollment update failed:', err);
            throw err;
        }
    };
    // --- 10. ACADEMIC RECORDS (GRADES & ATTENDANCE) ---
    const addGrade = (data) => performUpdate((d) => apiService.saveGrades(d), setGrades, (prev) => [...prev, { ...data, id: `grade_${Date.now()}` }]);
    const updateGrade = (updated) => performUpdate((d) => apiService.saveGrades(d), setGrades, (prev) => prev.map(g => g.id === updated.id ? updated : g));
    const saveGradeBatch = (records) => performUpdate((d) => apiService.saveGrades(d), setGrades, (prev) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        return [...prev.filter(r => !updatedMap.has(r.id)), ...records];
    });
    const deleteGrade = async (id) => {
        setGrades(prev => prev.filter(g => g.id !== id));
        try {
            await apiService.deleteRecord('grades', id);
        } catch (err) { }
    };

    const addAttendance = (data) => performUpdate((d) => apiService.saveAttendance(d), setAttendance, (prev) => [...prev, { ...data, id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }]);
    const updateAttendance = (updated) => performUpdate((d) => apiService.saveAttendance(d), setAttendance, (prev) => prev.map(a => a.id === updated.id ? updated : a));
    const saveAttendanceBatch = (records) => performUpdate((d) => apiService.saveAttendance(d), setAttendance, (prev) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        return [...prev.filter(r => !updatedMap.has(r.id)), ...records];
    });
    const deleteAttendance = async (id) => {
        setAttendance(prev => prev.filter(a => a.id !== id));
        try {
            await apiService.deleteRecord('attendance', id);
        } catch (err) { }
    };

    // --- 11. OPERATIONS (LOGS, INCIDENTS, ROOMS) ---
    const addStaffPermission = (data) => performUpdate((d) => apiService.saveStaffPermissions(d), setStaffPermissions, (prev) => [...prev, { ...data, id: `perm_${Date.now()}` }]);
    const updateStaffPermission = (updated) => performUpdate((d) => apiService.saveStaffPermissions(d), setStaffPermissions, (prev) => prev.map(p => p.id === updated.id ? updated : p));
    const deleteStaffPermission = async (id) => {
        setStaffPermissions(prev => prev.filter(p => p.id !== id));
        try {
            await apiService.deleteRecord('staff_permissions', id);
        } catch (err) { }
    };

    const addDailyLog = (data) => performUpdate((d) => apiService.saveDailyLogs(d), setDailyLogs, (prev) => [...prev, { ...data, id: `log_${Date.now()}` }]);
    const addIncidentReport = (data) => performUpdate((d) => apiService.saveIncidentReports(d), setIncidentReports, (prev) => [...prev, { ...data, id: `inc_${Date.now()}` }]);
    const updateRoomStatus = (updated) => performUpdate((d) => apiService.saveRoomStatuses(d), setRoomStatuses, (prev) => {
        const exists = prev.find(s => s.id === updated.id);
        if (exists) return prev.map(s => s.id === updated.id ? updated : s);
        return [...prev, updated];
    });

    // --- 12. ACADEMIC CONFIG & EVENTS ---
    const addEvent = (data) => performUpdate((d) => apiService.saveEvents(d), setEvents, (prev) => [...prev, { ...data, id: `evt_${Date.now()}` }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    const updateEvent = (updated) => performUpdate((d) => apiService.saveEvents(d), setEvents, (prev) => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    const deleteEvent = async (id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        try {
            await apiService.deleteRecord('events', id);
        } catch (err) {}
    };

    const addSubject = (subject) => performUpdate((d) => apiService.saveSubjects(d), setSubjects, (prev) => [...new Set([...prev, subject])].sort());
    const updateSubject = async (old, next) => {
        const nextSubs = subjects.map(s => s === old ? next : s);
        const nextStaff = staff.map(s => s.subject === old ? { ...s, subject: next } : s);
        setSubjects(nextSubs);
        setStaff(nextStaff);
        try { await Promise.all([apiService.saveSubjects(nextSubs), apiService.saveStaff(nextStaff)]); } catch (e) { }
    };
    const deleteSubject = async (target) => {
        const nextSubs = subjects.filter(s => s !== target);
        const nextStaff = staff.map(s => s.subject === target ? { ...s, subject: '' } : s);
        setSubjects(nextSubs);
        setStaff(nextStaff);
        try { await Promise.all([apiService.saveSubjects(nextSubs), apiService.saveStaff(nextStaff)]); } catch (e) { }
    };

    const addLevel = (level) => performUpdate((d) => apiService.saveLevels(d), setLevels, (prev) => [...new Set([...prev, level])]);
    const updateLevel = async (old, next) => {
        const nextLevels = levels.map(l => l === old ? next : l);
        const nextStudents = students.map(s => s.level === old ? { ...s, level: next } : s);
        const nextClasses = classes.map(c => c.level === old ? { ...c, level: next } : c);
        setLevels(nextLevels);
        setStudents(nextStudents);
        setClasses(nextClasses);
        try { await Promise.all([apiService.saveLevels(nextLevels), apiService.saveStudents(nextStudents), apiService.saveClasses(nextClasses)]); } catch (e) { }
    };
    const deleteLevel = (target) => performUpdate(apiService.saveLevels, setLevels, (prev) => prev.filter(l => l !== target));

    const addTimeSlot = (slot) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => [...prev, { ...slot, id: `slot_${Date.now()}` }]);
    const updateTimeSlot = (id, updatedSlot) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => prev.map(s => s.id === id ? { ...s, ...updatedSlot } : s));
    const deleteTimeSlot = (id) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => prev.filter(s => s.id !== id));

    const setAdminPassword = async (pwd) => {
        setAdminPasswordState(pwd);
        await apiService.saveAdminPassword(pwd);
    };

    // --- 13. DATA IMPORT & AUTH ---
    const importAllData = async (data) => {
        setLoading(true);
        try {
            await apiService.importAllData(data);
            setStudents(data.students || []);
            setStaff(data.staff || []);
            setStaffPermissions(data.staffPermissions || []);
            setClasses(data.classes || []);
            setEvents(data.events || []);
            setSubjects(data.subjects || []);
            setLevels(data.levels || []);
            setTimeSlots(data.timeSlots || []);
            setAdminPasswordState(data.adminPassword || 'admin123');
            setLastSyncedAt(new Date());
        } finally {
            setLoading(false);
        }
    };

    const handleSetCurrentUser = useCallback((user) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem('school_admin_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('school_admin_currentUser');
        }
    }, []);

    const value = {
        students, staff, classes, events, grades, attendance, enrollments, staffPermissions, dailyLogs, incidentReports, roomStatuses, subjects, levels, timeSlots, adminPassword,
        loading, isSyncing, lastSyncedAt, error, currentUser, setCurrentUser: handleSetCurrentUser, highlightedStudentId, setHighlightedStudentId,
        highlightedStaffId, setHighlightedStaffId, highlightedClassId, setHighlightedClassId,
        addStudent, addStudents, updateStudent, updateStudentsBatch, deleteStudent,
        addStaff, addStaffBatch, updateStaff, deleteStaff,
        addClass, addClasses, updateClass, deleteClass,
        addGrade, updateGrade, saveGradeBatch, deleteGrade,
        addAttendance, updateAttendance, saveAttendanceBatch, deleteAttendance,
        addStaffPermission, updateStaffPermission, deleteStaffPermission,
        addDailyLog, addIncidentReport, updateRoomStatus,
        addEnrollment, addEnrollments, deleteEnrollment, updateClassEnrollments,
        addEvent, updateEvent, deleteEvent,
        addSubject, updateSubject, deleteSubject,
        addLevel, updateLevel, deleteLevel,
        addTimeSlot, updateTimeSlot, deleteTimeSlot, setAdminPassword,
        importAllData, triggerSync
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
