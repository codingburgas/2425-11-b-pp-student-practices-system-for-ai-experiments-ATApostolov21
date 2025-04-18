import React from 'react';

const ModelInfo = ({ model, dataset }) => {
  if (!model) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-5">
        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{model.name}</h2>
          <p className="text-sm text-gray-500">
            Created on {new Date(model.createdAt).toLocaleDateString()} by {model.createdBy}
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Model Type</h3>
          <p className="text-gray-800 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
              {model.featureColumns.length > 1 ? 'Multiple' : 'Simple'} Linear Regression
            </span>
            <span className="text-gray-500 text-sm">({model.featureColumns.length} feature{model.featureColumns.length !== 1 ? 's' : ''})</span>
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Dataset</h3>
          <p className="text-gray-800 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              {dataset ? dataset.name : 'Unknown Dataset'}
            </span>
            <span className="text-gray-500 text-sm">
              ({dataset ? dataset.data.length : 0} data points)
            </span>
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Features</h3>
          <div className="flex flex-wrap gap-2">
            {model.featureColumns.map(feature => (
              <span
                key={feature}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Target</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            {model.targetColumn}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Model Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">R-squared (R²)</p>
              <p className={`text-lg font-semibold ${
                model.metrics.r2 > 0.8 ? 'text-green-600' : 
                model.metrics.r2 > 0.6 ? 'text-blue-600' : 
                model.metrics.r2 > 0.4 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {model.metrics.r2.toFixed(4)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Mean Squared Error</p>
              <p className="text-lg font-semibold text-gray-700">{model.metrics.mse.toFixed(4)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Mean Absolute Error</p>
              <p className="text-lg font-semibold text-gray-700">{model.metrics.mae.toFixed(4)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Model Formula</h3>
          <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
            <code className="text-sm text-gray-800 whitespace-nowrap">
              {model.targetColumn} = 
              {model.featureColumns.length > 1 ? (
                <>
                  {' '}{model.metrics.intercept.toFixed(4)}
                  {model.featureColumns.map((feature, index) => {
                    const coefficient = model.metrics.coefficients[index];
                    return (
                      <span key={feature}>
                        {' '}
                        {coefficient >= 0 ? '+' : ''}
                        {coefficient.toFixed(4)} × {feature}
                      </span>
                    );
                  })}
                </>
              ) : (
                <>
                  {' '}{model.metrics.intercept.toFixed(4)} 
                  {model.metrics.slope >= 0 ? '+' : ''}
                  {model.metrics.slope.toFixed(4)} × {model.featureColumns[0]}
                </>
              )}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfo; 