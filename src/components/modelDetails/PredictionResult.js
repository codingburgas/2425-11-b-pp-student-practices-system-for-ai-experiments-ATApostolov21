import React from 'react';

const PredictionResult = ({ prediction, model }) => {
  if (!prediction || !model) return null;
  
  // Calculate contributions if this is a multivariate model
  const getContributions = () => {
    let totalSum = model.metrics.intercept;
    let contributionDetails = [];
    
    model.featureColumns.forEach((feature, index) => {
      const featureValue = prediction.featureValues && prediction.featureValues[feature] !== undefined 
        ? prediction.featureValues[feature] 
        : 0;
        
      const coefficient = model.metrics.coefficients ? model.metrics.coefficients[index] : model.metrics.slope;
      const contribution = coefficient * featureValue;
      totalSum += contribution;
      
      contributionDetails.push({
        feature,
        coefficient,
        value: featureValue,
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
    
    return {
      contributionDetails,
      topFeatures
    };
  };
  
  const { contributionDetails, topFeatures } = getContributions();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Prediction Result</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Predicted {model.targetColumn}:</span>
          <span className="text-2xl font-bold text-indigo-700">{prediction.value.toFixed(2)}</span>
        </div>
        
        <div className="h-px bg-gray-200 my-4"></div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Feature Contributions</h4>
          <p className="text-sm text-gray-600 mb-3">
            Top factors: {topFeatures}
          </p>
          
          <div className="space-y-3">
            {/* Intercept/Base value */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Base value (intercept)</span>
              </div>
              <span className="text-sm font-medium">{model.metrics.intercept.toFixed(2)}</span>
            </div>
            
            {/* Feature contributions */}
            {contributionDetails.map(item => (
              <div key={item.feature} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    item.contribution > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {item.feature} ({item.value.toFixed(2)} × {item.coefficient.toFixed(2)})
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  item.contribution > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(2)}
                </span>
              </div>
            ))}
            
            {/* Result */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Predicted output</span>
              <span className="text-sm font-bold text-indigo-700">{prediction.value.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult; 