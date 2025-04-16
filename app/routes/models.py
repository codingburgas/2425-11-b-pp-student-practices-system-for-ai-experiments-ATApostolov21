from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, send_file, abort, jsonify
import os
import json
import pandas as pd
import pickle
import uuid
from datetime import datetime
import numpy as np
import io
from werkzeug.utils import secure_filename
from app.models import Dataset, Model, ModelType, ModelFactory

models = Blueprint('models', __name__)

@models.route('/')
def index():
    all_models = Model.get_all()
    return render_template('models/index.html', models=all_models)

@models.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        try:
            # Get form data
            name = request.form.get('name')
            description = request.form.get('description')
            model_type = request.form.get('model_type')
            dataset_id = request.form.get('dataset_id')
            hyperparameters = {
                'iterations': int(request.form.get('iterations', 1000)),
                'learning_rate': float(request.form.get('learning_rate', 0.1)),
                'random_state': int(request.form.get('random_state', 42))
            }
            
            # Add model-specific hyperparameters
            if model_type == ModelType.LOGISTIC_REGRESSION:
                hyperparameters['C'] = float(request.form.get('C', 1.0))
            elif model_type == ModelType.NEURAL_NETWORK:
                hidden_layers = request.form.get('hidden_layers', '100')
                hyperparameters['hidden_layers'] = hidden_layers
            
            # Load dataset
            dataset = Dataset.get_by_id(dataset_id)
            if not dataset:
                flash('Dataset not found', 'error')
                return redirect(url_for('models.create'))
            
            # Load and prepare data
            df = dataset.load_data()
            if isinstance(df, dict) and 'error' in df:
                flash(f'Error loading dataset: {df["error"]}', 'error')
                return redirect(url_for('models.create'))
                
            X = df.iloc[:, :-1].values
            y = df.iloc[:, -1].values
            
            # Create and train model
            model_instance = ModelFactory.create_model(model_type, hyperparameters)
            trained_model = ModelFactory.train_model(model_instance, X, y, model_type)
            
            # Generate a unique ID for the model file
            model_file_id = str(uuid.uuid4())
            
            # Save the trained model file
            model_result = ModelFactory.save_model(
                model=trained_model,
                model_id=model_file_id, # Use a dedicated ID for the file
                hyperparameters=hyperparameters,
                model_type=model_type
            )
            
            if not model_result:
                flash('Failed to save trained model file', 'error')
                return redirect(url_for('models.create'))
            
            # Create model metadata record using the new Model.create static method
            new_model = Model.create(
                name=name,
                description=description,
                model_type=model_type,
                hyperparameters=hyperparameters,
                filename=model_result['filename'], # Get filename from save_model result
                dataset_id=dataset_id
            )
            
            if not new_model:
                 flash('Failed to create model metadata record', 'error')
                 # Attempt to cleanup the saved model file if metadata creation failed
                 model_file_path = os.path.join(current_app.config['MODEL_FOLDER'], model_result['filename'])
                 if os.path.exists(model_file_path):
                     try:
                         os.remove(model_file_path)
                     except OSError as e:
                         print(f"Error cleaning up model file {model_file_path}: {e}")
                 return redirect(url_for('models.create'))
            
            flash('Model created successfully', 'success')
            return redirect(url_for('models.view', model_id=new_model.id))
                
        except Exception as e:
            flash(f'Error creating model: {str(e)}', 'error')
    
    # Get available datasets for the form
    datasets = Dataset.get_all()
    return render_template('models/create.html', datasets=datasets)

@models.route('/<model_id>')
def view(model_id):
    model = Model.get_by_id(model_id)
    if not model:
        flash('Model not found', 'error')
        return redirect(url_for('models.index'))
    
    # Load dataset for visualization
    dataset = Dataset.get_by_id(model.dataset_id)
    if not dataset:
        flash('Dataset not found for this model', 'warning')
        # Allow viewing model details even if dataset is missing
        dataset = None 
        features = []
        feature_ranges = {}
        metrics = {}
        hyperparameters = model.hyperparameters if model.hyperparameters else {}
    else:
        # Load dataset data
        df = dataset.load_data()
        if isinstance(df, dict) and 'error' in df:
            flash(f'Error loading dataset data: {df["error"]}', 'error')
            features = []
            feature_ranges = {}
            metrics = {}
            hyperparameters = model.hyperparameters if model.hyperparameters else {}
        else:
            features = df.columns[:-1].tolist()
            hyperparameters = model.hyperparameters if model.hyperparameters else {}
            
            # Calculate metrics
            metrics = {}
            loaded_model = model.load_model()
            if loaded_model:
                X = df.iloc[:, :-1].values
                y = df.iloc[:, -1].values
                metrics = ModelFactory.get_model_metrics(loaded_model, X, y, model.model_type)

            # Calculate feature ranges for sliders
            feature_ranges = {}
            features_df = df[features] # Select only feature columns
            for feature in features_df.select_dtypes(include=np.number).columns:
                min_val = features_df[feature].min()
                max_val = features_df[feature].max()
                # Determine a reasonable step (e.g., 1/100th of the range, or 1 if range is small)
                range_val = max_val - min_val
                if range_val > 1: 
                     step = range_val / 100
                     # Heuristic for decimal places based on step size
                     if step < 0.1: decimals = 3
                     elif step < 1: decimals = 2
                     else: decimals = 1
                     step = round(step, decimals) # Round step 
                else:
                     step = 0.01 # Default small step if range is tiny or zero
                
                if step == 0: step = 0.01 # Avoid zero step

                feature_ranges[feature] = {
                    'min': min_val,
                    'max': max_val,
                    'step': step,
                    'value': features_df[feature].mean() # Default slider value to mean
                }

    return render_template(
        'models/view.html', 
        model=model, 
        dataset=dataset,
        metrics=metrics,
        hyperparameters=hyperparameters,
        features=features,
        feature_ranges=feature_ranges # Pass ranges to template
    )

@models.route('/<model_id>/predict_realtime', methods=['POST'])
def predict_realtime(model_id):
    """Handle real-time prediction requests as sliders move."""
    model = Model.get_by_id(model_id)
    if not model:
        return jsonify({'error': 'Model not found'}), 404

    loaded_model = model.load_model()
    if not loaded_model:
        return jsonify({'error': 'Could not load model'}), 500

    try:
        data = request.get_json()
        if not data or 'features' not in data or not isinstance(data['features'], list):
             return jsonify({'error': 'Invalid feature data received'}), 400

        # Ensure we have the correct number of features expected by the model
        # Note: This requires knowing the expected number of features. We get it from the model itself if possible.
        n_features_in = getattr(loaded_model, 'n_features_in_', None)
        if n_features_in is not None and len(data['features']) != n_features_in:
             return jsonify({'error': f'Incorrect number of features. Expected {n_features_in}, got {len(data["features"])}'}), 400

        # Convert features to numpy array for prediction
        X = np.array(data['features']).reshape(1, -1)
        prediction = ModelFactory.predict(loaded_model, X, model.model_type)

        # Handle different output types
        prediction_value = prediction[0] if isinstance(prediction, np.ndarray) else prediction
        prediction_value = prediction_value.item() if isinstance(prediction_value, np.number) else prediction_value

        response_data = {'prediction': prediction_value}

        # --- Explanation (Feature Contribution for Linear Regression) --- 
        if model.model_type == ModelType.LINEAR_REGRESSION and hasattr(loaded_model, 'coef_') and hasattr(loaded_model, 'intercept_'):
            contributions = loaded_model.coef_ * X[0] # Element-wise multiplication
            response_data['explanation'] = {
                'intercept': loaded_model.intercept_,
                'contributions': contributions.tolist(),
                'total_check': loaded_model.intercept_ + np.sum(contributions) # For verification
            }
        # --- End Explanation --- 

        return jsonify(response_data)

    except Exception as e:
        current_app.logger.error(f"Real-time prediction error: {e}", exc_info=True)
        return jsonify({'error': f'Prediction error: {str(e)}'}), 400

@models.route('/<model_id>/predict', methods=['POST'])
def predict(model_id):
    model = Model.get_by_id(model_id)
    if not model:
        return jsonify({'error': 'Model not found'}), 404
    
    try:
        # Get input feature values from form data
        features = []
        for i in range(len(request.form)):
            key = f"feature_{i}"
            if key in request.form:
                features.append(float(request.form[key]))
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
            
        # Create a numpy array from the feature values
        X = np.array(features).reshape(1, -1)
        
        # Make prediction
        loaded_model = model.load_model()
        if not loaded_model:
            return jsonify({'error': 'Could not load model'}), 500
            
        prediction = ModelFactory.predict(loaded_model, X, model.model_type)
        
        # Handle different output types
        if isinstance(prediction, np.ndarray):
            prediction = prediction[0]
            
        return jsonify({
            'prediction': prediction if not isinstance(prediction, np.number) else prediction.item()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@models.route('/<model_id>/delete', methods=['POST'])
def delete(model_id):
    model = Model.get_by_id(model_id)
    if not model:
        flash('Model not found', 'error')
        return redirect(url_for('models.index'))
    
    # Delete the model
    if model.delete():
        flash('Model deleted successfully', 'success')
    else:
        flash('Failed to delete model', 'error')
    
    return redirect(url_for('models.index')) 