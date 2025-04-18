import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };
  
  // Hide navbar on home page for fullscreen effect
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="font-bold text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
                AI Experiment Platform
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <>
                <div className="ml-10 flex items-baseline space-x-3">
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  
                  {currentUser.role === 'student' && (
                    <>
                      <Link 
                        to="/upload" 
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Upload Dataset
                      </Link>
                      <Link 
                        to="/train" 
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Train Model
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="px-3 py-1 rounded-full bg-indigo-700 text-sm font-medium">
                    {currentUser.username} ({currentUser.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 px-4 py-1.5 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-teal-400 to-cyan-400 text-gray-900 hover:from-teal-500 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-900">
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              
              {currentUser.role === 'student' && (
                <>
                  <Link
                    to="/upload"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Upload Dataset
                  </Link>
                  <Link
                    to="/train"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Train Model
                  </Link>
                </>
              )}
              
              <div className="mt-3 px-3 py-2 rounded-md">
                <div className="text-sm font-medium">
                  Signed in as: {currentUser.username} ({currentUser.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-teal-400 to-cyan-400 text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 