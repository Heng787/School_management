/**
 * Shared utility functions for processing imported data.
 */

// --- ID Management ---

/**
 * Generates the next student ID based on existing IDs.
 */
export const getNextStudentId = (students) => {
  // Only parse IDs that match the "s{number}" pattern — skip any other ID formats
  return students
    .map((s) => {
      return /^s(\d+)$/.test(s.id) ? parseInt(s.id.substring(1), 10) : NaN;
    })
    .filter((id) => !isNaN(id))
    .reduce((max, curr) => Math.max(max, curr), 0);
};

// --- Student Matching ---

/**
 * Matches imported students with existing students by name.
 */
export const matchStudentsByName = (importedStudent, students) => {
  const targetName = importedStudent.name.trim().toLowerCase();
  return students.filter((s) => {
    return s.name.trim().toLowerCase() === targetName;
  });
};

/**
 * Determines default match for a student with possible duplicates.
 */
export const getDefaultStudentMatch = (importedStudent, possibleMatches) => {
  if (possibleMatches.length === 0) return null;
  if (importedStudent._genderInferred) return possibleMatches[0];

  const targetSex = (importedStudent.sex || '').toLowerCase();

  // Guard against null sex on existing students
  return possibleMatches.find((s) => {
    return (s.sex || '').toLowerCase() === targetSex;
  });
};

// --- Preview Generation ---

/**
 * Prepares imported students for preview.
 */
export const prepareStudentsForPreview = (validStudents, students) => {
  return validStudents.map((impStu) => {
    const existingMatches = matchStudentsByName(impStu, students);
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    if (existingMatches.length > 0) {
      const defaultMatch = getDefaultStudentMatch(impStu, existingMatches);
      return {
        ...impStu,
        _tempId: tempId,
        _possibleMatches: existingMatches,
        _selectedMatchId: defaultMatch ? defaultMatch.id : 'NEW',
      };
    }

    return {
      ...impStu,
      _tempId: tempId,
      _selectedMatchId: 'NEW',
    };
  });
};

// --- Finalization Logic ---

/**
 * Builds mapping of temporary IDs to final IDs and separates add/update operations.
 */
export const processFinalStudentList = (
  modifiedStudents,
  students,
  importType
) => {
  const finalAdd = [];
  const finalUpdate = [];
  const tempIdToFinalIdMap = {};
  const COPY_IF_MISSING = ['phone', 'dob', 'level'];

  let lastStuId = getNextStudentId(students);

  modifiedStudents.forEach((impStu) => {
    let finalId;

    if (impStu._selectedMatchId === 'NEW') {
      finalId = `s${++lastStuId}`;
      finalAdd.push({ ...impStu, id: finalId, sex: impStu.sex });
    } else {
      finalId = impStu._selectedMatchId;
      const existing = students.find((s) => s.id === finalId) || impStu;

      if (importType === 'excel') {
        const updates = Object.fromEntries(
          COPY_IF_MISSING.filter((k) => !existing[k] && impStu[k]).map((k) => [
            k,
            impStu[k],
          ])
        );

        if (impStu.status && existing.status !== impStu.status) {
          updates.status = impStu.status;
        }

        if (Object.keys(updates).length > 0) {
          finalUpdate.push({ ...existing, ...updates });
        }
      }
    }

    tempIdToFinalIdMap[impStu._tempId] = finalId;
  });

  return { finalAdd, finalUpdate, tempIdToFinalIdMap };
};

/**
 * Remaps enrollment and grade data with final student IDs.
 */
export const remapRelatedData = (enrollments, grades, tempIdToFinalIdMap) => {
  const remappedEnrollments = (enrollments || []).map((e) => {
    return {
      ...e,
      studentId: tempIdToFinalIdMap[e.studentId] || e.studentId,
    };
  });

  const remappedGrades = (grades || []).map((g) => {
    return {
      ...g,
      studentId: tempIdToFinalIdMap[g.studentId] || g.studentId,
    };
  });

  return { remappedEnrollments, remappedGrades };
};
