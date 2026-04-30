import { useState, useCallback } from 'react';
import { apiService } from '../../services/apiService';
import { performDataUpdate } from '../../utils/dataUtils';

/**
 * Hook to manage configuration data (subjects, levels, time slots, password).
 */
export const useConfigData = (setError, staff, setStaff, students, setStudents, classes, setClasses) => {
    const [subjects, setSubjects] = useState({ Kid: [], JuniorSenior: [] });
    const [levels, setLevels] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [adminPassword, setAdminPasswordState] = useState('admin123');

    const addSubject = useCallback((subject, category = 'JuniorSenior') =>
        performDataUpdate(
            (d) => apiService.saveSubjects(d),
            setSubjects,
            (prev) => {
                const next = { ...prev };
                if (!next[category]) next[category] = [];
                next[category] = [...new Set([...next[category], subject])].sort();
                return next;
            },
            (err) => setError(`Subject save failed: ${err.message}`)
        ), [setError]);

    const updateSubject = useCallback(async (old, next) => {
        const nextSubs = { ...subjects };
        Object.keys(nextSubs).forEach(cat => {
            nextSubs[cat] = nextSubs[cat].map(s => s === old ? next : s);
        });
        const nextStaff = staff.map(s => s.subject === old ? { ...s, subject: next } : s);
        setSubjects(nextSubs);
        setStaff(nextStaff);
        try { 
            await Promise.all([apiService.saveSubjects(nextSubs), apiService.saveStaff(nextStaff)]); 
        } catch (e) {
            setError(`Subject update failed: ${e.message}`);
        }
    }, [subjects, staff, setStaff, setError]);

    const deleteSubject = useCallback(async (target) => {
        const nextSubs = { ...subjects };
        Object.keys(nextSubs).forEach(cat => {
            nextSubs[cat] = nextSubs[cat].filter(s => s !== target);
        });
        const nextStaff = staff.map(s => s.subject === target ? { ...s, subject: '' } : s);
        setSubjects(nextSubs);
        setStaff(nextStaff);
        try { 
            await Promise.all([apiService.saveSubjects(nextSubs), apiService.saveStaff(nextStaff)]); 
        } catch (e) {
            setError(`Subject deletion failed: ${e.message}`);
        }
    }, [subjects, staff, setStaff, setError]);

    const addLevel = useCallback((level) =>
        performDataUpdate(
            (d) => apiService.saveLevels(d),
            setLevels,
            (prev) => [...new Set([...prev, level])],
            (err) => setError(`Level save failed: ${err.message}`)
        ), [setError]);

    const updateLevel = useCallback(async (old, next) => {
        const nextLevels = levels.map(l => l === old ? next : l);
        const nextStudents = students.map(s => s.level === old ? { ...s, level: next } : s);
        const nextClasses = classes.map(c => c.level === old ? { ...c, level: next } : c);
        setLevels(nextLevels);
        setStudents(nextStudents);
        setClasses(nextClasses);
        try { 
            await Promise.all([
                apiService.saveLevels(nextLevels), 
                apiService.saveStudents(nextStudents), 
                apiService.saveClasses(nextClasses)
            ]); 
        } catch (e) {
            setError(`Level update failed: ${e.message}`);
        }
    }, [levels, students, classes, setLevels, setStudents, setClasses, setError]);

    const deleteLevel = useCallback((target) =>
        performDataUpdate(
            apiService.saveLevels,
            setLevels,
            (prev) => prev.filter(l => l !== target),
            (err) => setError(`Level deletion failed: ${err.message}`)
        ), [setError]);

    const addTimeSlotsBatch = useCallback((records) =>
        performDataUpdate(
            (d) => apiService.saveTimeSlots(d),
            setTimeSlots,
            (prev) => {
                const newItems = records.map((r, i) => ({ ...r, id: r.id || `slot_${Date.now()}_${i}` }));
                return [...prev, ...newItems];
            },
            (err) => setError(`Time slot save failed: ${err.message}`)
        ), [setError]);

    const addTimeSlot = useCallback((slot) => addTimeSlotsBatch([slot]), [addTimeSlotsBatch]);

    const updateTimeSlot = useCallback((id, updatedSlot) =>
        performDataUpdate(
            (d) => apiService.saveTimeSlots(d),
            setTimeSlots,
            (prev) => prev.map(s => s.id === id ? { ...s, ...updatedSlot } : s),
            (err) => setError(`Time slot update failed: ${err.message}`)
        ), [setError]);

    const deleteTimeSlot = useCallback((id) =>
        performDataUpdate(
            (d) => apiService.saveTimeSlots(d),
            setTimeSlots,
            (prev) => prev.filter(s => s.id !== id),
            (err) => setError(`Time slot deletion failed: ${err.message}`)
        ), [setError]);

    const setAdminPassword = useCallback(async (pwd) => {
        setAdminPasswordState(pwd);
        try {
            await apiService.saveAdminPassword(pwd);
        } catch (err) {
            setError(`Password save failed: ${err.message}`);
        }
    }, [setError]);

    return {
        subjects, setSubjects,
        levels, setLevels,
        timeSlots, setTimeSlots,
        adminPassword, setAdminPasswordState,
        addSubject, updateSubject, deleteSubject,
        addLevel, updateLevel, deleteLevel,
        addTimeSlot, addTimeSlotsBatch, updateTimeSlot, deleteTimeSlot, setAdminPassword
    };
};
