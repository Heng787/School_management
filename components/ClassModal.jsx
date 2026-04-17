import React, { useState, useEffect, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import { StaffRole } from "../types";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  "mt-1 w-full px-3 py-2 bg-white border border-gray-400 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
const selectCls =
  "mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black";
const labelCls = "block text-sm font-medium text-primary-900";

// ─── Reusable Autosuggest ─────────────────────────────────────────────────────
const Autosuggest = ({
  label,
  value,
  onChange,
  suggestions,
  onSelect,
  placeholder,
  renderItem,
}) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    setOpen(e.target.value.length > 0);
  };

  return (
    <div ref={ref} className="relative">
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className={inputCls}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <li
                key={item.id}
                onMouseDown={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
              >
                {renderItem ? renderItem(item) : item.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 italic">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

// ─── Student Row ──────────────────────────────────────────────────────────────
const StudentRow = ({ student, onRemove }) => (
  <tr>
    <td className="px-4 py-2 text-sm text-gray-500">{student.id}</td>
    <td className="px-4 py-2 text-sm font-medium text-gray-900">
      {student.name}
    </td>
    <td className="px-4 py-2 text-sm text-gray-500">{student.sex}</td>
    <td className="px-4 py-2 text-sm text-gray-500">{student.phone}</td>
    <td className="px-4 py-2 text-right">
      <button
        type="button"
        onClick={() => onRemove(student.id)}
        className="text-sm text-red-600 hover:text-red-900"
      >
        Remove
      </button>
    </td>
  </tr>
);

// ─── Hooks ────────────────────────────────────────────────────────────────────
const normalizeRoomName = (name) =>
  name && /^\d+$/.test(name) ? `Room ${name}` : name;

const useRoomOptions = (classData) =>
  useMemo(() => {
    const rooms = Array.from({ length: 20 }, (_, i) => `Room ${i + 1}`);
    const opts = [...rooms, "Library", "Conference"];
    const customName = normalizeRoomName(classData?.name);
    if (customName && !opts.includes(customName)) opts.push(customName);
    return opts;
  }, [classData]);

const useLevelOptions = (levels, classData) =>
  useMemo(() => {
    const opts = [...levels];
    if (classData?.level && !opts.includes(classData.level))
      opts.push(classData.level);
    return opts;
  }, [levels, classData]);

// ─── Main Component ───────────────────────────────────────────────────────────
const ClassModal = ({ classData, onClose }) => {
  const {
    staff,
    students,
    timeSlots,
    levels,
    addClass,
    updateClass,
    enrollments,
    updateClassEnrollments,
  } = useData();

  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    schedule: "",
    level: levels[0] || "K1",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherSuggestions, setTeacherSuggestions] = useState([]);

  const [studentSearch, setStudentSearch] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [scheduleType, setScheduleType] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const availableTeachers = staff.filter((s) => s.role === StaffRole.Teacher);
  const roomOptions = useRoomOptions(classData);
  const levelOptions = useLevelOptions(levels, classData);
  const availableTimes = useMemo(
    () => timeSlots.filter((s) => s.type === scheduleType).map((s) => s.time),
    [scheduleType, timeSlots],
  );

  // Pre-fill when editing
  useEffect(() => {
    if (!classData) return;
    const name = normalizeRoomName(classData.name);
    setFormData({
      name,
      teacherId: classData.teacherId,
      schedule: classData.schedule,
      level: classData.level,
    });

    const teacher = staff.find((t) => t.id === classData.teacherId);
    if (teacher) setTeacherSearch(teacher.name);

    const enrolled = enrollments
      .filter((e) => e.classId === classData.id)
      .map((e) => e.studentId);
    setSelectedStudents(students.filter((s) => enrolled.includes(s.id)));

    if (classData.schedule) {
      const lower = classData.schedule.toLowerCase();
      setScheduleType(
        lower.includes("weekday")
          ? "weekday"
          : lower.includes("weekend")
            ? "weekend"
            : "",
      );
      const match = timeSlots.find(
        (s) =>
          s.time && lower.includes(s.time.toLowerCase().replace(/\s/g, "")),
      )?.time;
      setSelectedTime(
        match ?? classData.schedule.split(" ").slice(1).join(" "),
      );
    }
  }, [classData, staff, students, timeSlots, enrollments]);

  // Sync schedule string
  useEffect(() => {
    if (scheduleType && selectedTime) {
      const label = scheduleType === "weekday" ? "Weekday" : "Weekend";
      setFormData((prev) => ({
        ...prev,
        schedule: `${label} ${selectedTime}`,
      }));
    }
  }, [scheduleType, selectedTime]);

  // Handlers
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTeacherSearch = (query) => {
    setTeacherSearch(query);
    setFormData((prev) => ({ ...prev, teacherId: "" }));
    setTeacherSuggestions(
      query
        ? availableTeachers.filter((t) =>
            t.name.toLowerCase().includes(query.toLowerCase()),
          )
        : [],
    );
  };

  const handleStudentSearch = (query) => {
    setStudentSearch(query);
    const taken = new Set(selectedStudents.map((s) => s.id));
    setStudentSuggestions(
      query
        ? students.filter(
            (s) =>
              !taken.has(s.id) &&
              s.name.toLowerCase().includes(query.toLowerCase()),
          )
        : [],
    );
  };

  const selectStudent = (student) => {
    setSelectedStudents((prev) => [...prev, student]);
    setStudentSearch("");
  };

  const toggleScheduleType = (type) => {
    setScheduleType((prev) => (prev === type ? "" : type));
    setSelectedTime("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.teacherId || !formData.schedule) {
      setError("Please complete Class Name, Teacher, and Schedule fields.");
      return;
    }
    setIsSaving(true);
    const studentIds = selectedStudents.map((s) => s.id);
    try {
      if (classData) {
        await updateClass({ ...classData, ...formData });
        await updateClassEnrollments(classData.id, studentIds);
      } else {
        const id = `class_${Date.now()}`;
        await addClass({ ...formData, id });
        await updateClassEnrollments(id, studentIds);
      }
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const dayBtn = (type, label) => (
    <button
      type="button"
      onClick={() => toggleScheduleType(type)}
      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        scheduleType === type
          ? "bg-primary-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          {classData ? "Edit Class" : "Add New Class"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room */}
          <div>
            <label htmlFor="name" className={labelCls}>
              Class Name / Room
            </label>
            <select
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={selectCls}
              required
            >
              <option value="" disabled>
                Select a room/location
              </option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Level + Teacher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className={labelCls}>
                Level
              </label>
              <select
                name="level"
                id="level"
                value={formData.level}
                onChange={handleChange}
                className={selectCls}
              >
                {levelOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <Autosuggest
              label="Teacher"
              value={teacherSearch}
              onChange={handleTeacherSearch}
              suggestions={teacherSuggestions}
              onSelect={(t) => {
                setTeacherSearch(t.name);
                setFormData((p) => ({ ...p, teacherId: t.id }));
              }}
              placeholder="Type to search..."
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <p className={labelCls}>Schedule</p>
            <div className="p-3 bg-gray-50 rounded-md border space-y-3">
              <div>
                <h4 className="text-sm font-medium text-primary-900 mb-2">
                  Days
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dayBtn("weekday", "Weekday")}
                  {dayBtn("weekend", "Weekend")}
                </div>
              </div>
              <div>
                <label htmlFor="timeSlot" className={`${labelCls} mb-2 block`}>
                  Time Slot
                </label>
                <select
                  id="timeSlot"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!scheduleType}
                  className={`block w-full pl-3 pr-10 py-2 text-base bg-white border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm rounded-md text-black disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    Select a time slot
                  </option>
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="hidden"
              name="schedule"
              value={formData.schedule}
              required
            />
          </div>

          {/* Student Search */}
          <Autosuggest
            label="Add Students"
            value={studentSearch}
            onChange={handleStudentSearch}
            suggestions={studentSuggestions}
            onSelect={selectStudent}
            placeholder="Type student name to add..."
            renderItem={(s) => (
              <>
                <span>{s.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  {s.level}
                </span>
              </>
            )}
          />
          <p className="-mt-3 text-xs text-gray-500">
            Search for any student to add to this class.
          </p>

          {/* Student Table */}
          <div>
            <h4 className="text-sm font-medium text-primary-900 mb-2">
              Students in Class ({selectedStudents.length})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {["ID", "Name", "Sex", "Phone", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStudents.length > 0 ? (
                      selectedStudents.map((s) => (
                        <StudentRow
                          key={s.id}
                          student={s}
                          onRemove={(id) =>
                            setSelectedStudents((p) =>
                              p.filter((x) => x.id !== id),
                            )
                          }
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-4 text-sm text-gray-500"
                        >
                          No students added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSaving
                ? "Saving..."
                : classData
                  ? "Update Class"
                  : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
