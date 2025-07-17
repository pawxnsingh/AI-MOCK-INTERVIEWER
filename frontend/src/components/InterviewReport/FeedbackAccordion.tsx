import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ChevronDown SVG Component
const ChevronDown: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
);

export type FeedbackSubItem = {
    title: string;
    description: string;
};

export type FeedbackItem = {
    title: string;
    description: string;
    subItems: FeedbackSubItem[];
};

interface FeedbackAccordionProps {
    feedback: FeedbackItem[];
}

const FeedbackAccordion: React.FC<FeedbackAccordionProps> = ({ feedback }) => {
    const [openItems, setOpenItems] = React.useState<number[]>([]);

    const toggleItem = (index: number) => {
        setOpenItems(prev => {
            if (prev.includes(index)) {
                // If clicking on an open item, close it
                return prev.filter(i => i !== index);
            } else {
                // If clicking on a closed item, close all others and open this one
                return [index];
            }
        });
    };

    const getIconForTitle = (title: string) => {
        switch (title.toLowerCase()) {
            case 'confidence':
                return '💪';
            case 'fluency':
                return '🗣️';
            case 'patience':
                return '😌';
            case 'preparedness':
                return '📚';
            default:
                return '📊';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Feedback</h2>
                <p className="text-gray-600">In-depth analysis for each performance metric</p>
            </div>

            <div className="space-y-4">
                {feedback.map((item, index) => {
                    const isOpen = openItems.includes(index);
                    const icon = getIconForTitle(item.title);

                    return (
                        <div key={index} >
                            <Collapsible open={isOpen} onOpenChange={() => toggleItem(index)}>
                                <CollapsibleTrigger
                                    className={`w-full text-black flex items-center justify-between p-4 bg-gray-50 
                                        ${isOpen?'rounded-t-lg border border-b-0 border-gray-200':'rounded-lg'} hover:bg-gray-100`}
                                >
                                    <span className="font-semibold text-left flex items-center gap-2">
                                        <span>{icon}</span>
                                        {item.title}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </CollapsibleTrigger>

                                <CollapsibleContent className={isOpen ? 'animate-accordion-down' : 'animate-accordion-up'}>
                                    <div className="p-6 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                                        <p className="text-gray-700 mb-6">{item.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <h4 className="font-semibold text-green-800 mb-3">✅ What you did well</h4>
                                                <div className="text-sm text-green-700 whitespace-pre-line">
                                                    {item.subItems.find(sub => sub.title === 'What Went Well')?.description || 'No data available'}
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                <h4 className="font-semibold text-amber-800 mb-3">⚡ Where to level up</h4>
                                                <div className="text-sm text-amber-700 whitespace-pre-line">
                                                    {item.subItems.find(sub => sub.title === 'Areas to Improve')?.description || 'No data available'}
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <h4 className="font-semibold text-blue-800 mb-3">🚀 How to improve</h4>
                                                <div className="text-sm text-blue-700 whitespace-pre-line">
                                                    {item.subItems.find(sub => sub.title === 'How to Improve')?.description || 'No data available'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-500 p-4">
                                            <div className="flex">
                                                <div className="ml-3">
                                                    <p className="text-sm text-indigo-700">
                                                        <strong>💡 Pro Tip:</strong> {item.subItems.find(sub => sub.title === 'Pro Tip')?.description || 'Focus on one improvement area at a time for the next 2 weeks. Consistent practice in small chunks is more effective than trying to change everything at once.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeedbackAccordion;
