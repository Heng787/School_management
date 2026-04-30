import * as XLSX from 'xlsx';

// --- Utilities ---

const uid = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const today = () => new Date().toISOString().split('T')[0];

const normalizePhone = (raw) => {
  const s = String(raw || '').trim();
  if (!s || s === 'undefined') return '';
  return !s.startsWith('0') && s.replace(/\s/g, '').length >= 8 ? '0' + s : s;
};

const normalizeGender = (raw) => {
  const s = String(raw || '').trim().toLowerCase();
  if (['m', 'male', 'boy', 'man'].includes(s)) return 'Male';
  if (['f', 'female', 'girl', 'woman'].includes(s)) return 'Female';
  return null;
};

const capitalize = (str) => {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// --- Sheet Filtering ---

const SKIP_SHEETS = new Set(['guide', 'classes']);

const shouldSkipSheet = (name) => {
  const l = name.toLowerCase().trim();
  return SKIP_SHEETS.has(l) || l.includes('to update') || /^\d+$/.test(l);
};

// --- Class Context Extraction ---

const extractClassContext = (sheet, sheetName, fileName) => {
  let level = '';
  let room = '';
  let time = '';
  let teacherName = '';
  let branch = 'Primary';

  for (const row of sheet.slice(0, 10)) {
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const val = String(row[j] || '').trim();
      const next = String(row[j + 1] || '').trim();
      const lv = val.toLowerCase();

      if (!level && /^[kg]\d/i.test(val) && val.length <= 4) {
        level = val.toUpperCase();
      }

      if (!room && lv.includes('room')) {
        room = ['room', 'room:', 'room :'].includes(lv) ? next : val;
      }

      if (!time && (lv.includes(':') || lv.includes('am') || lv.includes('pm'))) {
        if (val.length > 5 && val.length < 20 && /\d/.test(val)) {
          time = val;
        }
      }

      if (!teacherName && (lv.includes('teacher') || lv.includes('tr:'))) {
        teacherName = ['teacher', 'teacher:', 'tr:'].includes(lv)
          ? next
          : val.split(/[:\s]/).slice(1).join(' ').trim();
      }
    }
  }

  const upper = sheetName.toUpperCase();
  if (!level) {
    level = (upper.match(/[KG][1-9]/) ?? [])[0] ?? '';
  }

  if (!room) {
    room = upper.includes('ROOM')
      ? ((upper.match(/ROOM\s*\d+/) ?? [])[0] ?? '')
      : level && upper.length <= 5
        ? upper
        : '';
  }

  if (!teacherName) {
    for (const [, c] of `${sheetName} ${fileName ?? ''}`.matchAll(
      /\(([^)]+)\)/g
    )) {
      if (c?.includes(' ') && c.length > 5 && !/^[ivx]+$/i.test(c)) {
        teacherName = c.trim();
        break;
      }
    }
  }

  if (level && (!room || ['room', 'room:'].includes(room.toLowerCase()))) {
    room = sheetName.length < 15 ? sheetName : level;
  }

  if (room && !room.toLowerCase().includes('room')) {
    room = `Room ${room}`;
  }

  if (time && !/weekday|weekend/i.test(time)) {
    time = `Weekday ${time}`;
  }

  return { level, room, time, teacherName, branch };
};

// --- Column Detection ---

const NAME_KEYS = new Set(['name', 'student name', 'student']);
const SEX_KEYS = new Set(['sex', 'gender']);

const detectColumns = (sheet) => {
  const cols = { name: -1, sex: -1, phone: -1 };
  let headerRowIdx = -1;

  for (let i = 0; i < Math.min(sheet.length, 30); i++) {
    const row = sheet[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const v = String(row[j] || '')
        .trim()
        .toLowerCase();

      if (cols.name === -1 && NAME_KEYS.has(v)) {
        cols.name = j;
        headerRowIdx = i;
      }
      if (cols.sex === -1 && SEX_KEYS.has(v)) {
        cols.sex = j;
      }
      if (cols.phone === -1 && (v.includes('phone') || v.includes('contact'))) {
        cols.phone = j;
      }
    }
    if (headerRowIdx === i) break;
  }

  return { cols, headerRowIdx };
};

// --- Student Dedup Key ---
// Match on normalised name + sex to avoid collisions between male/female students
// who share the same name (edge case but real in classroom data).
const studentKey = (name, sex) => {
  return `${name.trim().toLowerCase()}|${(sex || '').toLowerCase()}`;
};

// --- Main Parser ---

/**
 * Parses an Excel file and returns structured data for the application.
 */
export const parseExcelFile = async (file, onProgress) => {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

  const results = {
    classes: [],
    students: [],
    enrollments: [],
    errors: [],
  };

  const studentIndex = new Map();
  const classIndex = new Map();

  for (const sheetName of workbook.SheetNames) {
    if (shouldSkipSheet(sheetName)) continue;

    let sheet;
    try {
      sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
    } catch (err) {
      results.errors.push({
        sheet: sheetName,
        message: `Failed to parse sheet: ${err.message}`,
      });
      continue;
    }

    const { level, room, time, teacherName, branch } = extractClassContext(
      sheet,
      sheetName,
      file?.name
    );
    const { cols, headerRowIdx } = detectColumns(sheet);

    let classId = '';
    if (level && room) {
      const classKey = `${room.toLowerCase()}|${level.toLowerCase()}`;
      if (classIndex.has(classKey)) {
        classId = classIndex.get(classKey);
      } else {
        classId = uid('cls_imp');
        classIndex.set(classKey, classId);
        results.classes.push({
          id: classId,
          name: room,
          level,
          schedule: time,
          teacherName,
          branch,
        });
      }
    }

    if (headerRowIdx === -1) continue;

    const enrolledInSheet = new Set(); // prevents duplicate enrollments within one sheet

    for (let i = headerRowIdx + 1; i < sheet.length; i++) {
      const row = sheet[i];

      // Break on extended empty stretch
      if (!row?.[cols.name]) {
        if (i > headerRowIdx + 20) break;
        continue;
      }

      const name = String(row[cols.name]).trim();
      if (
        !name ||
        name.toLowerCase() === 'name' ||
        name.toLowerCase() === 'no' ||
        (!isNaN(name) && name.length < 3)
      ) {
        continue;
      }

      const sex = normalizeGender(cols.sex >= 0 ? row[cols.sex] : '');
      const phone = normalizePhone(cols.phone >= 0 ? row[cols.phone] : '');
      const key = studentKey(name, sex);

      let student = studentIndex.get(key);
      if (student) {
        if (!student.phone && phone) student.phone = phone;
        if (!student.level && level) student.level = level;
      } else {
        student = {
          id: uid('stu_imp'),
          name,
          sex,
          phone,
          level: level || 'K1',
          dob: '2015-01-01',
          status: 'Active',
          enrollmentDate: today(),
        };
        results.students.push(student);
        studentIndex.set(key, student);
      }

      if (classId && !enrolledInSheet.has(student.id)) {
        enrolledInSheet.add(student.id);
        results.enrollments.push({ studentId: student.id, classId });
      }
    }
  }

  // Deduplicate enrollments
  const seen = new Set();
  results.enrollments = results.enrollments.filter(({ studentId, classId }) => {
    const k = `${studentId}|${classId}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });

  // Drop classes that received no enrollments
  const activeClassIds = new Set(results.enrollments.map((e) => e.classId));
  results.classes = results.classes.filter((c) => activeClassIds.has(c.id));

  // AI Gender Inference Fallback
  const missingGenderStudents = results.students.filter((s) => !s.sex);
  if (missingGenderStudents.length > 0) {
    if (onProgress) {
      onProgress('AI Thinking: Inferring student genders based on names...');
    }
    const { inferGenders } = await import('./aiGenderHelper');
    const namesToInfer = Array.from(
      new Set(missingGenderStudents.map((s) => s.name))
    );

    // inferGenders never throws — handles all AI failures internally via phonetic fallback
    const inferred = await inferGenders(namesToInfer);

    results.students.forEach((s) => {
      if (!s.sex) {
        s.sex = inferred[s.name.trim().toLowerCase()] ?? 'Female';
        s._genderInferred = true;
      }
    });
  }

  console.info('Parse complete:', {
    classes: results.classes.length,
    students: results.students.length,
    enrollments: results.enrollments.length,
    errors: results.errors.length,
  });

  return results;
};
