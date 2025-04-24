# This file is deprecated and not being used.
# The actual models are in:
# - app/models/user.py (User model)
# - app/models/models.py (Model, Prediction, Feedback)
# - app/datasets/models.py (Dataset)

"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import json

from .extensions import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student' or 'teacher'
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Teacher-Student relationship (self-referential)
    students = db.relationship('User', backref=db.backref('teacher', remote_side=[id]),
                              foreign_keys='User.teacher_id')
    
    # Relationships
    datasets = db.relationship('Dataset', backref='owner', lazy='dynamic')
    models = db.relationship('MLModel', backref='owner', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_teacher(self):
        return self.role == 'teacher'
    
    def is_student(self):
        return self.role == 'student'


class Dataset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=False)
    columns = db.Column(db.Text, nullable=False)  # JSON string of column names
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    models = db.relationship('MLModel', backref='dataset', lazy='dynamic')
    
    def __repr__(self):
        return f'<Dataset {self.name}>'
    
    def get_columns(self):
        return json.loads(self.columns)


class MLModel(db.Model):
    __tablename__ = 'models'  # Explicitly set table name
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    model_type = db.Column(db.String(50), nullable=False)  # 'linear_regression', 'multiple_regression', etc.
    model_path = db.Column(db.String(255), nullable=False)  # Path to the saved model file
    target_column = db.Column(db.String(100), nullable=False)
    feature_columns = db.Column(db.Text, nullable=False)  # JSON string of column names
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metrics = db.Column(db.Text, nullable=True)  # JSON string of metrics
    feature_importance = db.Column(db.Text, nullable=True)  # JSON string of feature importance
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    predictions = db.relationship('Prediction', backref='model', lazy='dynamic')
    feedbacks = db.relationship('Feedback', backref='model', lazy='dynamic')
    
    def __repr__(self):
        return f'<MLModel {self.name}>'
    
    def get_feature_columns(self):
        return json.loads(self.feature_columns)
    
    def get_metrics(self):
        return json.loads(self.metrics) if self.metrics else None
    
    def get_feature_importance(self):
        return json.loads(self.feature_importance) if self.feature_importance else None


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    input_data = db.Column(db.Text, nullable=False)  # JSON string of input data
    output_data = db.Column(db.Text, nullable=False)  # JSON string of prediction result
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    model_id = db.Column(db.Integer, db.ForeignKey('models.id'), nullable=False)
    
    def __repr__(self):
        return f'<Prediction {self.id}>'
    
    def get_input_data(self):
        return json.loads(self.input_data)
    
    def get_output_data(self):
        return json.loads(self.output_data)


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # Optional rating (1-5)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    model_id = db.Column(db.Integer, db.ForeignKey('models.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationship
    user = db.relationship('User', backref='feedbacks')
    
    def __repr__(self):
        return f'<Feedback {self.id}>'
""" 