import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModel } from '../context/ModelContext';

const TrainModel = () => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { getUserDatasets, trainModel } = useModel();
  const navigate = useNavigate();
  
  const datasets = getUserDatasets();

  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDatasetChange = (e) => {
    const datasetId = e.target.value;
    setSelectedDataset(datasetId);
    setTargetColumn('');
    setFeatureColumns([]);
    
    if (datasetId) {
      const dataset = datasets.find(d => d.id === datasetId);
      // Reset target and feature selections
      if (dataset && dataset.columns.length > 0) {
        setTargetColumn(dataset.columns[0]);
      }
    }
  };

  const handleFeatureChange = (column) => {
    if (column === targetColumn) {
      // Don't allow selecting target column as feature
      return;
    }
    
    setFeatureColumns(prev => {
      if (prev.includes(column)) {
        // Remove if already selected
        return prev.filter(col => col !== column);
      } else {
        // Add if not already selected
        // Limit to 6 features maximum
        return prev.length < 6 ? [...prev, column] : prev;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }
    
    if (!targetColumn) {
      setError('Please select a target column');
      return;
    }
    
    if (featureColumns.length === 0) {
      setError('Please select at least one feature column');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = trainModel(selectedDataset, targetColumn, featureColumns);
      
      if (result.success) {
        navigate(`/model/${result.model.id}`);
      } else {
        setError(result.message || 'Error training model');
      }
    } catch (err) {
      setError('Error training model: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDatasetColumns = () => {
    if (!selectedDataset) return [];
    const dataset = datasets.find(d => d.id === selectedDataset);
    return dataset ? dataset.columns : [];
  };

  return (
    <div className="relative z-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-[10%] w-72 h-72 bg-indigo-600 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-20 right-[15%] w-80 h-80 bg-purple-600 opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-10"></div>
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                Train Machine Learning Model
              </h2>
              
              {datasets.length === 0 ? (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 text-amber-700 p-6 mb-6 rounded-lg shadow-sm transition-all hover:shadow-md">
                  <p className="font-medium">You haven't uploaded any datasets yet. Please upload a dataset first.</p>
                  <button 
                    onClick={() => navigate('/upload')}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transform hover:scale-105 transition-all shadow-md"
                  >
                    Upload Dataset
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md" role="alert">
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="dataset" className="block text-gray-700 text-sm font-medium mb-2">
                        Select Dataset
                      </label>
                      <select
                        id="dataset"
                        value={selectedDataset}
                        onChange={handleDatasetChange}
                        className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select a dataset</option>
                        {datasets.map(dataset => (
                          <option key={dataset.id} value={dataset.id}>
                            {dataset.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedDataset && (
                      <>
                        <div>
                          <label htmlFor="targetColumn" className="block text-gray-700 text-sm font-medium mb-2">
                            Select Target Column (What to Predict)
                          </label>
                          <select
                            id="targetColumn"
                            value={targetColumn}
                            onChange={(e) => setTargetColumn(e.target.value)}
                            className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select target column</option>
                            {getDatasetColumns().map(column => (
                              <option key={column} value={column}>
                                {column}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">
                            Select Feature Columns (What to Use for Prediction)
                          </label>
                          <p className="mt-1 text-sm text-gray-500 mb-4">
                            Select 1-6 feature columns. For optimal educational value, 3-6 features are recommended.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {getDatasetColumns()
                              .filter(column => column !== targetColumn)
                              .map(column => (
                                <div key={column} className="flex items-center bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                  <input
                                    id={`feature-${column}`}
                                    type="checkbox"
                                    checked={featureColumns.includes(column)}
                                    onChange={() => handleFeatureChange(column)}
                                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors"
                                    disabled={featureColumns.length >= 6 && !featureColumns.includes(column)}
                                  />
                                  <label
                                    htmlFor={`feature-${column}`}
                                    className="ml-3 block text-sm text-gray-700"
                                  >
                                    {column}
                                  </label>
                                </div>
                              ))}
                          </div>
                          {featureColumns.length >= 6 && (
                            <p className="text-amber-600 mt-2 text-sm">
                              Maximum of 6 features reached.
                            </p>
                          )}
                          {featureColumns.length > 0 && (
                            <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                              <p className="font-medium text-indigo-700">Selected features: {featureColumns.length}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {featureColumns.map(feature => (
                                  <span key={feature} className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">
                            Algorithm
                          </label>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                              id="linearRegression"
                              type="radio"
                              checked={true}
                              className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              disabled
                            />
                            <label
                              htmlFor="linearRegression"
                              className="ml-3 block text-gray-700"
                            >
                              Linear Regression
                            </label>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 italic">
                            Currently, only linear regression is supported.
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading || !selectedDataset || !targetColumn || featureColumns.length === 0}
                        className={`px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          (loading || !selectedDataset || !targetColumn || featureColumns.length === 0) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Training Model...
                          </span>
                        ) : 'Train Model'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainModel; 