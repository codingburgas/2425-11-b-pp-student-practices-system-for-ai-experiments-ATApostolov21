from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, send_file
from flask_login import login_required, current_user
import os
import json
import pandas as pd
import pickle
import time
from app.forms.ai_model import AIModelForm, CommentForm
from app.models.ai_model import AIModel, ModelType
from app.models.dataset import Dataset
from app.models.comment import Comment
from app.utils.model_trainer import train_model, predict_with_model
from app import db
import io

models = Blueprint('models', __name__)

@models.route('/')
@login_required
def index():
    # For teachers, show all models; for students, only show their own
    if current_user.is_teacher():
        models_list = AIModel.query.order_by(AIModel.created_at.desc()).all()
    else:
        models_list = AIModel.query.filter_by(user_id=current_user.id)\
            .order_by(AIModel.created_at.desc()).all()
    
    return render_template('models/index.html', models=models_list)

@models.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = AIModelForm()
    
    # Get datasets for the current user to use in the dropdown
    if current_user.is_teacher():
        datasets = Dataset.query.all()
    else:
        datasets = Dataset.query.filter_by(user_id=current_user.id).all()
    
    # Populate the dataset choices
    form.dataset_id.choices = [(d.id, d.name) for d in datasets]
    
    if form.validate_on_submit():
        dataset = Dataset.query.get(form.dataset_id.data)
        
        # Check permissions
        if not current_user.is_teacher() and dataset.user_id != current_user.id:
            flash('You do not have permission to use this dataset.', 'danger')
            return redirect(url_for('models.create'))
        
        # Load the dataset
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], dataset.filename)
        try:
            df = pd.read_csv(file_path)
        except:
            flash('Error loading dataset.', 'danger')
            return render_template('models/create.html', form=form)
        
        # Parse hyperparameters from form
        hyperparams = {}
        if form.learning_rate.data:
            hyperparams['learning_rate'] = form.learning_rate.data
        if form.iterations.data:
            hyperparams['iterations'] = form.iterations.data
        if form.hidden_layers.data:
            hyperparams['hidden_layers'] = form.hidden_layers.data
        
        # Train the model
        start_time = time.time()
        try:
            trained_model, metrics = train_model(
                df, 
                model_type=form.model_type.data,
                target_column=form.target_column.data,
                hyperparameters=hyperparams
            )
            training_time = time.time() - start_time
            
            # Serialize the model
            model_bytes = pickle.dumps(trained_model)
            
            # Create model record
            ai_model = AIModel(
                name=form.name.data,
                description=form.description.data,
                model_type=form.model_type.data,
                user_id=current_user.id,
                dataset_id=dataset.id,
                weights=model_bytes,
                accuracy=metrics.get('accuracy', 0),
                loss=metrics.get('loss', 0),
                training_time=training_time
            )
            
            # Save hyperparameters and metrics
            ai_model.set_hyperparameters(hyperparams)
            ai_model.set_metrics(metrics)
            
            db.session.add(ai_model)
            db.session.commit()
            
            flash('Model successfully trained!', 'success')
            return redirect(url_for('models.view', id=ai_model.id))
            
        except Exception as e:
            flash(f'Error training model: {str(e)}', 'danger')
            return render_template('models/create.html', form=form)
    
    return render_template('models/create.html', form=form)

@models.route('/<int:id>')
@login_required
def view(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions: students can only view their own models
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to view this model.', 'danger')
        return redirect(url_for('models.index'))
    
    dataset = Dataset.query.get(model.dataset_id)
    
    # Get comments
    comments = Comment.query.filter_by(model_id=model.id).order_by(Comment.created_at.desc()).all()
    comment_form = CommentForm()
    
    # Parse metrics and hyperparameters for display
    metrics = model.get_metrics()
    hyperparams = model.get_hyperparameters()
    
    return render_template('models/view.html', 
                          model=model,
                          dataset=dataset,
                          metrics=metrics,
                          hyperparams=hyperparams,
                          comments=comments,
                          comment_form=comment_form)

@models.route('/<int:id>/predict', methods=['GET', 'POST'])
@login_required
def predict(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to use this model.', 'danger')
        return redirect(url_for('models.index'))
    
    if request.method == 'POST':
        # Get input data from form
        input_data = {}
        for key, value in request.form.items():
            if key.startswith('feature_'):
                feature_name = key.replace('feature_', '')
                try:
                    input_data[feature_name] = float(value)
                except:
                    input_data[feature_name] = value
        
        # Make prediction
        try:
            trained_model = pickle.loads(model.weights)
            prediction = predict_with_model(trained_model, input_data)
            return render_template('models/predict.html', 
                                  model=model,
                                  input_data=input_data,
                                  prediction=prediction)
        except Exception as e:
            flash(f'Error making prediction: {str(e)}', 'danger')
    
    # Get feature names from dataset
    dataset = Dataset.query.get(model.dataset_id)
    features = json.loads(dataset.feature_columns)
    target = model.get_hyperparameters().get('target_column', '')
    
    # Remove target column from features
    if target in features:
        features.remove(target)
    
    return render_template('models/predict.html', 
                          model=model,
                          features=features,
                          prediction=None)

@models.route('/<int:id>/download')
@login_required
def download(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to download this model.', 'danger')
        return redirect(url_for('models.index'))
    
    # Create a BytesIO object from the model weights
    model_io = io.BytesIO(model.weights)
    model_io.seek(0)
    
    return send_file(
        model_io,
        as_attachment=True,
        download_name=f"{model.name.replace(' ', '_').lower()}.pkl",
        mimetype='application/octet-stream'
    )

@models.route('/<int:id>/comment', methods=['POST'])
@login_required
def add_comment(id):
    model = AIModel.query.get_or_404(id)
    form = CommentForm()
    
    if form.validate_on_submit():
        comment = Comment(
            content=form.content.data,
            user_id=current_user.id,
            model_id=model.id
        )
        db.session.add(comment)
        db.session.commit()
        flash('Comment added successfully.', 'success')
    
    return redirect(url_for('models.view', id=model.id))

@models.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    model = AIModel.query.get_or_404(id)
    
    # Check permissions: only owner or teacher can delete
    if not current_user.is_teacher() and model.user_id != current_user.id:
        flash('You do not have permission to delete this model.', 'danger')
        return redirect(url_for('models.index'))
    
    # Delete comments first (foreign key constraint)
    Comment.query.filter_by(model_id=model.id).delete()
    
    # Delete the model
    db.session.delete(model)
    db.session.commit()
    
    flash('Model deleted successfully.', 'success')
    return redirect(url_for('models.index')) 