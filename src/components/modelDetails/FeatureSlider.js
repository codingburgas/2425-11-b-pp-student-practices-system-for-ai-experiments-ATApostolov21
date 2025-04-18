import React from 'react';

const FeatureSlider = ({ 
  feature, 
  value, 
  min, 
  max, 
  prediction, 
  onChange,
  onSliderChange
}) => {
  // Calculate a reasonable step size
  const stepSize = Math.max((max - min) / 100, 0.01);
  
  // Check if the current slider value differs from the prediction's stored value
  const isPredictionValue = prediction && 
    prediction.featureValues && 
    prediction.featureValues[feature] !== undefined && 
    Math.abs(value - prediction.featureValues[feature]) < 0.001;
  
  return (
    <div className="relative p-4 rounded-lg border border-blue-200 bg-white shadow-sm transition-all hover:shadow">
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
            onChange(feature, newVal);
          }}
          onMouseUp={(e) => onSliderChange(feature, e.target.value)}
          onTouchEnd={(e) => onSliderChange(feature, e.target.value)}
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
            onSliderChange(feature, newVal);
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
              onSliderChange(feature, newVal);
            }
          }}
          className="text-center p-1 border border-blue-300 rounded-lg text-sm"
        />
        
        <button 
          className="p-1.5 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 transition-colors"
          onClick={() => {
            const newVal = Math.min(max, value + stepSize * 10);
            onSliderChange(feature, newVal);
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
};

export default FeatureSlider; 