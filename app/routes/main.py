from flask import Blueprint, render_template, redirect, url_for
from app.models.dataset import Dataset
from app.models.model import Model

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """Landing page route"""
    return render_template('index.html')

@main.route('/dashboard')
def dashboard():
    """Dashboard route showing system overview"""
    # Get counts for stats
    datasets_count = len(Dataset.get_all())
    models_count = len(Model.get_all())
    
    # Sample learning resources
    learning_resources = [
        {
            'title': 'Introduction to Machine Learning',
            'url': 'https://www.coursera.org/learn/machine-learning',
            'source': 'Coursera'
        },
        {
            'title': 'Neural Networks and Deep Learning',
            'url': 'https://www.deeplearning.ai/',
            'source': 'deeplearning.ai'
        },
        {
            'title': 'Scikit-Learn Documentation',
            'url': 'https://scikit-learn.org/stable/documentation.html',
            'source': 'Scikit-Learn'
        }
    ]
    
    return render_template(
        'dashboard.html',
        datasets_count=datasets_count,
        models_count=models_count,
        learning_resources=learning_resources
    )

@main.route('/about')
def about():
    return render_template('main/about.html') 