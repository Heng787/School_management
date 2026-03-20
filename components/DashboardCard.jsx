
import React from 'react';

const DashboardCard = ({ title, value, icon }) => {
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