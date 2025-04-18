import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModel } from '../context/ModelContext';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    models, 
    datasets, 
    makePrediction, 
    getModelPrediction, 
    addFeedback, 
    getModelFeedback,
    deleteModel 
  } = useModel();
  
  const [model, setModel] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [featureValues, setFeatureValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('information');

  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load model, dataset, and existing prediction/feedback
  useEffect(() => {
    const foundModel = models.find(m => m.id === id);
    if (!foundModel) {
      setError('Model not found');
      return;
    }
    
    setModel(foundModel);
    
    const foundDataset = datasets.find(d => d.id === foundModel.datasetId);
    if (foundDataset) {
      setDataset(foundDataset);
    }
    
    // Initialize feature values with defaults
    const initialFeatureValues = {};
    foundModel.featureColumns.forEach(feature => {
      if (foundDataset) {
        try {
          // Calculate the average value for this feature as initial value
          const numericValues = foundDataset.data
            .map(row => parseFloat(row[feature]))
            .filter(val => !isNaN(val));
            
          if (numericValues.length > 0) {
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const avg = sum / numericValues.length;
            initialFeatureValues[feature] = parseFloat(avg.toFixed(2));
          } else {
            initialFeatureValues[feature] = 0;
          }
        } catch (error) {
          console.error(`Error calculating average for ${feature}:`, error);
          initialFeatureValues[feature] = 0;
        }
      } else {
        initialFeatureValues[feature] = 0;
      }
    });
    
    console.log("Setting initial feature values:", initialFeatureValues);
    
    // Load existing prediction if any
    const existingPrediction = getModelPrediction(id);
    if (existingPrediction) {
      setPrediction(existingPrediction);
      
      // If prediction has stored feature values, use them to update the sliders
      if (existingPrediction.featureValues) {
        // Use the stored feature values instead of defaults
        foundModel.featureColumns.forEach(feature => {
          if (existingPrediction.featureValues[feature] !== undefined) {
            initialFeatureValues[feature] = existingPrediction.featureValues[feature];
          }
        });
        console.log("Using saved prediction values for sliders:", existingPrediction.featureValues);
      }
    }
    
    // Set the feature values (either from defaults or from saved prediction)
    setFeatureValues(initialFeatureValues);
    
    // Load existing feedback if any
    const existingFeedback = getModelFeedback(id);
    if (existingFeedback) {
      setSavedFeedback(existingFeedback);
    }
  }, [id, models, datasets, getModelPrediction, getModelFeedback]);

  const handlePredict = useCallback(() => {
    if (!model) return;
    
    try {
      // Create an object with feature names as keys for better error tracking
      const featureObject = {};
      model.featureColumns.forEach(feature => {
        featureObject[feature] = featureValues[feature];
      });
      
      // Make the prediction with the object
      const result = makePrediction(model.id, featureObject);
      if (result.success) {
        setPrediction(result);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(`Prediction error: ${error.message || 'Unknown error'}`);
    }
  }, [model, featureValues, makePrediction]);

  const handleFeatureChange = (feature, value) => {
    // Simple direct update without extra logic
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Update the state directly
      const newValues = { ...featureValues, [feature]: numericValue };
      setFeatureValues(newValues);
      
      // Immediately make the prediction without delay
      if (model) {
        try {
          // Set loading state
          setPrediction(prev => ({ ...prev, isUpdating: true }));
          
          // Create feature object
          const featureObject = {};
          Object.keys(newValues).forEach(key => {
            featureObject[key] = newValues[key];
          });
          
          // Make prediction directly
          const result = makePrediction(model.id, featureObject);
          if (result.success) {
            setPrediction(result);
          }
        } catch (err) {
          console.error("Prediction failed:", err);
        }
      }
    }
  };

  const handleSaveFeedback = () => {
    if (!feedback.trim()) return;
    
    setLoading(true);
    
    try {
      const result = addFeedback(model.id, feedback);
      if (result.success) {
        setSavedFeedback(result.feedback);
        setFeedback('');
      }
    } catch (err) {
      setError('Error saving feedback: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (!model) return;
    
    const result = deleteModel(model.id);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setDeleteConfirm(false);
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  // Generate chart data for feature importance
  const getFeatureImportanceChart = () => {
    if (!model) return null;
    
    // Prepare data differently based on the number of features
    const isMultivariate = model.featureColumns.length > 1;
    
    // Get the coefficients and their absolute values for feature importance
    let coefficients, importance;
    
    if (isMultivariate) {
      // For multivariate models, use the coefficients directly
      coefficients = model.metrics.coefficients;
      importance = model.metrics.featureImportance || coefficients.map(c => Math.abs(c));
    } else {
      // For simple linear models, use the slope
      coefficients = [model.metrics.slope];
      importance = [Math.abs(model.metrics.slope)];
    }
    
    // Colors for the bars
    const backgroundColors = [
      'rgba(99, 102, 241, 0.7)',   // indigo-500
      'rgba(236, 72, 153, 0.7)',   // pink-500
      'rgba(16, 185, 129, 0.7)',   // emerald-500
      'rgba(245, 158, 11, 0.7)',   // amber-500
      'rgba(59, 130, 246, 0.7)',   // blue-500
      'rgba(168, 85, 247, 0.7)'    // purple-500
    ];
    
    const data = {
      labels: model.featureColumns,
      datasets: [
        {
          label: 'Feature Importance',
          data: importance,
          backgroundColor: model.featureColumns.map((_, i) => backgroundColors[i % backgroundColors.length]),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Feature Importance (Absolute Coefficient Values)',
          font: {
            size: 14,
            family: 'Inter, system-ui, sans-serif',
          },
          color: '#4b5563', // text-gray-600
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const feature = model.featureColumns[context.dataIndex];
              const coefficient = coefficients[context.dataIndex];
              return `${feature}: ${coefficient.toFixed(4)} (abs: ${Math.abs(coefficient).toFixed(4)})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)', // gray-400 with low opacity
          },
          ticks: {
            font: {
              family: 'Inter, system-ui, sans-serif'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter, system-ui, sans-serif'
            }
          }
        }
      }
    };
    
    return { data, options, coefficients };
  };

  // Get min and max values for each feature to set slider range
  const getFeatureRange = (feature) => {
    if (!dataset) return { min: 0, max: 100 };
    
    const values = dataset.data.map(row => parseFloat(row[feature]));
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    
    return { min, max };
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl shadow-xl overflow-hidden mt-8 transition-all duration-300 transform">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur opacity-20"></div>
          <div className="relative bg-white p-8 rounded-xl">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-r-md mb-6" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!model || !dataset) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl shadow-xl overflow-hidden mt-8 transition-all duration-300 transform">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20"></div>
          <div className="relative bg-white p-8 rounded-xl">
            <div className="text-center py-10">
              <div className="inline-block w-16 h-16 relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg">Loading model details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getFeatureImportanceChart();
  const isOwner = model.createdBy === currentUser?.username;
  const isTeacher = currentUser?.role === 'teacher';
  const isMultivariate = model.featureColumns.length > 1;
  const canEdit = isTeacher && !isOwner;
  const canDelete = isTeacher && !isOwner;
  const shouldShowFeedback = savedFeedback && (isOwner || isTeacher);

  return (
    <div className="relative max-w-7xl mx-auto z-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="animate-float-slow absolute top-10 left-[5%] w-72 h-72 bg-indigo-600 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-10 right-[10%] w-80 h-80 bg-purple-600 opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="relative animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur opacity-20"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-5">
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
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-10"></div>
          <div className="relative bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {model.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isMultivariate ? 'Multiple' : 'Simple'} Linear Regression Model
                </p>
              </div>
              
              <div className="flex space-x-3">
                {canDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Model
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('information')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'information' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Model Information
                </button>
                
                <button 
                  onClick={() => setActiveTab('predict')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'predict' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Make Predictions
                </button>
                
                {shouldShowFeedback && (
                  <button 
                    onClick={() => setActiveTab('feedback')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'feedback' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Feedback
                  </button>
                )}
                
                {canEdit && !savedFeedback && (
                  <button 
                    onClick={() => setActiveTab('giveFeedback')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'giveFeedback' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Add Feedback
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab content */}
            <div className="transition-all duration-300">
              {/* Model Information Tab */}
              {activeTab === 'information' && (
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                  <div>
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Model Information
                      </h3>
                      
                      <div className="space-y-3 text-gray-700">
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Dataset:</span> 
                          <span className="w-2/3">{dataset.name}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Target:</span> 
                          <span className="w-2/3">{model.targetColumn}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Features:</span> 
                          <div className="w-2/3 flex flex-wrap gap-1.5">
                            {model.featureColumns.map(feature => (
                              <span key={feature} className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Algorithm:</span> 
                          <span className="w-2/3">{isMultivariate ? 'Multiple' : 'Simple'} Linear Regression</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Created By:</span> 
                          <span className="w-2/3">{model.createdBy}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-1/3">Created:</span> 
                          <span className="w-2/3">{new Date(model.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                        Model Performance
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-indigo-50 p-3 rounded-lg">
                            <div className="text-xs text-indigo-700 uppercase tracking-wider font-semibold">R² Score</div>
                            <div className="text-2xl font-bold text-indigo-800 mt-1">{model.metrics.r2.toFixed(4)}</div>
                            <div className="text-xs text-indigo-700 mt-1">Higher is better (max 1.0)</div>
                          </div>
                          
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-xs text-purple-700 uppercase tracking-wider font-semibold">Mean Squared Error</div>
                            <div className="text-2xl font-bold text-purple-800 mt-1">{model.metrics.mse.toFixed(4)}</div>
                            <div className="text-xs text-purple-700 mt-1">Lower is better</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Model Equation:</div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
                            {isMultivariate ? (
                              <div className="font-mono text-sm">
                                {model.targetColumn} = {model.metrics.intercept.toFixed(2)} 
                                {model.featureColumns.map((feature, index) => {
                                  const coefficient = model.metrics.coefficients[index];
                                  return (
                                    <span key={feature}>
                                      <span className={coefficient >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {' '}{coefficient >= 0 ? '+' : ''}{' '}{coefficient.toFixed(2)}
                                      </span>
                                      {' × '}{feature}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="font-mono text-sm">
                                {model.targetColumn} = 
                                <span className={model.metrics.slope >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {' '}{model.metrics.slope.toFixed(2)}
                                </span>
                                {' × '}{model.featureColumns[0]}{' '}
                                {model.metrics.intercept >= 0 ? '+' : ''}{' '}
                                {model.metrics.intercept.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isMultivariate && (
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          Feature Coefficients
                        </h3>
                        
                        <div className="space-y-3">
                          {model.featureColumns.map((feature, index) => (
                            <div key={feature} className="flex items-center">
                              <div className="w-1/3 text-sm font-medium">{feature}:</div>
                              <div className="w-2/3">
                                <div className="flex items-center">
                                  <div 
                                    className={`h-4 ${chartData.coefficients[index] >= 0 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'} rounded-full`} 
                                    style={{ 
                                      width: `${Math.min(Math.abs(chartData.coefficients[index] * 10), 100)}%`
                                    }}
                                  ></div>
                                  <span className={`ml-2 text-sm ${chartData.coefficients[index] >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                    {chartData.coefficients[index].toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-4 bg-gray-50 p-2 rounded">
                          <span className="font-medium">How to interpret:</span> Positive values (green) indicate that as the feature increases, 
                          the target tends to increase. Negative values (red) indicate that as the feature increases, the target tends to decrease.
                          The magnitude of the coefficient indicates the strength of the relationship.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-auto">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                        </svg>
                        Feature Importance
                      </h3>
                      
                      <div className="mt-2">
                        {chartData && <Bar data={chartData.data} options={chartData.options} />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Make Predictions Tab */}
              {activeTab === 'predict' && (
                <div className="animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Interactive Model
                    </h3>
                    
                    <p className="text-sm text-blue-700 mb-6">
                      Adjust the feature values using the sliders below to see how they affect the prediction.
                      Changes to the sliders will automatically update the prediction in real-time.
                    </p>
                    
                    <div className="space-y-6">
                      {model.featureColumns.map(feature => {
                        const { min, max } = getFeatureRange(feature);
                        const value = featureValues[feature] !== undefined ? featureValues[feature] : 0;
                        
                        // Calculate a reasonable step size
                        const stepSize = Math.max((max - min) / 100, 0.01);
                        
                        // Check if the current slider value differs from the prediction's stored value
                        const isPredictionValue = prediction && 
                          prediction.featureValues && 
                          prediction.featureValues[feature] !== undefined && 
                          Math.abs(value - prediction.featureValues[feature]) < 0.001;
                        
                        return (
                          <div key={feature} className="relative p-4 rounded-lg border border-blue-200 bg-white shadow-sm transition-all hover:shadow">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-gray-700 font-medium flex items-center">
                                <span className="mr-2">{feature}:</span> 
                                <span className="font-bold text-blue-700">{parseFloat(value).toFixed(2)}</span>
                                {!isPredictionValue && !prediction?.isUpdating && (
                                  <span className="ml-2 text-xs text-orange-500 font-normal">
                                    (changed)
                                  </span>
                                )}
                              </label>
                            </div>
                            
                            <div className="relative mt-3">
                              <input
                                type="range"
                                min={min}
                                max={max}
                                step={stepSize}
                                value={value}
                                onChange={(e) => {
                                  // Just update the value in state without triggering prediction
                                  const newVal = parseFloat(e.target.value);
                                  setFeatureValues({...featureValues, [feature]: newVal});
                                }}
                                onMouseUp={(e) => handleFeatureChange(feature, e.target.value)}
                                onTouchEnd={(e) => handleFeatureChange(feature, e.target.value)}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                              
                              {/* Visual marker for the last prediction value */}
                              {prediction && prediction.featureValues && prediction.featureValues[feature] !== undefined && (
                                <div 
                                  className="absolute w-1 h-5 bg-red-500 rounded"
                                  style={{ 
                                    left: `${((prediction.featureValues[feature] - min) / (max - min)) * 100}%`,
                                    top: '-1px',
                                    transform: 'translateX(-50%)',
                                  }}
                                  title={`Last prediction value: ${prediction.featureValues[feature].toFixed(2)}`}
                                ></div>
                              )}
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{min}</span>
                              <span>{max}</span>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <button 
                                className="p-1.5 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 transition-colors"
                                onClick={() => {
                                  const newVal = Math.max(min, value - stepSize * 10);
                                  handleFeatureChange(feature, newVal);
                                }}
                              >
                                <span className="flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                  Decrease
                                </span>
                              </button>
                              
                              <input
                                type="number"
                                min={min}
                                max={max}
                                step={stepSize}
                                value={value}
                                onChange={(e) => {
                                  const newVal = parseFloat(e.target.value);
                                  if (!isNaN(newVal)) {
                                    handleFeatureChange(feature, newVal);
                                  }
                                }}
                                className="text-center p-1 border border-blue-300 rounded-lg text-sm"
                              />
                              
                              <button 
                                className="p-1.5 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 transition-colors"
                                onClick={() => {
                                  const newVal = Math.min(max, value + stepSize * 10);
                                  handleFeatureChange(feature, newVal);
                                }}
                              >
                                <span className="flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Increase
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 flex justify-center space-x-4">
                      {prediction && prediction.featureValues && (
                        <button
                          onClick={() => {
                            // Reset all feature values to the last prediction values
                            if (prediction.featureValues) {
                              setFeatureValues({...prediction.featureValues});
                            }
                          }}
                          className="px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors shadow-sm"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset Values
                          </span>
                        </button>
                      )}
                      
                      <button
                        onClick={handlePredict}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Make Prediction
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {prediction && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg mb-6 border border-green-100 shadow-sm animate-fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Prediction Result
                        </h3>
                        {prediction.isUpdating && (
                          <span className="flex items-center">
                            <span className="text-blue-600 text-sm mr-2">Updating...</span>
                            <span className="inline-block h-4 w-4 rounded-full bg-blue-500 opacity-75 animate-pulse" 
                                title="Updating prediction..."></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-green-200 mt-2">
                        <p className="text-2xl font-bold text-green-700">
                          The predicted {model.targetColumn} is {Math.round(prediction.prediction)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Based on your selected feature values, the model predicts the {model.targetColumn} to be approximately {Math.round(prediction.prediction)}.
                        </p>
                      </div>
                      
                      {isMultivariate && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                          <p className="font-semibold text-gray-800">Feature Contribution Analysis</p>
                          <p className="text-xs text-gray-600 mb-3">
                            This breakdown shows how each feature contributes to the final prediction. 
                            The formula is: Feature Coefficient × Feature Value = Contribution.
                          </p>
                          
                          <div className="space-y-2.5">
                            <div className="flex items-center">
                              <div className="w-1/3 text-sm">Base (Intercept):</div>
                              <div className="w-2/3 text-sm font-medium">{model.metrics.intercept.toFixed(2)}</div>
                            </div>
                            
                            {model.featureColumns.map((feature, index) => {
                              // Use the feature values from the prediction object instead of current state
                              const featureValue = prediction.featureValues && prediction.featureValues[feature] !== undefined 
                                ? prediction.featureValues[feature] 
                                : featureValues[feature] || 0;
                                
                              const coefficient = model.metrics.coefficients[index];
                              const contribution = coefficient * featureValue;
                              
                              // Add class to show positive/negative contribution
                              const contributionClass = contribution > 0 
                                ? "text-green-600" 
                                : contribution < 0 
                                  ? "text-red-600" 
                                  : "";
                                  
                              return (
                                <div key={feature} className="flex items-center">
                                  <div className="w-1/3 text-sm">{feature}:</div>
                                  <div className="w-2/3 text-sm">
                                    <span>{coefficient.toFixed(2)} × {featureValue.toFixed(2)} = </span>
                                    <span className={`font-medium ${contributionClass}`}>{contribution.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Calculate the total sum to confirm it matches the prediction */}
                          {(() => {
                            let totalSum = model.metrics.intercept;
                            let contributionDetails = [];
                            
                            model.featureColumns.forEach((feature, index) => {
                              const featureValue = prediction.featureValues && prediction.featureValues[feature] !== undefined 
                                ? prediction.featureValues[feature] 
                                : featureValues[feature] || 0;
                                
                              const coefficient = model.metrics.coefficients[index];
                              const contribution = coefficient * featureValue;
                              totalSum += contribution;
                              
                              contributionDetails.push({
                                feature,
                                contribution
                              });
                            });
                            
                            // Sort contributions by absolute magnitude
                            contributionDetails.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
                            
                            // Find the most influential features
                            const topFeatures = contributionDetails.slice(0, 2).map(item => {
                              const direction = item.contribution > 0 ? 'increasing' : 'decreasing';
                              return `${item.feature} (${direction})`;
                            }).join(' and ');
                            
                            return (
                              <>
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex items-center font-medium">
                                    <div className="w-1/3 text-sm">Total:</div>
                                    <div className="w-2/3 text-sm">{model.metrics.intercept.toFixed(2)} (base) + feature contributions = {totalSum.toFixed(2)}</div>
                                  </div>
                                  <p className="text-xs mt-1 text-gray-500">
                                    Note: Small rounding differences may occur between this sum and the final prediction.
                                  </p>
                                </div>
                                
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-sm">
                                    <span className="font-medium">Key Insight:</span> The most influential features in this prediction are {topFeatures}.
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                          
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">How to interpret:</span> Positive contributions (green) increase the prediction,
                              while negative contributions (red) decrease it. The final prediction is the sum of the base intercept and all feature contributions.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Feedback Tab */}
              {activeTab === 'feedback' && shouldShowFeedback && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-lg border border-amber-200 shadow-sm animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Teacher Feedback
                  </h3>
                  
                  <div className="bg-white p-5 rounded-lg border border-amber-200">
                    <div className="prose max-w-none text-gray-800">
                      {savedFeedback.text}
                    </div>
                    
                    <div className="mt-6 flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Provided by <span className="font-medium">{savedFeedback.createdBy}</span></span>
                      
                      <span className="mx-2">•</span>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(savedFeedback.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('giveFeedback')}
                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Give Feedback Tab */}
              {activeTab === 'giveFeedback' && canEdit && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-lg border border-amber-200 shadow-sm animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {savedFeedback ? 'Update Feedback' : 'Add Feedback'}
                  </h3>
                  
                  <p className="text-sm text-amber-700 mb-4">
                    {savedFeedback 
                      ? 'Use this form to update your feedback for the student on their model.'
                      : 'Provide feedback to the student about their model to help them improve.'}
                  </p>
                  
                  <div className="bg-white p-5 rounded-lg border border-amber-200">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={savedFeedback 
                        ? "Update your feedback for this model..." 
                        : "Enter your feedback for the student here..."}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[150px]"
                    />
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      {savedFeedback && (
                        <button
                          onClick={() => setActiveTab('feedback')}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        onClick={handleSaveFeedback}
                        disabled={loading || !feedback.trim()}
                        className={`px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm ${
                          loading || !feedback.trim() ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
                        }`}
                      >
                        {loading 
                          ? <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {savedFeedback ? 'Updating...' : 'Saving...'}
                            </span> 
                          : savedFeedback ? 'Update Feedback' : 'Save Feedback'
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetails; 