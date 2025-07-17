import React, { useEffect, useState } from 'react';

interface KpiCardProps {
    label: string;
    value: number;
    previousValue?: number;
    delay?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, previousValue, delay = 0 }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                setAnimatedValue(prev => {
                    if (prev >= value) {
                        clearInterval(interval);
                        return value;
                    }
                    return Math.min(prev + 0.1, value);
                });
            }, 20);

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [value, delay]);

    const getColor = (score: number) => {
        if (score >= 8) return 'text-teal-600 border-teal-200 bg-teal-50';
        if (score >= 5) return 'text-amber-600 border-amber-200 bg-amber-50';
        return 'text-rose-600 border-rose-200 bg-rose-50';
    };

    const getProgressColor = (score: number) => {
        if (score >= 8) return '#14b8a6'; // teal-500
        if (score >= 5) return '#f59e0b'; // amber-500
        return '#ef4444'; // rose-500
    };

    const getScoreChangeText = () => {
        if (previousValue === undefined) return null;

        const difference = value - previousValue;
        const absDifference = Math.abs(difference);

        if (difference === 0) {
            return (
                <div className="text-right">
                    <div className="text-gray-500 text-xs">Same as last time</div>
                </div>
            );
        }

        const arrowIcon = difference > 0 ? '▲' : '▼';
        const changeColor = difference > 0 ? 'text-green-600' : 'text-red-600';
        const changeText = difference > 0 ? 'Better' : 'Lower';

        return (
            <div className="text-right">
                <div className={`${changeColor} text-xs font-medium`}>
                    {changeText} than last time
                </div>
                <div className={`${changeColor} text-sm font-bold flex items-center gap-1 justify-end`}>
                    <span className="text-xs">{arrowIcon}</span> +{absDifference.toFixed(1)}
                </div>
            </div>
        );
    };

    const percentage = (animatedValue / 10) * 100;
    const circumference = 2 * Math.PI * 36;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
        <div
            className={`p-6 rounded-xl border-2 ${getColor(value)} transition-all duration-300 hover:shadow-lg`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{label}</h3>
                <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="opacity-20"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke={getProgressColor(value)}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">
                            {animatedValue.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
            {previousValue && (
                <div className="flex items-center justify-between text-sm">
                    <span className="opacity-70">Score</span>
                    <div className="text-right">
                        <div className="font-medium">{Math.round(percentage)}%</div>
                        {getScoreChangeText()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KpiCard;
