import { StaffRole } from "../types";

/**
 * Service for handling file imports (CSV and Excel)
 */
export const importFileService = {
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
    },
  ) {
    const result = await parseExcelFile(file);

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
        const targetTeacherName = (impClass.teacherName || "").trim();
        let teacher = null;

        if (targetTeacherName) {
          // Check existing staff
          teacher = staff.find((s) => {
            const sName = (s.name || "").toLowerCase();
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
              contact: "",
              hireDate: new Date().toISOString().split("T")[0],
              status: "Active",
            };
            newStaffToCreate.push(newStaffRecord);
            newStaffMap.set(targetTeacherName.toLowerCase(), newStaffRecord);
            teacher = newStaffRecord;
          }
        }

        // --- B. Match Class ---
        const existing = classes.find(
          (c) =>
            c.name.toLowerCase() === impClass.name.toLowerCase() &&
            c.level.toLowerCase() === impClass.level.toLowerCase() &&
            c.schedule.toLowerCase() === impClass.schedule.toLowerCase(),
        );

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
          let scheduleType = "weekday";

          const lowerSched = rawTime.toLowerCase();
          if (lowerSched.startsWith("weekday ")) {
            rawTime = rawTime.substring(8).trim();
          } else if (lowerSched.startsWith("weekend ")) {
            scheduleType = "weekend";
            rawTime = rawTime.substring(8).trim();
          } else if (lowerSched.includes("weekend")) {
            scheduleType = "weekend";
          }

          const existingSlot = timeSlots.find(
            (ts) =>
              ts.type === scheduleType &&
              ts.time.toLowerCase().replace(/\s/g, "") ===
                rawTime.toLowerCase().replace(/\s/g, ""),
          );

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

      if (newTimeSlotsToCreate.length > 0)
        await addTimeSlotsBatch(newTimeSlotsToCreate);
      if (newStaffToCreate.length > 0) await addStaffBatch(newStaffToCreate);
      if (classesToAdd.length > 0) await addClasses(classesToAdd);
      if (classesToUpdate.length > 0) await updateClassesBatch(classesToUpdate);
    }

    // --- 2. SMART STUDENT MATCHING ---
    const studentIDMap = {};
    const studentsToAdd = [];
    const studentsToUpdate = [];
    let lastStuId = students
      .map((s) => parseInt(s.id.substring(1), 10))
      .filter((id) => !isNaN(id))
      .reduce((max, curr) => Math.max(max, curr), 0);

    if (result.students && result.students.length > 0) {
      for (const impStu of result.students) {
        const existing = students.find(
          (s) =>
            s.name.trim().toLowerCase() === impStu.name.trim().toLowerCase() &&
            s.sex.toLowerCase() === impStu.sex.toLowerCase(),
        );

        if (existing) {
          studentIDMap[impStu.id] = existing.id;
          let needsUpdate = false;
          const updatedStu = { ...existing };

          if (!existing.phone && impStu.phone) {
            updatedStu.phone = impStu.phone;
            needsUpdate = true;
          }
          if (!existing.dob && impStu.dob) {
            updatedStu.dob = impStu.dob;
            needsUpdate = true;
          }
          if (!existing.level && impStu.level) {
            updatedStu.level = impStu.level;
            needsUpdate = true;
          }
          if (existing.status !== impStu.status && impStu.status) {
            updatedStu.status = impStu.status;
            needsUpdate = true;
          }

          if (needsUpdate) {
            studentsToUpdate.push(updatedStu);
          }
        } else {
          const finalStuId = `s${++lastStuId}`;
          const newStu = { ...impStu, id: finalStuId };
          studentsToAdd.push(newStu);
          studentIDMap[impStu.id] = finalStuId;
        }
      }
      if (studentsToAdd.length > 0) await addStudents(studentsToAdd);
      if (studentsToUpdate.length > 0)
        await updateStudentsBatch(studentsToUpdate);
    }

    // --- 3. SMART ENROLLMENT MATCHING ---
    if (result.enrollments && result.enrollments.length > 0) {
      const mappedEnrollments = result.enrollments
        .map((enr) => ({
          studentId: studentIDMap[enr.studentId] || enr.studentId,
          classId: classIDMap[enr.classId] || enr.classId,
          enrollmentDate: new Date().toISOString().split("T")[0],
          status: "Enrolled",
        }))
        .filter((enr) => {
          return !enrollments.find(
            (e) => e.studentId === enr.studentId && e.classId === enr.classId,
          );
        });

      if (mappedEnrollments.length > 0) await addEnrollments(mappedEnrollments);
    }

    // --- 4. SMART GRADE MATCHING ---
    if (result.grades && result.grades.length > 0) {
      const mappedGrades = result.grades.map((grd) => ({
        ...grd,
        studentId: studentIDMap[grd.studentId] || grd.studentId,
        classId: classIDMap[grd.classId] || grd.classId,
        id: `grd_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      }));
      if (saveGradeBatch) await saveGradeBatch(mappedGrades);
    }

    return {
      successCount:
        classesToAdd.length +
        studentsToAdd.length +
        newStaffToCreate.length +
        (result.grades?.length || 0),
      errorCount: result.errors?.length || 0,
      errors: result.errors?.map((e) => ({ message: e })) || [],
      message: `Import complete! Added ${newStaffToCreate.length} new staff, ${classesToAdd.length} new classes, ${studentsToAdd.length} new students, and ${result.grades?.length || 0} marks.`,
    };
  },
};
