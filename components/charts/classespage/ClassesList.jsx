import React from "react";
import ClassRow from "./ClassRow";

const ClassList = ({
  allSessionLabels,
  classesByTimeSlot,
  enrollments,
  students,
  highlightedClassId,
  highlightedRowRef,
  isAdmin,
  isOffice,
  selectedClassIds,
  expandedClassId,
  getTeacherName,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const hasAnyClasses = Object.values(classesByTimeSlot).some(arr => arr && arr.length > 0);

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden transition-all duration-300">
      {!hasAnyClasses ? (
        <div className="p-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Classes Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-1">
              {allSessionLabels.length === 0 
                ? "Go to Class Settings to add school sessions (time slots) first." 
                : "No classes match your current filter criteria. Try adjusting your filters or add a new class."}
            </p>
          </div>
        </div>
      ) : (
        [...allSessionLabels, "Other Schedule"].map((label) => {
          const slotClasses = classesByTimeSlot[label];

          if (!slotClasses || slotClasses.length === 0) return null;

          return (
            <div
              key={label}
              className="border-b last:border-b-0 border-slate-100 dark:border-slate-800"
            >
              {/* Time Slot Header */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-3 flex justify-between items-center border-y border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    {label}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                  {slotClasses.length} Classes
                </span>
              </div>

              {/* Class Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {slotClasses.map((cls) => {
                  const isHighlighted = cls.id === highlightedClassId;
                  const isSelected = selectedClassIds.has(cls.id);
                  const teacherName = getTeacherName(cls.teacherId, cls);
                  const studentCount = enrollments.filter(
                    (e) => e.classId === cls.id,
                  ).length;
                  const capacity = cls.capacity || 30; // Use dynamic capacity if available
                  const percentage = Math.min(
                    (studentCount / capacity) * 100,
                    100,
                  );
                  const isExpanded = expandedClassId === cls.id;
                  const enrolledStudentsInClass = enrollments
                    .filter((e) => e.classId === cls.id)
                    .map((e) => students.find((s) => s.id === e.studentId))
                    .filter(Boolean)
                    .sort((a, b) =>
                      (a?.name || "").localeCompare(b?.name || ""),
                    );

                  return (
                    <ClassRow
                      key={cls.id}
                      cls={cls}
                      isHighlighted={isHighlighted}
                      isSelected={isSelected}
                      isExpanded={isExpanded}
                      isAdmin={isAdmin}
                      isOffice={isOffice}
                      teacherName={teacherName}
                      studentCount={studentCount}
                      capacity={capacity}
                      percentage={percentage}
                      enrolledStudentsInClass={enrolledStudentsInClass}
                      highlightedRowRef={highlightedRowRef}
                      onToggleExpand={onToggleExpand}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleSelect={onToggleSelect}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClassList;
