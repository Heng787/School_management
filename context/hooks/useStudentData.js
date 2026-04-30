import { useState, useCallback } from 'react';
import { apiService } from '../../services/apiService';
import { performDataUpdate } from '../../utils/dataUtils';

/**
 * Hook to manage student data and operations.
 */
export const useStudentData = (setError) => {
    const [students, setStudents] = useState([]);

    const addStudents = useCallback((newStudentsData) =>
        performDataUpdate(
            (data) => apiService.saveStudents(data),
            setStudents,
            (current) => {
                let lastIdInt = current
                    .map(s => parseInt(s.id.substring(1), 10))
                    .filter(id => !isNaN(id))
                    .reduce((max, curr) => Math.max(max, curr), 0);
                
                const newOnes = newStudentsData.map((data) => {
                    if (data.id && !data.id.startsWith('stu_imp_')) return data;
                    return { ...data, id: `s${++lastIdInt}` };
                });
                return [...current, ...newOnes];
            },
            (err) => setError(`Save failed: ${err.message || err}. Changes kept locally.`)
        ), [setError]);

    const addStudent = useCallback((data) => addStudents([data]), [addStudents]);

    const updateStudent = useCallback((updated) =>
        performDataUpdate(
            (data) => apiService.saveStudents(data),
            setStudents,
            (prev) => prev.map(s => s.id === updated.id ? updated : s),
            (err) => setError(`Update failed: ${err.message || err}. Changes kept locally.`)
        ), [setError]);

    const updateStudentsBatch = useCallback((updatedList) =>
        performDataUpdate(
            (data) => apiService.saveStudents(data),
            setStudents,
            (prev) => {
                const updatedMap = new Map(updatedList.map(s => [s.id, s]));
                return prev.map(s => updatedMap.has(s.id) ? updatedMap.get(s.id) : s);
            },
            (err) => setError(`Batch update failed: ${err.message || err}. Changes kept locally.`)
        ), [setError]);

    const deleteStudent = useCallback(async (id, cleanupFns = {}) => {
        // 1. Update Students local state
        setStudents(prev => prev.filter(s => s.id !== id));
        
        // 2. Cleanup Related Records (Cascade) - these setters come from other hooks
        if (cleanupFns.setEnrollments) cleanupFns.setEnrollments(prev => prev.filter(e => e.studentId !== id));
        if (cleanupFns.setAttendance) cleanupFns.setAttendance(prev => prev.filter(a => a.studentId !== id));
        if (cleanupFns.setGrades) cleanupFns.setGrades(prev => prev.filter(g => g.studentId !== id));

        try {
            await apiService.deleteRecord('students', id);
            return true;
        } catch (err) {
            console.error('Failed to delete student from Supabase:', err);
            setError(`Failed to delete student: ${err.message}`);
            throw err;
        }
    }, [setError]);

    return {
        students,
        setStudents,
        addStudent,
        addStudents,
        updateStudent,
        updateStudentsBatch,
        deleteStudent
    };
};
