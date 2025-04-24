from datetime import datetime
import json
from app import db
import os

class Dataset(db.Model):
    __tablename__ = 'datasets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    columns = db.Column(db.Text)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', foreign_keys=[user_id], backref=db.backref('datasets', lazy='dynamic'))
    
    @property
    def is_valid(self):
        """Check if the dataset file exists and is valid"""
        return os.path.exists(self.file_path)
    
    @property
    def num_rows(self):
        """Return the number of rows in the dataset"""
        try:
            import pandas as pd
            if not self.is_valid:
                return 0
            df = pd.read_csv(self.file_path)
            return len(df)
        except:
            return 0
            
    @property
    def num_columns(self):
        """Return the number of columns in the dataset"""
        try:
            if not self.columns:
                return 0
            return len(json.loads(self.columns))
        except:
            return 0
    
    def __repr__(self):
        return f'<Dataset {self.name}>' 