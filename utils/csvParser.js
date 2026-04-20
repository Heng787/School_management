import { StudentStatus, StaffRole } from "../types";

// ─── Date normalisation ───────────────────────────────────────────────────────

const normalizeDate = (raw, fieldName) => {
  const s = raw?.trim();
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy)
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().split("T")[0];

  throw new Error(
    `'${fieldName}' has invalid format. Use YYYY-MM-DD or DD/MM/YYYY.`,
  );
};

const today = () => new Date().toISOString().split("T")[0];

// ─── CSV line parser ──────────────────────────────────────────────────────────

const unquote = (field) =>
  field.startsWith('"') && field.endsWith('"')
    ? field.slice(1, -1).replace(/""/g, '"')
    : field;

const parseCSVLine = (text) => {
  const fields = [];
  let start = 0,
    inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') inQuotes = !inQuotes;
    else if (text[i] === "," && !inQuotes) {
      fields.push(unquote(text.slice(start, i).trim()));
      start = i + 1;
    }
  }
  fields.push(unquote(text.slice(start).trim()));
  return fields;
};

// ─── Header canonicalisation ──────────────────────────────────────────────────

const key = (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

const HEADER_MAPS = {
  student: {
    name: ["name", "studentname", "fullname"],
    sex: ["sex", "gender"],
    dob: ["dob", "dateofbirth", "birthdate"],
    level: ["level", "grade", "class", "gradelevel"],
    phone: ["phone", "mobile", "contact", "phonenumber"],
    enrollmentDate: ["enrollmentdate", "joined", "admissiondate", "startdate"],
    status: ["status", "studystatus"],
  },
  staff: {
    name: ["name", "fullname", "staffname"],
    role: ["role", "position", "job"],
    contact: ["contact", "phone", "email", "mobile"],
    hireDate: ["joined", "hiredate", "startdate"],
    subject: ["subject", "teaching"],
  },
  class: {
    name: ["name", "classname", "room", "roomname"],
    level: ["level", "grade", "gradelevel"],
    teacher: ["teacher", "teachername", "instructor"],
    schedule: ["schedule", "time", "timeslot", "session"],
  },
};

const buildCanonical = (type) => {
  const map = HEADER_MAPS[type];
  const lookup = {};
  for (const [canonical, aliases] of Object.entries(map))
    for (const alias of aliases) lookup[alias] = canonical;
  return (header) => lookup[key(header)] ?? null;
};

// ─── Shared CSV engine ────────────────────────────────────────────────────────

const NICE_NAMES = {
  name: "Full Name",
  sex: "Sex",
  role: "Role",
  contact: "Contact",
  level: "Level",
  schedule: "Schedule",
};

/**
 * parseCSV — shared parsing engine used by all three parsers.
 * @param {string}   csvContent
 * @param {Function} getCanonical  header → canonical key
 * @param {string[]} required      canonical keys that must be present
 * @param {Function} validateRow   (getValue, rowNum) → parsed object | throws
 */
const parseCSV = (csvContent, getCanonical, required, validateRow) => {
  const valid = [];
  const errors = [];

  const lines = csvContent
    .trim()
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n|\r/)
    .filter((l) => l.trim());

  if (lines.length < 2) {
    errors.push({ row: 0, message: "CSV file is empty or missing headers." });
    return { valid, errors };
  }

  const headers = parseCSVLine(lines[0]).map(getCanonical);
  const missing = required.filter((r) => !headers.includes(r));

  if (missing.length) {
    const labels = missing.map((c) => NICE_NAMES[c] ?? c);
    errors.push({
      row: 1,
      message: `Missing required columns: ${labels.join(", ")}`,
    });
    return { valid, errors };
  }

  // Map canonical key → column index
  const headerMap = Object.fromEntries(
    headers.flatMap((h, i) => (h ? [[h, i]] : [])),
  );
  const getValue = (values) => (key) => {
    const i = headerMap[key];
    return i !== undefined ? (values[i] ?? "") : "";
  };

  for (let i = 1; i < lines.length; i++) {
    try {
      valid.push(validateRow(getValue(parseCSVLine(lines[i])), i + 1));
    } catch (e) {
      errors.push({
        row: i + 1,
        message: e.message ?? "Unknown parsing error.",
      });
    }
  }

  return { valid, errors };
};

// ─── Row validators ───────────────────────────────────────────────────────────

const ROLE_SHORTHANDS = {
  T: StaffRole.Teacher,
  A: StaffRole.AssistantTeacher,
  O: StaffRole.OfficeWorker,
  G: StaffRole.Guard,
  C: StaffRole.Cleaner,
};

const normalizeSex = (raw) => {
  const s = raw.trim().toLowerCase();
  if (!s) return "";
  if (["male", "m"].includes(s)) return "Male";
  if (["female", "f"].includes(s)) return "Female";
  throw new Error("'Sex' must be 'Male' or 'Female'.");
};

const normalizeRole = (raw) => {
  const upper = raw.trim().toUpperCase();
  if (ROLE_SHORTHANDS[upper]) return ROLE_SHORTHANDS[upper];
  const match = Object.values(StaffRole).find(
    (r) => r.toLowerCase() === raw.trim().toLowerCase(),
  );
  if (match) return match;
  throw new Error(
    `Invalid 'Role' "${raw}". Use T (Teacher), A (Assistant), O (Office) or full names.`,
  );
};

const normalizeStatus = (raw) => {
  if (!raw) return StudentStatus.Active;
  const match = Object.values(StudentStatus).find(
    (s) => s.toLowerCase() === raw.trim().toLowerCase(),
  );
  if (match) return match;
  throw new Error(
    `Invalid 'Status'. Allowed: ${Object.values(StudentStatus).join(", ")}`,
  );
};

const validateStudent = (get) => {
  const name = get("name");
  if (!name) throw new Error("'Name' is required.");
  const sex = normalizeSex(get("sex") || "");
  return {
    name,
    sex,
    dob: normalizeDate(get("dob"), "Date of Birth"),
    phone: get("phone"),
    level: get("level") || "K1",
    enrollmentDate:
      normalizeDate(get("enrollmentDate"), "Enrollment Date") || today(),
    status: normalizeStatus(get("status")),
  };
};

const validateStaff = (get) => {
  const name = get("name");
  if (!name) throw new Error("'Name' is required.");
  const contact = get("contact");
  if (!contact) throw new Error("'Contact' is required.");
  const subject = get("subject");
  return {
    name,
    contact,
    role: normalizeRole(get("role")),
    hireDate: normalizeDate(get("hireDate"), "Hire Date") || today(),
    ...(subject ? { subject } : {}),
  };
};

const validateClass = (staffList) => (get) => {
  const name = get("name");
  if (!name) throw new Error("'Class Name' is required.");
  const level = get("level");
  if (!level) throw new Error("'Level' is required.");
  const schedule = get("schedule");
  if (!schedule) throw new Error("'Schedule' is required.");

  let teacherId = "";
  const teacherName = get("teacher");
  if (teacherName) {
    const TEACHER_ROLES = new Set([
      StaffRole.Teacher,
      StaffRole.AssistantTeacher,
    ]);
    const match = staffList.find(
      (s) =>
        s.name.toLowerCase() === teacherName.toLowerCase() &&
        TEACHER_ROLES.has(s.role),
    );
    if (!match) throw new Error(`Teacher '${teacherName}' not found.`);
    teacherId = match.id;
  }

  return { name, level, schedule, teacherId };
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const parseStudentCSV = async (csvContent) => {
  const { valid, errors } = parseCSV(
    csvContent,
    buildCanonical("student"),
    ["name"],
    validateStudent,
  );

  const missingGenderStudents = valid.filter(v => v.sex === "");
  if (missingGenderStudents.length > 0) {
    const { inferGenders } = await import('./aiGenderHelper');
    const namesToInfer = Array.from(new Set(missingGenderStudents.map(s => s.name)));
    const inferred = await inferGenders(namesToInfer);
    
    valid.forEach(s => {
      if (s.sex === "") {
        s.sex = String(inferred[s.name] || "").trim().toLowerCase() === "male" ? "Male" : "Female";
        s._genderInferred = true;
      }
    });
  }

  return { validStudents: valid, errors };
};

export const parseStaffCSV = (csvContent) => {
  const { valid, errors } = parseCSV(
    csvContent,
    buildCanonical("staff"),
    ["name", "role", "contact"],
    validateStaff,
  );
  return { validStaff: valid, errors };
};

export const parseClassCSV = (csvContent, staffList) => {
  const { valid, errors } = parseCSV(
    csvContent,
    buildCanonical("class"),
    ["name", "level", "schedule"],
    validateClass(staffList),
  );
  return { validClasses: valid, errors };
};
