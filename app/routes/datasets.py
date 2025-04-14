from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import pandas as pd
import json
from app.forms.dataset import DatasetForm
from app.models.dataset import Dataset
from app import db

datasets = Blueprint('datasets', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv'}

@datasets.route('/')
@login_required
def index():
    # For teachers, show all datasets; for students, only show their own
    if current_user.is_teacher():
        datasets_list = Dataset.query.order_by(Dataset.created_at.desc()).all()
    else:
        datasets_list = Dataset.query.filter_by(user_id=current_user.id)\
            .order_by(Dataset.created_at.desc()).all()
    
    return render_template('datasets/index.html', datasets=datasets_list)

@datasets.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = DatasetForm()
    
    if form.validate_on_submit():
        if not form.file.data:
            flash('No file selected!', 'danger')
            return render_template('datasets/create.html', form=form)
        
        file = form.file.data
        if not allowed_file(file.filename):
            flash('Only CSV files are allowed!', 'danger')
            return render_template('datasets/create.html', form=form)
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Read the file to get metadata
        try:
            df = pd.read_csv(file_path)
            columns = df.columns.tolist()
            
            dataset = Dataset(
                name=form.name.data,
                description=form.description.data,
                filename=filename,
                feature_columns=json.dumps(columns),
                row_count=len(df),
                column_count=len(columns),
                user_id=current_user.id
            )
            
            db.session.add(dataset)
            db.session.commit()
            
            flash('Dataset successfully uploaded!', 'success')
            return redirect(url_for('datasets.view', id=dataset.id))
            
        except Exception as e:
            flash(f'Error processing file: {str(e)}', 'danger')
            return render_template('datasets/create.html', form=form)
    
    return render_template('datasets/create.html', form=form)

@datasets.route('/<int:id>')
@login_required
def view(id):
    dataset = Dataset.query.get_or_404(id)
    
    # Check permissions: students can only view their own datasets
    if not current_user.is_teacher() and dataset.user_id != current_user.id:
        flash('You do not have permission to view this dataset.', 'danger')
        return redirect(url_for('datasets.index'))
    
    # Load dataset preview
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], dataset.filename)
        df = pd.read_csv(file_path)
        preview = df.head(10).to_html(classes=['table', 'table-striped', 'table-bordered'])
        columns = json.loads(dataset.feature_columns)
    except:
        preview = "Error loading dataset preview"
        columns = []
    
    return render_template('datasets/view.html', 
                          dataset=dataset, 
                          preview=preview,
                          columns=columns)

@datasets.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    dataset = Dataset.query.get_or_404(id)
    
    # Check permissions: only owner or teacher can delete
    if not current_user.is_teacher() and dataset.user_id != current_user.id:
        flash('You do not have permission to delete this dataset.', 'danger')
        return redirect(url_for('datasets.index'))
    
    # Delete the file if it exists
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], dataset.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except:
        flash('Could not delete dataset file.', 'warning')
    
    # Delete from database
    db.session.delete(dataset)
    db.session.commit()
    
    flash('Dataset deleted successfully.', 'success')
    return redirect(url_for('datasets.index')) 