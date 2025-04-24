from flask import jsonify, request, abort
from flask_login import login_required, current_user
from app import db
from app.api import bp
from app.models import MLModel, Prediction
from app.models.ml_utils import make_prediction
import json

@bp.route('/models', methods=['GET'])
@login_required
def get_models():
    """Get all models for the current user"""
    if current_user.is_student():
        models = MLModel.query.filter_by(user_id=current_user.id).all()
    else:  # Teacher
        # Get all students assigned to this teacher
        student_ids = [student.id for student in current_user.students]
        # Get models from these students
        models = MLModel.query.filter(MLModel.user_id.in_(student_ids)).all() if student_ids else []
    
    return jsonify({
        'success': True,
        'models': [{
            'id': model.id,
            'name': model.name,
            'description': model.description,
            'model_type': model.model_type,
            'target_column': model.target_column,
            'feature_columns': model.get_feature_columns(),
            'created_at': model.created_at.isoformat(),
            'dataset_id': model.dataset_id,
            'dataset_name': model.dataset.name
        } for model in models]
    })

@bp.route('/models/<int:model_id>', methods=['GET'])
@login_required
def get_model(model_id):
    """Get details for a specific model"""
    model = MLModel.query.get_or_404(model_id)
    
    # Check if user has permission to view the model
    if not (current_user.id == model.user_id or 
            (current_user.is_teacher() and model.owner.teacher_id == current_user.id)):
        abort(403)
    
    return jsonify({
        'success': True,
        'model': {
            'id': model.id,
            'name': model.name,
            'description': model.description,
            'model_type': model.model_type,
            'target_column': model.target_column,
            'feature_columns': model.get_feature_columns(),
            'performance_metrics': model.get_performance_metrics(),
            'created_at': model.created_at.isoformat(),
            'dataset_id': model.dataset_id,
            'dataset_name': model.dataset.name,
            'owner': model.owner.username
        }
    })

@bp.route('/models/<int:model_id>/predict', methods=['POST'])
@login_required
def predict(model_id):
    """Make a prediction using a model"""
    model = MLModel.query.get_or_404(model_id)
    
    # Check if user has permission to use the model
    if not (current_user.id == model.user_id or 
            (current_user.is_teacher() and model.owner.teacher_id == current_user.id)):
        abort(403)
    
    # Get feature values from request
    data = request.get_json()
    if not data or 'feature_values' not in data:
        return jsonify({
            'success': False,
            'error': 'Missing feature_values in request'
        }), 400
    
    feature_values = data['feature_values']
    feature_columns = model.get_feature_columns()
    
    # Validate feature values
    if len(feature_values) != len(feature_columns):
        return jsonify({
            'success': False,
            'error': f'Expected {len(feature_columns)} feature values, but got {len(feature_values)}'
        }), 400
    
    # Make prediction
    result = make_prediction(model.model_data, feature_values)
    
    if result['success']:
        # Save prediction to database
        input_data = {column: value for column, value in zip(feature_columns, feature_values)}
        output_data = {'prediction': result['prediction']}
        
        prediction = Prediction(
            input_data=json.dumps(input_data),
            output_data=json.dumps(output_data),
            model_id=model.id
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'prediction': result['prediction'],
            'input': input_data
        })
    else:
        return jsonify({
            'success': False,
            'error': result.get('error', 'Unknown error')
        }), 500 