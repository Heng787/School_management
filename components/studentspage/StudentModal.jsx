import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { StudentStatus } from "../../types";

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelCls = "block text-sm font-semibold text-primary-900";
const inputCls =
  "mt-1 w-full px-3 py-2 bg-white border border-gray-400 rounded-md text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";

// ─── Field primitives ─────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <Field label={label}>
    <input className={inputCls} {...props} />
  </Field>
);

const Select = ({ label, options, ...props }) => (
  <Field label={label}>
    <select className={inputCls} {...props}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </Field>
);

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
    <svg
      className="w-4 h-4 text-red-500 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <p className="text-xs font-bold text-red-600">{message}</p>
  </div>
);

// ─── Default form state ───────────────────────────────────────────────────────
const defaultForm = (levels) => ({
  name: "",
  dob: "",
  sex: "Male",
  level: levels[0] || "K1",
  status: StudentStatus.Active,
  phone: "",
  enrollmentDate: new Date().toISOString().split("T")[0],
});

const validate = ({ name, sex, dob, enrollmentDate }) => {
  if (!name || !sex) return "Please provide at least a Name and Gender.";
  if (dob && enrollmentDate && new Date(enrollmentDate) < new Date(dob))
    return "Enrollment date cannot be earlier than date of birth.";
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentModal = ({ studentData, onClose }) => {
  const { addStudent, updateStudent, levels } = useData();
  const [formData, setFormData] = useState(
    () => studentData ?? defaultForm(levels),
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (studentData) setFormData(studentData);
  }, [studentData]);

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(formData);
    if (err) {
      setError(err);
      return;
    }

    setIsSaving(true);
    try {
      await (studentData
        ? updateStudent({ ...studentData, ...formData })
        : addStudent(formData));
      onClose();
    } catch {
      setError("Save failed. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-8 w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">
          {studentData ? "Update Student Record" : "Register New Student"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
            <Select
              label="Sex *"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={["Male", "Female"]}
            />
            <Input
              label="Phone Number"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Select
              label="Study Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={Object.values(StudentStatus)}
            />
            <Input
              label="Enrollment Date"
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleChange}
              required
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex justify-end pt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 flex items-center"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              )}
              {studentData ? "Update Record" : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
