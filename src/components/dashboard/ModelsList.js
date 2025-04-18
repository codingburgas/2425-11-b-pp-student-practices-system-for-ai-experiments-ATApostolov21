import React from 'react';
import { Link } from 'react-router-dom';

const ModelsList = ({ 
  isTeacher, 
  userModels, 
  getDatasetName, 
  getModelFeedback, 
  handleDeleteModelClick,
  isVisible
}) => {
  return (
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
          <div className="relative bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-center text-center">
              <div>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">No Models Yet</h4>
                <p className="text-gray-500 max-w-md mx-auto mb-5">
                  {isTeacher 
                    ? "Your students haven't created any models yet. Check back later!" 
                    : "You haven't created any models yet. Click the button below to train your first model!"}
                </p>
                {!isTeacher && (
                  <Link
                    to="/train"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Train Your First Model
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dataset
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metrics
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isTeacher ? 'Student' : 'Created'}
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
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
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-10">R²:</span>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              model.metrics.r2 > 0.8 ? 'bg-green-100 text-green-800' : 
                              model.metrics.r2 > 0.6 ? 'bg-blue-100 text-blue-800' : 
                              model.metrics.r2 > 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {model.metrics.r2.toFixed(4)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-10">MSE:</span>
                            <span className="text-xs">{model.metrics.mse.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-10">MAE:</span>
                            <span className="text-xs">{model.metrics.mae.toFixed(4)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {feedback ? (
                          <div className="max-w-[150px] text-sm text-gray-900 truncate" title={feedback.text}>
                            "{feedback.text}"
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No feedback yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isTeacher ? (
                          <div className="text-sm text-gray-900">{model.createdBy}</div>
                        ) : (
                          <div className="text-sm text-gray-500">{new Date(model.createdAt).toLocaleDateString()}</div>
                        )}
                      </td>
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
      )}
    </div>
  );
};

export default ModelsList; 