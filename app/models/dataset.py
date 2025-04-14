from datetime import datetime
from app import db

class Dataset(db.Model):
    __tablename__ = 'datasets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    filename = db.Column(db.String(128), nullable=False)
    feature_columns = db.Column(db.Text)  # Stored as JSON string
    target_column = db.Column(db.String(64))
    row_count = db.Column(db.Integer)
    column_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    models = db.relationship('AIModel', backref='dataset', lazy='dynamic')
    
    def __repr__(self):
        return f'<Dataset {self.name}>' 