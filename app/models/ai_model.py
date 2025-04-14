from datetime import datetime
import json
from app import db

class ModelType:
    PERCEPTRON = 'perceptron'
    LINEAR_REGRESSION = 'linear_regression'
    LOGISTIC_REGRESSION = 'logistic_regression'
    NEURAL_NETWORK = 'neural_network'

class AIModel(db.Model):
    __tablename__ = 'ai_models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    model_type = db.Column(db.String(20), nullable=False)
    hyperparameters = db.Column(db.Text)  # Stored as JSON string
    weights = db.Column(db.LargeBinary)  # Pickled model
    accuracy = db.Column(db.Float)
    loss = db.Column(db.Float)
    metrics = db.Column(db.Text)  # Stored as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    training_time = db.Column(db.Float)  # in seconds
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    
    # Relationships
    comments = db.relationship('Comment', backref='model', lazy='dynamic')
    
    def get_hyperparameters(self):
        if self.hyperparameters:
            return json.loads(self.hyperparameters)
        return {}
    
    def set_hyperparameters(self, hyperparams):
        self.hyperparameters = json.dumps(hyperparams)
    
    def get_metrics(self):
        if self.metrics:
            return json.loads(self.metrics)
        return {}
    
    def set_metrics(self, metrics_dict):
        self.metrics = json.dumps(metrics_dict)
    
    def __repr__(self):
        return f'<AIModel {self.name} ({self.model_type})>' 