import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error, confusion_matrix
from sklearn.linear_model import LinearRegression, LogisticRegression, Perceptron
from sklearn.neural_network import MLPClassifier, MLPRegressor
from app.models.ai_model import ModelType

def train_model(df, model_type, target_column, hyperparameters=None):
    """
    Train a machine learning model with the given data
    
    Args:
        df: pandas DataFrame containing the dataset
        model_type: string, type of model to train
        target_column: string, column name of the target variable
        hyperparameters: dict of hyperparameters
    
    Returns:
        trained_model: the trained sklearn model
        metrics: dict of performance metrics
    """
    if hyperparameters is None:
        hyperparameters = {}
    
    # Extract features and target
    y = df[target_column].values
    X = df.drop(columns=[target_column]).values
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Get default hyperparameters
    learning_rate = hyperparameters.get('learning_rate', 0.01)
    iterations = hyperparameters.get('iterations', 100)
    
    # Store information about the model
    metrics = {
        'target_column': target_column,
        'features': df.drop(columns=[target_column]).columns.tolist(),
        'classes': np.unique(y).tolist() if model_type != ModelType.LINEAR_REGRESSION else []
    }
    
    # Train the model based on type
    if model_type == ModelType.LINEAR_REGRESSION:
        # For linear regression
        model = LinearRegression()
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = model.score(X_test, y_test)
        
        metrics.update({
            'loss': mse,
            'r2': r2,
            'coef': model.coef_.tolist(),
            'intercept': float(model.intercept_),
            'train_loss': [],  # Placeholder for learning curve
            'val_loss': []     # Placeholder for learning curve
        })
        
    elif model_type == ModelType.LOGISTIC_REGRESSION:
        # For logistic regression
        model = LogisticRegression(max_iter=iterations, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        conf_matrix = confusion_matrix(y_test, y_pred).tolist()
        
        metrics.update({
            'accuracy': accuracy,
            'loss': -accuracy,  # Negative accuracy as a loss
            'confusion_matrix': conf_matrix,
            'train_loss': [],  # Placeholder for learning curve
            'val_loss': []     # Placeholder for learning curve
        })
        
    elif model_type == ModelType.PERCEPTRON:
        # For perceptron
        model = Perceptron(max_iter=iterations, eta0=learning_rate, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        conf_matrix = confusion_matrix(y_test, y_pred).tolist()
        
        metrics.update({
            'accuracy': accuracy,
            'loss': -accuracy,  # Negative accuracy as a loss
            'confusion_matrix': conf_matrix,
            'train_loss': [],  # Placeholder for learning curve
            'val_loss': []     # Placeholder for learning curve
        })
        
    elif model_type == ModelType.NEURAL_NETWORK:
        # For neural network
        # Parse hidden_layers hyperparameter
        hidden_layer_sizes = (10, 5)  # Default
        if 'hidden_layers' in hyperparameters:
            try:
                layers = hyperparameters['hidden_layers'].split(',')
                hidden_layer_sizes = tuple(int(l.strip()) for l in layers)
            except:
                pass
        
        # Determine if regression or classification based on target data
        if np.unique(y).size > 10 or np.issubdtype(y.dtype, np.number) and not np.array_equal(y, y.astype(int)):
            # Regression
            model = MLPRegressor(
                hidden_layer_sizes=hidden_layer_sizes,
                learning_rate_init=learning_rate,
                max_iter=iterations,
                random_state=42
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            
            metrics.update({
                'loss': mse,
                'train_loss': model.loss_curve_,
                'val_loss': []  # sklearn doesn't provide validation loss
            })
        else:
            # Classification
            model = MLPClassifier(
                hidden_layer_sizes=hidden_layer_sizes,
                learning_rate_init=learning_rate,
                max_iter=iterations,
                random_state=42
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            conf_matrix = confusion_matrix(y_test, y_pred).tolist()
            
            metrics.update({
                'accuracy': accuracy,
                'loss': model.loss_,
                'confusion_matrix': conf_matrix,
                'train_loss': model.loss_curve_,
                'val_loss': []  # sklearn doesn't provide validation loss
            })
    
    # Add scaler to the model object for later use during prediction
    model.scaler = scaler
    model.features = metrics['features']
    
    return model, metrics

def predict_with_model(model, input_data):
    """
    Use a trained model to make a prediction
    
    Args:
        model: trained sklearn model
        input_data: dict of feature values
    
    Returns:
        prediction: model prediction
    """
    # Convert input data to array with correct feature order
    features = getattr(model, 'features', list(input_data.keys()))
    data_array = np.array([input_data.get(f, 0) for f in features]).reshape(1, -1)
    
    # Apply the same scaling used during training
    if hasattr(model, 'scaler'):
        data_array = model.scaler.transform(data_array)
    
    # Make prediction
    prediction = model.predict(data_array)
    
    # Return first (and only) prediction
    return prediction[0] 