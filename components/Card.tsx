
import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-slate-200/80 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-slate-200/80 flex items-center space-x-3 bg-slate-50/70">
        <div className="text-indigo-600">{icon}</div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
