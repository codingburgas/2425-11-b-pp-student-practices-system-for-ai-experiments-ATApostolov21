import numpy as np
import pickle
import json
import os
import uuid
from datetime import datetime
from flask import current_app
from app.models.model_type import ModelType

# Import model implementations from scikit-learn
from sklearn.linear_model import Perceptron, LinearRegression, LogisticRegression
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score, precision_score, recall_score, f1_score, confusion_matrix

class ModelFactory:
    @staticmethod
    def create_model(model_type, hyperparameters=None):
        """
        Create model instance based on type and hyperparameters
        """
        hyperparameters = hyperparameters or {}
        
        if model_type == ModelType.PERCEPTRON:
            return Perceptron(
                max_iter=hyperparameters.get('iterations', 1000),
                eta0=hyperparameters.get('learning_rate', 0.1),
                random_state=hyperparameters.get('random_state', 42)
            )
        
        elif model_type == ModelType.LINEAR_REGRESSION:
            return LinearRegression()
        
        elif model_type == ModelType.LOGISTIC_REGRESSION:
            return LogisticRegression(
                max_iter=hyperparameters.get('iterations', 1000),
                C=hyperparameters.get('C', 1.0),
                random_state=hyperparameters.get('random_state', 42)
            )
            
        elif model_type == ModelType.NEURAL_NETWORK:
            # Parse hidden layer structure from string like "10,5"
            hidden_layer_str = hyperparameters.get('hidden_layers', '10,5')
            hidden_layer_sizes = tuple(int(x) for x in hidden_layer_str.split(',') if x.strip())
            
            if hyperparameters.get('problem_type') == 'classification':
                return MLPClassifier(
                    hidden_layer_sizes=hidden_layer_sizes,
                    max_iter=hyperparameters.get('iterations', 1000),
                    learning_rate_init=hyperparameters.get('learning_rate', 0.001),
                    random_state=hyperparameters.get('random_state', 42)
                )
            else:
                return MLPRegressor(
                    hidden_layer_sizes=hidden_layer_sizes,
                    max_iter=hyperparameters.get('iterations', 1000),
                    learning_rate_init=hyperparameters.get('learning_rate', 0.001),
                    random_state=hyperparameters.get('random_state', 42)
                )
                
        # Default fallback
        return Perceptron()
    
    @staticmethod
    def train_model(model, X, y, model_type):
        """
        Train model with given data
        """
        # For perceptron models, ensure y is binary for classification
        if model_type == ModelType.PERCEPTRON:
            # Ensure y is in right format 
            unique_values = np.unique(y)
            if len(unique_values) == 2:
                # Convert to 0,1 for binary classification if needed
                if not np.array_equal(unique_values, np.array([0, 1])):
                    y_mapping = {unique_values[0]: 0, unique_values[1]: 1}
                    y = np.array([y_mapping[val] for val in y])
        
        model.fit(X, y)
        return model
    
    @staticmethod
    def save_model(model, model_id, hyperparameters, model_type):
        """
        Save trained model to local storage
        """
        try:
            # Serialize the model
            model_bytes = pickle.dumps(model)
            
            # Create file path for the model
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            filename = f"{model_id}_{timestamp}_model.pkl"
            file_path = os.path.join(current_app.config['MODEL_FOLDER'], filename)
            
            # Save model to file
            with open(file_path, 'wb') as f:
                f.write(model_bytes)
            
            return {
                'filename': filename,
                'model_type': model_type,
                'hyperparameters': hyperparameters
            }
        except Exception as e:
            print(f"Error saving model: {e}")
            return None
    
    @staticmethod
    def load_model(file_path):
        """
        Load a model from local storage
        """
        try:
            # Load model from file
            with open(file_path, 'rb') as f:
                model_bytes = f.read()
            
            # Deserialize the model
            model = pickle.loads(model_bytes)
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    @staticmethod
    def predict(model, X, model_type):
        """
        Make predictions using the trained model
        """
        predictions = model.predict(X)
        
        # For perceptron models, convert back from 0,1 to original class labels if needed
        if model_type == ModelType.PERCEPTRON:
            # If the model returns 0/1, return that directly
            pass
            
        return predictions
    
    @staticmethod
    def get_model_metrics(model, X, y, model_type):
        """
        Calculate metrics based on model type
        """
        y_pred = model.predict(X)
        metrics = {}
        
        # Classification metrics 
        if model_type in [ModelType.PERCEPTRON, ModelType.LOGISTIC_REGRESSION]:
            metrics['accuracy'] = accuracy_score(y, y_pred)
            
            # If binary classification, add more metrics
            if len(np.unique(y)) == 2:
                metrics['precision'] = precision_score(y, y_pred, average='binary')
                metrics['recall'] = recall_score(y, y_pred, average='binary')
                metrics['f1_score'] = f1_score(y, y_pred, average='binary')
                metrics['confusion_matrix'] = confusion_matrix(y, y_pred).tolist()
                metrics['labels'] = np.unique(y).tolist()
                
        # Regression metrics
        elif model_type == ModelType.LINEAR_REGRESSION:
            metrics['mse'] = mean_squared_error(y, y_pred)
            metrics['r2_score'] = r2_score(y, y_pred)
            metrics['mae'] = np.mean(np.abs(y - y_pred))
            
            # If it's a LinearRegression, also add coefficients
            if hasattr(model, 'coef_'):
                metrics['coef'] = model.coef_.tolist()
                metrics['intercept'] = model.intercept_
        
        return metrics 