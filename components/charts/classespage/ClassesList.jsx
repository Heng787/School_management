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
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {allSessionLabels.length === 0 &&
      classesByTimeSlot["Other Schedule"]?.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 italic">
            No sessions defined and no classes exist. Go to Class Settings to
            add school sessions (time slots).
          </p>
        </div>
      ) : (
        [...allSessionLabels, "Other Schedule"].map((label) => {
          const slotClasses = classesByTimeSlot[label];

          if (!slotClasses || slotClasses.length === 0) return null;

          return (
            <div
              key={label}
              className="border-b last:border-b-0 border-slate-100"
            >
              {/* Time Slot Header */}
              <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-2.5 flex justify-between items-center border-y border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {label}
                  </h3>
                </div>
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
                  const capacity = 30;
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
