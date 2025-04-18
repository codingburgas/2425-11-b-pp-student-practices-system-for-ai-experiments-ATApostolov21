import React from 'react';

const AuthBackground = ({ position = 'default' }) => {
  // Different background positions for login and register
  const backgroundElements = position === 'default' 
    ? (
      <>
        <div className="animate-float absolute top-10 left-[20%] w-72 h-72 bg-indigo-600 opacity-10 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-10 right-[20%] w-64 h-64 bg-purple-600 opacity-10 rounded-full blur-3xl"></div>
      </>
    ) : (
      <>
        <div className="animate-float absolute top-10 right-[20%] w-72 h-72 bg-purple-600 opacity-10 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-10 left-[20%] w-64 h-64 bg-indigo-600 opacity-10 rounded-full blur-3xl"></div>
      </>
    );

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {backgroundElements}
    </div>
  );
};

export default AuthBackground; 