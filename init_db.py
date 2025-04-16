import os
from app import create_app, db
from app.models import User
from app.models.user import Role

def init_db():
    # Create the application
    app = create_app('development')
    
    # Push an application context
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create test users if they don't exist
        if User.query.filter_by(email='teacher@example.com').first() is None:
            teacher = User(
                username='teacher',
                email='teacher@example.com',
                name='Test Teacher',
                role=Role.TEACHER
            )
            teacher.set_password('password')
            db.session.add(teacher)
        
        if User.query.filter_by(email='student@example.com').first() is None:
            student = User(
                username='student',
                email='student@example.com',
                name='Test Student',
                role=Role.STUDENT
            )
            student.set_password('password')
            db.session.add(student)
        
        # Commit changes
        db.session.commit()
        
        print("Database initialized with test users.")

if __name__ == '__main__':
    init_db() 