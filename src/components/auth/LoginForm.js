import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ username, setUsername, selectedUser, setSelectedUser, error, setError }) => {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  
  // Filter out users for the dropdown
  const usernames = users.map(user => user.username);

  useEffect(() => {
    if (selectedUser) {
      setUsername(selectedUser);
    }
  }, [selectedUser, setUsername]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    const result = login(username);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Welcome Back
        </h2>
        <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-1">
            Select User
          </label>
          <select
            id="users"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a user</option>
            {usernames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
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
        
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </div>
        
        <div className="text-center mt-6">
          <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </>
  );
};

export default LoginForm; 