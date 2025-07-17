import React, { useEffect, useState } from 'react';

interface ScoreBadgeProps {
  scores: {
    confidence: number;
    fluency: number;
    patience: number;
    preparedness: number;
  };
  overallScore?: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ scores, overallScore: propOverallScore }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const overallScore = propOverallScore || Math.round(
    ((scores.confidence + scores.fluency + scores.patience + scores.preparedness) / 4) * 10
  );

  useEffect(() => {
    // Animate score count up
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= overallScore) {
            clearInterval(interval);
            if (overallScore >= 80) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }
            return overallScore;
          }
          return Math.min(prev + 2, overallScore);
        });
      }, 50);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, [overallScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="text-center relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'][i % 4],
              }}
            />
          ))}
        </div>
      )}

      <div
        className="inline-flex flex-col items-center"
      >
        <div className={`relative w-32 h-32 rounded-full border-4 ${getScoreColor(overallScore)} flex items-center justify-center mb-4`}>
          <div className="text-center">
            <div className="text-3xl font-bold">{animatedScore}</div>
            <div className="text-sm opacity-70">/ 100</div>
          </div>

          {/* Animated ring */}
          <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="opacity-20"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${(animatedScore / 100) * 351.86} 351.86`}
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Overall Interview Score</h3>
          <p className={`text-lg font-semibold mb-2 ${getScoreColor(overallScore).split(' ')[0]}`}>
            {getScoreLabel(overallScore)}
          </p>
          <p className="text-gray-600 max-w-md">
            Your comprehensive interview performance based on confidence, fluency, patience, and preparedness metrics.
          </p>

          {overallScore >= 80 && (
            <div
              className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg"
            >
              <p className="text-teal-800 font-semibold">🎉 Congratulations!</p>
              <p className="text-teal-700 text-sm">You're ready for real interviews!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreBadge;
