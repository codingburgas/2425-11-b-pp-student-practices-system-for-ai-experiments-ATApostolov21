from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, SelectMultipleField, FloatField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError, Optional
import json

class ModelForm(FlaskForm):
    """Form for training a new ML model"""
    name = StringField('Model Name', validators=[
        DataRequired(),
        Length(min=3, max=100)
    ])
    
    description = TextAreaField('Description', validators=[
        Length(max=500)
    ])
    
    dataset_id = SelectField('Dataset', validators=[
        DataRequired()
    ], coerce=int)
    
    model_type = SelectField('Model Type', validators=[
        DataRequired()
    ], choices=[
        ('regression', 'Regression'),
        ('classification', 'Classification')
    ])
    
    target_column = SelectField('Target Column', validators=[
        DataRequired()
    ])
    
    feature_columns = SelectMultipleField('Feature Columns', validators=[
        DataRequired()
    ])
    
    submit = SubmitField('Train Model')

class PredictionForm(FlaskForm):
    """Base form for making predictions with a model"""
    submit = SubmitField('Make Prediction')
    
    @staticmethod
    def create_field(field_name):
        """Create a dynamic field for a feature column"""
        return FloatField(
            field_name, 
            validators=[DataRequired()],
            render_kw={'placeholder': f'Enter value for {field_name}'}
        )

class FeedbackForm(FlaskForm):
    comment = TextAreaField('Feedback', validators=[DataRequired(), Length(min=3, max=1000)])
    rating = SelectField('Rating', choices=[
        ('1', '1 - Poor'),
        ('2', '2 - Fair'),
        ('3', '3 - Good'),
        ('4', '4 - Very Good'),
        ('5', '5 - Excellent')
    ], validators=[Optional()])
    submit = SubmitField('Submit Feedback') 