
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

interface AttendanceChartProps {
    startDate: Date;
    endDate: Date;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ startDate, endDate }) => {
    const { students } = useData();

    const getWeekStartDate = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday for Monday-start week
        return new Date(date.setDate(diff));
    };

    const data = useMemo(() => {
        const attendanceByDate: { [key: string]: { present: number; total: number } } = {};
        
        students.forEach(student => {
            student.attendance.forEach(att => {
                const attDate = new Date(att.date);
                attDate.setHours(0, 0, 0, 0);
                if (attDate >= startDate && attDate <= endDate) {
                    const dateString = att.date;
                    if (!attendanceByDate[dateString]) {
                        attendanceByDate[dateString] = { present: 0, total: 0 };
                    }
                    attendanceByDate[dateString].total += 1;
                    if (att.present) {
                        attendanceByDate[dateString].present += 1;
                    }
                }
            });
        });

        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 31) { // Aggregate by week
            const weeklyData: { [key: string]: { present: number; total: number } } = {};
            for (const dateString in attendanceByDate) {
                const date = new Date(dateString);
                const weekStart = getWeekStartDate(date);
                weekStart.setHours(0, 0, 0, 0);
                const weekStartString = weekStart.toISOString().split('T')[0];

                if (!weeklyData[weekStartString]) {
                    weeklyData[weekStartString] = { present: 0, total: 0 };
                }
                weeklyData[weekStartString].present += attendanceByDate[dateString].present;
                weeklyData[weekStartString].total += attendanceByDate[dateString].total;
            }

            return Object.keys(weeklyData)
                .sort()
                .map(weekStartString => {
                    const { present, total } = weeklyData[weekStartString];
                    const weekStartDate = new Date(weekStartString);
                    const name = `W/o ${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                    return {
                        name,
                        "Attendance %": total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0,
                    };
                });

        } else { // Aggregate by day
            const dailyData = [];
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                const dayData = attendanceByDate[dateString];
                const name = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dailyData.push({
                    name,
                    "Attendance %": dayData && dayData.total > 0 ? parseFloat(((dayData.present / dayData.total) * 100).toFixed(1)) : 0,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dailyData;
        }

    }, [students, startDate, endDate]);

    if (data.length === 0) {
        return (
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center">
                <p className="text-gray-500">No attendance data for the selected period.</p>
            </div>
        );
    }
    
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} unit="%" allowDecimals={false} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="Attendance %" stroke="#1d4ed8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;
