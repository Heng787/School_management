/**
 * Generates the next student ID based on existing IDs
 */
export const getNextStudentId = (students) => {
  return students
    .map((s) => parseInt(s.id.substring(1), 10))
    .filter((id) => !isNaN(id))
    .reduce((max, curr) => Math.max(max, curr), 0);
};

/**
 * Matches imported students with existing students by name
 */
export const matchStudentsByName = (importedStudent, students) => {
  return students.filter(
    (s) =>
      s.name.trim().toLowerCase() === importedStudent.name.trim().toLowerCase(),
  );
};

/**
 * Determines default match for a student with possible duplicates
 */
export const getDefaultStudentMatch = (importedStudent, possibleMatches) => {
  if (possibleMatches.length === 0) return null;

  // If gender was inferred, use first match
  if (importedStudent._genderInferred) {
    return possibleMatches[0];
  }

  // Otherwise, try to find match with same gender
  return possibleMatches.find(
    (s) => s.sex.toLowerCase() === importedStudent.sex.toLowerCase(),
  );
};

/**
 * Prepares imported students for preview
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
        _selectedMatchId: defaultMatch ? defaultMatch.id : "NEW",
      };
    }

    return {
      ...impStu,
      _tempId: tempId,
      _selectedMatchId: "NEW",
    };
  });
};

/**
 * Builds mapping of temporary IDs to final IDs and separates add/update operations
 */
export const processFinalStudentList = (
  modifiedStudents,
  students,
  importType,
) => {
  const finalAdd = [];
  const finalUpdate = [];
  const tempIdToFinalIdMap = {};
  let lastStuId = getNextStudentId(students);
  const COPY_IF_MISSING = ["phone", "dob", "level"];

  modifiedStudents.forEach((impStu) => {
    let finalId;

    if (impStu._selectedMatchId === "NEW") {
      finalId = `s${++lastStuId}`;
      finalAdd.push({ ...impStu, id: finalId, sex: impStu.sex });
    } else {
      finalId = impStu._selectedMatchId;
      const existing = students.find((s) => s.id === finalId) || impStu;

      if (importType === "excel") {
        const updates = Object.fromEntries(
          COPY_IF_MISSING.filter((k) => !existing[k] && impStu[k]).map((k) => [
            k,
            impStu[k],
          ]),
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
 * Remaps enrollment and grade data with final student IDs
 */
export const remapRelatedData = (enrollments, grades, tempIdToFinalIdMap) => {
  const remappedEnrollments = (enrollments || []).map((e) => ({
    ...e,
    studentId: tempIdToFinalIdMap[e.studentId] || e.studentId,
  }));

  const remappedGrades = (grades || []).map((g) => ({
    ...g,
    studentId: tempIdToFinalIdMap[g.studentId] || g.studentId,
  }));

  return { remappedEnrollments, remappedGrades };
};
