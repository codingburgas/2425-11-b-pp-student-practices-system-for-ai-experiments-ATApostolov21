import React from 'react';
import FeatureSlider from './FeatureSlider';

const FeatureControls = ({ 
  model, 
  dataset, 
  featureValues, 
  prediction, 
  handleFeatureChange, 
  getFeatureRange 
}) => {
  if (!model || !dataset) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactive Model</h3>
      <p className="text-gray-600 mb-6">
        Adjust the feature values using the sliders below to see how they affect the prediction.
      </p>
      
      <div className="space-y-6">
        {model.featureColumns.map(feature => {
          const { min, max } = getFeatureRange(feature);
          const value = featureValues[feature] !== undefined ? featureValues[feature] : 0;
          
          return (
            <FeatureSlider 
              key={feature}
              feature={feature}
              value={value}
              min={min}
              max={max}
              prediction={prediction}
              onChange={(feature, value) => {
                // Just changes the UI without triggering prediction
                const newValues = { ...featureValues };
                newValues[feature] = value;
                handleFeatureChange(feature, value);
              }}
              onSliderChange={handleFeatureChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FeatureControls; 