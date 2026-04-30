// @refresh reset
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import { useStudentData } from './hooks/useStudentData';
import { useStaffData } from './hooks/useStaffData';
import { useAcademicData } from './hooks/useAcademicData';
import { useConfigData } from './hooks/useConfigData';
import { useOperationalData } from './hooks/useOperationalData';
import { useSyncEngine } from './hooks/useSyncEngine';

import { apiService } from '../services/apiService';

import { UserRole } from '../types';
import { generateHolidays } from '../utils/dataUtils';

export const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setErrorState] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('school_admin_currentUser');

      if (saved) {
        const user = JSON.parse(saved);

        // Migrate legacy "Demo User" display name
        if (user.role === UserRole.Admin && (user.name === 'Demo User' || user.name === 'Demo Admin')) {
          user.name = 'Administrator';
        }

        return user;
      }

      return null;
    } catch {
      return null;
    }
  });

  const [highlightedStudentId, setHighlightedStudentId] = useState(null);
  const [highlightedStaffId, setHighlightedStaffId] = useState(null);
  const [highlightedClassId, setHighlightedClassId] = useState(null);

  const setError = useCallback((err) => {
    let message = 'An unknown error occurred.';

    if (typeof err === 'string') message = err;
    else if (err instanceof Error) message = err.message;
    else if (err?.message) message = err.message;
    
    setErrorState(message);
    setTimeout(() => setErrorState(null), 7000);
  }, []);

  const studentOps = useStudentData(setError);
  const staffOps = useStaffData(setError);
  const academicOps = useAcademicData(setError);
  const configOps = useConfigData(
    setError, 
    staffOps.staff, staffOps.setStaff,
    studentOps.students, studentOps.setStudents,
    academicOps.classes, academicOps.setClasses
  );
  const operationalOps = useOperationalData(setError);

  const syncOps = useSyncEngine(loading, setError, {
    students: studentOps.students,
    staff: staffOps.staff,
    staffPermissions: staffOps.staffPermissions,
    classes: academicOps.classes,
    events: operationalOps.events,
    grades: academicOps.grades,
    attendance: academicOps.attendance,
    enrollments: academicOps.enrollments,
    subjects: configOps.subjects,
    levels: configOps.levels,
    timeSlots: configOps.timeSlots,
    adminPassword: configOps.adminPassword
  }, {
    setStudents: studentOps.setStudents,
    setStaff: staffOps.setStaff,
    setClasses: academicOps.setClasses,
    setEnrollments: academicOps.setEnrollments,
    setGrades: academicOps.setGrades,
    setAttendance: academicOps.setAttendance
  });

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

        if (s) studentOps.setStudents(s);
        if (st) staffOps.setStaff(st);
        if (c) academicOps.setClasses(c);
        if (g) academicOps.setGrades(g);
        if (att) academicOps.setAttendance(att);
        if (enr) academicOps.setEnrollments(enr);
        if (sp) staffOps.setStaffPermissions(sp);
        if (lvls) configOps.setLevels(lvls);
        if (slots) configOps.setTimeSlots(slots);
        if (pwd) configOps.setAdminPasswordState(pwd);

        const fetchedEvents = e || [];
        const seedHolidays = generateHolidays();
        const schoolEvents = [
          { id: 'sch_evt_1', title: 'Parent-Teacher Meeting', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], type: 'Event', description: 'Annual progress review with parents.' },
          { id: 'sch_evt_2', title: 'Science Fair 2026', date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], type: 'Event', description: 'Student project exhibitions in the main hall.' },
          { id: 'sch_evt_3', title: 'English Speech Contest', date: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0], type: 'Event', description: 'Campus-wide competition for junior levels.' }
        ];

        const missingHolidays = seedHolidays.filter(sh => 
          !fetchedEvents.some(ce => ce.title === sh.title && ce.date === sh.date)
        );

        const finalEvents = [...fetchedEvents];

        if (missingHolidays.length > 0) finalEvents.push(...missingHolidays);
        if (!fetchedEvents.some(ce => ce.title.includes('Science Fair'))) finalEvents.push(...schoolEvents);
        
        operationalOps.setEvents(finalEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

        if (missingHolidays.length > 0 || !fetchedEvents.some(ce => ce.title.includes('Science Fair'))) {
          apiService.saveEvents(finalEvents).catch(console.error);
        }

        if (operationalOps.activityLogs.length === 0) {
          operationalOps.setActivityLogs([
            { id: Date.now() - 10000, action: 'Student "Alice Johnson" enrollment approved', time: '08:30 AM' },
            { id: Date.now() - 20000, action: 'Daily attendance marked for Class K1A', time: '09:15 AM' },
            { id: Date.now() - 30000, action: 'New staff member "John Smith" added', time: '10:00 AM' },
            { id: Date.now() - 40000, action: 'Academic calendar updated for Q2', time: '11:45 AM' }
          ]);
        }

        if (g && g.length < 5 && c && c.length > 1) {
          const dummyGrades = [];
          const someClassIds = c.slice(0, 5).map(cls => cls.id);
          const someStudentIds = (s || []).slice(0, 10).map(stu => stu.id);
          
          if (someStudentIds.length > 0) {
            someClassIds.forEach(cid => {
              someStudentIds.forEach(sid => {
                dummyGrades.push({
                  id: `dummy_grade_${cid}_${sid}`,
                  studentId: sid,
                  classId: cid,
                  subject: 'Grammar',
                  score: Math.floor(Math.random() * 4) + 6,
                  term: 'Term 1',
                  date: new Date().toISOString()
                });
              });
            });
            academicOps.setGrades(prev => [...prev, ...dummyGrades]);
          }
        }

        if (sub) {
          const cleanedJuniorSenior = ["Grammar", "Listening", "Speaking", "Homework", "Reading", "Writing"];

          if (Array.isArray(sub)) {
            configOps.setSubjects({ Kid: [], JuniorSenior: cleanedJuniorSenior });
          } else {
            configOps.setSubjects({ Kid: sub.Kid || [], JuniorSenior: cleanedJuniorSenior });
          }
        }

        if (navigator.onLine) syncOps.setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Initial load error:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const deleteAllData = useCallback(async () => {
    const tableSetters = [
      { name: 'students', setter: studentOps.setStudents },
      { name: 'staff', setter: staffOps.setStaff },
      { name: 'classes', setter: academicOps.setClasses },
      { name: 'grades', setter: academicOps.setGrades },
      { name: 'enrollments', setter: academicOps.setEnrollments },
      { name: 'attendance', setter: academicOps.setAttendance },
    ];

    tableSetters.forEach(({ name, setter }) => {
      setter([]);
      localStorage.removeItem(`school_admin_${name}`);
      localStorage.removeItem(`school_admin_${name}_dirty`);
    });

    localStorage.removeItem('school_admin_deleted_queue');

    const client = (await import('../services/core')).getSupabase();

    if (client && navigator.onLine) {
      await Promise.allSettled(
        tableSetters.map(({ name }) => client.from(name).delete().neq('id', '__nonexistent__'))
      );
    }

    syncOps.setLastSyncedAt(new Date());
  }, [studentOps, staffOps, academicOps, syncOps]);

  const importAllData = useCallback(async (data) => {
    setLoading(true);
    try {
      await apiService.importAllData(data);
      studentOps.setStudents(data.students || []);
      staffOps.setStaff(data.staff || []);
      staffOps.setStaffPermissions(data.staffPermissions || []);
      academicOps.setClasses(data.classes || []);
      operationalOps.setEvents(data.events || []);
      configOps.setSubjects(data.subjects || []);
      configOps.setLevels(data.levels || []);
      configOps.setTimeSlots(data.timeSlots || []);
      configOps.setAdminPasswordState(data.adminPassword || 'admin123');
      syncOps.setLastSyncedAt(new Date());
    } finally {
      setLoading(false);
    }
  }, [studentOps, staffOps, academicOps, operationalOps, configOps, syncOps]);

  const handleSetCurrentUser = useCallback((user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('school_admin_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('school_admin_currentUser');
    }
  }, []);

  const value = useMemo(() => ({
    ...studentOps,
    ...staffOps,
    ...academicOps,
    ...configOps,
    ...operationalOps,
    ...syncOps,
    loading,
    error,
    currentUser,
    highlightedStudentId,
    highlightedStaffId,
    highlightedClassId,
    setError,
    setCurrentUser: handleSetCurrentUser,
    setHighlightedStudentId,
    setHighlightedStaffId,
    setHighlightedClassId,
    importAllData,
    deleteAllData,
    clearActivityLogs: operationalOps.clearActivityLogs
  }), [
    studentOps, staffOps, academicOps, configOps, operationalOps, syncOps,
    loading, error, currentUser, highlightedStudentId, highlightedStaffId, 
    highlightedClassId, setError, handleSetCurrentUser, importAllData, deleteAllData
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
