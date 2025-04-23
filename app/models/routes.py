from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, session, Markup
from flask_login import login_required, current_user
from werkzeug.exceptions import NotFound
import pandas as pd
import numpy as np
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import pickle
from datetime import datetime

from app import db
from app.models.forms import ModelForm, PredictionForm, FeedbackForm
from app.models.models import Model, Prediction, Feedback
from app.datasets.models import Dataset

models = Blueprint('models', __name__, template_folder='templates')

# Add template context processors
@models.app_context_processor
def utility_processor():
    def min_value(a, b):
        return min(a, b)
    
    def max_value(a, b):
        return max(a, b)
    
    def abs_value(a):
        return abs(a)
    
    def safe_division(a, b):
        if b == 0:
            return 0
        return a / b
    
    # Function to convert newlines to HTML line breaks
    def nl2br(value):
        if value:
            return Markup(value.replace('\n', '<br>'))
        return value
    
    return {
        'min': min_value,
        'max': max_value,
        'abs': abs_value,
        'safe_division': safe_division,
        'nl2br': nl2br
    }

@models.route('/models')
@login_required
def list():
    # For students, show only their models
    if current_user.is_student():
        user_models = Model.query.filter_by(user_id=current_user.id).order_by(Model.created_at.desc()).all()
    # For teachers, show all models for now to avoid circular imports
    else:
        # This is a simplified approach - we'll show all models
        user_models = Model.query.order_by(Model.created_at.desc()).all()
    
    return render_template('models/list.html', models=user_models)

@models.route('/models/train', methods=['GET', 'POST'])
@login_required
def train():
    # Get dataset_id from query parameter if provided
    preselected_dataset_id = request.args.get('dataset_id', None)
    
    # Create form instance
    form = ModelForm()
    
    # Populate dataset choices
    datasets = Dataset.query.filter_by(user_id=current_user.id).all()
    form.dataset_id.choices = [(d.id, d.name) for d in datasets]
    
    # Set default empty choices for columns to avoid validation errors
    form.target_column.choices = [('', 'Select a dataset first')]
    form.feature_columns.choices = [('', 'Select a dataset first')]
    
    # If dataset_id was provided and it's a GET request, pre-populate the form with columns
    if preselected_dataset_id and request.method == 'GET':
        try:
            # Convert to int and validate dataset exists and user has access
            dataset_id = int(preselected_dataset_id)
            dataset = Dataset.query.get_or_404(dataset_id)
            
            if dataset.user_id == current_user.id:
                # Pre-select the dataset in the form
                form.dataset_id.data = dataset_id
                
                # Load dataset columns
                if dataset.is_valid:
                    df = pd.read_csv(dataset.file_path)
                    columns = df.columns.tolist()
                    
                    # Update choices for form validation
                    form.target_column.choices = [(col, col) for col in columns]
                    form.feature_columns.choices = [(col, col) for col in columns]
                    
                    # Flash a helpful message
                    flash(f'Dataset "{dataset.name}" selected. Choose your target and feature columns to train a model.', 'info')
        except (ValueError, NotFound):
            # If invalid dataset_id, just continue without pre-selection
            pass
    
    # Check if we're receiving a POST request
    if request.method == 'POST':
        dataset_id = request.form.get('dataset_id')
        
        if dataset_id:
            try:
                # Load dataset
                dataset = Dataset.query.get_or_404(int(dataset_id))
                if dataset.user_id != current_user.id:
                    flash('You do not have permission to use this dataset', 'danger')
                    return redirect(url_for('models.train'))
                
                df = pd.read_csv(dataset.file_path)
                columns = df.columns.tolist()
                
                # Update choices for form validation
                form.target_column.choices = [(col, col) for col in columns]
                form.feature_columns.choices = [(col, col) for col in columns]
                
                # Continue with processing if the form is valid
                if form.validate_on_submit():
                    # Get form data
                    name = form.name.data
                    description = form.description.data
                    model_type = form.model_type.data
                    target_column = form.target_column.data
                    feature_columns = form.feature_columns.data
                    
                    # Validate target and feature columns
                    if target_column not in columns:
                        flash(f'Target column "{target_column}" not found in dataset', 'danger')
                        return render_template('models/train.html', form=form)
                    
                    if not feature_columns:
                        flash('Please select at least one feature column', 'danger')
                        return render_template('models/train.html', form=form)
                    
                    for col in feature_columns:
                        if col not in columns:
                            flash(f'Feature column "{col}" not found in dataset', 'danger')
                            return render_template('models/train.html', form=form)
                    
                    if target_column in feature_columns:
                        flash('Target column cannot be a feature column', 'danger')
                        return render_template('models/train.html', form=form)
                    
                    # Train the model
                    try:
                        # Prepare data
                        X = df[feature_columns]
                        y = df[target_column]
                        
                        # Handle non-numeric data
                        X = pd.get_dummies(X)
                        
                        # Split data
                        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                        
                        # Create appropriate model based on model_type
                        if model_type == 'regression':
                            if len(feature_columns) > 1:
                                estimator = RandomForestRegressor(n_estimators=100, random_state=42)
                            else:
                                estimator = LinearRegression()
                                
                            # Create pipeline with scaling
                            pipeline = Pipeline([
                                ('scaler', StandardScaler()),
                                ('model', estimator)
                            ])
                            
                            # Train model
                            pipeline.fit(X_train, y_train)
                            
                            # Evaluate model
                            y_pred = pipeline.predict(X_test)
                            metrics = {
                                'mse': mean_squared_error(y_test, y_pred),
                                'r2_score': r2_score(y_test, y_pred),
                                'mae': np.mean(np.abs(y_test - y_pred))
                            }
                            
                            # Get feature importance if available
                            if hasattr(estimator, 'feature_importances_'):
                                feature_importance = estimator.feature_importances_
                            else:
                                feature_importance = None
                            
                        elif model_type == 'classification':
                            if len(feature_columns) > 1:
                                estimator = RandomForestClassifier(n_estimators=100, random_state=42)
                            else:
                                estimator = LogisticRegression(random_state=42)
                            
                            # Create pipeline with scaling
                            pipeline = Pipeline([
                                ('scaler', StandardScaler()),
                                ('model', estimator)
                            ])
                            
                            # Train model
                            pipeline.fit(X_train, y_train)
                            
                            # Evaluate model
                            y_pred = pipeline.predict(X_test)
                            metrics = {
                                'accuracy': accuracy_score(y_test, y_pred),
                                'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
                                'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
                                'f1': f1_score(y_test, y_pred, average='weighted', zero_division=0)
                            }
                            
                            # Get feature importance if available
                            if hasattr(estimator, 'feature_importances_'):
                                feature_importance = estimator.feature_importances_
                            else:
                                feature_importance = None
                        else:
                            flash(f'Unsupported model type: {model_type}', 'danger')
                            return render_template('models/train.html', form=form)
                        
                        # Save model to file
                        model_filename = f'user_{current_user.id}_model_{pd.Timestamp.now().strftime("%Y%m%d%H%M%S")}.pkl'
                        model_path = f'app/static/models/{model_filename}'
                        
                        # Create a model info object to save
                        model_info = {
                            'pipeline': pipeline,
                            'feature_columns': X.columns.tolist(),  # Save the processed column names (after get_dummies)
                            'target_column': target_column,
                            'feature_mapping': {col: X.columns[X.columns.str.startswith(f'{col}_')].tolist() 
                                            if len(X.columns[X.columns.str.startswith(f'{col}_')]) > 0 
                                            else [col] for col in feature_columns},
                            'training_history': {
                                'train_loss': [0.5, 0.3, 0.2, 0.1],  # Example values
                                'val_loss': [0.6, 0.4, 0.3, 0.2]  # Example values
                            }
                        }
                        
                        # Save the model to disk
                        with open(model_path, 'wb') as f:
                            pickle.dump(model_info, f)
                        
                        # Create model in database
                        new_model = Model(
                            name=name,
                            description=description,
                            model_type=model_type,
                            model_path=model_path,
                            target_column=target_column,
                            feature_columns=feature_columns,
                            metrics=metrics,
                            feature_importance=feature_importance.tolist() if feature_importance is not None else None,
                            dataset_id=dataset.id,
                            user_id=current_user.id
                        )
                        
                        # Add min/max values for visualization
                        if model_type == 'regression':
                            # Get target min/max for visualization
                            dataset_df = pd.read_csv(dataset.file_path)
                            if metrics is None:
                                metrics = {}
                            metrics['target_min'] = float(dataset_df[target_column].min())
                            metrics['target_max'] = float(dataset_df[target_column].max())
                            new_model.metrics = metrics
                        
                        db.session.add(new_model)
                        db.session.commit()
                        
                        flash('Model trained successfully!', 'success')
                        return redirect(url_for('models.view', model_id=new_model.id))
                        
                    except Exception as e:
                        flash(f'Error training model: {str(e)}', 'danger')
                        return render_template('models/train.html', form=form)
                else:
                    # If we get here, the form didn't validate - but we'll display the form with errors
                    pass
            except Exception as e:
                flash(f'Error loading dataset: {str(e)}', 'danger')
    
    # For GET requests or if validation failed
    return render_template('models/train.html', form=form)

@models.route('/models/get_columns/<int:dataset_id>')
@login_required
def get_columns(dataset_id):
    dataset = Dataset.query.get_or_404(dataset_id)
    
    # Check if user has access to this dataset
    if dataset.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        df = pd.read_csv(dataset.file_path)
        columns = df.columns.tolist()
        return jsonify({'columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@models.route('/models/<int:model_id>')
@login_required
def view(model_id):
    model = Model.query.get_or_404(model_id)
    
    # Check if user has access to this model
    if model.user_id != current_user.id and not current_user.is_teacher():
        flash('You do not have permission to view this model', 'danger')
        return redirect(url_for('models.list'))
    
    return render_template('models/view.html', model=model)

@models.route('/models/<int:model_id>/predict', methods=['GET', 'POST'])
@login_required
def predict(model_id):
    model = Model.query.get_or_404(model_id)
    
    # Check if user has access to this model - allow if owner or teacher
    if model.user_id != current_user.id and not current_user.is_teacher():
        flash('You do not have permission to use this model', 'danger')
        return redirect(url_for('models.list'))
    
    # Handle download request if download parameter is present
    if request.args.get('download') == 'true' and 'predictions' in session:
        # Code to handle download would go here
        flash('Download functionality is not implemented yet', 'info')
        return redirect(url_for('models.predict', model_id=model.id))
    
    # Load the model
    try:
        with open(model.model_path, 'rb') as f:
            model_info = pickle.load(f)
        
        pipeline = model_info['pipeline']
        feature_mapping = model_info.get('feature_mapping', {})
        
        # For Linear/Logistic Regression, try to extract coefficients for feature importance
        estimator = pipeline.named_steps.get('model')
        if estimator is not None:
            # Extract and store coefficients if they don't exist
            if model.model_type == 'regression' and hasattr(estimator, 'coef_') and 'coefficients' not in model.metrics:
                coefficients = estimator.coef_
                intercept = estimator.intercept_
                
                # For single feature models, coef_ might be a scalar
                if not hasattr(coefficients, '__len__'):
                    coefficients = [coefficients]
                
                metrics = model.metrics.copy() if model.metrics else {}
                metrics['coefficients'] = coefficients.tolist() if hasattr(coefficients, 'tolist') else list(coefficients)
                metrics['intercept'] = float(intercept)
                
                # Save updated metrics
                model.metrics = metrics
                db.session.commit()
    except Exception as e:
        flash(f'Error loading model: {str(e)}', 'danger')
        return redirect(url_for('models.view', model_id=model.id))
    
    # Create a dynamic form based on the model's features
    class DynamicPredictionForm(PredictionForm):
        pass
    
    # Add fields for each feature
    feature_descriptions = {}
    for feature in model.feature_columns:
        setattr(DynamicPredictionForm, feature, PredictionForm.create_field(feature))
        feature_descriptions[feature] = f"Enter a value for {feature}"
    
    form = DynamicPredictionForm()
    
    # Handle form submission
    prediction = None
    prediction_proba = None
    predictions = None
    is_single_prediction = True
    example_prediction = False
    
    if request.method == 'POST':
        # Check if file upload form was submitted
        if 'csv_file' in request.files:
            file = request.files['csv_file']
            if file and file.filename.endswith('.csv'):
                try:
                    # Process CSV file
                    has_header = 'has_header' in request.form
                    df = pd.read_csv(file, header=0 if has_header else None)
                    
                    # Validate columns
                    missing_columns = [col for col in model.feature_columns if col not in df.columns]
                    if missing_columns:
                        flash(f'CSV file is missing required columns: {", ".join(missing_columns)}', 'danger')
                    else:
                        # Make predictions for each row
                        predictions = []
                        for _, row in df.iterrows():
                            X_pred = pd.DataFrame([row[model.feature_columns].to_dict()])
                            # Apply preprocessing
                            X_pred_processed = pd.get_dummies(X_pred)
                            
                            # Ensure columns match training data
                            for col in model_info['feature_columns']:
                                if col not in X_pred_processed.columns:
                                    X_pred_processed[col] = 0
                            
                            # Make sure columns are in the same order as during training
                            X_pred_processed = X_pred_processed[model_info['feature_columns']]
                            
                            # Make prediction
                            pred = pipeline.predict(X_pred_processed)[0]
                            prob = None
                            
                            # For classification models, get probability if available
                            if model.model_type == 'classification' and hasattr(pipeline, 'predict_proba'):
                                proba = pipeline.predict_proba(X_pred_processed)[0]
                                max_prob_idx = proba.argmax()
                                prob = proba[max_prob_idx]
                            
                            predictions.append({
                                'inputs': row[model.feature_columns].to_dict(),
                                'prediction': pred,
                                'probability': prob
                            })
                        
                        is_single_prediction = False
                        # Store in session for download
                        session['predictions'] = predictions
                except Exception as e:
                    flash(f'Error processing CSV file: {str(e)}', 'danger')
        
        # Handle manual form submission
        elif form.validate():
            try:
                # Extract feature values from form
                feature_values = {}
                for feature in model.feature_columns:
                    feature_values[feature] = getattr(form, feature).data
                
                # Create input dataframe
                X_pred = pd.DataFrame([feature_values])
                
                # Apply the same preprocessing (handle categorical features)
                X_pred_processed = pd.get_dummies(X_pred)
                
                # Ensure columns match training data
                for col in model_info['feature_columns']:
                    if col not in X_pred_processed.columns:
                        X_pred_processed[col] = 0
                
                # Make sure columns are in the same order as during training
                X_pred_processed = X_pred_processed[model_info['feature_columns']]
                
                # Make prediction
                prediction = pipeline.predict(X_pred_processed)[0]
                
                # For classification models, get class probabilities if available
                if model.model_type == 'classification' and hasattr(pipeline, 'predict_proba'):
                    proba = pipeline.predict_proba(X_pred_processed)[0]
                    classes = pipeline.classes_
                    prediction_proba = {str(classes[i]): float(proba[i]) for i in range(len(classes))}
                
            except Exception as e:
                flash(f'Error making prediction: {str(e)}', 'danger')
    
    # Generate example prediction if no prediction has been made yet and it's a GET request
    if request.method == 'GET' and prediction is None and predictions is None:
        try:
            # Get example values for each feature (middle value of the dataset)
            dataset = Dataset.query.get(model.dataset_id)
            df = pd.read_csv(dataset.file_path)
            
            # Use the median or mode value for each feature depending on data type
            feature_values = {}
            for feature in model.feature_columns:
                if pd.api.types.is_numeric_dtype(df[feature]):
                    # For numeric features, use median
                    feature_values[feature] = float(df[feature].median())
                    # Pre-populate the form with these values
                    getattr(form, feature).data = feature_values[feature]
                else:
                    # For categorical features, use mode
                    feature_values[feature] = df[feature].mode()[0]
                    getattr(form, feature).data = feature_values[feature]
            
            # Create input dataframe
            X_pred = pd.DataFrame([feature_values])
            
            # Apply the same preprocessing (handle categorical features)
            X_pred_processed = pd.get_dummies(X_pred)
            
            # Ensure columns match training data
            for col in model_info['feature_columns']:
                if col not in X_pred_processed.columns:
                    X_pred_processed[col] = 0
            
            # Make sure columns are in the same order as during training
            X_pred_processed = X_pred_processed[model_info['feature_columns']]
            
            # Make example prediction
            prediction = pipeline.predict(X_pred_processed)[0]
            
            # For classification models, get class probabilities if available
            if model.model_type == 'classification' and hasattr(pipeline, 'predict_proba'):
                proba = pipeline.predict_proba(X_pred_processed)[0]
                classes = pipeline.classes_
                prediction_proba = {str(classes[i]): float(proba[i]) for i in range(len(classes))}
            
            example_prediction = True
            flash('Here is an example prediction using typical values from your dataset. Adjust the values to see how they affect the prediction.', 'info')
            
        except Exception as e:
            # Silently fail if we can't generate an example prediction
            pass
    
    return render_template('models/predict.html', 
                           model=model, 
                           form=form, 
                           prediction=prediction, 
                           probabilities=prediction_proba,
                           predictions=predictions,
                           is_single_prediction=is_single_prediction,
                           feature_descriptions=feature_descriptions,
                           example_prediction=example_prediction)

@models.route('/models/<int:model_id>/delete', methods=['POST'])
@login_required
def delete(model_id):
    model = Model.query.get_or_404(model_id)
    
    # Check if user has access to this model
    if model.user_id != current_user.id and not current_user.is_teacher():
        flash('You do not have permission to delete this model', 'danger')
        return redirect(url_for('models.list'))
    
    try:
        # First delete any associated feedback records
        Feedback.query.filter_by(model_id=model.id).delete()
        
        # Then delete any associated prediction records
        Prediction.query.filter_by(model_id=model.id).delete()
        
        # Delete the model file
        import os
        if os.path.exists(model.model_path):
            os.remove(model.model_path)
        
        # Delete from database
        db.session.delete(model)
        db.session.commit()
        
        flash('Model deleted successfully', 'success')
    except Exception as e:
        flash(f'Error deleting model: {str(e)}', 'danger')
        db.session.rollback()  # Rollback the transaction in case of error
    
    return redirect(url_for('main.dashboard'))

@models.route('/models/<int:model_id>/feedback', methods=['GET', 'POST'])
@login_required
def feedback(model_id):
    model = Model.query.get_or_404(model_id)
    form = FeedbackForm()
    
    # Check if user is a teacher
    if not current_user.is_teacher():
        flash('Only teachers can provide feedback on models', 'danger')
        return redirect(url_for('main.dashboard'))
    
    # Check if the student who owns this model is in the teacher's class
    # For simplicity, we'll allow any teacher to provide feedback for now
    
    if form.validate_on_submit():
        feedback = Feedback(
            comment=form.comment.data,
            rating=int(form.rating.data) if form.rating.data else None,
            model_id=model.id,
            user_id=current_user.id
        )
        db.session.add(feedback)
        db.session.commit()
        
        flash('Feedback has been submitted successfully', 'success')
        return redirect(url_for('models.view', model_id=model.id))
    
    return render_template('models/feedback.html', form=form, model=model)

@models.route('/models/<int:model_id>/view_feedback')
@login_required
def view_feedback(model_id):
    model = Model.query.get_or_404(model_id)
    
    # Check if the user is authorized to view the feedback
    # Allow if the user is the model owner or a teacher
    if model.user_id != current_user.id and not current_user.is_teacher():
        flash('You are not authorized to view feedback for this model', 'danger')
        return redirect(url_for('main.dashboard'))
    
    # Get all feedback for this model
    feedbacks = Feedback.query.filter_by(model_id=model.id).order_by(Feedback.created_at.desc()).all()
    
    return render_template('models/view_feedback.html', model=model, feedbacks=feedbacks) 