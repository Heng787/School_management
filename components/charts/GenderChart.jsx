import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useData } from '../../context/DataContext';

/**
 * GenderChart Component
 * Displays a pie chart showing the distribution of student genders.
 */
const GenderChart = () => {
    const { students } = useData();

    const data = useMemo(() => {
        if (!students || students.length === 0) return [];

        let maleCount = 0;
        let femaleCount = 0;
        let otherCount = 0;

        students.forEach(s => {
            const sex = (s.sex || s.gender || '').trim().toLowerCase();
            if (['male', 'm', 'boy'].includes(sex)) maleCount++;
            else if (['female', 'f', 'girl'].includes(sex)) femaleCount++;
            else otherCount++;
        });

        const results = [
            { name: 'Boys', value: maleCount, color: '#3b82f6', fill: '#3b82f6' }, // blue-500
            { name: 'Girls', value: femaleCount, color: '#f43f5e', fill: '#f43f5e' }, // rose-500
        ];

        return results.filter(d => d.value > 0);
    }, [students]);

    if (!students || students.length === 0) {
        return (
            <div className="h-[250px] flex flex-col items-center justify-center text-slate-500 text-sm font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 transition-all duration-500 group hover:border-primary-500/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                   </svg>
                </div>
                No student data available
            </div>
        );
    }

    return (
        <div className="w-full h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'white',
                            color: '#1e293b'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            paddingTop: '20px'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GenderChart;
