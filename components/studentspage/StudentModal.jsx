import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { StudentStatus } from "../../types";
import Modal from "../ui/Modal";

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]";
const inputCls =
  "mt-1 w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200";

// ─── Field primitives ─────────────────────────────────────────────────────────
const Field = ({ label, children, id }) => (
  <div>
    <label htmlFor={id} className={labelCls}>{label}</label>
    {children}
  </div>
);

const Input = ({ label, id, ...props }) => (
  <Field label={label} id={id || props.name}>
    <input id={id || props.name} className={inputCls} {...props} />
  </Field>
);

const Select = ({ label, id, options, ...props }) => (
  <Field label={label} id={id || props.name}>
    <select id={id || props.name} className={inputCls} {...props}>
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
  status: StudentStatus.Pending,
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
  const { addStudent, updateStudent, levels, addActivityLog, apiService } = useData();
  const [formData, setFormData] = useState(
    () => studentData ?? defaultForm(levels),
  );
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(null); // Collision warning
  const [isSaving, setIsSaving] = useState(false);
  const [ignoreCollision, setIgnoreCollision] = useState(false);

  useEffect(() => {
    if (studentData) setFormData(studentData);
  }, [studentData]);

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate(formData);
    if (err) {
      setError(err);
      return;
    }

    setIsSaving(true);
    try {
      // Identity Collision Check (Only for new students, unless name/dob changed)
      if (!studentData && !ignoreCollision) {
        const validation = await apiService.validateStudent(formData);
        if (validation.isPotentialDuplicate) {
          setWarning({
            message: `Potential identity collision detected! ${validation.collisions.length} student(s) with the same Name and DOB already exist.`,
            details: validation.collisions
          });
          setIsSaving(false);
          return;
        }
      }

      await (studentData
        ? updateStudent({ ...studentData, ...formData })
        : addStudent(formData));
      
      if (!studentData) {
        addActivityLog({
          action: `Student "${formData.name}" added to the system`
        });
      }
      onClose();
    } catch (e) {
      console.error("Save Error:", e);
      setError(e.message || "Save failed. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      onClose={onClose} 
      ariaLabelledBy="student-modal-title"
      maxWidth="max-w-lg"
    >
      <h2 
        id="student-modal-title"
        className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 tracking-tight"
      >
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

        {warning && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-800">{warning.message}</p>
                <div className="text-[10px] font-medium text-amber-700/80 bg-white/50 p-2 rounded-lg border border-amber-100/50">
                  {warning.details.map(c => (
                    <div key={c.id} className="flex justify-between gap-4 py-0.5 first:pt-0 last:pb-0 border-b border-amber-100/30 last:border-0">
                      <span className="font-bold">{c.id}</span>
                      <span>{c.phone || 'No phone'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIgnoreCollision(true);
                setWarning(null);
              }}
              className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-widest rounded-lg transition-colors"
            >
              It's a different person - Save Anyway
            </button>
          </div>
        )}

        <div className="flex justify-end pt-6 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            )}
            {studentData ? "Update Record" : "Save Student"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentModal;
