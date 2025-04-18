import React, { useState, useEffect } from 'react';
import { AuthLogo, AuthBackground, AuthCard, LoginForm } from '../components/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorations */}
      <AuthBackground position="default" />
      
      {/* Card with Logo */}
      <AuthCard isVisible={isVisible}>
        <AuthLogo />
        <LoginForm 
          username={username}
          setUsername={setUsername}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          error={error}
          setError={setError}
        />
      </AuthCard>
    </div>
  );
};

export default Login; 