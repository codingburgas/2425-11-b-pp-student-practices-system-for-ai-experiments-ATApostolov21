from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, Response
from flask_login import login_required, current_user
import os
import json
import pandas as pd
import pickle
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import numpy as np
from app.models.ai_model import AIModel
from app.models.dataset import Dataset
from app.utils.visualizations import plot_decision_boundary, plot_regression_line, plot_confusion_matrix, plot_learning_curve
from app import db

visualizations = Blueprint('visualizations', __name__)

@visualizations.route('/model/<int:id>/metrics')
@login_required
def model_metrics(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    metrics = model.get_metrics()
    
    return render_template('visualizations/metrics.html', 
                          model=model,
                          metrics=metrics)

@visualizations.route('/model/<int:id>/confusion-matrix.png')
@login_required
def confusion_matrix(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    metrics = model.get_metrics()
    
    if 'confusion_matrix' not in metrics:
        return "No confusion matrix available", 404
    
    # Create confusion matrix plot
    fig = plot_confusion_matrix(metrics['confusion_matrix'], 
                               metrics.get('classes', []))
    
    # Convert plot to PNG image
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)
    plt.close(fig)
    
    return Response(output.getvalue(), mimetype='image/png')

@visualizations.route('/model/<int:id>/learning-curve.png')
@login_required
def learning_curve(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    metrics = model.get_metrics()
    
    if 'train_loss' not in metrics or 'val_loss' not in metrics:
        return "No learning curve data available", 404
    
    # Create learning curve plot
    fig = plot_learning_curve(metrics['train_loss'], metrics['val_loss'])
    
    # Convert plot to PNG image
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)
    plt.close(fig)
    
    return Response(output.getvalue(), mimetype='image/png')

@visualizations.route('/model/<int:id>/decision-boundary.png')
@login_required
def decision_boundary(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    # Only applicable for classification models with 2 features
    if model.model_type not in ['perceptron', 'logistic_regression']:
        return "Decision boundary only available for classification models", 404
    
    # Load dataset
    dataset = Dataset.query.get(model.dataset_id)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], dataset.filename)
    
    try:
        df = pd.read_csv(file_path)
        trained_model = pickle.loads(model.weights)
        target_column = model.get_hyperparameters().get('target_column')
        
        if len(df.columns) < 3:  # Need at least 2 features + target
            return "Not enough features for visualization", 404
        
        # If more than 2 features, use the first 2 for visualization
        features = [col for col in df.columns if col != target_column][:2]
        
        # Create decision boundary plot
        fig = plot_decision_boundary(trained_model, df, features, target_column)
        
        # Convert plot to PNG image
        output = io.BytesIO()
        FigureCanvas(fig).print_png(output)
        plt.close(fig)
        
        return Response(output.getvalue(), mimetype='image/png')
    except Exception as e:
        return f"Error generating visualization: {str(e)}", 500

@visualizations.route('/model/<int:id>/regression-line.png')
@login_required
def regression_line(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    # Only applicable for regression models
    if model.model_type != 'linear_regression':
        return "Regression line only available for linear regression models", 404
    
    # Load dataset
    dataset = Dataset.query.get(model.dataset_id)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], dataset.filename)
    
    try:
        df = pd.read_csv(file_path)
        trained_model = pickle.loads(model.weights)
        target_column = model.get_hyperparameters().get('target_column')
        
        # For simplicity, use the first feature for visualization if multiple features
        features = [col for col in df.columns if col != target_column]
        feature = features[0]
        
        # Create regression line plot
        fig = plot_regression_line(trained_model, df, feature, target_column)
        
        # Convert plot to PNG image
        output = io.BytesIO()
        FigureCanvas(fig).print_png(output)
        plt.close(fig)
        
        return Response(output.getvalue(), mimetype='image/png')
    except Exception as e:
        return f"Error generating visualization: {str(e)}", 500 