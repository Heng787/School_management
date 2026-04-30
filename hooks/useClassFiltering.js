import { useMemo } from 'react';
import { StaffRole, UserRole } from '../types';

/**
 * Handles all filtering and grouping logic for classes.
 */
export const useClassFiltering = (
  classes,
  selectedLevel,
  selectedTeacherIds,
  selectedTime,
  currentUser,
  staff,
  timeSlots
) => {
  // --- Derived State ---

  const availableTeachers = useMemo(() => {
    return staff.filter((s) => s.role === StaffRole.Teacher);
  }, [staff]);

  const allSessionLabels = useMemo(() => {
    return timeSlots.map((s) => s.time);
  }, [timeSlots]);

  // --- Filtering ---

  const filteredClasses = useMemo(() => {
    let baseClasses = classes;

    // Teachers only see their own classes; Admin and Office Workers see all
    if (currentUser?.role === UserRole.Teacher) {
      baseClasses = classes.filter((cls) => cls.teacherId === currentUser.id);
    }

    return baseClasses
      .filter((cls) => selectedLevel === 'all' || cls.level === selectedLevel)
      .filter((cls) => {
        return (
          selectedTeacherIds.length === 0 ||
          selectedTeacherIds.includes(cls.teacherId)
        );
      })
      .filter((cls) => {
        return (
          selectedTime === 'all' ||
          (cls.schedule && cls.schedule.includes(selectedTime))
        );
      });
  }, [classes, selectedLevel, selectedTeacherIds, selectedTime, currentUser]);

  // --- Grouping ---

  const classesByTimeSlot = useMemo(() => {
    const grouped = {};

    allSessionLabels.forEach((label) => {
      grouped[label] = [];
    });
    grouped['Other Schedule'] = [];

    filteredClasses.forEach((cls) => {
      const matchedSlot = allSessionLabels.find((label) => {
        return cls.schedule && cls.schedule.includes(label);
      });

      if (matchedSlot) {
        grouped[matchedSlot].push(cls);
      } else {
        grouped['Other Schedule'].push(cls);
      }
    });

    return grouped;
  }, [filteredClasses, allSessionLabels]);

  return {
    availableTeachers,
    allSessionLabels,
    filteredClasses,
    classesByTimeSlot,
  };
};
