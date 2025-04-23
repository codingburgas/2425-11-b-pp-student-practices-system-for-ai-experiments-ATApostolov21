import numpy as np
import pandas as pd
import json
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score

def train_linear_regression(file_path, target_column, feature_columns, test_size=0.2, random_state=42):
    """
    Train a linear regression model using the specified dataset, target column, and feature columns
    """
    try:
        # Load the dataset
        df = pd.read_csv(file_path)
        
        # Select features and target
        X = df[feature_columns].values
        y = df[target_column].values
        
        # Split the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
        
        # Normalize the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train the model
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_train_pred = model.predict(X_train_scaled)
        y_test_pred = model.predict(X_test_scaled)
        
        # Calculate performance metrics
        train_mse = mean_squared_error(y_train, y_train_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        
        # Store model data and metrics
        model_data = {
            'weights': model.coef_.tolist(),
            'intercept': model.intercept_,
            'scaler_mean': scaler.mean_.tolist(),
            'scaler_scale': scaler.scale_.tolist()
        }
        
        performance_metrics = {
            'train_mse': train_mse,
            'test_mse': test_mse,
            'train_r2': train_r2,
            'test_r2': test_r2
        }
        
        return {
            'success': True,
            'model_data': model_data,
            'performance_metrics': performance_metrics
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def make_prediction(model_data, feature_values):
    """
    Make a prediction using the trained model
    """
    try:
        # Convert model data from JSON string to Python objects
        if isinstance(model_data, str):
            model_data = json.loads(model_data)
        
        # Get model parameters
        weights = np.array(model_data['weights'])
        intercept = model_data['intercept']
        scaler_mean = np.array(model_data['scaler_mean'])
        scaler_scale = np.array(model_data['scaler_scale'])
        
        # Convert feature values to numpy array
        feature_values = np.array(feature_values).reshape(1, -1)
        
        # Scale the features
        scaled_features = (feature_values - scaler_mean) / scaler_scale
        
        # Make prediction
        prediction = np.dot(scaled_features, weights) + intercept
        
        return {
            'success': True,
            'prediction': float(prediction[0])
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_feature_importance(model_data, feature_columns):
    """
    Calculate and return feature importance based on the absolute values of the coefficients
    """
    try:
        # Convert model data from JSON string to Python objects
        if isinstance(model_data, str):
            model_data = json.loads(model_data)
        
        # Get model weights
        weights = np.array(model_data['weights'])
        
        # Calculate absolute weights
        abs_weights = np.abs(weights)
        
        # Normalize to sum to 100
        importance = (abs_weights / np.sum(abs_weights)) * 100
        
        # Create a list of (feature, importance) tuples
        feature_importance = [(feature, imp) for feature, imp in zip(feature_columns, importance)]
        
        # Sort by importance (descending)
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return {
            'success': True,
            'feature_importance': feature_importance
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        } 