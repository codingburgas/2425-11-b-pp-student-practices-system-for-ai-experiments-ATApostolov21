import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    // Load current user if there is one
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save users whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  // Save current user whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const register = (username, role, teacher = null) => {
    // Check if user already exists
    if (users.some(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    const newUser = { 
      username, 
      role,
      ...(role === 'student' && { teacher })
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const login = (username) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'User not found' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getTeachers = () => {
    return users.filter(user => user.role === 'teacher');
  };

  const getStudentsByTeacher = (teacherUsername) => {
    return users.filter(user => 
      user.role === 'student' && user.teacher === teacherUsername
    );
  };

  const value = {
    currentUser,
    users,
    register,
    login,
    logout,
    getTeachers,
    getStudentsByTeacher
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 