from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from app.models.ai_model import AIModel
from app.models.dataset import Dataset
from app import db

main = Blueprint('main', __name__)

@main.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('main/index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    # If user is a teacher, show all models and datasets
    if current_user.is_teacher():
        datasets = Dataset.query.order_by(Dataset.created_at.desc()).limit(5).all()
        models = AIModel.query.order_by(AIModel.created_at.desc()).limit(5).all()
    else:
        # For students, only show their own data
        datasets = Dataset.query.filter_by(user_id=current_user.id)\
            .order_by(Dataset.created_at.desc()).limit(5).all()
        models = AIModel.query.filter_by(user_id=current_user.id)\
            .order_by(AIModel.created_at.desc()).limit(5).all()
    
    return render_template('main/dashboard.html', 
                           datasets=datasets, 
                           models=models)

@main.route('/about')
def about():
    return render_template('main/about.html') 