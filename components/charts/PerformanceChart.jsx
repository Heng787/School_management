
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const PerformanceChart = ({ subjectFilter }) => {
    const { students, levels, enrollments, classes, grades } = useData();

    const calculateAverageScore = (level) => {
        // Find students in this level
        const levelClassIds = classes.filter(c => c.level === level).map(c => c.id);
        const levelStudentIds = enrollments
            .filter(e => levelClassIds.includes(e.classId))
            .map(e => e.studentId);
            
        if (levelStudentIds.length === 0) return 0;
        
        let filteredGrades = grades.filter(g => levelStudentIds.includes(g.studentId));

        if (subjectFilter !== 'All') {
            filteredGrades = filteredGrades.filter(g => g.subject === subjectFilter);
        }
        
        if (filteredGrades.length === 0) return 0;

        const totalScore = filteredGrades.reduce((sum, grade) => sum + grade.score, 0);
        
        // Assuming score is out of 10, convert to percentage for the chart if YAxis is 0-100
        return parseFloat(((totalScore / filteredGrades.length) * 10).toFixed(2));
    };
    
    const handleBarClick = (data) => {
        if (data && data.name) {
            alert(`Drill-down feature for ${data.name} would show a detailed academic report here.`);
        }
    };

    const data = levels.map(level => ({
        name: level,
        'Avg Score': calculateAverageScore(level),
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar 
                        dataKey="Avg Score" 
                        fill="#1e40af" 
                        cursor="pointer"
                        onClick={handleBarClick}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceChart;
