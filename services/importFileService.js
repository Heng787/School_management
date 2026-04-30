import { StaffRole } from '../types';
import { gradeId } from './mappers';

/**
 * Service for handling file imports (CSV and Excel).
 */
export const importFileService = {
  // --- CSV Import ---

  async processCSVFile(file, staff, classes, addClasses, parseClassCSV) {
    const fileContent = await file.text();
    const { validClasses, errors } = parseClassCSV(fileContent, staff);

    if (validClasses.length > 0) {
      await addClasses(validClasses);
    }

    return {
      successCount: validClasses.length,
      errorCount: errors.length,
      errors: errors,
    };
  },

  // --- Excel Import ---

  async processExcelFile(
    file,
    staff,
    classes,
    enrollments,
    timeSlots,
    {
      addClasses,
      addStudents,
      addEnrollments,
      saveGradeBatch,
      addStaffBatch,
      updateClassesBatch,
      updateStudentsBatch,
      addTimeSlotsBatch,
      parseExcelFile,
      students,
      onProgress,
    }
  ) {
    const result = await parseExcelFile(file, onProgress);

    // --- 1. SMART CLASS MATCHING & ID PREPARATION ---
    const classIDMap = {};
    const classesToAdd = [];
    const classesToUpdate = [];
    const newStaffToCreate = [];
    const newStaffMap = new Map();
    const newTimeSlotsToCreate = [];
    const newTimeSlotsMap = new Map();
    let classNextIdx = Date.now();

    if (result.classes && result.classes.length > 0) {
      for (const impClass of result.classes) {
        // --- A. Resolve teacher ---
        const targetTeacherName = (impClass.teacherName || '').trim();
        let teacher = null;

        if (targetTeacherName) {
          // Check existing staff
          teacher = staff.find((s) => {
            const sName = (s.name || '').toLowerCase();
            const tName = targetTeacherName.toLowerCase();
            return (
              (sName.length >= 5 && tName.includes(sName)) ||
              (tName.length >= 5 && sName.includes(tName))
            );
          });

          // Check staff already queued for creation
          if (!teacher) {
            for (const [name, rec] of newStaffMap.entries()) {
              if (name === targetTeacherName.toLowerCase()) {
                teacher = rec;
                break;
              }
            }
          }

          // Create if not found
          if (!teacher) {
            const newStaffRecord = {
              id: `tr_imp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              name: targetTeacherName,
              role: StaffRole.Teacher,
              contact: '',
              hireDate: new Date().toISOString().split('T')[0],
              status: 'Active',
            };
            newStaffToCreate.push(newStaffRecord);
            newStaffMap.set(targetTeacherName.toLowerCase(), newStaffRecord);
            teacher = newStaffRecord;
          }
        }

        // --- B. Match Class ---
        const existing = classes.find((c) => {
          const cName = (c.name || '').toLowerCase();
          const impName = (impClass.name || '').toLowerCase();
          const cLevel = (c.level || '').toLowerCase();
          const impLevel = (impClass.level || '').toLowerCase();

          // Robust schedule match
          const cleanSched = (s) => {
            return (s || '')
              .toLowerCase()
              .replace(/^(weekday|weekend)\s+/i, '')
              .trim();
          };

          const cSched = cleanSched(c.schedule);
          const impSched = cleanSched(impClass.schedule);

          return cName === impName && cLevel === impLevel && cSched === impSched;
        });

        if (existing) {
          classIDMap[impClass.id] = existing.id;
          if (teacher && existing.teacherId !== teacher.id) {
            classesToUpdate.push({ ...existing, teacherId: teacher.id });
          }
        } else {
          const finalClassId = `class_imp_${classNextIdx++}`;
          const newClass = {
            ...impClass,
            id: finalClassId,
            teacherId: teacher?.id || null,
          };
          classesToAdd.push(newClass);
          classIDMap[impClass.id] = finalClassId;
        }

        // --- C. Auto-create Missing Time Slot ---
        if (impClass.schedule && impClass.schedule.trim()) {
          let rawTime = impClass.schedule.trim();
          let scheduleType = 'weekday';

          const lowerSched = rawTime.toLowerCase();
          if (lowerSched.startsWith('weekday ')) {
            rawTime = rawTime.substring(8).trim();
          } else if (lowerSched.startsWith('weekend ')) {
            scheduleType = 'weekend';
            rawTime = rawTime.substring(8).trim();
          } else if (lowerSched.includes('weekend')) {
            scheduleType = 'weekend';
          }

          const existingSlot = timeSlots.find((ts) => {
            return (
              ts.type === scheduleType &&
              ts.time.toLowerCase().replace(/\s/g, '') ===
                rawTime.toLowerCase().replace(/\s/g, '')
            );
          });

          if (!existingSlot) {
            const lookupKey = `${scheduleType}_${rawTime}`.toLowerCase();
            if (!newTimeSlotsMap.has(lookupKey)) {
              const newSlot = {
                id: `slot_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                type: scheduleType,
                time: rawTime,
              };
              newTimeSlotsMap.set(lookupKey, newSlot);
              newTimeSlotsToCreate.push(newSlot);
            }
          }
        }
      }

      if (newTimeSlotsToCreate.length > 0) {
        await addTimeSlotsBatch(newTimeSlotsToCreate);
      }
      if (newStaffToCreate.length > 0) {
        await addStaffBatch(newStaffToCreate);
      }
      if (classesToAdd.length > 0) {
        await addClasses(classesToAdd);
      }
      if (classesToUpdate.length > 0) {
        await updateClassesBatch(classesToUpdate);
      }
    }

    // --- 2. SMART STUDENT MATCHING ---
    const studentIDMap = {};
    const previewStudents = [];

    if (result.students && result.students.length > 0) {
      for (const impStu of result.students) {
        const existingMatches = students.filter((s) => {
          return s.name.trim().toLowerCase() === impStu.name.trim().toLowerCase();
        });

        impStu._tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        studentIDMap[impStu.id] = impStu._tempId;

        if (existingMatches.length > 0) {
          impStu._possibleMatches = existingMatches;
          let defaultMatch;
          if (impStu._genderInferred) {
            defaultMatch = existingMatches[0];
          } else {
            defaultMatch = existingMatches.find((s) => {
              return (
                (s.sex || '').toLowerCase() === (impStu.sex || '').toLowerCase()
              );
            });
          }
          impStu._selectedMatchId = defaultMatch ? defaultMatch.id : 'NEW';
        } else {
          impStu._selectedMatchId = 'NEW';
        }
        previewStudents.push(impStu);
      }
    }

    // --- 3. SMART ENROLLMENT MATCHING (Preview) ---
    let mappedEnrollments = [];
    if (result.enrollments && result.enrollments.length > 0) {
      mappedEnrollments = result.enrollments
        .map((enr) => ({
          studentId: studentIDMap[enr.studentId] || enr.studentId,
          classId: classIDMap[enr.classId] || enr.classId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'Enrolled',
        }))
        .filter((enr) => {
          return !enrollments.find((e) => {
            return e.studentId === enr.studentId && e.classId === enr.classId;
          });
        });
    }

    // --- 4. SMART GRADE MATCHING (Preview) ---
    let mappedGrades = [];
    if (result.grades && result.grades.length > 0) {
      mappedGrades = result.grades.map((grd) => ({
        ...grd,
        studentId: studentIDMap[grd.studentId] || grd.studentId,
        classId: classIDMap[grd.classId] || grd.classId,
        id: gradeId(
          classIDMap[grd.classId] || grd.classId,
          studentIDMap[grd.studentId] || grd.studentId,
          grd.subject,
          grd.term
        ),
      }));
    }

    if (previewStudents.length > 0) {
      return {
        requiresPreview: true,
        previewData: {
          type: 'excel',
          studentsToPreview: previewStudents,
          mappedEnrollments,
          mappedGrades,
          errors: result.errors || [],
          addedStaffCount: newStaffToCreate.length,
          addedClassesCount: classesToAdd.length,
        },
      };
    }

    if (mappedEnrollments.length > 0) {
      await addEnrollments(mappedEnrollments);
    }
    if (mappedGrades.length > 0 && saveGradeBatch) {
      await saveGradeBatch(mappedGrades);
    }

    return {
      successCount:
        classesToAdd.length +
        newStaffToCreate.length +
        (result.grades?.length || 0),
      errorCount: result.errors?.length || 0,
      errors: result.errors || [],
      message: `Import complete! Added ${newStaffToCreate.length} new staff, ${classesToAdd.length} new classes, and ${result.grades?.length || 0} marks.`,
    };
  },
};
