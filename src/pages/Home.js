import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="animate-float absolute top-10 left-10 w-72 h-72 bg-indigo-400 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-10 right-10 w-80 h-80 bg-purple-400 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-slow absolute top-1/2 left-1/3 w-96 h-96 bg-blue-400 opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Custom Navbar */}
      <div className="relative z-10 border-b border-gray-100 backdrop-blur-lg bg-white bg-opacity-70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-xl ring-2 ring-white ring-opacity-50">
                AI
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Experiment Platform</h1>
                <p className="text-xs text-gray-500 mt-0.5">Machine Learning for Education</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {!currentUser ? (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hover:underline underline-offset-4 decoration-indigo-600 decoration-2">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium ring-2 ring-white"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium ring-2 ring-white">
                  Dashboard
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-6 border-t border-gray-100">
              <div className="flex flex-col space-y-4 pt-3">
                {!currentUser ? (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition-colors py-2 font-medium flex justify-center">
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg inline-block hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium text-center mx-4"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg inline-block hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium text-center mx-4">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hero section */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-center text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">AI Experiment Platform</span>
              <span className="block mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                For Students and Teachers
              </span>
            </h1>
            
            <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 text-center leading-relaxed">
              A simple and educational environment for machine learning experiments.
              Upload datasets, train models, and make real-time predictions.
            </p>
            
            <div className="mt-10 flex justify-center">
              {!currentUser ? (
                <div className="inline-flex rounded-md shadow-xl">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="inline-flex rounded-md shadow-xl">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="relative z-10 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <h2 className="text-base font-semibold tracking-wide uppercase text-indigo-600">
                Features
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Learn AI in a simple way
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Our platform makes it easy to experiment with machine learning concepts
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature 1 */}
                <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 shadow-md group-hover:shadow-lg group-hover:bg-indigo-100 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Dataset Upload</h3>
                    </div>
                    <p className="text-base text-gray-600">
                      Upload and preview your own datasets in CSV format. Our platform makes it easy to manage data for your machine learning experiments.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 shadow-md group-hover:shadow-lg group-hover:bg-indigo-100 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Model Training</h3>
                    </div>
                    <p className="text-base text-gray-600">
                      Train linear regression models with your datasets. Understand how machine learning algorithms work and see results in real-time.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 shadow-md group-hover:shadow-lg group-hover:bg-indigo-100 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Real-time Predictions</h3>
                    </div>
                    <p className="text-base text-gray-600">
                      Make predictions and see results update in real-time with interactive sliders. Experiment with different input values to understand model behavior.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 shadow-md group-hover:shadow-lg group-hover:bg-indigo-100 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Visualization</h3>
                    </div>
                    <p className="text-base text-gray-600">
                      View model performance metrics and feature importance charts. Powerful visualizations help you understand your models and data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to action */}
      <div className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 delay-500 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <div className="absolute inset-0 bg-black opacity-5 pattern-dots"></div>
              <div className="relative px-8 py-16">
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-white">Ready to start your AI journey?</h2>
                  <p className="mt-4 text-lg text-indigo-100">
                    Join our platform today and explore the world of machine learning.
                  </p>
                </div>
                <div className="mt-8 flex justify-center">
                  {!currentUser ? (
                    <div className="inline-flex rounded-md shadow-xl">
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <div className="inline-flex rounded-md shadow-xl">
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        Explore Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 