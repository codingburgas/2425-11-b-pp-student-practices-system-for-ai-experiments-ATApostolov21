from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, FloatField, IntegerField, SubmitField
from wtforms.validators import DataRequired, Length, NumberRange, Optional
from app.models.ai_model import ModelType

class AIModelForm(FlaskForm):
    name = StringField('Model Name', validators=[DataRequired(), Length(max=64)])
    description = TextAreaField('Description')
    model_type = SelectField('Model Type', choices=[
        (ModelType.PERCEPTRON, 'Perceptron'),
        (ModelType.LINEAR_REGRESSION, 'Linear Regression'),
        (ModelType.LOGISTIC_REGRESSION, 'Logistic Regression'),
        (ModelType.NEURAL_NETWORK, 'Neural Network')
    ])
    dataset_id = SelectField('Dataset', coerce=int, validators=[DataRequired()])
    target_column = StringField('Target Column', validators=[DataRequired()])
    
    # Hyperparameters
    learning_rate = FloatField('Learning Rate', 
                              validators=[Optional(), NumberRange(min=0.0001, max=1.0)],
                              default=0.01)
    iterations = IntegerField('Iterations', 
                             validators=[Optional(), NumberRange(min=1, max=10000)],
                             default=100)
    hidden_layers = StringField('Hidden Layers (comma-separated nodes per layer)',
                              default="10,5")
    
    submit = SubmitField('Train Model')

class CommentForm(FlaskForm):
    content = TextAreaField('Comment', validators=[DataRequired()])
    submit = SubmitField('Add Comment')
 