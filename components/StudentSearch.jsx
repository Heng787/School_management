import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Page, StaffRole } from '../types';

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

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        
        const studentResults = students
            .filter(s => s.name.toLowerCase().includes(lowerCaseQuery) || s.id.toLowerCase().includes(lowerCaseQuery))
            .map(s => ({ type: 'student', data: s }));

        const teacherResults = staff
            .filter(t => (t.role === StaffRole.Teacher || t.role === StaffRole.AssistantTeacher) && t.name.toLowerCase().includes(lowerCaseQuery))
            .map(t => ({ type: 'teacher', data: t }));

        const classResults = classes
            .filter(c => c.name.toLowerCase().includes(lowerCaseQuery))
            .map(c => ({ type: 'class', data: c }));
        
        const combinedResults = [...studentResults, ...teacherResults, ...classResults];
        setResults(combinedResults);
        setIsOpen(combinedResults.length > 0);
        setActiveIndex(-1);
    }, [query, students, staff, classes]);

    const handleClickOutside = useCallback((event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleSelect = (result) => {
        setQuery('');
        setIsOpen(false);
        if (result.type === 'student') {
            setHighlightedStudentId(result.data.id);
            navigate(Page.Students);
        } else if (result.type === 'teacher') {
            setHighlightedStaffId(result.data.id);
            navigate(Page.Staff);
        } else if (result.type === 'class') {
            setHighlightedClassId(result.data.id);
            navigate(Page.Classes);
        }
    };
    
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                handleSelect(results[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };
    
    const renderHighlightedText = (text, highlight) => {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <strong key={i}>{part}</strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const renderResults = () => {
        const studentResults = results.filter(r => r.type === 'student');
        const teacherResults = results.filter(r => r.type === 'teacher');
        const classResults = results.filter(r => r.type === 'class');
        let currentIndex = -1;

        return (
            <>
                {studentResults.length > 0 && (
                    <>
                        <li className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0">Students</li>
                        {studentResults.map((result) => {
                            currentIndex++;
                            const localIndex = currentIndex;
                            const student = result.data;
                            const enrollment = enrollments.find(e => e.studentId === student.id);
                            const studentClass = enrollment ? classes.find(c => c.id === enrollment.classId) : null;
                            
                            return (
                                <li
                                    key={`student-${student.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseOver={() => setActiveIndex(localIndex)}
                                    className={`px-4 py-3 cursor-pointer ${activeIndex === localIndex ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                                >
                                    <p className="font-semibold text-gray-800">{renderHighlightedText(student.name, query)}</p>
                                    <p className="text-sm text-gray-600">
                                        ID: {renderHighlightedText(student.id, query)} {studentClass ? `| Level: ${studentClass.level}` : ''}
                                    </p>
                                </li>
                            )
                        })}
                    </>
                )}
                {teacherResults.length > 0 && (
                    <>
                         <li className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0">Teaching Staff</li>
                         {teacherResults.map((result) => {
                             currentIndex++;
                             const localIndex = currentIndex;
                             const teacher = result.data;
                             return (
                                <li
                                    key={`teacher-${teacher.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseOver={() => setActiveIndex(localIndex)}
                                    className={`px-4 py-3 cursor-pointer ${activeIndex === localIndex ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                                >
                                    <p className="font-semibold text-gray-800">{renderHighlightedText(teacher.name, query)}</p>
                                    <p className="text-sm text-gray-600">
                                        Role: {teacher.role}
                                    </p>
                                </li>
                             )
                         })}
                    </>
                )}
                {classResults.length > 0 && (
                    <>
                         <li className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0">Classes</li>
                         {classResults.map((result) => {
                             currentIndex++;
                             const localIndex = currentIndex;
                             const cls = result.data;
                             return (
                                <li
                                    key={`class-${cls.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseOver={() => setActiveIndex(localIndex)}
                                    className={`px-4 py-3 cursor-pointer ${activeIndex === localIndex ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                                >
                                    <p className="font-semibold text-gray-800">{renderHighlightedText(cls.name, query)}</p>
                                    <p className="text-sm text-gray-600">
                                        Level: {cls.level} | Schedule: {cls.schedule}
                                    </p>
                                </li>
                             )
                         })}
                    </>
                )}
            </>
        )
    }

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search students, teachers, classes..."
                    className="w-full py-2 pl-10 pr-4 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
