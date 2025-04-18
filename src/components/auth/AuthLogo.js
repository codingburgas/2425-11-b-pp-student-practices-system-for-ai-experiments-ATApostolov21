import React from 'react';
import { Link } from 'react-router-dom';

const AuthLogo = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <Link to="/" className="group">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white transform transition-transform duration-300 group-hover:scale-105">
          AI
        </div>
      </Link>
      <h1 className="mt-4 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        AI Experiment Platform
      </h1>
    </div>
  );
};

export default AuthLogo; 