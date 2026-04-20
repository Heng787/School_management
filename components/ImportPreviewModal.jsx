import React, { useState } from "react";
import { X, Sparkles, Check, AlertTriangle } from "lucide-react";

/**
 * PAGE: components/ImportPreviewModal
 * DESCRIPTION: Intercepts an import to allow reviewing AI-classified genders.
 */
const ImportPreviewModal = ({ students, onConfirm, onCancel }) => {
  const [editableStudents, setEditableStudents] = useState([...students]);
  const hasInferred = editableStudents.some((s) => s._genderInferred);
  const hasConflicts = editableStudents.some(
    (s) => s._possibleMatches && s._possibleMatches.length > 0
  );

  const [showInferredOnly, setShowInferredOnly] = useState(hasInferred);
  const [showConflictsOnly, setShowConflictsOnly] = useState(hasConflicts);

  const handleGenderChange = (studentToChange, newSex) => {
    setEditableStudents(
      editableStudents.map((s) =>
        s === studentToChange ? { ...s, sex: newSex } : s
      )
    );
  };

  const handleMatchChange = (studentToChange, newMatchId) => {
    setEditableStudents(
      editableStudents.map((s) =>
        s === studentToChange ? { ...s, _selectedMatchId: newMatchId } : s
      )
    );
  };

  const handleConfirm = () => {
    onConfirm(editableStudents);
  };

  const displayedStudents = editableStudents.filter((s) => {
    if (showInferredOnly && !showConflictsOnly) return s._genderInferred;
    if (showConflictsOnly && !showInferredOnly)
      return s._possibleMatches && s._possibleMatches.length > 0;
    if (showInferredOnly && showConflictsOnly)
      return (
        s._genderInferred ||
        (s._possibleMatches && s._possibleMatches.length > 0)
      );
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Review Import Data
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Please verify the extracted data before saving to the database.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {hasInferred && (
            <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/30 rounded-xl p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-300">
                  AI Gender Classification Applied
                </h3>
                <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                  Some rows were missing a gender value. The system has automatically inferred them using AI. 
                  Please review the highlighted rows below and correct them with a single click if necessary.
                </p>
              </div>
            </div>
          )}

          {hasConflicts && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  Possible Duplicate Profiles Detected
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Some imported names match existing students. Review the "Match Resolution" column below to verify whether they should be linked together or created separately.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Students to Import ({displayedStudents.length} rows)
            </h3>
            <div className="flex items-center gap-4">
              {hasInferred && (
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showInferredOnly}
                    onChange={(e) => setShowInferredOnly(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Unclassified
                </label>
              )}
              {hasConflicts && (
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showConflictsOnly}
                    onChange={(e) => setShowConflictsOnly(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  Duplicate Checks
                </label>
              )}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Sex</th>
                  {hasConflicts && (
                    <th className="px-4 py-3 font-medium text-amber-700 dark:text-amber-500 w-1/3">
                      Match Resolution
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {displayedStudents.map((student, idx) => (
                  <tr 
                    key={idx} 
                    className={
                      student._genderInferred 
                        ? "bg-primary-50/50 dark:bg-primary-900/10" 
                        : "bg-white dark:bg-slate-900"
                    }
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {student.level || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {student.phone || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student._genderInferred && (
                          <Sparkles className="w-4 h-4 text-primary-500" title="Inferred by AI" />
                        )}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-max">
                          <button
                            onClick={() => handleGenderChange(student, "Male")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              student.sex === "Male"
                                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                            }`}
                          >
                            Male
                          </button>
                          <button
                            onClick={() => handleGenderChange(student, "Female")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              student.sex === "Female"
                                ? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                            }`}
                          >
                            Female
                          </button>
                        </div>
                      </div>
                    </td>
                    {hasConflicts && (
                      <td className="px-4 py-3">
                        {student._possibleMatches && student._possibleMatches.length > 0 ? (
                          <select
                            value={student._selectedMatchId}
                            onChange={(e) => handleMatchChange(student, e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none w-full shadow-sm"
                          >
                            <option value="NEW">✨ Create New Student</option>
                            <optgroup label="Link to Database Profile">
                              {student._possibleMatches.map((m) => (
                                <option key={m.id} value={m.id}>
                                  🔗 {m.name} ({m.sex}, Level: {m.level || "-"}) - ID: {m.id}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center w-full">
                            ✨ New
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel Import
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;
