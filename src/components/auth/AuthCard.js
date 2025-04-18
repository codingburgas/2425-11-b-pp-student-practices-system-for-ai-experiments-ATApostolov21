import React from 'react';

const AuthCard = ({ isVisible, children }) => {
  return (
    <div className={`relative z-10 max-w-md w-full transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-20"></div>
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard; 