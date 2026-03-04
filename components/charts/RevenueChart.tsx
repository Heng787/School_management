
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const RevenueChart: React.FC = () => {
    const { students } = useData();

    const totalPaid = students.reduce((sum, student) => sum + student.tuition.paid, 0);
    const totalDue = students.reduce((sum, student) => sum + student.tuition.total, 0);
    const totalOutstanding = totalDue - totalPaid;

    const data = [
        { name: 'Collected', value: totalPaid },
        { name: 'Outstanding', value: totalOutstanding },
    ];

    const COLORS = ['#2563eb', '#fca5a5'];

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        // FIX: Explicitly typed the label prop's argument to resolve a TypeScript error.
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;