import React from 'react';

interface CoachCardProps {
  title: string;
  subtitle: string;
  loading?: boolean;
}

const CoachCard: React.FC<CoachCardProps> = ({ title, subtitle, loading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 text-center animate-fade-in-up">
      <div className="inline-block p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
        {loading ? (
          <span className="animate-pulse">✨ AI Thinking...</span>
        ) : (
          <span className="font-semibold">🤖 Idea Coach</span>
        )}
      </div>
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight leading-tight">
        {title}
      </h2>
      <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};

export default CoachCard;
