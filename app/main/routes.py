from flask import render_template, redirect, url_for
from flask_login import login_required, current_user
from app.datasets.models import Dataset
from app.models.models import Model
from app.models.user import User
from app.main import bp
from app import db

@bp.route('/')
def index():
    return render_template('main/index.html')

@bp.route('/dashboard')
@login_required
def dashboard():
    user_datasets = []
    user_models = []
    students = []
    
    if current_user.is_student():
        # Get student's datasets and models
        user_datasets = Dataset.query.filter_by(user_id=current_user.id).all()
        user_models = Model.query.filter_by(user_id=current_user.id).all()
    
    elif current_user.is_teacher():
        # Get students assigned to this teacher
        students = User.query.filter_by(teacher_id=current_user.id).all()
        
        # Get datasets and models from these students
        student_ids = [student.id for student in students]
        
        if student_ids:
            user_datasets = Dataset.query.filter(Dataset.user_id.in_(student_ids)).all()
            user_models = Model.query.filter(Model.user_id.in_(student_ids)).all()
    
    # Precompute counts for each dataset and student
    datasets_with_counts = []
    for dataset in user_datasets:
        model_count = Model.query.filter_by(dataset_id=dataset.id).count()
        dataset.model_count = model_count
        datasets_with_counts.append(dataset)
    
    students_with_counts = []
    for student in students:
        dataset_count = Dataset.query.filter_by(user_id=student.id).count()
        model_count = Model.query.filter_by(user_id=student.id).count()
        student.dataset_count = dataset_count
        student.model_count = model_count
        students_with_counts.append(student)
    
    return render_template('main/dashboard.html', 
                           datasets=datasets_with_counts, 
                           models=user_models,
                           students=students_with_counts) 