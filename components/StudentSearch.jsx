import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useData } from '../context/DataContext';

import { Page, StaffRole } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────
const TEACHER_ROLES = new Set([StaffRole.Teacher, StaffRole.AssistantTeacher]);

const RESULT_GROUPS = [
  { type: 'student', label: 'Students' },
  { type: 'teacher', label: 'Teaching Staff' },
  { type: 'class', label: 'Classes' },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────
const Highlight = ({ text, query }) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i}>{part}</strong>
        ) : (
          part
        ),
      )}
    </span>
  );
};

const ResultItem = ({
  result,
  query,
  isActive,
  onSelect,
  onHover,
  classes,
  enrollments,
}) => {
  const { type, data } = result;

  const subtitle = {
    student: () => {
      const classId = enrollments.find((e) => e.studentId === data.id)?.classId;
      const cls = classId ? classes.find((c) => c.id === classId) : null;
      return (
        <>
          ID: <Highlight text={data.id} query={query} />
          {cls ? ` | Level: ${cls.level}` : ''}
        </>
      );
    },
    teacher: () => `Role: ${data.role}`,
    class: () => `Level: ${data.level} | Schedule: ${data.schedule}`,
  }[type]();

  return (
    <li
      onClick={onSelect}
      onMouseOver={onHover}
      className={`px-4 py-3 cursor-pointer ${isActive ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
    >
      <p className="font-semibold text-gray-800">
        <Highlight text={data.name} query={query} />
      </p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </li>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentSearch = ({ navigate }) => {
  const {
    students,
    staff,
    classes,
    enrollments,
    setHighlightedStudentId,
    setHighlightedStaffId,
    setHighlightedClassId,
  } = useData();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);

  // Build results on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase();

    const combined = [
      ...students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
        )
        .map((s) => ({ type: 'student', data: s })),
      ...staff
        .filter(
          (t) => TEACHER_ROLES.has(t.role) && t.name.toLowerCase().includes(q),
        )
        .map((t) => ({ type: 'teacher', data: t })),
      ...classes
        .filter((c) => c.name.toLowerCase().includes(q))
        .map((c) => ({ type: 'class', data: c })),
    ];

    setResults(combined);
    setIsOpen(combined.length > 0);
    setActiveIndex(-1);
  }, [query, students, staff, classes]);

  // Click outside
  const handleClickOutside = useCallback((e) => {
    if (searchRef.current && !searchRef.current.contains(e.target))
      setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Navigation + highlight on select
  const PAGE_MAP = {
    student: (id) => {
      setHighlightedStudentId(id);
      navigate(Page.Students);
    },
    teacher: (id) => {
      setHighlightedStaffId(id);
      navigate(Page.Staff);
    },
    class: (id) => {
      setHighlightedClassId(id);
      navigate(Page.Classes);
    },
  };

  const handleSelect = ({ type, data }) => {
    setQuery('');
    setIsOpen(false);
    PAGE_MAP[type](data.id);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    const actions = {
      ArrowDown: () =>
        setActiveIndex((i) => Math.min(i + 1, results.length - 1)),
      ArrowUp: () => setActiveIndex((i) => Math.max(i - 1, 0)),
      Enter: () => {
        if (results[activeIndex]) handleSelect(results[activeIndex]);
      },
      Escape: () => setIsOpen(false),
    };
    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  };

  // Render grouped results with a running global index
  const renderResults = () => {
    let offset = 0;
    return RESULT_GROUPS.flatMap(({ type, label }) => {
      const group = results.filter((r) => r.type === type);
      if (!group.length) return [];

      const items = group.map((result, i) => {
        const globalIndex = offset + i;
        return (
          <ResultItem
            key={`${type}-${result.data.id}`}
            result={result}
            query={query}
            isActive={activeIndex === globalIndex}
            onSelect={() => handleSelect(result)}
            onHover={() => setActiveIndex(globalIndex)}
            classes={classes}
            enrollments={enrollments}
          />
        );
      });
      offset += group.length;

      return [
        <li
          key={`hdr-${type}`}
          className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0"
        >
          {label}
        </li>,
        ...items,
      ];
    });
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search students, teachers, classes..."
          className="w-full py-2 pl-10 pr-4 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-500 shadow-sm"
        />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {renderResults()}
        </ul>
      )}
    </div>
  );
};

export default StudentSearch;
