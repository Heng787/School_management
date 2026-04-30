import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const PerformanceChart = ({ subjectFilter }) => {
    const { enrollments, classes, grades, levels } = useData();
    const [activeTab, setActiveTab] = useState('Kid');

    const calculateAverageScore = (level) => {
        const levelClassIds = classes.filter(c => c.level === level).map(c => c.id);
        const levelStudentIds = enrollments
            .filter(e => levelClassIds.includes(e.classId))
            .map(e => e.studentId);
            
        if (levelStudentIds.length === 0) return 0;
        
        let filteredGrades = grades.filter(g => levelStudentIds.includes(g.studentId));

        if (subjectFilter && subjectFilter !== 'All') {
            filteredGrades = filteredGrades.filter(g => g.subject === subjectFilter);
        }
        
        if (filteredGrades.length === 0) return 0;

        const totalScore = filteredGrades.reduce((sum, grade) => sum + grade.score, 0);
        return parseFloat(((totalScore / filteredGrades.length) * 10).toFixed(2));
    };

    const categorizeLevel = (level) => {
        if (/^K\d+$/i.test(level)) return 'Kid';
        if (/^\d+[A-Za-z]$/.test(level)) return 'Junior';
        if (/^\d+$/.test(level)) return 'Senior';
        return 'Custom';
    };

    const groupedData = useMemo(() => {
        const groups = { Kid: [], Junior: [], Senior: [], Custom: [] };
        
        levels.forEach(level => {
            const score = calculateAverageScore(level);
            // Only include levels with actual data
            if (score > 0) {
                const category = categorizeLevel(level);
                groups[category].push({
                    name: level,
                    'Avg Score': score
                });
            }
        });

        // Sort data chronologically within programs
        groups.Kid.sort((a, b) => parseInt(a.name.replace(/\D/g, '') || 0) - parseInt(b.name.replace(/\D/g, '') || 0));
        groups.Junior.sort((a, b) => {
            const numA = parseInt(a.name) || 0;
            const numB = parseInt(b.name) || 0;
            if (numA !== numB) return numA - numB;
            return a.name.localeCompare(b.name);
        });
        groups.Senior.sort((a, b) => (parseInt(a.name) || 0) - (parseInt(b.name) || 0));

        return groups;
    }, [levels, classes, enrollments, grades, subjectFilter]);

    // Available tabs based on whether they have data
    const availableTabs = ['Kid', 'Junior', 'Senior', 'Custom'].filter(tab => groupedData[tab].length > 0);
    
    // Fallback if current activeTab has no data but others do
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
        setActiveTab(availableTabs[0]);
    }

    const currentData = groupedData[activeTab] || [];
    // Adjust height dynamically based on number of items to prevent squishing the horizontal bars
    const chartHeight = Math.max(300, currentData.length * 40 + 60);

    const handleBarClick = (data) => {
        if (data && data.name) {
            alert(`Drill-down feature for ${data.name} would show a detailed academic report here.`);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            {availableTabs.length > 0 ? (
                <>
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2">
                        {availableTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                                    activeTab === tab
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-sm"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                                }`}
                            >
                                {tab} ({groupedData[tab].length})
                            </button>
                        ))}
                    </div>

                    {/* Chart Container */}
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <div style={{ height: chartHeight, minWidth: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={currentData} 
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" domain={[0, 100]} className="text-xs font-medium text-slate-500" />
                                    <YAxis type="category" dataKey="name" className="text-xs font-bold text-slate-700 dark:text-slate-300" tickMargin={10} width={40} />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Average Score']} 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar 
                                        dataKey="Avg Score" 
                                        fill="#3b82f6" 
                                        radius={[0, 4, 4, 0]}
                                        cursor="pointer"
                                        onClick={handleBarClick}
                                        background={{ fill: '#f1f5f9' }}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-500 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    No performance data available
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;
