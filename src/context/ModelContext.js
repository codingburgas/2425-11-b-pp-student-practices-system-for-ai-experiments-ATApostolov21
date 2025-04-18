import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import { Matrix } from 'ml-matrix';
import { v4 as uuidv4 } from 'uuid';

const ModelContext = createContext();

export const useModel = () => {
  return useContext(ModelContext);
};

export const ModelProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  // Load data from localStorage
  useEffect(() => {
    const storedDatasets = localStorage.getItem('datasets');
    const storedModels = localStorage.getItem('models');
    const storedPredictions = localStorage.getItem('predictions');
    const storedFeedbacks = localStorage.getItem('feedbacks');

    if (storedDatasets) setDatasets(JSON.parse(storedDatasets));
    if (storedModels) setModels(JSON.parse(storedModels));
    if (storedPredictions) setPredictions(JSON.parse(storedPredictions));
    if (storedFeedbacks) setFeedbacks(JSON.parse(storedFeedbacks));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (datasets.length > 0) localStorage.setItem('datasets', JSON.stringify(datasets));
    if (models.length > 0) localStorage.setItem('models', JSON.stringify(models));
    if (Object.keys(predictions).length > 0) localStorage.setItem('predictions', JSON.stringify(predictions));
    if (Object.keys(feedbacks).length > 0) localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
  }, [datasets, models, predictions, feedbacks]);

  const uploadDataset = (datasetName, data, columns) => {
    const newDataset = {
      id: Date.now().toString(),
      name: datasetName,
      data,
      columns,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString()
    };
    
    setDatasets(prev => [...prev, newDataset]);
    return newDataset;
  };

  const getUserDatasets = () => {
    return datasets.filter(dataset => dataset.createdBy === currentUser?.username);
  };

  // Get all datasets from students assigned to this teacher
  const getStudentDatasets = () => {
    if (!currentUser || currentUser.role !== 'teacher') {
      return [];
    }
    
    // Get all students assigned to this teacher
    const teacherStudents = JSON.parse(localStorage.getItem('users') || '[]')
      .filter(user => user.role === 'student' && user.teacher === currentUser.username)
      .map(student => student.username);
    
    // Filter datasets created by these students
    return datasets.filter(dataset => {
      return teacherStudents.includes(dataset.createdBy);
    });
  };
  
  // Delete a dataset (only available to teachers)
  const deleteDataset = (datasetId) => {
    // Check if current user is a teacher
    if (!currentUser || currentUser.role !== 'teacher') {
      return { success: false, message: 'Only teachers can delete datasets' };
    }
    
    const datasetToDelete = datasets.find(d => d.id === datasetId);
    if (!datasetToDelete) {
      return { success: false, message: 'Dataset not found' };
    }
    
    // Check if dataset creator is a student of this teacher
    const students = JSON.parse(localStorage.getItem('users') || '[]')
      .filter(user => user.role === 'student' && user.teacher === currentUser.username)
      .map(student => student.username);
    
    if (!students.includes(datasetToDelete.createdBy)) {
      return { success: false, message: 'You can only delete datasets from your students' };
    }
    
    // Find models using this dataset
    const affectedModels = models.filter(model => model.datasetId === datasetId)
      .map(model => model.id);
    
    // Delete the dataset
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    
    // Delete any models that use this dataset
    if (affectedModels.length > 0) {
      setModels(prev => prev.filter(m => !affectedModels.includes(m.id)));
      
      // Also clean up related predictions and feedbacks
      affectedModels.forEach(modelId => {
        setPredictions(prev => {
          const newPredictions = {...prev};
          delete newPredictions[modelId];
          return newPredictions;
        });
        
        setFeedbacks(prev => {
          const newFeedbacks = {...prev};
          delete newFeedbacks[modelId];
          return newFeedbacks;
        });
      });
    }
    
    return { 
      success: true, 
      message: `Dataset deleted successfully${affectedModels.length > 0 ? `, along with ${affectedModels.length} associated model(s)` : ''}` 
    };
  };

  // Multiple Linear Regression implementation
  class MultipleLinearRegression {
    constructor() {
      this.weights = null;
      this.intercept = null;
      this.means = null;
      this.stds = null;
    }
    
    // Normalize the data
    normalize(X) {
      try {
        // Calculate mean and standard deviation for each feature
        const numFeatures = X[0].length;
        const numSamples = X.length;
        
        this.means = Array(numFeatures).fill(0);
        this.stds = Array(numFeatures).fill(0);
        
        // Calculate means
        for (let i = 0; i < numSamples; i++) {
          for (let j = 0; j < numFeatures; j++) {
            this.means[j] += X[i][j];
          }
        }
        
        for (let j = 0; j < numFeatures; j++) {
          this.means[j] /= numSamples;
        }
        
        // Calculate standard deviations
        for (let i = 0; i < numSamples; i++) {
          for (let j = 0; j < numFeatures; j++) {
            this.stds[j] += Math.pow(X[i][j] - this.means[j], 2);
          }
        }
        
        // Check feature variance
        const lowVarianceFeatures = [];
        
        for (let j = 0; j < numFeatures; j++) {
          // Calculate std dev
          this.stds[j] = Math.sqrt(this.stds[j] / numSamples);
          
          // Check for low variance features
          if (this.stds[j] < 0.0001) {
            lowVarianceFeatures.push(j);
            console.warn(`Feature at index ${j} has very low variance: ${this.stds[j]}`);
          }
          
          // Prevent division by zero with a minimum value
          if (this.stds[j] === 0 || isNaN(this.stds[j])) {
            this.stds[j] = 0.0001; // Small value instead of 1 to reduce impact
          }
        }
        
        if (lowVarianceFeatures.length > 0) {
          console.warn("Low variance features detected. This may cause numerical instability.");
        }
        
        // Normalize the data
        const normalizedX = [];
        for (let i = 0; i < numSamples; i++) {
          normalizedX[i] = [];
          for (let j = 0; j < numFeatures; j++) {
            normalizedX[i][j] = (X[i][j] - this.means[j]) / this.stds[j];
          }
        }
        
        return normalizedX;
      } catch (error) {
        console.error("Error during normalization:", error);
        throw new Error("Failed to normalize data: " + error.message);
      }
    }
    
    // Denormalize a feature value for prediction
    denormalizeFeature(featureValue, featureIndex) {
      return featureValue * this.stds[featureIndex] + this.means[featureIndex];
    }
    
    // Normalize a feature value for prediction
    normalizeFeature(featureValue, featureIndex) {
      return (featureValue - this.means[featureIndex]) / this.stds[featureIndex];
    }
    
    train(X, y) {
      try {
        // For multiple features, use normal equation with regularization
        const X_matrix = new Matrix(X);
        
        // Add a column of ones for the intercept term
        const ones = Matrix.ones(X.length, 1);
        const X_with_intercept = ones.hstack(X_matrix);
        
        // Calculate (X^T * X)^-1 * X^T * y
        const X_transpose = X_with_intercept.transpose();
        const X_transpose_X = X_transpose.mmul(X_with_intercept);
        
        // Add a stronger regularization term to ensure invertibility
        // Create an identity matrix with a small value (lambda) on the diagonal
        const lambda = 0.5; // Further increased regularization for better stability
        const regularization = Matrix.eye(X_transpose_X.rows, X_transpose_X.columns).mul(lambda);
        
        // Add regularization to X_transpose_X
        const X_transpose_X_reg = X_transpose_X.add(regularization);
        
        // Now try to invert - wrapped in a try-catch for safety
        let X_transpose_X_inverse;
        try {
          // Check if the matrix is invertible by checking determinant
          const det = X_transpose_X_reg.det();
          if (Math.abs(det) < 1e-10) {
            throw new Error("Matrix is nearly singular with determinant close to zero: " + det);
          }
          
          X_transpose_X_inverse = X_transpose_X_reg.inverse();
          
          // Verify the inverse worked by checking if X * X^-1 is close to identity
          const product = X_transpose_X_reg.mmul(X_transpose_X_inverse);
          const identity = Matrix.eye(product.rows, product.columns);
          
          // Check if any elements differ too much from identity matrix
          for (let i = 0; i < product.rows; i++) {
            for (let j = 0; j < product.columns; j++) {
              const expected = i === j ? 1 : 0;
              if (Math.abs(product.get(i, j) - expected) > 0.1) {
                console.warn("Matrix inversion check failed: Not close to identity");
                // We'll still proceed with the inversion, but log the warning
              }
            }
          }
        } catch (err) {
          console.error("Matrix inversion failed", err);
          console.log("Falling back to gradient descent method...");
          // Fall back to gradient descent instead
          return this.trainWithGradientDescent(X, y);
        }
        
        const X_transpose_y = X_transpose.mmul(Matrix.columnVector(y));
        const beta = X_transpose_X_inverse.mmul(X_transpose_y);
        
        // Extract intercept and coefficients
        this.intercept = beta.get(0, 0);
        this.weights = [];
        for (let i = 1; i < beta.rows; i++) {
          this.weights.push(beta.get(i, 0));
        }
        
        // Calculate predicted values
        const y_pred = X_with_intercept.mmul(beta).to1DArray();
        
        // Calculate R^2 and MSE
        const y_mean = y.reduce((sum, val) => sum + val, 0) / y.length;
        let ss_total = 0;
        let ss_residual = 0;
        let mse = 0;
        
        for (let i = 0; i < y.length; i++) {
          ss_total += Math.pow(y[i] - y_mean, 2);
          ss_residual += Math.pow(y[i] - y_pred[i], 2);
          mse += Math.pow(y[i] - y_pred[i], 2);
        }
        
        const r2 = 1 - (ss_residual / ss_total);
        mse /= y.length;
        
        return {
          r2,
          mse,
          weights: this.weights,
          intercept: this.intercept,
          means: this.means,
          stds: this.stds
        };
      } catch (error) {
        // If a general error occurs in the normal equation method, try gradient descent
        console.error("Error in normal equation method:", error);
        console.log("Attempting gradient descent as a last resort...");
        return this.trainWithGradientDescent(X, y);
      }
    }
    
    predict(X) {
      try {
        // Check if X is a single sample or multiple samples
        const isSingleSample = !Array.isArray(X[0]);
        
        if (isSingleSample) {
          // Normalize the input features
          const normalizedX = X.map((val, idx) => this.normalizeFeature(val, idx));
          // Make prediction
          return this.intercept + normalizedX.reduce((sum, x, i) => sum + x * this.weights[i], 0);
        } else {
          // Normalize each sample and make predictions
          return X.map(sample => {
            const normalizedSample = sample.map((val, idx) => this.normalizeFeature(val, idx));
            return this.intercept + normalizedSample.reduce((sum, x, i) => sum + x * this.weights[i], 0);
          });
        }
      } catch (error) {
        console.error("Error during prediction:", error);
        throw new Error("Failed to make prediction: " + error.message);
      }
    }

    // Alternative training method if matrix inversion fails
    trainWithGradientDescent(X, y) {
      console.log("Attempting to train with gradient descent instead");
      try {
        const numSamples = X.length;
        const numFeatures = X[0].length;
        
        // Normalize the data
        const normalizedX = this.normalize(X);
        
        // Initialize weights and bias
        let weights = Array(numFeatures).fill(0);
        let bias = 0;
        
        // Hyperparameters
        const learningRate = 0.01;
        const numIterations = 10000;
        const convergenceThreshold = 0.0001;
        
        // Gradient descent
        let prevCost = Infinity;
        
        for (let iter = 0; iter < numIterations; iter++) {
          // Predictions
          const predictions = [];
          for (let i = 0; i < numSamples; i++) {
            let pred = bias;
            for (let j = 0; j < numFeatures; j++) {
              pred += weights[j] * normalizedX[i][j];
            }
            predictions.push(pred);
          }
          
          // Calculate gradients
          let biasGradient = 0;
          const weightGradients = Array(numFeatures).fill(0);
          
          for (let i = 0; i < numSamples; i++) {
            const error = predictions[i] - y[i];
            biasGradient += error;
            
            for (let j = 0; j < numFeatures; j++) {
              weightGradients[j] += error * normalizedX[i][j];
            }
          }
          
          biasGradient /= numSamples;
          for (let j = 0; j < numFeatures; j++) {
            weightGradients[j] /= numSamples;
          }
          
          // Update weights and bias
          bias -= learningRate * biasGradient;
          for (let j = 0; j < numFeatures; j++) {
            weights[j] -= learningRate * weightGradients[j];
          }
          
          // Calculate cost (mean squared error)
          let cost = 0;
          for (let i = 0; i < numSamples; i++) {
            const error = predictions[i] - y[i];
            cost += error * error;
          }
          cost /= numSamples;
          
          // Check for convergence
          if (Math.abs(prevCost - cost) < convergenceThreshold) {
            console.log(`Gradient descent converged after ${iter} iterations with cost ${cost}`);
            break;
          }
          
          prevCost = cost;
          
          // Log progress occasionally
          if (iter % 1000 === 0) {
            console.log(`Iteration ${iter}, Cost: ${cost}`);
          }
        }
        
        // Store the model parameters
        this.weights = weights;
        this.intercept = bias;
        
        // Calculate R² and MSE
        const predictions = [];
        for (let i = 0; i < numSamples; i++) {
          let pred = bias;
          for (let j = 0; j < numFeatures; j++) {
            pred += weights[j] * normalizedX[i][j];
          }
          predictions.push(pred);
        }
        
        const mean = y.reduce((sum, val) => sum + val, 0) / y.length;
        let totalSumSquares = 0;
        let residualSumSquares = 0;
        let mse = 0;
        
        for (let i = 0; i < numSamples; i++) {
          const error = predictions[i] - y[i];
          residualSumSquares += error * error;
          totalSumSquares += Math.pow(y[i] - mean, 2);
          mse += error * error;
        }
        
        const r2 = 1 - (residualSumSquares / totalSumSquares);
        mse /= numSamples;
        
        return {
          r2,
          mse,
          weights,
          intercept: bias,
          means: this.means,
          stds: this.stds
        };
      } catch (error) {
        console.error("Gradient descent training failed:", error);
        throw new Error("Failed to train using gradient descent: " + error.message);
      }
    }
  }

  const trainModel = (datasetId, targetColumn, featureColumns, modelType = 'linearRegression') => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (!dataset) return { success: false, message: 'Dataset not found' };

    try {
      // Make sure we have enough data points
      if (dataset.data.length < featureColumns.length * 5) {  // Recommend 5x more samples than features
        return { 
          success: false, 
          message: `Not enough data points. For reliable results with ${featureColumns.length} features, consider having at least ${featureColumns.length * 5} samples.`
        };
      }
      
      // Extract the data for training
      const X = [];
      const y = [];
      
      // First filter out any rows with missing/invalid data
      const validRows = dataset.data.filter(row => {
        // Check if target column is a valid number
        const targetValue = parseFloat(row[targetColumn]);
        if (isNaN(targetValue)) return false;
        
        // Check if all feature columns have valid numbers
        for (const col of featureColumns) {
          const featureValue = parseFloat(row[col]);
          if (isNaN(featureValue)) return false;
        }
        
        return true;
      });
      
      if (validRows.length < featureColumns.length * 3) {  // Still need minimum 3x samples
        return { 
          success: false, 
          message: `After removing invalid data, not enough valid data points remain. Need at least ${featureColumns.length * 3} valid samples for ${featureColumns.length} features.`
        };
      }
      
      // Check for highly correlated features
      if (featureColumns.length > 1) {
        // Create feature value arrays for correlation check
        const featureData = {};
        featureColumns.forEach(col => {
          featureData[col] = validRows.map(row => parseFloat(row[col]));
        });
        
        // Simple correlation check (basic implementation)
        const highlyCorrelated = [];
        for (let i = 0; i < featureColumns.length; i++) {
          for (let j = i + 1; j < featureColumns.length; j++) {
            const col1 = featureColumns[i];
            const col2 = featureColumns[j];
            
            // Calculate correlation - simplified Pearson correlation
            const values1 = featureData[col1];
            const values2 = featureData[col2];
            
            // Calculate means
            const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
            const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
            
            // Calculate correlation
            let numerator = 0;
            let denom1 = 0;
            let denom2 = 0;
            
            for (let k = 0; k < values1.length; k++) {
              const diff1 = values1[k] - mean1;
              const diff2 = values2[k] - mean2;
              numerator += diff1 * diff2;
              denom1 += diff1 * diff1;
              denom2 += diff2 * diff2;
            }
            
            const correlation = numerator / (Math.sqrt(denom1) * Math.sqrt(denom2));
            
            // Check if absolute correlation is high
            if (Math.abs(correlation) > 0.9) {
              highlyCorrelated.push([col1, col2, Math.abs(correlation)]);
            }
          }
        }
        
        if (highlyCorrelated.length > 0) {
          console.warn("Highly correlated features detected:", highlyCorrelated);
          // We'll still train, but warn in the console
        }
      }
      
      // Process the valid data
      validRows.forEach(row => {
        if (featureColumns.length === 1) {
          // Simple linear regression (one feature)
          X.push(parseFloat(row[featureColumns[0]]));
        } else {
          // Multiple linear regression
          X.push(featureColumns.map(col => parseFloat(row[col])));
        }
        y.push(parseFloat(row[targetColumn]));
      });

      // Train the model based on type
      let serializedModel = null;
      let metrics = {};
      let modelInstance = null;
      
      if (modelType === 'linearRegression') {
        // Simple linear regression functions
        const calculateSlope = (x, y) => {
          const n = x.length;
          let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
          
          for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
          }
          
          return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        };
        
        const calculateIntercept = (x, y, slope) => {
          const n = x.length;
          let sumX = 0, sumY = 0;
          
          for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
          }
          
          return (sumY - slope * sumX) / n;
        };

        // Train the model based on number of features
        if (featureColumns.length === 1) {
          // Simple linear regression
          const slope = calculateSlope(X, y);
          const intercept = calculateIntercept(X, y, slope);
          
          modelInstance = { slope, intercept };
          
          // Calculate R²
          const predictions = X.map(x => slope * x + intercept);
          const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
          
          let totalSumSquares = 0;
          let residualSumSquares = 0;
          
          for (let i = 0; i < y.length; i++) {
            totalSumSquares += Math.pow(y[i] - meanY, 2);
            residualSumSquares += Math.pow(y[i] - predictions[i], 2);
          }
          
          const r2 = 1 - (residualSumSquares / totalSumSquares);
          
          // Calculate MSE
          const mse = residualSumSquares / y.length;
          
          metrics = { slope, intercept, r2, mse };
          serializedModel = { slope, intercept };
        } else {
          // Multiple linear regression
          try {
            const mlr = new MultipleLinearRegression();
            console.log(`Training multiple linear regression with ${X.length} samples and ${featureColumns.length} features`);
            
            // The train method now returns metrics and parameters directly
            const result = mlr.train(X, y);
            modelInstance = { 
              weights: result.weights, 
              intercept: result.intercept,
              means: result.means,
              stds: result.stds
            };
            
            metrics = {
              coefficients: result.weights,
              intercept: result.intercept,
              r2: result.r2,
              mse: result.mse,
              featureImportance: result.weights.map(w => Math.abs(w))
            };
            
            serializedModel = {
              weights: result.weights,
              intercept: result.intercept,
              means: result.means,
              stds: result.stds
            };
            
            console.log("Model trained successfully:", metrics);
          } catch (error) {
            console.error("Error training multiple linear regression:", error);
            return { success: false, message: 'Failed to train model: ' + error.message };
          }
        }
      } else {
        return { success: false, message: 'Unsupported model type' };
      }
      
      // Generate a model ID
      const modelId = uuidv4();
      
      // Create the model object
      const newModel = {
        id: modelId,
        name: `${dataset.name} - ${targetColumn} prediction`,
        type: modelType,
        datasetId,
        targetColumn,
        featureColumns,
        metrics,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        serializedModel
      };

      setModels(prev => [...prev, newModel]);
      return { success: true, model: newModel };
    } catch (error) {
      console.error('Error training model:', error);
      return { success: false, message: 'Error training model: ' + error.message };
    }
  };

  const getUserModels = () => {
    return models.filter(model => model.createdBy === currentUser?.username);
  };

  const getStudentModels = (teacherUsername) => {
    // Get all students assigned to this teacher
    const teacherStudents = currentUser && currentUser.role === 'teacher' 
      ? JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.role === 'student' && user.teacher === teacherUsername)
        .map(student => student.username)
      : [];
    
    // Filter models created by these students
    return models.filter(model => {
      return teacherStudents.includes(model.createdBy);
    });
  };

  const deleteModel = (modelId) => {
    // Check if current user is a teacher and if the model belongs to a student of this teacher
    if (!currentUser || currentUser.role !== 'teacher') {
      return { success: false, message: 'Only teachers can delete models' };
    }
    
    const modelToDelete = models.find(m => m.id === modelId);
    if (!modelToDelete) {
      return { success: false, message: 'Model not found' };
    }
    
    // Check if model creator is a student of this teacher
    const students = JSON.parse(localStorage.getItem('users') || '[]')
      .filter(user => user.role === 'student' && user.teacher === currentUser.username)
      .map(student => student.username);
    
    if (!students.includes(modelToDelete.createdBy)) {
      return { success: false, message: 'You can only delete models from your students' };
    }
    
    // Delete the model
    setModels(prev => prev.filter(m => m.id !== modelId));
    
    // Also clean up related data
    setPredictions(prev => {
      const newPredictions = {...prev};
      delete newPredictions[modelId];
      return newPredictions;
    });
    
    setFeedbacks(prev => {
      const newFeedbacks = {...prev};
      delete newFeedbacks[modelId];
      return newFeedbacks;
    });
    
    return { success: true, message: 'Model deleted successfully' };
  };

  const makePrediction = (modelId, featureValues) => {
    console.log("Making prediction with values:", featureValues);
    const model = models.find(m => m.id === modelId);
    if (!model) return { success: false, message: 'Model not found' };

    try {
      let prediction;
      let featureArray;
      
      // Convert object form to array for internal use
      if (!Array.isArray(featureValues)) {
        featureArray = model.featureColumns.map(feature => {
          const value = parseFloat(featureValues[feature]);
          if (isNaN(value)) {
            throw new Error(`Invalid value for feature: ${feature}`);
          }
          return value;
        });
      } else {
        featureArray = featureValues.map(v => parseFloat(v));
      }
      
      // Verify we have the right number of features
      if (featureArray.length !== model.featureColumns.length) {
        console.error(`Feature count mismatch: expected ${model.featureColumns.length}, got ${featureArray.length}`);
        return { 
          success: false, 
          message: `Expected ${model.featureColumns.length} features, got ${featureArray.length}`
        };
      }

      // Make the prediction based on model type
      if (model.featureColumns.length === 1) {
        // Simple linear regression
        const { slope, intercept } = model.serializedModel;
        prediction = slope * featureArray[0] + intercept;
      } else {
        // Multiple linear regression
        const { weights, intercept, means, stds } = model.serializedModel;
        
        // Normalize the features
        const normalizedValues = featureArray.map((val, idx) => {
          if (!stds[idx] || stds[idx] === 0) return 0;
          return (val - means[idx]) / stds[idx];
        });
        
        // Calculate prediction
        prediction = intercept;
        for (let i = 0; i < weights.length; i++) {
          prediction += normalizedValues[i] * weights[i];
        }
      }

      // Ensure prediction is valid
      if (isNaN(prediction)) {
        console.error("Invalid prediction result (NaN)");
        return { success: false, message: 'Invalid prediction result' };
      }

      // Round for display
      const roundedPrediction = Math.round(prediction);
      
      // Store the prediction for later reference
      const newPrediction = {
        id: Date.now().toString(),
        modelId,
        featureValues,
        prediction: roundedPrediction,
        createdAt: new Date().toISOString()
      };

      setPredictions(prev => ({
        ...prev,
        [modelId]: newPrediction
      }));

      return { 
        success: true, 
        prediction: roundedPrediction,
        formattedPrediction: `The predicted ${model.targetColumn} is ${roundedPrediction}`
      };
    } catch (error) {
      console.error('Error making prediction:', error);
      return { success: false, message: 'Error making prediction: ' + error.message };
    }
  };

  const getModelPrediction = (modelId) => {
    return predictions[modelId];
  };

  const addFeedback = (modelId, feedback) => {
    const newFeedback = {
      id: Date.now().toString(),
      modelId,
      text: feedback,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString()
    };

    setFeedbacks(prev => ({
      ...prev,
      [modelId]: newFeedback
    }));

    return { success: true, feedback: newFeedback };
  };

  const getModelFeedback = (modelId) => {
    return feedbacks[modelId];
  };

  const value = {
    datasets,
    models,
    uploadDataset,
    getUserDatasets,
    getStudentDatasets,
    deleteDataset,
    trainModel,
    getUserModels,
    getStudentModels,
    deleteModel,
    makePrediction,
    getModelPrediction,
    addFeedback,
    getModelFeedback
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}; 