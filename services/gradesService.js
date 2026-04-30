import { gradeId } from './mappers';

/**
 * Service for handling grade/marks operations.
 */
export const gradesService = {
  // --- Input Validation ---

  /**
   * Handles changes to individual student marks.
   * Clamps values between 0 and 10.
   */
  processGradeInput(value) {
    if (value === '') return '';

    // Allow trailing dot for typing decimals
    if (value.endsWith('.') && value.indexOf('.') === value.lastIndexOf('.')) {
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return value;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return '';

    if (num < 0) return '0';
    if (num > 10) {
      // Auto-inject decimal for two-digit numbers (e.g. "55" -> "5.5")
      const strVal = value.toString();
      if (!strVal.includes('.') && strVal.length === 2 && strVal !== '10') {
        return `${strVal[0]}.${strVal[1]}`;
      }
      return '10';
    }

    // Return the string value to preserve formatting while typing
    return value.toString();
  },

  // --- Record Building ---

  /**
   * Builds grade records for batch save.
   */
  buildGradeRecords(
    modifiedStudents,
    localGrades,
    subjects,
    grades,
    selectedClassId,
    selectedTerm
  ) {
    const recordsToSave = [];

    for (const studentId of Array.from(modifiedStudents)) {
      for (const subject of subjects) {
        let score = localGrades[studentId]?.[subject];
        score = (score === '' || score == null) ? null : Number(score);

        const existingGrade = grades.find((g) => {
          return (
            g.studentId === studentId &&
            g.subject === subject &&
            g.classId === selectedClassId &&
            g.term === selectedTerm
          );
        });

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

  // --- Initialization ---

  /**
   * Initializes local grades from database.
   */
  initializeLocalGrades(
    classStudents,
    subjects,
    grades,
    selectedClassId,
    selectedTerm
  ) {
    const initialGrades = {};

    classStudents.forEach((student) => {
      initialGrades[student.id] = {};

      subjects.forEach((subject) => {
        const existingGrade = grades.find((g) => {
          return (
            g.studentId === student.id &&
            g.subject === subject &&
            g.classId === selectedClassId &&
            g.term === selectedTerm
          );
        });

        initialGrades[student.id][subject] = existingGrade
          ? existingGrade.score
          : '';
      });
    });

    return initialGrades;
  },
};
