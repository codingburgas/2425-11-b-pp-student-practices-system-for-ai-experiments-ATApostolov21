import React, { useState, useEffect } from 'react';
import { AuthLogo, AuthBackground, AuthCard, RegisterForm } from '../components/auth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');
  const [teacher, setTeacher] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorations */}
      <AuthBackground position="alternate" />
      
      {/* Card with Logo */}
      <AuthCard isVisible={isVisible}>
        <AuthLogo />
        <RegisterForm 
          username={username}
          setUsername={setUsername}
          role={role}
          setRole={setRole}
          teacher={teacher}
          setTeacher={setTeacher}
          error={error}
          setError={setError}
        />
      </AuthCard>
    </div>
  );
};

export default Register; 