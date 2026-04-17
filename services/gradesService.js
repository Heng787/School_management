import { gradeId } from "./mappers";

/**
 * Service for handling grade/marks operations
 */
export const gradesService = {
  /**
   * Handles changes to individual student marks.
   * Clamps values between 0 and 10.
   */
  processGradeInput(value) {
    if (value === "") {
      return "";
    }

    let strVal = value;
    let num = parseFloat(strVal);

    if (num < 0) {
      strVal = "0";
    } else if (num > 10) {
      // Auto-inject decimal for two-digit numbers (e.g. "55" -> "5.5")
      if (!strVal.includes(".") && strVal.length === 2) {
        strVal = `${strVal[0]}.${strVal[1]}`;
      } else if (
        !strVal.includes(".") &&
        strVal.length === 3 &&
        strVal.startsWith("10")
      ) {
        strVal = "10";
      } else {
        strVal = "10";
      }
    }

    return strVal;
  },

  /**
   * Builds grade records for batch save
   */
  buildGradeRecords(
    modifiedStudents,
    localGrades,
    subjects,
    grades,
    selectedClassId,
    selectedTerm,
  ) {
    const recordsToSave = [];

    for (const studentId of Array.from(modifiedStudents)) {
      for (const subject of subjects) {
        const score = Number(localGrades[studentId]?.[subject] || 0);
        const existingGrade = grades.find(
          (g) =>
            g.studentId === studentId &&
            g.subject === subject &&
            g.classId === selectedClassId &&
            g.term === selectedTerm,
        );
        const id = existingGrade
          ? existingGrade.id
          : gradeId(selectedClassId, studentId, subject, selectedTerm);
        recordsToSave.push({
          id,
          studentId,
          classId: selectedClassId,
          subject,
          score,
          term: selectedTerm,
        });
      }
    }

    return recordsToSave;
  },

  /**
   * Initializes local grades from database
   */
  initializeLocalGrades(
    classStudents,
    subjects,
    grades,
    selectedClassId,
    selectedTerm,
  ) {
    const initialGrades = {};
    classStudents.forEach((student) => {
      initialGrades[student.id] = {};
      subjects.forEach((subject) => {
        const existingGrade = grades.find(
          (g) =>
            g.studentId === student.id &&
            g.subject === subject &&
            g.classId === selectedClassId &&
            g.term === selectedTerm,
        );
        initialGrades[student.id][subject] = existingGrade
          ? existingGrade.score
          : "";
      });
    });
    return initialGrades;
  },
};
