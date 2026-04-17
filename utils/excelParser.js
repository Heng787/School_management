import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const today = () => new Date().toISOString().split("T")[0];

const normalizePhone = (raw) => {
  const s = String(raw || "").trim();
  if (!s || s === "undefined") return "";
  return !s.startsWith("0") && s.replace(/\s/g, "").length >= 8 ? "0" + s : s;
};

const normalizeGender = (raw) => {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  return ["m", "male"].includes(s) ? "Male" : "Female";
};

const capitalize = (str) =>
  str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

// ─── Sheet filtering ──────────────────────────────────────────────────────────

const SKIP_SHEETS = new Set(["guide", "classes"]);

const shouldSkipSheet = (name) => {
  const l = name.toLowerCase().trim();
  return SKIP_SHEETS.has(l) || l.includes("to update") || /^\d+$/.test(l);
};

// ─── Class context extraction ─────────────────────────────────────────────────

const extractClassContext = (sheet, sheetName, fileName) => {
  let level = "",
    room = "",
    time = "",
    teacherName = "",
    branch = "Primary";

  // Scan top 10 rows for metadata cells
  for (const row of sheet.slice(0, 10)) {
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const val = String(row[j] || "").trim();
      const next = String(row[j + 1] || "").trim();
      const lv = val.toLowerCase();

      if (!level && /^[kg]\d/i.test(val) && val.length <= 4)
        level = val.toUpperCase();

      if (!room && lv.includes("room"))
        room = ["room", "room:", "room :"].includes(lv) ? next : val;

      if (!time && (lv.includes(":") || lv.includes("am") || lv.includes("pm")))
        if (val.length > 5 && val.length < 20 && /\d/.test(val)) time = val;

      if (!teacherName && (lv.includes("teacher") || lv.includes("tr:")))
        teacherName = ["teacher", "teacher:", "tr:"].includes(lv)
          ? next
          : val.split(/[:\s]/).slice(1).join(" ").trim();
    }
  }

  // Fallbacks from sheet name
  const upper = sheetName.toUpperCase();
  if (!level) level = (upper.match(/[KG][1-9]/) ?? [])[0] ?? "";
  if (!room) {
    room = upper.includes("ROOM")
      ? ((upper.match(/ROOM\s*\d+/) ?? [])[0] ?? "")
      : level && upper.length <= 5
        ? upper
        : "";
  }

  // Fallback teacher from parentheses in sheet/file name
  if (!teacherName) {
    for (const [, c] of `${sheetName} ${fileName ?? ""}`.matchAll(
      /\(([^)]+)\)/g,
    )) {
      if (c?.includes(" ") && c.length > 5 && !/^[ivx]+$/i.test(c)) {
        teacherName = c.trim();
        break;
      }
    }
  }

  // Final room normalisation
  if (level && (!room || ["room", "room:"].includes(room.toLowerCase())))
    room = sheetName.length < 15 ? sheetName : level;
  if (room && !room.toLowerCase().includes("room")) room = `Room ${room}`;
  if (time && !/weekday|weekend/i.test(time)) time = `Weekday ${time}`;

  return { level, room, time, teacherName, branch };
};

// ─── Column detection ─────────────────────────────────────────────────────────

const NAME_KEYS = new Set(["name", "student name", "student"]);
const SEX_KEYS = new Set(["sex", "gender"]);

const detectColumns = (sheet) => {
  const cols = { name: -1, sex: -1, phone: -1 };
  let headerRowIdx = -1;

  for (let i = 0; i < Math.min(sheet.length, 30); i++) {
    const row = sheet[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const v = String(row[j] || "")
        .trim()
        .toLowerCase();
      if (cols.name === -1 && NAME_KEYS.has(v)) {
        cols.name = j;
        headerRowIdx = i;
      }
      if (cols.sex === -1 && SEX_KEYS.has(v)) cols.sex = j;
      if (cols.phone === -1 && (v.includes("phone") || v.includes("contact")))
        cols.phone = j;
    }
    if (headerRowIdx === i) break;
  }

  return { cols, headerRowIdx };
};

// ─── Subject column detection ─────────────────────────────────────────────────

const EXCLUDED_HEADERS = new Set([
  "no",
  "name",
  "sex",
  "phone",
  "total",
  "avg",
  "result",
  "mention",
]);
const EXCLUDED_PARTS = ["change", "stop", "point"];

const detectSubjectCols = (sheet, headerRowIdx) => {
  // Shift up if we landed on a "points" sub-row
  if (
    headerRowIdx > 0 &&
    sheet[headerRowIdx].filter((c) => String(c).toLowerCase().includes("point"))
      .length >= 3
  )
    headerRowIdx--;

  const headerRow = sheet[headerRowIdx];
  const subjects = [];
  let lastSubject = "";

  for (let j = 0; j < headerRow.length; j++) {
    const val = String(headerRow[j] || "").trim();
    const lv = val.toLowerCase();
    const excluded =
      EXCLUDED_HEADERS.has(lv) || EXCLUDED_PARTS.some((p) => lv.includes(p));

    if (val && !excluded) {
      subjects.push({ col: j, name: val });
      lastSubject = val;
    } else if (!val && lastSubject && j > 3) {
      subjects.push({ col: j, name: `${lastSubject} Part 2` });
      lastSubject = "";
    } else {
      lastSubject = "";
    }
  }

  return { subjects, headerRowIdx };
};

// ─── Term / type extraction ───────────────────────────────────────────────────

const extractTermInfo = (sheetName, sheet) => {
  const l = sheetName.toLowerCase();
  const type = l.includes("exam")
    ? "Exam"
    : l.includes("result")
      ? "Exam"
      : "Daily";
  let term = l.includes("promotion") ? "Promotion" : "Midterm";

  for (const row of sheet.slice(0, 6)) {
    if (!row) continue;
    for (const cell of row) {
      const v = String(cell || "")
        .trim()
        .toLowerCase();
      if (v.includes("score sheet")) {
        const clean = v.replace("score sheet", "").trim();
        if (clean.length > 3) {
          term = capitalize(clean);
          break;
        }
      }
    }
  }

  return { type, term };
};

// ─── Student dedup key ────────────────────────────────────────────────────────
// Match on normalised name + sex to avoid collisions between male/female students
// who share the same name (edge case but real in classroom data).
const studentKey = (name, sex) =>
  `${name.trim().toLowerCase()}|${sex.toLowerCase()}`;

// ─── Main parser ──────────────────────────────────────────────────────────────

export const parseExcelFile = async (file) => {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

  const results = {
    classes: [],
    students: [],
    enrollments: [],
    grades: [],
    errors: [],
  };

  // name|sex → student object for fast dedup lookups
  const studentIndex = new Map();
  // "name|level" → classId for fast class lookups
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
      file?.name,
    );
    const { cols, headerRowIdx } = detectColumns(sheet);
    const { type, term } = extractTermInfo(sheetName, sheet);

    // ── Register class ────────────────────────────────────────────────────────
    let classId = "";
    if (level && room) {
      const classKey = `${room.toLowerCase()}|${level.toLowerCase()}`;
      if (classIndex.has(classKey)) {
        classId = classIndex.get(classKey);
      } else {
        classId = uid("cls_imp");
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

    // ── Students & enrollments ────────────────────────────────────────────────
    const enrolledInSheet = new Set(); // prevent duplicate enrollments within one sheet

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
        name.toLowerCase() === "name" ||
        name.toLowerCase() === "no" ||
        (!isNaN(name) && name.length < 3)
      )
        continue;

      const sex = normalizeGender(cols.sex >= 0 ? row[cols.sex] : "");
      const phone = normalizePhone(cols.phone >= 0 ? row[cols.phone] : "");
      const key = studentKey(name, sex);

      let student = studentIndex.get(key);
      if (student) {
        // Enrich with any new data found in this sheet
        if (!student.phone && phone) student.phone = phone;
        if (!student.level && level) student.level = level;
      } else {
        student = {
          id: uid("stu_imp"),
          name,
          sex,
          phone,
          level: level || "K1",
          dob: "2015-01-01",
          status: "Active",
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

    // ── Grades ────────────────────────────────────────────────────────────────
    const { subjects, headerRowIdx: subHeaderIdx } = detectSubjectCols(
      sheet,
      headerRowIdx,
    );
    if (!subjects.length) continue;

    const gradeDate = today();
    for (let i = subHeaderIdx + 1; i < sheet.length; i++) {
      const row = sheet[i];
      if (!row?.[cols.name]) continue;

      const sex = normalizeGender(cols.sex >= 0 ? row[cols.sex] : "");
      const student = studentIndex.get(
        studentKey(String(row[cols.name]).trim(), sex),
      );
      if (!student) continue;

      for (const sub of subjects) {
        const score = parseFloat(row[sub.col]);
        if (!isNaN(score)) {
          results.grades.push({
            id: uid("grd"),
            studentId: student.id,
            classId: classId || results.classes[0]?.id || "",
            subject: sub.name,
            score,
            type,
            term,
            date: gradeDate,
          });
        }
      }
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  // Dedup enrollments (belt-and-suspenders — the Set above prevents most)
  const seen = new Set();
  results.enrollments = results.enrollments.filter(({ studentId, classId }) => {
    const k = `${studentId}|${classId}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });

  // Drop classes that received no enrollments
  const activeClassIds = new Set(results.enrollments.map((e) => e.classId));
  results.classes = results.classes.filter((c) => activeClassIds.has(c.id));

  console.info("Parse complete:", {
    classes: results.classes.length,
    students: results.students.length,
    enrollments: results.enrollments.length,
    grades: results.grades.length,
    errors: results.errors.length,
  });

  return results;
};
