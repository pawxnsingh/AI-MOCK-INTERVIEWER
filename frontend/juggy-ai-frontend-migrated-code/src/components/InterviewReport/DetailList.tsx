
import React from 'react';
import { DetailItem } from '../InterviewReport';

interface DetailListProps {
    title: string;
    items: DetailItem[];
    type: 'strengths' | 'improvements';
}

const DetailList: React.FC<DetailListProps> = ({ title, items, type }) => {
    const isStrengths = type === 'strengths';
    const icon = isStrengths ? '✅' : '⚠️';
    const borderColor = isStrengths ? 'border-teal-200' : 'border-amber-200';
    const bgColor = isStrengths ? 'bg-teal-50' : 'bg-amber-50';

    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${borderColor}`}>
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${bgColor} border border-opacity-20`}
                    >
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-700 prose prose-sm">{item.description}</p>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No {type} identified in this interview.</p>
                </div>
            )}
        </div>
    );
};

export default DetailList;
