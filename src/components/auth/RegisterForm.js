import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = ({ username, setUsername, role, setRole, teacher, setTeacher, error, setError }) => {
  const { register, getTeachers } = useAuth();
  const navigate = useNavigate();
  
  const teachers = getTeachers();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (role === 'student' && !teacher) {
      setError('Please select a teacher');
      return;
    }
    
    const result = register(username, role, teacher);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Create Account
        </h2>
        <p className="mt-2 text-gray-600">Join our AI experiment platform</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter your username"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
              </svg>
            </div>
          </div>
        </div>
        
        {role === 'student' && (
          <div className="transition-all duration-300 ease-in-out">
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
              Select Teacher
            </label>
            {teachers.length > 0 ? (
              <div className="relative">
                <select
                  id="teacher"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t.username} value={t.username}>
                      {t.username}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-amber-600 mt-1 p-3 bg-amber-50 rounded-md text-sm">
                No teachers available. Please register a teacher first.
              </div>
            )}
          </div>
        )}
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={role === 'student' && teachers.length === 0}
          >
            Create Account
          </button>
        </div>
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterForm; 