import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModel } from '../context/ModelContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser, getStudentsByTeacher } = useAuth();
  const { 
    getUserModels, 
    getStudentModels, 
    getStudentDatasets,
    getModelFeedback, 
    deleteModel, 
    deleteDataset,
    models, 
    datasets 
  } = useModel();
  
  const navigate = useNavigate();
  const [deleteModelConfirm, setDeleteModelConfirm] = useState(null);
  const [deleteDatasetConfirm, setDeleteDatasetConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const isTeacher = currentUser?.role === 'teacher';
  
  // Get appropriate models based on user role
  const userModels = isTeacher 
    ? getStudentModels(currentUser.username)
    : getUserModels();
  
  // Get student datasets if teacher
  const studentDatasets = isTeacher
    ? getStudentDatasets()
    : [];
    
  // Get students if teacher
  const students = isTeacher 
    ? getStudentsByTeacher(currentUser.username)
    : [];

  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Helper to get dataset name
  const getDatasetName = (datasetId) => {
    const dataset = datasets.find(d => d.id === datasetId);
    return dataset ? dataset.name : 'Unknown Dataset';
  };

  // Handle model deletion
  const handleDeleteModelClick = (modelId) => {
    setDeleteModelConfirm(modelId);
    setDeleteDatasetConfirm(null);
    setDeleteError(null);
  };
  
  const confirmDeleteModel = () => {
    if (!deleteModelConfirm) return;
    
    const result = deleteModel(deleteModelConfirm);
    if (result.success) {
      setDeleteModelConfirm(null);
    } else {
      setDeleteError(result.message);
    }
  };
  
  // Handle dataset deletion
  const handleDeleteDatasetClick = (datasetId) => {
    setDeleteDatasetConfirm(datasetId);
    setDeleteModelConfirm(null);
    setDeleteError(null);
  };
  
  const confirmDeleteDataset = () => {
    if (!deleteDatasetConfirm) return;
    
    const result = deleteDataset(deleteDatasetConfirm);
    if (result.success) {
      setDeleteDatasetConfirm(null);
    } else {
      setDeleteError(result.message);
    }
  };
  
  const cancelDelete = () => {
    setDeleteModelConfirm(null);
    setDeleteDatasetConfirm(null);
    setDeleteError(null);
  };

  return (
    <div className="relative z-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="animate-float-slow absolute top-10 left-[10%] w-72 h-72 bg-indigo-600 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-10 right-[15%] w-80 h-80 bg-purple-600 opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      <div className={`transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
          </h2>
          
          {!isTeacher && (
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                to="/upload"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload Dataset
              </Link>
              <Link
                to="/train"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Train Model
              </Link>
            </div>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
          {/* Models Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-800 font-semibold">
                  {isTeacher ? 'Student Models' : 'Your Models'}
                </h4>
                <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-gray-900">{userModels.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {isTeacher 
                    ? `Models created by students` 
                    : `Total models created`}
                </p>
              </div>
              <Link to="#models" className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Datasets Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-800 font-semibold">
                  {isTeacher ? 'Student Datasets' : 'Your Datasets'}
                </h4>
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-gray-900">
                  {isTeacher ? studentDatasets.length : datasets.filter(d => d.createdBy === currentUser.username).length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isTeacher 
                    ? `Datasets uploaded by students` 
                    : `Total datasets uploaded`}
                </p>
              </div>
              {isTeacher && studentDatasets.length > 0 && (
                <Link to="#datasets" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
              {!isTeacher && (
                <Link to="/upload" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Upload New
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
          
          {/* Third Card - Students for Teacher, Performance for Student */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              {isTeacher ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-800 font-semibold">Your Students</h4>
                    <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Students assigned to you
                    </p>
                  </div>
                  {students.length > 0 && (
                    <Link to="#students" className="mt-4 inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                      View Students
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-800 font-semibold">Best Performance</h4>
                    <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-3">
                    {userModels.length > 0 ? (
                      <>
                        <p className="text-3xl font-bold text-gray-900">
                          {Math.max(...userModels.map(m => m.metrics.r2)).toFixed(4)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Your highest R² score
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-900">No models yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Train a model to see metrics
                        </p>
                      </>
                    )}
                  </div>
                  <Link to="/train" className="mt-4 inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                    Train New Model
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {deleteError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
            {deleteError}
          </div>
        )}
        
        {deleteModelConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative animate-fade-in-up">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur opacity-20"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Model Deletion</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this model? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteModel}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Delete Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {deleteDatasetConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative animate-fade-in-up">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur opacity-20"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Dataset Deletion</h3>
                
                {(() => {
                  // Check if there are models using this dataset
                  const modelsUsingDataset = models.filter(m => m.datasetId === deleteDatasetConfirm);
                  const hasModels = modelsUsingDataset.length > 0;
                  
                  return (
                    <>
                      <p className="text-gray-600 mb-2">
                        Are you sure you want to delete this dataset? This action cannot be undone.
                      </p>
                      
                      {hasModels && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded-r-md">
                          <p className="font-medium">Warning:</p>
                          <p>This dataset is used by {modelsUsingDataset.length} {modelsUsingDataset.length === 1 ? 'model' : 'models'}. 
                          Deleting this dataset will also delete the following {modelsUsingDataset.length === 1 ? 'model' : 'models'}:</p>
                          <ul className="list-disc ml-5 mt-2">
                            {modelsUsingDataset.map(model => (
                              <li key={model.id} className="text-sm">{model.name} (by {model.createdBy})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteDataset}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {models.filter(m => m.datasetId === deleteDatasetConfirm).length > 0 
                      ? "Delete Dataset & Models" 
                      : "Delete Dataset"
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isTeacher && students.length === 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
            <p>No students are currently assigned to you.</p>
          </div>
        )}
        
        <div id="models" className={`mb-10 transition-all duration-1000 delay-100 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </span>
            {isTeacher ? "Student Models" : "Your Models"}
          </h3>
        
          {userModels.length === 0 ? (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-10"></div>
              <div className="relative bg-white shadow-md rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-indigo-100 p-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-center">
                    {isTeacher 
                      ? "Your students haven't created any models yet." 
                      : "You haven't trained any models yet."}
                  </p>
                  {!isTeacher && (
                    <button
                      onClick={() => navigate('/train')}
                      className="mt-6 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Train Your First Model
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-10"></div>
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-modern">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dataset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        {isTeacher && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        {!isTeacher && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teacher Feedback
                          </th>
                        )}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userModels.map(model => {
                        const feedback = getModelFeedback(model.id);
                        
                        return (
                          <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                  <div className="text-xs text-gray-500">{model.featureColumns.length > 1 ? 'Multiple' : 'Simple'} Linear Regression</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{getDatasetName(model.datasetId)}</div>
                              <div className="text-xs text-gray-500">{model.featureColumns.length} features</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`h-2 w-16 rounded-full ${
                                  model.metrics.r2 > 0.8 ? 'bg-green-500' : 
                                  model.metrics.r2 > 0.6 ? 'bg-blue-500' : 
                                  model.metrics.r2 > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} style={{ width: `${Math.max(model.metrics.r2 * 100, 5)}%`, maxWidth: '80px' }}></div>
                                <span className="ml-3 text-sm font-medium">{model.metrics.r2.toFixed(4)}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">MSE: {model.metrics.mse.toFixed(4)}</div>
                            </td>
                            {isTeacher && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  {model.createdBy}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {new Date(model.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            {!isTeacher && (
                              <td className="px-6 py-4">
                                {feedback ? (
                                  <div className="max-w-xs">
                                    <div className="text-sm text-gray-900 truncate flex items-start">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                      <span>
                                        {feedback.text.length > 50 
                                          ? `${feedback.text.substring(0, 50)}...` 
                                          : feedback.text}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 ml-5">
                                      {new Date(feedback.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                    </svg>
                                    No feedback yet
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-4">
                                <Link 
                                  to={`/model/${model.id}`}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  View
                                </Link>
                                
                                {isTeacher && (
                                  <button 
                                    onClick={() => handleDeleteModelClick(model.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isTeacher && students.length > 0 && (
          <div id="students" className={`mt-10 mb-10 transition-all duration-1000 delay-200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </span>
              Your Students
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => {
                const studentModels = models.filter(m => m.createdBy === student.username);
                
                return (
                  <div key={student.username} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{student.username}</h4>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                            </svg>
                            <span>
                              {studentModels.length} {studentModels.length === 1 ? 'model' : 'models'}
                            </span>
                          </div>
                          {studentModels.length > 0 && (
                            <div className="mt-3 flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Best R²:</span>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                Math.max(...studentModels.map(m => m.metrics.r2)) > 0.8 ? 'bg-green-100 text-green-800' : 
                                Math.max(...studentModels.map(m => m.metrics.r2)) > 0.6 ? 'bg-blue-100 text-blue-800' : 
                                Math.max(...studentModels.map(m => m.metrics.r2)) > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {Math.max(...studentModels.map(m => m.metrics.r2)).toFixed(4)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Student Datasets Section for Teachers */}
        {isTeacher && studentDatasets.length > 0 && (
          <div id="datasets" className={`mt-10 transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
              </span>
              Student Datasets
            </h3>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-10"></div>
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-modern">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dataset Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentDatasets.map(dataset => {
                        // Check if there are models using this dataset
                        const modelsUsingDataset = models.filter(m => m.datasetId === dataset.id);
                        
                        return (
                          <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {dataset.createdBy}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {dataset.columns.length} columns
                                </div>
                                <div className="flex items-center mt-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                  </svg>
                                  {dataset.data.length} rows
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {new Date(dataset.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end items-center">
                                {modelsUsingDataset.length > 0 && (
                                  <span className="mr-4 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                    Used by {modelsUsingDataset.length} {modelsUsingDataset.length === 1 ? 'model' : 'models'}
                                  </span>
                                )}
                                <button 
                                  onClick={() => handleDeleteDatasetClick(dataset.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 