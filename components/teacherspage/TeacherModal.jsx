import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { StaffRole } from "../../types";

/**
 * COMPONENT: TeacherModal
 * DESCRIPTION: Modal for adding and editing staff records.
 */
const TeacherModal = ({ staffData, onClose }) => {
  const { addStaff, updateStaff } = useData();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    subject: "",
    email: "",
    phone: "",
    hireDate: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (staffData) {
      let initialEmail = "";
      let initialPhone = "";
      if (staffData.contact) {
        if (staffData.contact.includes("|")) {
          const parts = staffData.contact.split("|").map((s) => s.trim());
          initialPhone = parts[0] || "";
          initialEmail = parts[1] || "";
        } else if (staffData.contact.includes("@")) {
          initialEmail = staffData.contact;
        } else {
          initialPhone = staffData.contact;
        }
      }
      setFormData({
        name: staffData.name,
        role: staffData.role,
        subject: staffData.subject || "",
        email: initialEmail,
        phone: initialPhone,
        hireDate: staffData.hireDate,
      });
    }
  }, [staffData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const isTeacherRole =
      formData.role === StaffRole.Teacher ||
      formData.role === StaffRole.AssistantTeacher;
    if (!formData.name || (!formData.email && !formData.phone)) {
      setError(
        "Please fill out all required fields (Name and at least one contact).",
      );
      return;
    }

    let contactString = "";
    if (formData.phone && formData.email) {
      contactString = `${formData.phone} | ${formData.email}`;
    } else if (formData.phone) {
      contactString = formData.phone;
    } else if (formData.email) {
      contactString = formData.email;
    }

    const payload = {
      name: formData.name,
      role: formData.role,
      contact: contactString,
      hireDate: formData.hireDate,
      subject: isTeacherRole ? formData.subject || undefined : undefined,
    };

    if (staffData) {
      updateStaff({ ...staffData, ...payload });
    } else {
      addStaff(payload);
    }
    onClose();
  };

  const inputClasses =
    "mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-primary-900";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          {staffData ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClasses}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="role" className={labelClasses}>
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.values(StaffRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelClasses}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClasses}
                placeholder="012-345-678"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                placeholder="email@school.com"
              />
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
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {staffData ? "Update Staff Member" : "Add Staff Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;
