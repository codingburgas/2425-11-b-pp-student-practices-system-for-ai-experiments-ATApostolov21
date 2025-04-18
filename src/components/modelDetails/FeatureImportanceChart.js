import React from 'react';
import { Bar } from 'react-chartjs-2';

const FeatureImportanceChart = ({ model }) => {
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
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Bar data={data} options={options} />
    </div>
  );
};

export default FeatureImportanceChart; 