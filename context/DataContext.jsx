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
    const [draftGrades, setDraftGrades] = useState(() => localStore.get('draft_grades', []));
    const [attendance, setAttendance] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [staffPermissions, setStaffPermissions] = useState([]);
    const [subjects, setSubjects] = useState({ Kid: [], JuniorSenior: [] });
    const [levels, setLevels] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [adminPassword, setAdminPasswordState] = useState('admin123');


    // --- 3. CONFIGURATION STATE ---

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
                const [s, st, c, e, g, att, enr, sp, sub, lvls, slots, pwd] = await Promise.all([
                    apiService.getStudents(),
                    apiService.getStaff(),
                    apiService.getClasses(),
                    apiService.getEvents(),
                    apiService.getGrades(),
                    apiService.getAttendance(),
                    apiService.getEnrollments(),
                    apiService.getStaffPermissions(),
                    apiService.getSubjects(),
                    apiService.getLevels(),
                    apiService.getTimeSlots(),
                    apiService.getAdminPassword()
                ]);
                if (s) setStudents(s);
                if (st) setStaff(st);
                if (c) setClasses(c);
                const fetchedEvents = e || [];
                const baseHolidays = [
                    { title: 'International New Year’s Day', datePattern: '-01-01', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Victory over Genocide Day', datePattern: '-01-07', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'International Women’s Day', datePattern: '-03-08', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Khmer New Year (Chol Chnam Thmey)', datePattern: '-04-14', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Khmer New Year (Chol Chnam Thmey)', datePattern: '-04-15', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Khmer New Year (Chol Chnam Thmey)', datePattern: '-04-16', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'International Labor Day', datePattern: '-05-01', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Royal Ploughing Ceremony', datePattern: '-05-05', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'King Norodom Sihamoni’s Birthday', datePattern: '-05-14', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Visak Bochea Day', datePattern: '-05-22', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Queen Mother Norodom Monineath Sihanouk’s Birthday', datePattern: '-06-18', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Constitution Day', datePattern: '-09-24', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Pchum Ben Festival', datePattern: '-10-10', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Pchum Ben Festival', datePattern: '-10-11', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Pchum Ben Festival', datePattern: '-10-12', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Commemoration Day of the late King Father', datePattern: '-10-15', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'King Norodom Sihamoni’s Coronation Day', datePattern: '-10-29', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Independence Day', datePattern: '-11-09', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Water Festival', datePattern: '-11-23', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Water Festival', datePattern: '-11-24', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Water Festival', datePattern: '-11-25', type: 'Holiday', description: 'Public Holiday' },
                    { title: 'Peace Day', datePattern: '-12-29', type: 'Holiday', description: 'Public Holiday' }
                ];
                
                const seedHolidays = [];
                for (let y = 2024; y <= 2030; y++) {
                    baseHolidays.forEach((bh, i) => {
                        seedHolidays.push({
                            id: `hol_${y}_${i}`,
                            title: bh.title,
                            date: `${y}${bh.datePattern}`,
                            type: bh.type,
                            description: bh.description
                        });
                    });
                }
                
                const missingHolidays = seedHolidays.filter(sh => !fetchedEvents.some(ce => ce.title === sh.title && ce.date === sh.date));
                if (missingHolidays.length > 0) {
                    const newEventsList = [...fetchedEvents, ...missingHolidays];
                    setEvents(newEventsList);
                    apiService.saveEvents(newEventsList).catch(console.error);
                } else {
                    setEvents(fetchedEvents);
                }
                if (g) setGrades(g);
                if (att) setAttendance(att);
                if (enr) setEnrollments(enr);
                if (sp) setStaffPermissions(sp);
                if (sub) {
                    if (Array.isArray(sub)) {
                        setSubjects({ Kid: [], JuniorSenior: sub });
                    } else {
                        setSubjects({ Kid: [], JuniorSenior: [], ...sub });
                    }
                }
                if (lvls) setLevels(lvls);
                if (slots) setTimeSlots(slots);
                if (pwd) setAdminPasswordState(pwd);

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
    }, [students, staff, classes, events, grades, attendance, enrollments, subjects, levels, timeSlots, adminPassword, loading, staffPermissions]);

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
    }, [students, staff, staffPermissions, classes, events, grades, attendance, enrollments, subjects, levels, timeSlots, triggerSync]);

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
            let lastIdInt = current.map(s => parseInt(s.id.substring(1), 10)).filter(id => !isNaN(id)).reduce((max, curr) => Math.max(max, curr), 0);
            const newOnes = newStudentsData.map((data, i) => {
                if (data.id && !data.id.startsWith('stu_imp_')) return data;
                return { ...data, id: `s${++lastIdInt}` };
            });
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
        // 1. Update Students
        setStudents(prev => prev.filter(s => s.id !== id));
        
        // 2. Cleanup Related Records (Cascade)
        setEnrollments(prev => prev.filter(e => e.studentId !== id));
        setAttendance(prev => prev.filter(a => a.studentId !== id));
        setGrades(prev => prev.filter(g => g.studentId !== id));

        try {
            await apiService.deleteRecord('students', id);
            if (navigator.onLine) setLastSyncedAt(new Date());
        } catch (err) {
            console.error('Failed to delete student from Supabase:', err);
            throw err;
        }
    };

    // --- 8. STAFF MANAGEMENT ---
    const addStaffBatch = (newData) =>
        performUpdate((data) => apiService.saveStaff(data), setStaff, (current) => {
            const newItems = newData.map((data, idx) => {
                if (data.id) return data;
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
    const addClass = (data) => addClasses([data]);
    const addClasses = (data) => performUpdate((d) => apiService.saveClasses(d), setClasses, (prev) => {
        const newItems = data.map((d, i) => ({ 
            ...d, 
            id: (d.id && !d.id.startsWith('cls_')) ? d.id : `class_${Date.now()}_${i}` 
        }));
        return [...prev, ...newItems];
    });
    const updateClass = (updated) => updateClassesBatch([updated]);
    const updateClassesBatch = (records) => performUpdate((d) => apiService.saveClasses(d), setClasses, (prev) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        return prev.map(c => updatedMap.has(c.id) ? updatedMap.get(c.id) : c);
    });
    const deleteClass = async (id) => {
        // 1. Update Classes
        setClasses(prev => prev.filter(c => c.id !== id));

        // 2. Cleanup Related Records (Cascade)
        setEnrollments(prev => prev.filter(e => e.classId !== id));
        setAttendance(prev => prev.filter(a => a.classId !== id));
        setGrades(prev => prev.filter(g => g.classId !== id));

        try {
            await apiService.deleteRecord('classes', id);
            if (navigator.onLine) setLastSyncedAt(new Date());
        } catch (err) {
            console.error('Failed to delete class from Supabase:', err);
        }
    };

    const addEnrollment = (data) => addEnrollments([data]);
    const addEnrollments = (data) => performUpdate((d) => apiService.saveEnrollments(d), setEnrollments, (prev) => {
        // Prevent duplicates in the state before adding
        const existingMap = new Set(prev.map(e => `${e.studentId}|${e.classId}`));
        const newOnes = data
            .map((enr, i) => ({ 
                ...enr, 
                id: enr.id || `enr_${Date.now()}_${i}` 
            }))
            .filter(enr => !existingMap.has(`${enr.studentId}|${enr.classId}`));
        return [...prev, ...newOnes];
    });
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
    const saveDraftGradeBatch = (records) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        setDraftGrades((prev) => {
            const newDrafts = [...prev.filter(r => !updatedMap.has(r.id)), ...records];
            localStore.set('draft_grades', newDrafts);
            return newDrafts;
        });
    };
    const publishClassGrades = async (classId) => {
        const draftsToPublish = draftGrades.filter(g => g.classId === classId);
        if (draftsToPublish.length === 0) return;
        
        await saveGradeBatch(draftsToPublish);
        
        setDraftGrades((prev) => {
            const newDrafts = prev.filter(g => g.classId !== classId);
            localStore.set('draft_grades', newDrafts);
            return newDrafts;
        });
    };
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

    // Operations & Facility management are currently disabled due to missing database tables.

    // --- 12. ACADEMIC CONFIG & EVENTS ---
    const addEvent = (data) => performUpdate((d) => apiService.saveEvents(d), setEvents, (prev) => [...prev, { ...data, id: `evt_${Date.now()}` }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    const updateEvent = (updated) => performUpdate((d) => apiService.saveEvents(d), setEvents, (prev) => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    const deleteEvent = async (id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        try {
            await apiService.deleteRecord('events', id);
        } catch (err) {}
    };

    const addSubject = (subject, category = 'JuniorSenior') => performUpdate((d) => apiService.saveSubjects(d), setSubjects, (prev) => {
        const next = { ...prev };
        if (!next[category]) next[category] = [];
        next[category] = [...new Set([...next[category], subject])].sort();
        return next;
    });
    const updateSubject = async (old, next) => {
        const nextSubs = { ...subjects };
        Object.keys(nextSubs).forEach(cat => {
            nextSubs[cat] = nextSubs[cat].map(s => s === old ? next : s);
        });
        const nextStaff = staff.map(s => s.subject === old ? { ...s, subject: next } : s);
        setSubjects(nextSubs);
        setStaff(nextStaff);
        try { await Promise.all([apiService.saveSubjects(nextSubs), apiService.saveStaff(nextStaff)]); } catch (e) { }
    };
    const deleteSubject = async (target) => {
        const nextSubs = { ...subjects };
        Object.keys(nextSubs).forEach(cat => {
            nextSubs[cat] = nextSubs[cat].filter(s => s !== target);
        });
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

    const addTimeSlot = (slot) => addTimeSlotsBatch([slot]);
    const addTimeSlotsBatch = (records) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => {
        const newItems = records.map((r, i) => ({ ...r, id: r.id || `slot_${Date.now()}_${i}` }));
        return [...prev, ...newItems];
    });
    const updateTimeSlot = (id, updatedSlot) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => prev.map(s => s.id === id ? { ...s, ...updatedSlot } : s));
    const deleteTimeSlot = (id) => performUpdate((d) => apiService.saveTimeSlots(d), setTimeSlots, (prev) => prev.filter(s => s.id !== id));

    const setAdminPassword = async (pwd) => {
        setAdminPasswordState(pwd);
        await apiService.saveAdminPassword(pwd);
    };

    // --- 13. DATA IMPORT, AUTH & RESET ---
    /**
     * Deletes all core school data (students, staff, classes, grades,
     * enrollments, attendance) from both local state and Supabase.
     */
    const deleteAllData = async () => {
        const tables = [
            { name: 'students',   setter: setStudents },
            { name: 'staff',      setter: setStaff },
            { name: 'classes',    setter: setClasses },
            { name: 'grades',     setter: setGrades },
            { name: 'enrollments',setter: setEnrollments },
            { name: 'attendance', setter: setAttendance },
        ];

        // 1. Clear local state and localStorage immediately
        tables.forEach(({ name, setter }) => {
            setter([]);
            localStorage.removeItem(`school_admin_${name}`);
            localStorage.removeItem(`school_admin_${name}_dirty`);
        });
        // Clear the deleted_queue so stale IDs don't linger
        localStorage.removeItem('school_admin_deleted_queue');

        // 2. Wipe from Supabase
        const client = (await import('../services/core')).getSupabase();
        if (client && navigator.onLine) {
            await Promise.allSettled(
                tables.map(({ name }) =>
                    client.from(name).delete().neq('id', '__nonexistent__')
                )
            );
        }
        setLastSyncedAt(new Date());
    };

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
        students, staff, classes, events, grades, draftGrades, attendance, enrollments, staffPermissions, subjects, levels, timeSlots, adminPassword,
        loading, isSyncing, lastSyncedAt, error, currentUser, setCurrentUser: handleSetCurrentUser, highlightedStudentId, setHighlightedStudentId,
        highlightedStaffId, setHighlightedStaffId, highlightedClassId, setHighlightedClassId,
        addStudent, addStudents, updateStudent, updateStudentsBatch, deleteStudent,
        addStaff, addStaffBatch, updateStaff, deleteStaff,
        addClass, addClasses, updateClass, updateClassesBatch, deleteClass,
        addGrade, updateGrade, saveGradeBatch, saveDraftGradeBatch, publishClassGrades, deleteGrade,
        addAttendance, updateAttendance, saveAttendanceBatch, deleteAttendance,
        addStaffPermission, updateStaffPermission, deleteStaffPermission,
        addEnrollment, addEnrollments, deleteEnrollment, updateClassEnrollments,
        addEvent, updateEvent, deleteEvent,
        addSubject, updateSubject, deleteSubject,
        addLevel, updateLevel, deleteLevel,
        addTimeSlot, addTimeSlotsBatch, updateTimeSlot, deleteTimeSlot, setAdminPassword,
        importAllData, deleteAllData, triggerSync
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
