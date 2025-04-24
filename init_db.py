from app import create_app, db
from app.models.user import User
from app.datasets.models import Dataset
from app.models.models import Model

app = create_app()

with app.app_context():
    # Create tables
    db.create_all()
    
    # Add an initial admin user
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@example.com',
            role='teacher'
        )
        admin.set_password('password')
        db.session.add(admin)
        db.session.commit()
        print("Created admin user: admin@example.com (password: password)")
    else:
        print("Admin user already exists")
    
    print("Database initialized successfully!") 