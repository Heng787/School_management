
import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    // FIX: Replaced JSX.Element with React.ReactNode to resolve namespace error.
    icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="bg-primary-100 text-primary-600 p-3 rounded-full">
                {icon}
            </div>
        </div>
    );
};

export default DashboardCard;