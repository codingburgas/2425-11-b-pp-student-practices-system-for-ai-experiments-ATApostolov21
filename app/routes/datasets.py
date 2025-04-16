from flask import Blueprint, render_template, redirect, url_for, flash, request, send_file, jsonify
import pandas as pd
import io
import os
from werkzeug.utils import secure_filename
import tempfile
from app.models.dataset import Dataset

datasets_bp = Blueprint('datasets', __name__)

@datasets_bp.route('/')
def index():
    # Get all datasets
    datasets = Dataset.get_all()
    return render_template('datasets/index.html', datasets=datasets)

@datasets_bp.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part', 'danger')
            return redirect(request.url)
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file', 'danger')
            return redirect(request.url)
        
        if file:
            # Ensure filename is secure
            filename = secure_filename(file.filename)
            
            # Check if file is CSV
            if not filename.endswith('.csv'):
                flash('File must be a CSV', 'danger')
                return redirect(request.url)
            
            # Try to read the CSV to ensure it's valid
            try:
                # Create dataset in database
                description = request.form.get('description', '')
                name = request.form.get('name') or filename.rsplit('.', 1)[0]  # Use form name or filename
                
                result = Dataset.create(
                    name=name,
                    description=description,
                    file=file
                )
                
                if isinstance(result, Dataset):
                    flash('Dataset uploaded successfully!', 'success')
                    return redirect(url_for('datasets.view', dataset_id=result.id))
                else:
                    flash(f'Failed to upload dataset: {result.get("error", "Unknown error")}', 'danger')
                    return redirect(request.url)
            
            except Exception as e:
                flash(f'Error processing CSV: {str(e)}', 'danger')
                return redirect(request.url)
    
    return render_template('datasets/upload.html')

@datasets_bp.route('/<dataset_id>')
def view(dataset_id):
    dataset = Dataset.get_by_id(dataset_id)
    
    if dataset is None:
        flash('Dataset not found', 'danger')
        return redirect(url_for('datasets.index'))
    
    # Get dataset preview (first 10 rows)
    preview = None
    try:
        preview = dataset.get_preview(rows=10)
        if isinstance(preview, dict) and 'error' in preview:
            flash(f'Error previewing dataset: {preview["error"]}', 'warning')
            preview = None
    except Exception as e:
        flash(f'Error previewing dataset: {str(e)}', 'warning')
    
    # Get dataset statistics
    stats = dataset.get_statistics()
    if isinstance(stats, dict) and 'error' in stats:
        flash(f'Error getting dataset statistics: {stats["error"]}', 'warning')
        stats = None
    
    # Check if dataset is used by any models
    from app.models.model import Model
    models = Model.get_all()
    models_using_dataset = [m for m in models if m.dataset_id == dataset_id]
    
    return render_template('datasets/view.html', 
                          dataset=dataset, 
                          preview=preview,
                          stats=stats,
                          models=models_using_dataset)

@datasets_bp.route('/<dataset_id>/download')
def download(dataset_id):
    dataset = Dataset.get_by_id(dataset_id)
    
    if dataset is None:
        flash('Dataset not found', 'danger')
        return redirect(url_for('datasets.index'))
    
    try:
        # Get file path for download
        file_path = dataset.download_file()
        if file_path:
            return send_file(file_path, 
                         mimetype='text/csv',
                         as_attachment=True,
                         download_name=f"{dataset.name}.csv")
        else:
            flash('Error downloading dataset', 'danger')
            return redirect(url_for('datasets.view', dataset_id=dataset_id))
    except Exception as e:
        flash(f'Error downloading dataset: {str(e)}', 'danger')
        return redirect(url_for('datasets.view', dataset_id=dataset_id))

@datasets_bp.route('/<dataset_id>/delete', methods=['POST'])
def delete(dataset_id):
    dataset = Dataset.get_by_id(dataset_id)
    
    if dataset is None:
        flash('Dataset not found', 'danger')
        return redirect(url_for('datasets.index'))
    
    # Check if dataset is used by any models
    from app.models.model import Model
    models = Model.get_all()
    models_using_dataset = [m for m in models if m.dataset_id == dataset_id]
    
    if models_using_dataset:
        flash('Cannot delete dataset as it is used by one or more models', 'danger')
        return redirect(url_for('datasets.view', dataset_id=dataset_id))
    
    # Delete the dataset
    if dataset.delete():
        flash('Dataset deleted successfully', 'success')
    else:
        flash('Failed to delete dataset', 'danger')
    
    return redirect(url_for('datasets.index')) 