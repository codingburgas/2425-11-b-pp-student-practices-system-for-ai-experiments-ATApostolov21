import React from 'react';

const DashboardBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      <div className="animate-float-slow absolute top-10 left-[10%] w-72 h-72 bg-indigo-600 opacity-5 rounded-full blur-3xl"></div>
      <div className="animate-float-delayed absolute bottom-10 right-[15%] w-80 h-80 bg-purple-600 opacity-5 rounded-full blur-3xl"></div>
    </div>
  );
};

export default DashboardBackground; 