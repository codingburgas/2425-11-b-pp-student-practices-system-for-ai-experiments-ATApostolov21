import os
from app import create_app, db
from app.models.user import User, Role
from app.models.dataset import Dataset
from app.models.ai_model import AIModel
from app.models.comment import Comment
from werkzeug.security import generate_password_hash
import datetime

def init_db():
    """Initialize database with some sample data"""
    app = create_app('development')
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if we already have users
        if User.query.count() > 0:
            print("Database already initialized. Exiting.")
            return
        
        # Create a teacher user
        teacher = User(
            username='teacher',
            email='teacher@example.com',
            name='Teacher User',
            role=Role.TEACHER
        )
        teacher.password_hash = generate_password_hash('teacher123')
        
        # Create a student user
        student = User(
            username='student',
            email='student@example.com',
            name='Student User',
            role=Role.STUDENT
        )
        student.password_hash = generate_password_hash('student123')
        
        # Add users to the database
        db.session.add(teacher)
        db.session.add(student)
        db.session.commit()
        
        print("Database initialized with sample users:")
        print("Teacher account: teacher@example.com / teacher123")
        print("Student account: student@example.com / student123")

if __name__ == '__main__':
    init_db() 