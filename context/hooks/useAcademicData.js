import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { localStore } from '../../services/core';
import { performDataUpdate } from '../../utils/dataUtils';

/**
 * Hook to manage academic data (classes, enrollments, grades, attendance).
 * Optimized for pure local operation with maximum resilience.
 */
export const useAcademicData = (setError) => {
    const [classes, setClasses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [draftGrades, setDraftGrades] = useState(() => localStore.get('draft_grades', []));
    const [draftAttendance, setDraftAttendance] = useState(() => localStore.get('draft_attendance', []));

    // --- Class Operations ---
    const addClasses = useCallback((data) =>
        performDataUpdate(
            (d) => apiService.saveClasses(d),
            setClasses,
            (prev) => {
                const newItems = data.map((d, i) => ({ 
                    ...d, 
                    id: (d.id && d.id.length > 5) ? d.id : `class_${Date.now()}_${i}` 
                }));
                return [...prev, ...newItems];
            },
            (err) => setError(`Class save failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const addClass = useCallback((data) => addClasses([data]), [addClasses]);

    const updateClassesBatch = useCallback((records) =>
        performDataUpdate(
            (d) => apiService.saveClasses(d),
            setClasses,
            (prev) => {
                const updatedMap = new Map(records.map(r => [r.id, r]));
                return prev.map(c => updatedMap.has(c.id) ? updatedMap.get(c.id) : c);
            },
            (err) => setError(`Class update failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const updateClass = useCallback((updated) => updateClassesBatch([updated]), [updateClassesBatch]);

    const deleteClass = useCallback(async (id) => {
        if (!id) return;

        // Instant UI update
        setClasses(prev => prev.filter(c => c.id !== id));
        
        // Also remove enrollments from current view (optional but cleaner)
        // Note: We are NOT deleting the student record, just their link to this class.
        setEnrollments(prev => prev.filter(e => e.classId !== id));

        try {
            await apiService.deleteRecord('classes', id);
        } catch (err) {
            console.error('Delete class failed:', err);
            setError(`Failed to delete class: ${err?.message || 'Local storage error'}`);
        }
    }, [setError]);

    // --- Enrollment Operations ---
    const addEnrollments = useCallback((data) =>
        performDataUpdate(
            (d) => apiService.saveEnrollments(d),
            setEnrollments,
            (prev) => {
                const existingMap = new Set(prev.map(e => `${e.studentId}|${e.classId}`));
                const newOnes = data
                    .map((enr, i) => ({ 
                        ...enr, 
                        id: enr.id || `enr_${Date.now()}_${i}` 
                    }))
                    .filter(enr => !existingMap.has(`${enr.studentId}|${enr.classId}`));
                return [...prev, ...newOnes];
            },
            (err) => setError(`Enrollment save failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const addEnrollment = useCallback((data) => addEnrollments([data]), [addEnrollments]);

    const deleteEnrollment = useCallback(async (id) => {
        setEnrollments(prev => prev.filter(e => e.id !== id));
        try {
            await apiService.deleteRecord('enrollments', id);
        } catch (err) {
            setError(`Failed to delete enrollment: ${err.message || 'Unknown error'}`);
        }
    }, [setError]);

    const updateClassEnrollments = useCallback(async (classId, studentIds) => {
        const academicYear = new Date().getFullYear().toString();
        try {
            // Filter local state directly for speed
            const enrollmentsToDelete = enrollments.filter(e => 
                e.classId === classId && !studentIds.includes(e.studentId)
            );
            
            if (enrollmentsToDelete.length > 0) {
                await Promise.all(enrollmentsToDelete.map(enr => apiService.deleteRecord('enrollments', enr.id)));
            }

            const newEnrollments = studentIds.map(sid => ({
                id: `enr_${classId}_${sid}`,
                classId,
                studentId: sid,
                academicYear
            }));

            setEnrollments(prev => {
                const otherEnrollments = prev.filter(e => e.classId !== classId);
                const next = [...otherEnrollments, ...newEnrollments];
                apiService.saveEnrollments(next).catch(console.error);
                return next;
            });
            
            // Wait a tiny bit for React state batching to at least queue the update
            await new Promise(resolve => setTimeout(resolve, 0));
            return true;
        } catch (err) {
            setError(`Safe enrollment update failed: ${err.message || 'Unknown error'}`);
            throw err;
        }
    }, [enrollments, setError]);

    // --- Grade Operations ---
    const addGrade = useCallback((data) =>
        performDataUpdate(
            (d) => apiService.saveGrades(d),
            setGrades,
            (prev) => [...prev, { ...data, id: `grade_${Date.now()}` }],
            (err) => setError(`Grade save failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const updateGrade = useCallback((updated) =>
        performDataUpdate(
            (d) => apiService.saveGrades(d),
            setGrades,
            (prev) => prev.map(g => g.id === updated.id ? updated : g),
            (err) => setError(`Grade update failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const saveGradeBatch = useCallback((records) =>
        performDataUpdate(
            (d) => apiService.saveGrades(d),
            setGrades,
            (prev) => {
                const updatedMap = new Map(records.map(r => [r.id, r]));
                return [...prev.filter(r => !updatedMap.has(r.id)), ...records];
            },
            (err) => setError(`Grade batch save failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const saveDraftGradeBatch = useCallback((records) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        setDraftGrades((prev) => {
            const newDrafts = [...prev.filter(r => !updatedMap.has(r.id)), ...records];
            localStore.set('draft_grades', newDrafts);
            return newDrafts;
        });
    }, []);

    const publishClassGrades = useCallback(async (classId) => {
        const draftsToPublish = draftGrades.filter(g => g.classId === classId);
        if (draftsToPublish.length === 0) return;
        
        await saveGradeBatch(draftsToPublish);
        
        setDraftGrades((prev) => {
            const newDrafts = prev.filter(g => g.classId !== classId);
            localStore.set('draft_grades', newDrafts);
            return newDrafts;
        });
    }, [draftGrades, saveGradeBatch]);

    const saveAttendanceBatch = useCallback((records) =>
        performDataUpdate(
            (d) => apiService.saveAttendance(d),
            setAttendance,
            (prev) => {
                const updatedMap = new Map(records.map(r => [r.id, r]));
                return [...prev.filter(r => !updatedMap.has(r.id)), ...records];
            },
            (err) => setError(`Attendance batch save failed: ${err.message || 'Unknown error'}`)
        ), [setError]);

    const saveDraftAttendanceBatch = useCallback((records) => {
        const updatedMap = new Map(records.map(r => [r.id, r]));
        setDraftAttendance((prev) => {
            const newDrafts = [...prev.filter(r => !updatedMap.has(r.id)), ...records];
            localStore.set('draft_attendance', newDrafts);
            return newDrafts;
        });
    }, []);

    const publishClassAttendance = useCallback(async (classId) => {
        const draftsToPublish = draftAttendance.filter(a => a.id.includes(`_${classId}_`));
        if (draftsToPublish.length === 0) return;
        
        await saveAttendanceBatch(draftsToPublish);
        
        setDraftAttendance((prev) => {
            const newDrafts = prev.filter(a => !a.id.includes(`_${classId}_`));
            localStore.set('draft_attendance', newDrafts);
            return newDrafts;
        });
    }, [draftAttendance, saveAttendanceBatch]);

    return {
        classes,
        setClasses,
        addClass,
        addClasses,
        updateClass,
        updateClassesBatch,
        deleteClass,
        enrollments,
        setEnrollments,
        addEnrollment,
        addEnrollments,
        deleteEnrollment,
        updateClassEnrollments,
        grades,
        setGrades,
        addGrade,
        updateGrade,
        saveGradeBatch,
        draftGrades,
        saveDraftGradeBatch,
        publishClassGrades,
        attendance,
        setAttendance,
        saveAttendanceBatch,
        draftAttendance,
        saveDraftAttendanceBatch,
        publishClassAttendance
    };
};
