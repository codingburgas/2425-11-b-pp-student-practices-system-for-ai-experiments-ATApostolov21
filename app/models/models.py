from datetime import datetime
import json
from app import db
from app.datasets.models import Dataset

class Model(db.Model):
    __tablename__ = 'models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    model_type = db.Column(db.String(50), nullable=False)
    model_path = db.Column(db.String(255), nullable=False)
    target_column = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Store as JSON strings in the database
    _feature_columns = db.Column('feature_columns', db.Text, nullable=False)
    _metrics = db.Column('metrics', db.Text)
    _feature_importance = db.Column('feature_importance', db.Text)
    
    # Relationships
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    dataset = db.relationship('Dataset', backref=db.backref('models', lazy=True))
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', foreign_keys=[user_id], backref=db.backref('models', lazy='dynamic'))
    
    def __init__(self, name, description, model_type, model_path, target_column, feature_columns, 
                 metrics=None, feature_importance=None, dataset_id=None, user_id=None):
        self.name = name
        self.description = description
        self.model_type = model_type
        self.model_path = model_path
        self.target_column = target_column
        self.feature_columns = feature_columns
        self.metrics = metrics
        self.feature_importance = feature_importance
        self.dataset_id = dataset_id
        self.user_id = user_id
    
    @property
    def feature_columns(self):
        if self._feature_columns:
            return json.loads(self._feature_columns)
        return []
    
    @feature_columns.setter
    def feature_columns(self, value):
        self._feature_columns = json.dumps(value)
    
    @property
    def metrics(self):
        if self._metrics:
            return json.loads(self._metrics)
        return None
    
    @metrics.setter
    def metrics(self, value):
        if value is not None:
            self._metrics = json.dumps(value)
        else:
            self._metrics = None
    
    @property
    def feature_importance(self):
        if self._feature_importance:
            return json.loads(self._feature_importance)
        return None
    
    @feature_importance.setter
    def feature_importance(self, value):
        if value is not None:
            self._feature_importance = json.dumps(value)
        else:
            self._feature_importance = None
    
    @property
    def training_history(self):
        # For now, return a dummy training history
        # In a real application, this would be stored in the database
        return {
            'train_loss': [0.5, 0.3, 0.2, 0.1],
            'val_loss': [0.6, 0.4, 0.3, 0.2]
        }
    
    def __repr__(self):
        return f'<Model {self.name}>'

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    _input_data = db.Column('input_data', db.Text, nullable=False)  # JSON string of input data
    _output_data = db.Column('output_data', db.Text, nullable=False)  # JSON string of prediction result
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    model_id = db.Column(db.Integer, db.ForeignKey('models.id'), nullable=False)
    model = db.relationship('Model', backref=db.backref('predictions', lazy='dynamic'))
    
    def __init__(self, input_data, output_data, model_id):
        self.input_data = input_data
        self.output_data = output_data
        self.model_id = model_id
    
    @property
    def input_data(self):
        if self._input_data:
            return json.loads(self._input_data)
        return {}
    
    @input_data.setter
    def input_data(self, value):
        if value is not None:
            self._input_data = json.dumps(value)
        else:
            self._input_data = "{}"
    
    @property
    def output_data(self):
        if self._output_data:
            return json.loads(self._output_data)
        return {}
    
    @output_data.setter
    def output_data(self, value):
        if value is not None:
            self._output_data = json.dumps(value)
        else:
            self._output_data = "{}"
    
    def __repr__(self):
        return f'<Prediction {self.id}>'

class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # Optional rating (1-5)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    model_id = db.Column(db.Integer, db.ForeignKey('models.id'), nullable=False)
    model = db.relationship('Model', backref=db.backref('feedbacks', lazy='dynamic'))
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('feedbacks', lazy='dynamic'))
    
    def __init__(self, comment, rating, model_id, user_id):
        self.comment = comment
        self.rating = rating
        self.model_id = model_id
        self.user_id = user_id
    
    def __repr__(self):
        return f'<Feedback {self.id}>' 