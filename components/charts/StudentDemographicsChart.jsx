
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const CustomTooltip = ({ active, payload, label, totalStudents }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = totalStudents > 0 ? ((data.students / totalStudents) * 100).toFixed(1) : 0;
        return (
            <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
                <p className="font-bold text-gray-800">{`Level: ${label}`}</p>
                <p className="text-sm text-gray-600">{`Students: ${data.students}`}</p>
                <p className="text-sm text-gray-600">{`(${percentage}% of total)`}</p>
            </div>
        );
    }
    return null;
};

const StudentDemographicsChart= () => {
    const { students, levels } = useData();
    const totalStudentBody = students.length;

    const data = levels.map(level => ({
        name: level,
        students: students.filter(s => s.level === level).length,
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} domain={[0, 'dataMax + 20']} />
                  <Tooltip content={<CustomTooltip totalStudents={totalStudentBody} />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                  <Legend />
                  <Bar dataKey="students" fill="#3b82f6" />
              </BarChart>
          </ResponsiveContainer>
        </div>
    );
};

export default StudentDemographicsChart;
