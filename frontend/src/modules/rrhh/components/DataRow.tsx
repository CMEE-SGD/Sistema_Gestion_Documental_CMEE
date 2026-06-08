import React from 'react';

interface DataRowProps {
    label: string;
    value?: string | React.ReactNode;
    isLink?: boolean;
    children?: React.ReactNode;
    mb?: string;
}

const DataRow = ({ label, value, isLink = false, children, mb = "mb-3" }: DataRowProps) => (
    <div className={`flex items-start ${mb} text-[11px]`}>
        <div className="w-[180px] font-bold text-gray-900 shrink-0 mt-1">{label}</div>
        <div className={`flex-1 ${isLink ? 'text-blue-600 underline cursor-pointer' : 'text-gray-800'}`}>
            {value !== undefined && value !== null && value !== '' ? value : children || '-'}
        </div>
    </div>
);

export default DataRow;