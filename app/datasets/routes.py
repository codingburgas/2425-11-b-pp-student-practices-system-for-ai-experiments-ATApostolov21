from flask import render_template, redirect, url_for, flash, request, jsonify, abort
from flask_login import login_required, current_user
from app import db
from app.datasets import bp
from app.datasets.forms import DatasetUploadForm
from app.datasets.utils import save_dataset_file, get_dataset_columns, get_dataset_preview, get_dataset_stats
from app.datasets.models import Dataset
import json
import os

@bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if not current_user.is_student():
        flash('Only students can upload datasets.', 'error')
        return redirect(url_for('main.dashboard'))
    
    form = DatasetUploadForm()
    
    if form.validate_on_submit():
        try:
            # Save the file
            file_path = save_dataset_file(form.file.data)
            
            # Get columns from the CSV
            columns = get_dataset_columns(file_path)
            
            if not columns:
                flash('Could not read columns from the CSV file. Please check the file format.', 'error')
                return render_template('datasets/upload.html', form=form)
            
            # Create dataset record
            dataset = Dataset(
                name=form.name.data,
                description=form.description.data,
                file_path=file_path,
                columns=json.dumps(columns),
                user_id=current_user.id
            )
            
            db.session.add(dataset)
            db.session.commit()
            
            flash('Dataset uploaded successfully!', 'success')
            return redirect(url_for('datasets.view', dataset_id=dataset.id))
            
        except Exception as e:
            flash(f'Error uploading dataset: {str(e)}', 'error')
    
    return render_template('datasets/upload.html', form=form)

@bp.route('/view/<int:dataset_id>')
@login_required
def view(dataset_id):
    dataset = Dataset.query.get_or_404(dataset_id)
    
    # Check if user has permission to view the dataset
    if not (current_user.id == dataset.user_id or 
            (current_user.is_teacher() and current_user.id == dataset.owner.teacher_id)):
        abort(403)
    
    # Check if file exists
    if not os.path.exists(dataset.file_path):
        flash(f'Dataset file not found at {dataset.file_path}. It may have been moved or deleted.', 'error')
        # Update file path if it could be in the sample datasets directory
        filename = os.path.basename(dataset.file_path)
        sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(dataset.file_path))), 
                                 'static', 'datasets', filename)
        if os.path.exists(sample_path):
            dataset.file_path = sample_path
            db.session.commit()
            flash(f'Found dataset at sample location, updated path.', 'success')
    
    # Get dataset preview
    preview = get_dataset_preview(dataset.file_path)
    
    # Get dataset statistics
    stats = get_dataset_stats(dataset.file_path)
    
    return render_template('datasets/view.html', 
                           dataset=dataset, 
                           preview=preview, 
                           stats=stats,
                           columns=json.loads(dataset.columns) if dataset.columns else [])

@bp.route('/delete/<int:dataset_id>')
@login_required
def delete(dataset_id):
    dataset = Dataset.query.get_or_404(dataset_id)
    
    # Check if the user has permission to delete the dataset
    if not (current_user.id == dataset.user_id or 
            (current_user.is_teacher() and current_user.id == dataset.owner.teacher_id)):
        abort(403)
    
    try:
        # Find and delete any models associated with this dataset
        # Import here to avoid circular imports
        from app.models.models import Model, Feedback, Prediction
        
        # Get all models associated with this dataset
        models = Model.query.filter_by(dataset_id=dataset.id).all()
        
        for model in models:
            # First delete any associated feedback records
            Feedback.query.filter_by(model_id=model.id).delete()
            
            # Then delete any associated prediction records
            Prediction.query.filter_by(model_id=model.id).delete()
            
            # Delete the model file if it exists
            if os.path.exists(model.model_path):
                os.remove(model.model_path)
            
            # Delete the model from database
            db.session.delete(model)
        
        # Delete the dataset file if it exists
        if os.path.exists(dataset.file_path):
            os.remove(dataset.file_path)
        
        # Delete the dataset record
        db.session.delete(dataset)
        db.session.commit()
        
        flash('Dataset and associated models deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting dataset: {str(e)}', 'error')
    
    return redirect(url_for('main.dashboard')) 