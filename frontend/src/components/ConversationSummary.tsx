import React from 'react';

interface ConversationSummaryProps {
  conversation: any;
  transcript: string;
  onBack: () => void;
}

export const ConversationSummary: React.FC<ConversationSummaryProps> = ({ conversation, transcript, onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Conversation Summary</h3>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Transcript</h4>
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          {transcript}
        </div>
      </div>
      {conversation.analysis && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Scores</h5>
              <ul className="space-y-1">
                <li>Overall: {conversation.analysis.overall_score}/10</li>
                <li>Confidence: {conversation.analysis.confidence_score}/10</li>
                <li>Fluency: {conversation.analysis.fluency_score}/10</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Recommendations</h5>
              <ul className="list-disc list-inside space-y-1">
                {conversation.analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Back to Dashboard
      </button>
    </div>
  );
}; 