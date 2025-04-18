import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ModelProvider } from './context/ModelContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadDataset from './pages/UploadDataset';
import TrainModel from './pages/TrainModel';
import ModelDetails from './pages/ModelDetails';

// Route guard for authenticated routes
const PrivateRoute = ({ element, allowedRoles }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <ModelProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className={`${isHomePage ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={<PrivateRoute element={<Dashboard />} />} 
            />
            
            <Route 
              path="/upload" 
              element={<PrivateRoute element={<UploadDataset />} allowedRoles={['student']} />} 
            />
            
            <Route 
              path="/train" 
              element={<PrivateRoute element={<TrainModel />} allowedRoles={['student']} />} 
            />
            
            <Route 
              path="/model/:id" 
              element={<PrivateRoute element={<ModelDetails />} />} 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </ModelProvider>
  );
}

export default App; 