from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'teacher'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Student-Teacher relationship
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    students = db.relationship('User', 
                               backref=db.backref('teacher', remote_side=[id]),
                               lazy='dynamic')
    
    def __init__(self, username, email, role='student', teacher_id=None):
        self.username = username
        self.email = email
        self.role = role
        self.teacher_id = teacher_id
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_student(self):
        return self.role == 'student'
    
    def is_teacher(self):
        return self.role == 'teacher'
    
    def __repr__(self):
        return f'<User {self.username}>' 